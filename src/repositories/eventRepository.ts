import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Event, EventOption, Participant, Vote } from "../domain/types.js";

interface RepositoryDump {
  events: Event[];
  options: EventOption[];
  participants: Participant[];
  votes: Vote[];
}

export class EventRepository {
  private readonly events = new Map<string, Event>();
  private readonly options = new Map<string, EventOption>();
  private readonly participants = new Map<string, Participant>();
  private readonly votes = new Map<string, Vote>();

  constructor(private readonly persistenceFilePath = process.env.DATA_FILE_PATH ?? "./data/events-store.json") {
    this.loadFromDisk();
  }

  saveEvent(event: Event): void {
    this.events.set(event.id, event);
    this.persist();
  }

  getEvent(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  findEventByInviteToken(inviteToken: string): Event | undefined {
    return [...this.events.values()].find((event) => event.inviteToken === inviteToken);
  }

  saveOption(option: EventOption): void {
    this.options.set(option.id, option);
    this.persist();
  }

  listOptionsByEvent(eventId: string): EventOption[] {
    return [...this.options.values()].filter((option) => option.eventId === eventId);
  }

  saveParticipant(participant: Participant): void {
    this.participants.set(participant.id, participant);
    this.persist();
  }

  getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId);
  }

  findParticipantByAuthToken(authToken: string): Participant | undefined {
    return [...this.participants.values()].find((participant) => participant.authToken === authToken);
  }

  findParticipantByEventAndName(eventId: string, name: string): Participant | undefined {
    const normalized = name.trim().toLowerCase();
    return [...this.participants.values()].find(
      (participant) => participant.eventId === eventId && participant.name.trim().toLowerCase() === normalized,
    );
  }

  listParticipantsByEvent(eventId: string): Participant[] {
    return [...this.participants.values()].filter((participant) => participant.eventId === eventId);
  }

  saveVote(vote: Vote): void {
    this.votes.set(vote.id, vote);
    this.persist();
  }

  findVoteByParticipantAndOption(participantId: string, optionId: string): Vote | undefined {
    return [...this.votes.values()].find(
      (vote) => vote.participantId === participantId && vote.optionId === optionId,
    );
  }

  findVotesByParticipant(eventId: string, participantId: string): Vote[] {
    return [...this.votes.values()].filter((vote) => vote.eventId === eventId && vote.participantId === participantId);
  }

  deleteVotesByParticipant(eventId: string, participantId: string): void {
    for (const vote of this.votes.values()) {
      if (vote.eventId === eventId && vote.participantId === participantId) {
        this.votes.delete(vote.id);
      }
    }
    this.persist();
  }

  listVotesByEvent(eventId: string): Vote[] {
    return [...this.votes.values()].filter((vote) => vote.eventId === eventId);
  }

  private loadFromDisk(): void {
    if (!existsSync(this.persistenceFilePath)) {
      return;
    }

    try {
      const raw = readFileSync(this.persistenceFilePath, "utf8");
      const parsed = JSON.parse(raw) as RepositoryDump;

      for (const event of parsed.events ?? []) {
        this.events.set(event.id, {
          ...event,
          createdAt: new Date(event.createdAt),
          closeAt: new Date(event.closeAt),
          closedAt: event.closedAt ? new Date(event.closedAt) : undefined,
        });
      }

      for (const option of parsed.options ?? []) {
        this.options.set(option.id, option);
      }

      for (const participant of parsed.participants ?? []) {
        this.participants.set(participant.id, {
          ...participant,
          createdAt: new Date(participant.createdAt),
        });
      }

      for (const vote of parsed.votes ?? []) {
        this.votes.set(vote.id, {
          ...vote,
          updatedAt: new Date(vote.updatedAt),
        });
      }
    } catch {
      // In caso di file corrotto, avvio comunque con store vuoto.
    }
  }

  private persist(): void {
    mkdirSync(dirname(this.persistenceFilePath), { recursive: true });
    const dump: RepositoryDump = {
      events: [...this.events.values()],
      options: [...this.options.values()],
      participants: [...this.participants.values()],
      votes: [...this.votes.values()],
    };
    writeFileSync(this.persistenceFilePath, JSON.stringify(dump, null, 2), "utf8");
  }
}
