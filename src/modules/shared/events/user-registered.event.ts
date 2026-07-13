// src/modules/shared/events/user-registered.event.ts

export interface UserRegisteredEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  registeredAt: Date;
}

export class UserRegisteredEvent {
  constructor(public readonly data: UserRegisteredEvent) {}
}