import { supabase } from '../config/supabase';
import { User, CreateUserData, UpdateUserData, UserModel } from '../models/User';
import bcrypt from 'bcrypt';

export class UserService {
  static async createUser(userData: CreateUserData): Promise<User> {
    const { email, password, language_preference } = userData;
    
    // Validate input
    if (!UserModel.validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!UserModel.validatePassword(password)) {
      throw new Error('Password must be at least 8 characters');
    }
    
    if (!UserModel.validateLanguagePreference(language_preference)) {
      throw new Error('Invalid language preference');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    
    // Create trial dates
    const { trial_start_date, trial_end_date } = UserModel.createTrialDates();

    // Create user in Supabase
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        language_preference,
        trial_start_date,
        trial_end_date,
        subscription_status: 'trial',
        subscription_type: null,
        subscription_end_date: null,
        notification_enabled: true,
        notification_time: '00:05',
        favorite_categories: [],
        theme_preference: 'system',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return data;
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return null;
    }

    return data;
  }

  static async updateUser(id: string, updateData: UpdateUserData): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updateData,
        updated_at: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  static async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return null;
    }

    return user;
  }

  static async checkTrialStatus(user: User): Promise<{ isExpired: boolean; hasAccess: boolean }> {
    const isExpired = UserModel.isTrialExpired(user);
    const hasActiveSubscription = UserModel.hasActiveSubscription(user);
    
    return {
      isExpired,
      hasAccess: !isExpired || hasActiveSubscription,
    };
  }
}
