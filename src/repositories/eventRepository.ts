import { Event, EventOption, Participant, Vote } from "../domain/types.js";

export class EventRepository {
  private readonly events = new Map<string, Event>();
  private readonly options = new Map<string, EventOption>();
  private readonly participants = new Map<string, Participant>();
  private readonly votes = new Map<string, Vote>();

  saveEvent(event: Event): void {
    this.events.set(event.id, event);
  }

  getEvent(eventId: string): Event | undefined {
    return this.events.get(eventId);
  }

  findEventByInviteToken(inviteToken: string): Event | undefined {
    return [...this.events.values()].find((event) => event.inviteToken === inviteToken);
  }

  saveOption(option: EventOption): void {
    this.options.set(option.id, option);
  }

  listOptionsByEvent(eventId: string): EventOption[] {
    return [...this.options.values()].filter((option) => option.eventId === eventId);
  }

  saveParticipant(participant: Participant): void {
    this.participants.set(participant.id, participant);
  }

  getParticipant(participantId: string): Participant | undefined {
    return this.participants.get(participantId);
  }

  listParticipantsByEvent(eventId: string): Participant[] {
    return [...this.participants.values()].filter((participant) => participant.eventId === eventId);
  }

  findParticipantByEventAndName(eventId: string, name: string): Participant | undefined {
    return [...this.participants.values()].find(
      (participant) => participant.eventId === eventId && participant.name === name,
    );
  }

  saveVote(vote: Vote): void {
    this.votes.set(vote.id, vote);
  }

  findVoteByParticipantAndOption(participantId: string, optionId: string): Vote | undefined {
    return [...this.votes.values()].find(
      (vote) => vote.participantId === participantId && vote.optionId === optionId,
    );
  }

  listVotesByEvent(eventId: string): Vote[] {
    return [...this.votes.values()].filter((vote) => vote.eventId === eventId);
  }
}
