import express from 'express';
import { SubscriptionService } from '../services/SubscriptionService';
import { UserService } from '../services/UserService';

const router = express.Router();

// GET /subscription/status
router.get('/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(userId);

    res.json({
      status: subscriptionStatus.isSubscribed ? 'active' : 'inactive',
      subscription_type: subscriptionStatus.subscriptionType,
      end_date: subscriptionStatus.endDate,
      is_expired: subscriptionStatus.isExpired,
      is_subscribed: subscriptionStatus.isSubscribed,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({
      error: 'Failed to get subscription status',
    });
  }
});

// POST /subscription/verify
router.post('/verify', async (req, res) => {
  try {
    const { platform, receipt_data } = req.body;
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    if (!platform || !receipt_data) {
      return res.status(400).json({
        error: 'Missing required fields: platform, receipt_data',
      });
    }

    if (platform !== 'ios' && platform !== 'android') {
      return res.status(400).json({
        error: 'Invalid platform. Must be "ios" or "android"',
      });
    }

    // Verify receipt with App Store/Google Play
    const verificationResult = await verifyReceipt(platform, receipt_data);

    if (!verificationResult.isValid) {
      return res.status(400).json({
        error: 'Invalid receipt',
      });
    }

    // Create subscription
    const subscription = await SubscriptionService.createSubscription({
      user_id: userId,
      subscription_type: verificationResult.subscriptionType,
      payment_method: platform,
      transaction_id: verificationResult.transactionId,
      amount: verificationResult.amount,
      currency: 'USD',
    });

    res.json({
      subscription_id: subscription.id,
      subscription_type: subscription.subscription_type,
      status: subscription.status,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      amount: subscription.amount,
      currency: subscription.currency,
    });
  } catch (error) {
    console.error('Verify subscription error:', error);
    res.status(500).json({
      error: 'Failed to verify subscription',
    });
  }
});

// POST /subscription/cancel
router.post('/cancel', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return res.status(401).json({
        error: 'User ID required',
      });
    }

    const subscription = await SubscriptionService.getSubscriptionByUserId(userId);

    if (!subscription) {
      return res.status(404).json({
        error: 'No active subscription found',
      });
    }

    const cancelledSubscription = await SubscriptionService.cancelSubscription(subscription.id);

    res.json({
      subscription_id: cancelledSubscription.id,
      status: cancelledSubscription.status,
      cancelled_at: cancelledSubscription.cancelled_at,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
    });
  }
});

// GET /subscription/prices
router.get('/prices', async (req, res) => {
  try {
    const monthlyPrice = await SubscriptionService.getSubscriptionPrice('monthly');
    const yearlyPrice = await SubscriptionService.getSubscriptionPrice('yearly');

    res.json({
      monthly: {
        price: monthlyPrice,
        currency: 'USD',
        period: 'month',
      },
      yearly: {
        price: yearlyPrice,
        currency: 'USD',
        period: 'year',
        savings: Math.round(((monthlyPrice * 12) - yearlyPrice) / (monthlyPrice * 12) * 100),
      },
    });
  } catch (error) {
    console.error('Get subscription prices error:', error);
    res.status(500).json({
      error: 'Failed to get subscription prices',
    });
  }
});

// Helper function to verify receipts
async function verifyReceipt(platform: string, receiptData: string): Promise<{
  isValid: boolean;
  subscriptionType: 'monthly' | 'yearly';
  transactionId: string;
  amount: number;
}> {
  // Placeholder implementation - would integrate with actual App Store/Google Play APIs
  // For now, return mock verification result
  return {
    isValid: true,
    subscriptionType: 'monthly',
    transactionId: `txn_${Date.now()}`,
    amount: 9.99,
  };
}

export default router;
