// src/modules/shared/events/portfolio-published.event.ts

export interface PortfolioPublishedEvent {
  userId: string;
  portfolioId: string;
  username: string;
  title: string;
  url: string;
  publishedAt: Date;
}

export class PortfolioPublishedEvent {
  constructor(public readonly data: PortfolioPublishedEvent) {}
}