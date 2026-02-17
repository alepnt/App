export type EventStatus = "open" | "closed";

export interface EventOption {
  id: string;
  eventId: string;
  label: string;
  source: "manual" | "suggested";
}

export interface Participant {
  id: string;
  eventId: string;
  name: string;
  role: "host" | "guest";
  authToken: string;
  createdAt: Date;
}

export interface Vote {
  id: string;
  eventId: string;
  optionId: string;
  participantId: string;
  score: 1;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  status: EventStatus;
  closeAt: Date;
  inviteToken: string;
  winningOptionId?: string;
  hostParticipantId: string;
  createdAt: Date;
  closedAt?: Date;
}

export interface VoteTotal {
  optionId: string;
  votes: number;
}
