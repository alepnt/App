import express, { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { EventRepository } from "./repositories/eventRepository.js";
import { createEventRoutes } from "./routes/eventRoutes.js";
import { EventService } from "./services/eventService.js";
import { AppError } from "./shared/errors.js";

const rateWindowMs = 60_000;
const maxRequestsPerWindow = 120;
const perIpHits = new Map<string, { count: number; resetAt: number }>();

const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  byRoute: new Map<string, number>(),
};

function applyBasicSecurityHeaders(res: Response): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-XSS-Protection", "0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-Id");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
}

export function createApp() {
  const app = express();
  app.use(express.json());

  const repository = new EventRepository();
  const service = new EventService(repository);

  app.use((req, res, next) => {
    applyBasicSecurityHeaders(res);

    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const currentTime = Date.now();
    const bucket = perIpHits.get(ip);

    if (!bucket || bucket.resetAt < currentTime) {
      perIpHits.set(ip, { count: 1, resetAt: currentTime + rateWindowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > maxRequestsPerWindow) {
      next(new AppError("Rate limit superato", 429, "RATE_LIMIT_EXCEEDED"));
      return;
    }

    next();
  });

  app.use((req, res, next) => {
    const requestId = req.header("X-Request-Id") ?? randomUUID();
    res.setHeader("X-Request-Id", requestId);
    res.locals.requestId = requestId;

    const routeKey = `${req.method} ${req.path}`;
    metrics.totalRequests += 1;
    metrics.byRoute.set(routeKey, (metrics.byRoute.get(routeKey) ?? 0) + 1);
    const startedAt = Date.now();

    res.on("finish", () => {
      const latencyMs = Date.now() - startedAt;
      console.log(
        JSON.stringify({
          level: "info",
          requestId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          latencyMs,
        }),
      );
    });

    next();
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.get("/metrics", (_req, res) => {
    res.status(200).json({
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      byRoute: Object.fromEntries(metrics.byRoute.entries()),
    });
  });

  app.get("/api/v1/openapi", (_req, res) => {
    res.status(200).json({
      openapi: "3.0.3",
      info: {
        title: "Planit MVP API",
        version: "1.0.0",
      },
      paths: {
        "/api/v1/events": { post: { summary: "Crea evento" } },
        "/api/v1/events/join": { post: { summary: "Join evento" } },
        "/api/v1/events/{eventId}/votes": { post: { summary: "Invia voto" } },
        "/api/v1/events/{eventId}/close": { post: { summary: "Chiudi evento" } },
        "/api/v1/events/{eventId}": { get: { summary: "Snapshot evento" } },
      },
    });
  });

  app.use("/api/v1", createEventRoutes(service));
  app.use("/api", createEventRoutes(service));

  app.use((error: unknown, req: Request, res: Response, _next: NextFunction) => {
    metrics.totalErrors += 1;
    const requestId = res.locals.requestId ?? req.header("X-Request-Id");

    if (error instanceof ZodError) {
      res.status(422).json({
        code: "VALIDATION_ERROR",
        message: "Payload non valido",
        requestId,
        details: error.flatten(),
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        code: error.code,
        message: error.message,
        requestId,
      });
      return;
    }

    res.status(500).json({
      code: "INTERNAL_ERROR",
      message: "Errore interno",
      requestId,
    });
  });

  return app;
}
