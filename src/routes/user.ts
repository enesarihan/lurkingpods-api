import express from 'express';
import { UserService } from '../services/UserService';
import { NotificationService } from '../services/NotificationService';

const router = express.Router();

// GET /user/preferences
router.get('/preferences', async (req, res) => {
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

    res.json({
      language_preference: user.language_preference,
      notification_enabled: user.notification_enabled,
      notification_time: user.notification_time,
      favorite_categories: user.favorite_categories,
      theme_preference: user.theme_preference,
    });
  } catch (error) {
    console.error('Get user preferences error:', error);
    res.status(500).json({
      error: 'Failed to get user preferences',
    });
  }
});

// PUT /user/preferences
router.put('/preferences', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const { language_preference, notification_enabled, notification_time, favorite_categories, theme_preference } = req.body;

    // Validate input
    if (language_preference && !UserService.validateLanguagePreference(language_preference)) {
      return res.status(400).json({
        error: 'Invalid language preference. Must be "en" or "tr"',
      });
    }

    if (theme_preference && !UserService.validateThemePreference(theme_preference)) {
      return res.status(400).json({
        error: 'Invalid theme preference. Must be "light", "dark", or "system"',
      });
    }

    const updateData: any = {};
    if (language_preference) updateData.language_preference = language_preference;
    if (notification_enabled !== undefined) updateData.notification_enabled = notification_enabled;
    if (notification_time) updateData.notification_time = notification_time;
    if (favorite_categories) updateData.favorite_categories = favorite_categories;
    if (theme_preference) updateData.theme_preference = theme_preference;

    const updatedUser = await UserService.updateUser(userId, updateData);

    res.json({
      language_preference: updatedUser.language_preference,
      notification_enabled: updatedUser.notification_enabled,
      notification_time: updatedUser.notification_time,
      favorite_categories: updatedUser.favorite_categories,
      theme_preference: updatedUser.theme_preference,
    });
  } catch (error) {
    console.error('Update user preferences error:', error);
    res.status(500).json({
      error: 'Failed to update user preferences',
    });
  }
});

// POST /user/device-token
router.post('/device-token', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const { device_token, platform } = req.body;

    if (!device_token || !platform) {
      return res.status(400).json({
        error: 'Missing required fields: device_token, platform',
      });
    }

    if (platform !== 'ios' && platform !== 'android') {
      return res.status(400).json({
        error: 'Invalid platform. Must be "ios" or "android"',
      });
    }

    // Store device token (placeholder - would use actual device token storage)
    // For now, just return success
    res.json({
      success: true,
      message: 'Device token registered successfully',
    });
  } catch (error) {
    console.error('Register device token error:', error);
    res.status(500).json({
      error: 'Failed to register device token',
    });
  }
});

// GET /user/notifications
router.get('/notifications', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    // Get user's notification preferences
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      notification_enabled: user.notification_enabled,
      notification_time: user.notification_time,
      language_preference: user.language_preference,
    });
  } catch (error) {
    console.error('Get user notifications error:', error);
    res.status(500).json({
      error: 'Failed to get user notifications',
    });
  }
});

// POST /user/notifications/test
router.post('/notifications/test', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const { device_token } = req.body;

    if (!device_token) {
      return res.status(400).json({
        error: 'Missing required field: device_token',
      });
    }

    // Get user preferences
    const user = await UserService.getUserById(userId);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Create test notification
    const testNotification = await NotificationService.createDailyContentNotification(
      userId,
      device_token,
      user.language_preference
    );

    res.json({
      success: true,
      notification_id: testNotification.id,
      message: 'Test notification scheduled',
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      error: 'Failed to send test notification',
    });
  }
});

export default router;
