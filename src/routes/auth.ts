import express from 'express';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

const router = express.Router();

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
    const user = await UserService.createUser({
      email,
      password,
      language_preference,
    });

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
        subscription_status: user.subscription_status,
      },
      session: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      trial_info: {
        is_trial: true,
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
        days_remaining: Math.ceil((user.trial_end_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
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
    const user = await UserService.authenticateUser(email, password);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password',
      });
    }

    // Check trial status
    const trialStatus = await UserService.checkTrialStatus(user);

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
        subscription_status: user.subscription_status,
      },
      session: {
        user_id: user.id,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
      trial_info: {
        is_trial: user.subscription_status === 'trial',
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
        days_remaining: Math.ceil((user.trial_end_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
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

    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Get subscription status
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        language_preference: user.language_preference,
        trial_start_date: user.trial_start_date,
        trial_end_date: user.trial_end_date,
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
