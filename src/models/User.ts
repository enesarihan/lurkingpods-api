export interface User {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
  trial_start_date: Date;
  trial_end_date: Date;
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled';
  subscription_type: 'monthly' | 'yearly' | null;
  subscription_end_date: Date | null;
  language_preference: 'en' | 'tr';
  notification_enabled: boolean;
  notification_time: string;
  favorite_categories: string[];
  theme_preference: 'light' | 'dark' | 'system';
}

export interface CreateUserData {
  email: string;
  password: string;
  language_preference: 'en' | 'tr';
}

export interface UpdateUserData {
  language_preference?: 'en' | 'tr';
  notification_enabled?: boolean;
  notification_time?: string;
  favorite_categories?: string[];
  theme_preference?: 'light' | 'dark' | 'system';
}

export class UserModel {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  static validateLanguagePreference(language: string): language is 'en' | 'tr' {
    return language === 'en' || language === 'tr';
  }

  static validateThemePreference(theme: string): theme is 'light' | 'dark' | 'system' {
    return theme === 'light' || theme === 'dark' || theme === 'system';
  }

  static createTrialDates(): { trial_start_date: Date; trial_end_date: Date } {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
    return {
      trial_start_date: now,
      trial_end_date: trialEnd,
    };
  }

  static isTrialExpired(user: User): boolean {
    return new Date() > user.trial_end_date;
  }

  static hasActiveSubscription(user: User): boolean {
    return user.subscription_status === 'active' && 
           user.subscription_end_date !== null && 
           new Date() < user.subscription_end_date;
  }
}
