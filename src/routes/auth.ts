import express from 'express';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

const router = express.Router();

// Normalize Supabase date fields which may arrive as strings
function normalizeUserDates(u: any) {
  if (!u) return u;
  const toDate = (v: any) => (v ? new Date(v as any) : v);
  return {
    ...u,
    created_at: toDate(u.created_at),
    updated_at: toDate(u.updated_at),
    trial_start_date: toDate(u.trial_start_date),
    trial_end_date: toDate(u.trial_end_date),
    subscription_end_date: toDate(u.subscription_end_date),
  };
}

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, language_preference } = req.body;

    // Validate required fields
    if (!email || !password || !language_preference) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, language_preference',
      });
    }

    // Create user
    const createdUser = await UserService.createUser({
      email,
      password,
      language_preference,
    });
    const user = normalizeUserDates(createdUser);

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: (user.trial_start_date as Date).toISOString(),
        trial_end_date: (user.trial_end_date as Date).toISOString(),
        subscription_status: user.subscription_status,
      },
      session: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      trial_info: {
        is_trial: true,
        trial_start_date: (user.trial_start_date as Date).toISOString(),
        trial_end_date: (user.trial_end_date as Date).toISOString(),
        days_remaining: Math.ceil(((user.trial_end_date as Date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error?.code === 'EMAIL_TAKEN' || error?.message === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({
      error: 'Failed to create user account',
    });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: email, password',
      });
    }

    // Authenticate user
    const rawUser = await UserService.authenticateUser(email, password);

    if (!rawUser) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }
    const user = normalizeUserDates(rawUser);

    // Check trial status
    const trialStatus = await UserService.checkTrialStatus(user as any);

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: (user.trial_start_date as Date).toISOString(),
        trial_end_date: (user.trial_end_date as Date).toISOString(),
        subscription_status: user.subscription_status,
      },
      session: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      trial_info: {
        is_trial: user.subscription_status === 'trial',
        trial_start_date: (user.trial_start_date as Date).toISOString(),
        trial_end_date: (user.trial_end_date as Date).toISOString(),
        days_remaining: Math.ceil(((user.trial_end_date as Date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        is_expired: trialStatus.isExpired,
        has_access: trialStatus.hasAccess,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Failed to authenticate user',
    });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const rawUser = await UserService.getUserById(userId);

    if (!rawUser) {
      return res.status(404).json({
        error: 'User not found',
      });
    }
    const user = normalizeUserDates(rawUser);

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: (user.trial_start_date as Date).toISOString(),
        trial_end_date: (user.trial_end_date as Date).toISOString(),
        subscription_status: user.subscription_status,
        notification_enabled: user.notification_enabled,
        favorite_categories: user.favorite_categories,
        theme_preference: user.theme_preference,
      },
      subscription: subscriptionStatus,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user information',
    });
  }
});

export default router;
