import { Router } from "express";
import { EventService } from "../services/eventService.js";

export function createEventRoutes(service: EventService): Router {
  const router = Router();

  router.post("/events", (req, res, next) => {
    try {
      const response = service.createEvent(req.body);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/events/join", (req, res, next) => {
    try {
      const response = service.joinByLink(req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/events/:eventId/votes", (req, res, next) => {
    try {
      const response = service.submitVote(req.params.eventId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/events/:eventId/close", (req, res, next) => {
    try {
      const response = service.closeDecision(req.params.eventId, req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.get("/events/:eventId", (req, res, next) => {
    try {
      const response = service.getEventSnapshot(req.params.eventId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
