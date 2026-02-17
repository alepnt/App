import express, { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { EventRepository } from "./repositories/eventRepository.js";
import { createEventRoutes } from "./routes/eventRoutes.js";
import { EventService } from "./services/eventService.js";
import { AppError } from "./shared/errors.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  const repository = new EventRepository();
  const service = new EventService(repository);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", createEventRoutes(service));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      res.status(422).json({
        message: "Payload non valido",
        details: error.flatten(),
      });
      return;
    }

    if (error instanceof AppError) {
      res.status(error.statusCode).json({ message: error.message });
      return;
    }

    res.status(500).json({ message: "Errore interno" });
  });

  return app;
}
