// src/modules/shared/events/contact-received.event.ts

export interface ContactReceivedEvent {
  userId: string;
  portfolioId: string;
  from: string;
  email: string;
  message: string;
  portfolioUsername: string;
  receivedAt: Date;
}

export class ContactReceivedEvent {
  constructor(public readonly data: ContactReceivedEvent) {}
}