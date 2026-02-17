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

export class EventService {
  constructor(private readonly repository: EventRepository) {}

  createEvent(payload: unknown) {
    const data = createEventSchema.parse(payload);
    const eventId = uuid();
    const hostParticipantId = uuid();
    const inviteToken = uuid().replace(/-/g, "");
    const event: Event = {
      id: eventId,
      title: data.title,
      description: data.description,
      status: "open",
      closeAt: new Date(data.closeAt),
      inviteToken,
      hostParticipantId,
      createdAt: new Date(),
    };

    this.repository.saveEvent(event);
    this.repository.saveParticipant({
      id: hostParticipantId,
      eventId,
      name: data.hostName,
      role: "host",
    });

    for (const optionLabel of data.options) {
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
    };
  }

  joinByLink(payload: unknown) {
    const data = joinSchema.parse(payload);
    const event = this.repository.findEventByInviteToken(data.inviteToken);
    if (!event) {
      throw new AppError("Evento non trovato", 404);
    }

    if (event.status === "closed") {
      throw new AppError("Evento già chiuso", 409);
    }

    const participantId = uuid();
    this.repository.saveParticipant({
      id: participantId,
      eventId: event.id,
      name: data.guestName,
      role: "guest",
    });

    return {
      eventId: event.id,
      participantId,
      role: "guest",
      status: event.status,
    };
  }

  submitVote(eventId: string, payload: unknown) {
    const data = voteSchema.parse(payload);
    const event = this.repository.getEvent(eventId);
    if (!event) {
      throw new AppError("Evento non trovato", 404);
    }

    if (event.status === "closed") {
      throw new AppError("Le votazioni sono chiuse", 409);
    }

    const participant = this.repository.getParticipant(data.participantId);
    if (!participant || participant.eventId !== eventId) {
      throw new AppError("Partecipante non valido", 403);
    }

    const option = this.repository.listOptionsByEvent(eventId).find((item) => item.id === data.optionId);
    if (!option) {
      throw new AppError("Opzione non valida", 404);
    }

    const existing = this.repository.findVoteByParticipantAndOption(data.participantId, data.optionId);
    const voteId = existing?.id ?? uuid();
    this.repository.saveVote({
      id: voteId,
      eventId,
      optionId: data.optionId,
      participantId: data.participantId,
      score: 1,
      updatedAt: new Date(),
    });

    return {
      accepted: true,
      totals: this.computeTotals(eventId),
      eventStatus: event.status,
    };
  }

  closeDecision(eventId: string) {
    const event = this.repository.getEvent(eventId);
    if (!event) {
      throw new AppError("Evento non trovato", 404);
    }

    if (event.status === "closed") {
      return {
        eventId,
        status: "closed",
        winningOptionId: event.winningOptionId,
      };
    }

    const totals = this.computeTotals(eventId).sort((a, b) => b.votes - a.votes);
    const winner = totals[0]?.optionId;

    this.repository.saveEvent({
      ...event,
      status: "closed",
      winningOptionId: winner,
      closedAt: new Date(),
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
      throw new AppError("Evento non trovato", 404);
    }

    return {
      event,
      participants: this.repository.listParticipantsByEvent(eventId),
      options: this.repository.listOptionsByEvent(eventId),
      totals: this.computeTotals(eventId),
    };
  }

  private computeTotals(eventId: string): VoteTotal[] {
    const options = this.repository.listOptionsByEvent(eventId);
    const votes = this.repository.listVotesByEvent(eventId);
    return options.map((option) => ({
      optionId: option.id,
      votes: votes.filter((vote) => vote.optionId === option.id).length,
    }));
  }
}
