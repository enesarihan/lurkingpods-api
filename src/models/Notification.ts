export interface Notification {
  id: string;
  user_id: string;
  type: 'daily_content' | 'subscription_reminder' | 'trial_expiry';
  title_en: string;
  title_tr: string;
  body_en: string;
  body_tr: string;
  scheduled_for: Date;
  sent_at: Date | null;
  delivery_status: 'pending' | 'sent' | 'failed';
  device_token: string;
  created_at: Date;
}

export interface CreateNotificationData {
  user_id: string;
  type: 'daily_content' | 'subscription_reminder' | 'trial_expiry';
  title_en: string;
  title_tr: string;
  body_en: string;
  body_tr: string;
  scheduled_for: Date;
  device_token: string;
}

export interface UpdateNotificationData {
  sent_at?: Date | null;
  delivery_status?: 'pending' | 'sent' | 'failed';
}

export class NotificationModel {
  static validateDeviceToken(token: string): boolean {
    return token.length > 0;
  }

  static validateScheduledTime(scheduledFor: Date): boolean {
    return scheduledFor > new Date();
  }

  static getTitle(notification: Notification, language: 'en' | 'tr'): string {
    return language === 'en' ? notification.title_en : notification.title_tr;
  }

  static getBody(notification: Notification, language: 'en' | 'tr'): string {
    return language === 'en' ? notification.body_en : notification.body_tr;
  }

  static isPending(notification: Notification): boolean {
    return notification.delivery_status === 'pending';
  }

  static isSent(notification: Notification): boolean {
    return notification.delivery_status === 'sent';
  }

  static isFailed(notification: Notification): boolean {
    return notification.delivery_status === 'failed';
  }

  static markAsSent(notification: Notification): Notification {
    return {
      ...notification,
      sent_at: new Date(),
      delivery_status: 'sent',
    };
  }

  static markAsFailed(notification: Notification): Notification {
    return {
      ...notification,
      delivery_status: 'failed',
    };
  }
}
