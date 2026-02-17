import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("Planit MVP API", () => {
  beforeEach(() => {
    process.env.DATA_FILE_PATH = `./data/test-${Date.now()}-${Math.random()}.json`;
  });

  it("crea evento, join idempotente e voto autenticato", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/v1/events").send({
      title: "Cena Team Giovedì",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Pizzeria Roma", "Sushi Zen"],
      hostName: "Luca",
    });

    expect(createResponse.status).toBe(201);
    const eventId = createResponse.body.eventId as string;
    const inviteToken = (createResponse.body.inviteLink as string).replace("/join/", "");

    const joinResponse = await request(app).post("/api/v1/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    expect(joinResponse.status).toBe(200);
    expect(joinResponse.body.idempotent).toBe(false);

    const secondJoinResponse = await request(app).post("/api/v1/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    expect(secondJoinResponse.status).toBe(200);
    expect(secondJoinResponse.body.idempotent).toBe(true);
    expect(secondJoinResponse.body.participantId).toBe(joinResponse.body.participantId);

    const eventResponse = await request(app).get(`/api/v1/events/${eventId}`);
    const optionId = eventResponse.body.options[0].id;

    const voteResponse = await request(app)
      .post(`/api/v1/events/${eventId}/votes`)
      .set("Authorization", joinResponse.body.authToken)
      .send({
        participantId: joinResponse.body.participantId,
        optionId,
        score: 1,
      });

    expect(voteResponse.status).toBe(200);
    expect(voteResponse.body.accepted).toBe(true);
  });

  it("rifiuta voto con token non valido", async () => {
    const app = createApp();
    const createResponse = await request(app).post("/api/v1/events").send({
      title: "Pranzo Team",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Burger", "Pokè"],
      hostName: "Anna",
    });

    const eventId = createResponse.body.eventId as string;
    const inviteToken = (createResponse.body.inviteLink as string).replace("/join/", "");
    const joinResponse = await request(app).post("/api/v1/events/join").send({ inviteToken, guestName: "Mario" });

    const eventResponse = await request(app).get(`/api/v1/events/${eventId}`);
    const optionId = eventResponse.body.options[0].id;

    const voteResponse = await request(app)
      .post(`/api/v1/events/${eventId}/votes`)
      .set("Authorization", "invalid-token")
      .send({
        participantId: joinResponse.body.participantId,
        optionId,
        score: 1,
      });

    expect(voteResponse.status).toBe(401);
    expect(voteResponse.body.code).toBe("INVALID_AUTH_TOKEN");
  });

  it("consente chiusura solo all'host", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/v1/events").send({
      title: "Retro Sprint",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Sala A", "Sala B"],
      hostName: "Chiara",
    });

    const eventId = createResponse.body.eventId as string;

    const closeAsGuest = await request(app)
      .post(`/api/v1/events/${eventId}/close`)
      .set("Authorization", "guest-token")
      .send();

    expect(closeAsGuest.status).toBe(403);

    const closeAsHost = await request(app)
      .post(`/api/v1/events/${eventId}/close`)
      .set("Authorization", createResponse.body.host.authToken)
      .send();

    expect(closeAsHost.status).toBe(200);
    expect(closeAsHost.body.status).toBe("closed");
  });

  it("espone endpoint metriche e openapi", async () => {
    const app = createApp();

    const metricsResponse = await request(app).get("/metrics");
    expect(metricsResponse.status).toBe(200);

    const openApiResponse = await request(app).get("/api/v1/openapi");
    expect(openApiResponse.status).toBe(200);
    expect(openApiResponse.body.openapi).toBe("3.0.3");
  });

  it("auto-chiude evento scaduto su snapshot", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/v1/events").send({
      title: "Evento Scaduto",
      closeAt: new Date(Date.now() + 150).toISOString(),
      options: ["Opzione A", "Opzione B"],
      hostName: "Host",
    });

    const eventId = createResponse.body.eventId as string;
    await new Promise((resolve) => setTimeout(resolve, 300));

    const snapshot = await request(app).get(`/api/v1/events/${eventId}`);
    expect(snapshot.status).toBe(200);
    expect(snapshot.body.event.status).toBe("closed");
  });
});
