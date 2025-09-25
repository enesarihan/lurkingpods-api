import { supabase } from '../config/supabase';
import { Subscription, CreateSubscriptionData, UpdateSubscriptionData, SubscriptionModel } from '../models/Subscription';

export class SubscriptionService {
  static async createSubscription(subscriptionData: CreateSubscriptionData): Promise<Subscription> {
    // Validate input
    if (!SubscriptionModel.validateAmount(subscriptionData.amount)) {
      throw new Error('Amount must be greater than 0');
    }
    
    if (!SubscriptionModel.validateCurrency(subscriptionData.currency)) {
      throw new Error('Invalid currency');
    }
    
    if (!SubscriptionModel.validateTransactionId(subscriptionData.transaction_id)) {
      throw new Error('Transaction ID is required');
    }

    const startDate = new Date();
    const endDate = SubscriptionModel.calculateEndDate(startDate, subscriptionData.subscription_type);
    const renewalDate = SubscriptionModel.calculateRenewalDate(endDate);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        status: 'active',
        start_date: startDate,
        end_date: endDate,
        renewal_date: renewalDate,
        cancelled_at: null,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }

    return data;
  }

  static async getSubscriptionById(id: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getSubscriptionByUserId(userId: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async updateSubscription(id: string, updateData: UpdateSubscriptionData): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }

    return data;
  }

  static async cancelSubscription(id: string): Promise<Subscription> {
    return await this.updateSubscription(id, {
      status: 'cancelled',
      cancelled_at: new Date(),
    });
  }

  static async isUserSubscribed(userId: string): Promise<boolean> {
    const subscription = await this.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return false;
    }

    return SubscriptionModel.isActive(subscription);
  }

  static async getSubscriptionStatus(userId: string): Promise<{
    isSubscribed: boolean;
    subscriptionType: 'monthly' | 'yearly' | null;
    endDate: Date | null;
    isExpired: boolean;
  }> {
    const subscription = await this.getSubscriptionByUserId(userId);
    
    if (!subscription) {
      return {
        isSubscribed: false,
        subscriptionType: null,
        endDate: null,
        isExpired: false,
      };
    }

    const isActive = SubscriptionModel.isActive(subscription);
    const isExpired = SubscriptionModel.isExpired(subscription);

    return {
      isSubscribed: isActive,
      subscriptionType: subscription.subscription_type,
      endDate: subscription.end_date,
      isExpired,
    };
  }

  static async getSubscriptionPrice(subscriptionType: 'monthly' | 'yearly'): Promise<number> {
    return SubscriptionModel.getSubscriptionPrice(subscriptionType);
  }
}
