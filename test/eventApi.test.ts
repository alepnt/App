import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

describe("Planit MVP API", () => {
  it("crea evento, join e voto", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/events").send({
      title: "Cena Team Giovedì",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Pizzeria Roma", "Sushi Zen"],
      hostName: "Luca",
    });

    expect(createResponse.status).toBe(201);
    const eventId = createResponse.body.eventId as string;
    const inviteToken = (createResponse.body.inviteLink as string).replace("/join/", "");

    const joinResponse = await request(app).post("/api/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    expect(joinResponse.status).toBe(200);

    const eventResponse = await request(app).get(`/api/events/${eventId}`);
    const optionId = eventResponse.body.options[0].id;

    const voteResponse = await request(app).post(`/api/events/${eventId}/votes`).send({
      participantId: joinResponse.body.participantId,
      optionId,
      score: 1,
    });

    expect(voteResponse.status).toBe(200);
    expect(voteResponse.body.accepted).toBe(true);
    expect(voteResponse.body.totals[0].votes).toBe(1);
  });

  it("non permette join duplicato con stesso nome", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/events").send({
      title: "Team lunch",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Burger", "Pokè"],
      hostName: "Anna",
    });

    const inviteToken = (createResponse.body.inviteLink as string).replace("/join/", "");

    const firstJoinResponse = await request(app).post("/api/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    const secondJoinResponse = await request(app).post("/api/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    expect(firstJoinResponse.status).toBe(200);
    expect(secondJoinResponse.status).toBe(200);
    expect(secondJoinResponse.body.participantId).toBe(firstJoinResponse.body.participantId);
  });

  it("consente la chiusura solo all'host", async () => {
    const app = createApp();

    const createResponse = await request(app).post("/api/events").send({
      title: "Pranzo",
      closeAt: new Date(Date.now() + 60_000).toISOString(),
      options: ["Burger", "Pokè"],
      hostName: "Anna",
    });

    const eventId = createResponse.body.eventId as string;
    const inviteToken = (createResponse.body.inviteLink as string).replace("/join/", "");

    const joinResponse = await request(app).post("/api/events/join").send({
      inviteToken,
      guestName: "Sara",
    });

    const guestCloseResponse = await request(app).post(`/api/events/${eventId}/close`).send({
      participantId: joinResponse.body.participantId,
    });

    expect(guestCloseResponse.status).toBe(403);

    const snapshotResponse = await request(app).get(`/api/events/${eventId}`);
    const hostParticipant = snapshotResponse.body.participants.find((participant: { role: string }) => participant.role === "host");

    const hostCloseResponse = await request(app).post(`/api/events/${eventId}/close`).send({
      participantId: hostParticipant.id,
    });

    expect(hostCloseResponse.status).toBe(200);
    expect(hostCloseResponse.body.status).toBe("closed");
  });
});
