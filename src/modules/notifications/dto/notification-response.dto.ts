// src/modules/notifications/dto/notification-response.dto.ts
export class NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  priority: number;
  channels: string[];
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(notification: any) {
    this.id = notification._id.toString();
    this.userId = notification.userId;
    this.type = notification.type;
    this.priority = notification.priority;
    this.channels = notification.channels;
    this.title = notification.title;
    this.message = notification.message;
    this.data = notification.data;
    this.isRead = notification.isRead;
    this.readAt = notification.readAt;
    this.status = notification.status;
    this.createdAt = notification.createdAt;
    this.updatedAt = notification.updatedAt;
  }

  static fromNotification(notification: any): NotificationResponseDto {
    return new NotificationResponseDto(notification);
  }

  static fromNotifications(notifications: any[]): NotificationResponseDto[] {
    return notifications.map(n => new NotificationResponseDto(n));
  }
}