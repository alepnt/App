import { v4 as uuid } from "uuid";
import { z } from "zod";
import { EventRepository } from "../repositories/eventRepository.js";
import { Event, VoteTotal } from "../domain/types.js";
import { AppError } from "../shared/errors.js";

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  closeAt: z.string().datetime(),
  options: z.array(z.string().min(1)).min(2),
  hostName: z.string().min(2),
});

const joinSchema = z.object({
  inviteToken: z.string().min(8),
  guestName: z.string().min(2),
});

const voteSchema = z.object({
  participantId: z.string().uuid(),
  optionId: z.string().uuid(),
  score: z.literal(1),
});

const authorizationSchema = z.object({
  authorization: z.string().min(16),
});

function now(): Date {
  return new Date();
}

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  createEvent(payload: unknown) {
    const data = createEventSchema.parse(payload);
    const closeAt = new Date(data.closeAt);
    if (Number.isNaN(closeAt.getTime()) || closeAt.getTime() <= now().getTime()) {
      throw new AppError("closeAt deve essere una data futura", 422, "INVALID_CLOSE_AT");
    }

    const eventId = uuid();
    const hostParticipantId = uuid();
    const inviteToken = uuid().replace(/-/g, "");
    const hostAuthToken = uuid().replace(/-/g, "");

    const event: Event = {
      id: eventId,
      title: data.title,
      description: data.description,
      status: "open",
      closeAt,
      inviteToken,
      hostParticipantId,
      createdAt: now(),
    };

    this.repository.saveEvent(event);
    this.repository.saveParticipant({
      id: hostParticipantId,
      eventId,
      name: data.hostName,
      role: "host",
      authToken: hostAuthToken,
      createdAt: now(),
    });

    for (const optionLabel of [...new Set(data.options.map((item) => item.trim()))]) {
      this.repository.saveOption({
        id: uuid(),
        eventId,
        label: optionLabel,
        source: "manual",
      });
    }

    return {
      eventId,
      inviteLink: `/join/${inviteToken}`,
      status: event.status,
      host: {
        participantId: hostParticipantId,
        authToken: hostAuthToken,
      },
    };
  }

  joinByLink(payload: unknown) {
    const data = joinSchema.parse(payload);
    const event = this.repository.findEventByInviteToken(data.inviteToken);
    if (!event) {
      throw new AppError("Evento non trovato", 404, "EVENT_NOT_FOUND");
    }

    this.closeEventIfExpired(event.id);
    const refreshed = this.repository.getEvent(event.id);
    if (!refreshed || refreshed.status === "closed") {
      throw new AppError("Evento già chiuso", 409, "EVENT_CLOSED");
    }

    const existing = this.repository.findParticipantByEventAndName(event.id, data.guestName);
    if (existing && existing.role === "guest") {
      return {
        eventId: event.id,
        participantId: existing.id,
        role: "guest",
        status: refreshed.status,
        authToken: existing.authToken,
        idempotent: true,
      };
    }

    const participantId = uuid();
    const authToken = uuid().replace(/-/g, "");
    this.repository.saveParticipant({
      id: participantId,
      eventId: event.id,
      name: data.guestName,
      role: "guest",
      authToken,
      createdAt: now(),
    });

    return {
      eventId: event.id,
      participantId,
      role: "guest",
      status: refreshed.status,
      authToken,
      idempotent: false,
    };
  }

  submitVote(eventId: string, payload: unknown, authHeaderValue: string | undefined) {
    const data = voteSchema.parse(payload);
    const authPayload = authorizationSchema.parse({ authorization: authHeaderValue });

    const event = this.repository.getEvent(eventId);
    if (!event) {
      throw new AppError("Evento non trovato", 404, "EVENT_NOT_FOUND");
    }

    this.closeEventIfExpired(eventId);
    const refreshedEvent = this.repository.getEvent(eventId);
    if (!refreshedEvent || refreshedEvent.status === "closed") {
      throw new AppError("Le votazioni sono chiuse", 409, "VOTING_CLOSED");
    }

    const participant = this.repository.getParticipant(data.participantId);
    if (!participant || participant.eventId !== eventId) {
      throw new AppError("Partecipante non valido", 403, "INVALID_PARTICIPANT");
    }

    if (participant.authToken !== authPayload.authorization) {
      throw new AppError("Token partecipante non valido", 401, "INVALID_AUTH_TOKEN");
    }

    const option = this.repository.listOptionsByEvent(eventId).find((item) => item.id === data.optionId);
    if (!option) {
      throw new AppError("Opzione non valida", 404, "INVALID_OPTION");
    }

    this.repository.deleteVotesByParticipant(eventId, data.participantId);
    const existing = this.repository.findVoteByParticipantAndOption(data.participantId, data.optionId);
    const voteId = existing?.id ?? uuid();
    this.repository.saveVote({
      id: voteId,
      eventId,
      optionId: data.optionId,
      participantId: data.participantId,
      score: 1,
      updatedAt: now(),
    });

    return {
      accepted: true,
      totals: this.computeTotals(eventId),
      eventStatus: refreshedEvent.status,
    };
  }

  closeDecision(eventId: string, authHeaderValue: string | undefined) {
    const authPayload = authorizationSchema.parse({ authorization: authHeaderValue });
    const event = this.repository.getEvent(eventId);
    if (!event) {
      throw new AppError("Evento non trovato", 404, "EVENT_NOT_FOUND");
    }

    const host = this.repository.getParticipant(event.hostParticipantId);
    if (!host || host.authToken !== authPayload.authorization) {
      throw new AppError("Solo host può chiudere l'evento", 403, "HOST_AUTH_REQUIRED");
    }

    if (event.status === "closed") {
      return {
        eventId,
        status: "closed",
        winningOptionId: event.winningOptionId,
      };
    }

    const totals = this.computeTotals(eventId);
    const winner = this.resolveWinner(eventId, totals);

    this.repository.saveEvent({
      ...event,
      status: "closed",
      winningOptionId: winner,
      closedAt: now(),
    });

    return {
      eventId,
      status: "closed",
      winningOptionId: winner,
    };
  }

  getEventSnapshot(eventId: string) {
    const event = this.repository.getEvent(eventId);
    if (!event) {
      throw new AppError("Evento non trovato", 404, "EVENT_NOT_FOUND");
    }

    this.closeEventIfExpired(eventId);
    const refreshedEvent = this.repository.getEvent(eventId);
    if (!refreshedEvent) {
      throw new AppError("Evento non trovato", 404, "EVENT_NOT_FOUND");
    }

    return {
      event: refreshedEvent,
      participants: this.repository.listParticipantsByEvent(eventId).map((participant) => ({
        id: participant.id,
        eventId: participant.eventId,
        name: participant.name,
        role: participant.role,
      })),
      options: this.repository.listOptionsByEvent(eventId),
      totals: this.computeTotals(eventId),
    };
  }

  private closeEventIfExpired(eventId: string): void {
    const event = this.repository.getEvent(eventId);
    if (!event) {
      return;
    }

    if (event.status === "open" && event.closeAt.getTime() <= now().getTime()) {
      const totals = this.computeTotals(event.id);
      const winner = this.resolveWinner(event.id, totals);
      this.repository.saveEvent({
        ...event,
        status: "closed",
        winningOptionId: winner,
        closedAt: now(),
      });
    }
  }

  private computeTotals(eventId: string): VoteTotal[] {
    const options = this.repository.listOptionsByEvent(eventId);
    const votes = this.repository.listVotesByEvent(eventId);
    return options.map((option) => ({
      optionId: option.id,
      votes: votes.filter((vote) => vote.optionId === option.id).length,
    }));
  }

  private resolveWinner(eventId: string, totals: VoteTotal[]): string | undefined {
    if (totals.length === 0) {
      return undefined;
    }

    const sorted = [...totals].sort((a, b) => {
      if (b.votes !== a.votes) {
        return b.votes - a.votes;
      }

      const optionA = this.repository.listOptionsByEvent(eventId).find((option) => option.id === a.optionId);
      const optionB = this.repository.listOptionsByEvent(eventId).find((option) => option.id === b.optionId);
      return (optionA?.label ?? "").localeCompare(optionB?.label ?? "", "it", { sensitivity: "base" });
    });

    return sorted[0]?.optionId;
  }
}
