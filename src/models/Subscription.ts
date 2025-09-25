export interface Subscription {
  id: string;
  user_id: string;
  subscription_type: 'monthly' | 'yearly';
  status: 'active' | 'cancelled' | 'expired';
  start_date: Date;
  end_date: Date;
  renewal_date: Date;
  payment_method: string;
  transaction_id: string;
  amount: number;
  currency: string;
  created_at: Date;
  cancelled_at: Date | null;
}

export interface CreateSubscriptionData {
  user_id: string;
  subscription_type: 'monthly' | 'yearly';
  payment_method: string;
  transaction_id: string;
  amount: number;
  currency: string;
}

export interface UpdateSubscriptionData {
  status?: 'active' | 'cancelled' | 'expired';
  end_date?: Date;
  renewal_date?: Date;
  cancelled_at?: Date | null;
}

export class SubscriptionModel {
  static validateAmount(amount: number): boolean {
    return amount > 0;
  }

  static validateCurrency(currency: string): boolean {
    return currency === 'USD';
  }

  static validateTransactionId(transactionId: string): boolean {
    return transactionId.length > 0;
  }

  static calculateEndDate(startDate: Date, subscriptionType: 'monthly' | 'yearly'): Date {
    const endDate = new Date(startDate);
    if (subscriptionType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    return endDate;
  }

  static calculateRenewalDate(endDate: Date): Date {
    return new Date(endDate);
  }

  static isActive(subscription: Subscription): boolean {
    return subscription.status === 'active' && new Date() < subscription.end_date;
  }

  static isExpired(subscription: Subscription): boolean {
    return new Date() > subscription.end_date;
  }

  static isCancelled(subscription: Subscription): boolean {
    return subscription.status === 'cancelled';
  }

  static getSubscriptionPrice(subscriptionType: 'monthly' | 'yearly'): number {
    return subscriptionType === 'monthly' ? 9.99 : 99.99;
  }
}
