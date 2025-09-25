import { supabase } from '../config/supabase';
import { Notification, CreateNotificationData, UpdateNotificationData, NotificationModel } from '../models/Notification';

export class NotificationService {
  static async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    // Validate input
    if (!NotificationModel.validateDeviceToken(notificationData.device_token)) {
      throw new Error('Device token is required');
    }
    
    if (!NotificationModel.validateScheduledTime(notificationData.scheduled_for)) {
      throw new Error('Scheduled time must be in the future');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notificationData,
        sent_at: null,
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }

    return data;
  }

  static async getNotificationById(id: string): Promise<Notification | null> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getPendingNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('delivery_status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true });

    if (error) {
      throw new Error(`Failed to get pending notifications: ${error.message}`);
    }

    return data || [];
  }

  static async updateNotification(id: string, updateData: UpdateNotificationData): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update notification: ${error.message}`);
    }

    return data;
  }

  static async markAsSent(id: string): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    const updatedNotification = NotificationModel.markAsSent(notification);
    
    return await this.updateNotification(id, {
      sent_at: updatedNotification.sent_at,
      delivery_status: updatedNotification.delivery_status,
    });
  }

  static async markAsFailed(id: string): Promise<Notification> {
    const notification = await this.getNotificationById(id);
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    const updatedNotification = NotificationModel.markAsFailed(notification);
    
    return await this.updateNotification(id, {
      delivery_status: updatedNotification.delivery_status,
    });
  }

  static async createDailyContentNotification(
    userId: string,
    deviceToken: string,
    language: 'en' | 'tr'
  ): Promise<Notification> {
    const title = language === 'en' 
      ? 'New Daily Podcasts Available!'
      : 'Yeni Günlük Podcastler Hazır!';
    
    const body = language === 'en'
      ? 'Your daily AI-generated podcasts are ready to listen to.'
      : 'Günlük AI üretimi podcastleriniz dinlemeye hazır.';

    const scheduledFor = new Date();
    scheduledFor.setUTCHours(0, 5, 0, 0); // 00:05 UTC

    return await this.createNotification({
      user_id: userId,
      type: 'daily_content',
      title_en: 'New Daily Podcasts Available!',
      title_tr: 'Yeni Günlük Podcastler Hazır!',
      body_en: 'Your daily AI-generated podcasts are ready to listen to.',
      body_tr: 'Günlük AI üretimi podcastleriniz dinlemeye hazır.',
      scheduled_for: scheduledFor,
      device_token: deviceToken,
    });
  }

  static async createTrialExpiryNotification(
    userId: string,
    deviceToken: string,
    language: 'en' | 'tr'
  ): Promise<Notification> {
    const title = language === 'en'
      ? 'Trial Expiring Soon'
      : 'Deneme Süresi Yakında Bitiyor';
    
    const body = language === 'en'
      ? 'Your free trial will expire soon. Subscribe to continue enjoying our podcasts.'
      : 'Ücretsiz deneme süreniz yakında bitiyor. Podcastlerimizi dinlemeye devam etmek için abone olun.';

    const scheduledFor = new Date();
    scheduledFor.setUTCHours(23, 0, 0, 0); // 23:00 UTC (1 hour before trial ends)

    return await this.createNotification({
      user_id: userId,
      type: 'trial_expiry',
      title_en: 'Trial Expiring Soon',
      title_tr: 'Deneme Süresi Yakında Bitiyor',
      body_en: 'Your free trial will expire soon. Subscribe to continue enjoying our podcasts.',
      body_tr: 'Ücretsiz deneme süreniz yakında bitiyor. Podcastlerimizi dinlemeye devam etmek için abone olun.',
      scheduled_for: scheduledFor,
      device_token: deviceToken,
    });
  }
}
