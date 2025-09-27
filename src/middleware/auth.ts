import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { SubscriptionService } from '../services/SubscriptionService';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        subscription_status: string;
        trial_end_date: Date;
      };
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // For now, we'll use a simple token validation
    // In production, this should validate JWT tokens
    if (!token || token === 'invalid') {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Extract user ID from token (simplified for now)
    // In production, decode JWT and extract user ID
    const userId = token; // Simplified - in real implementation, decode JWT
    
    const user = await UserService.getUserById(userId);
    
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check if user has access (trial or subscription)
    const trialStatus = await UserService.checkTrialStatus(user);
    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(userId);
    
    if (!trialStatus.hasAccess && !subscriptionStatus.isSubscribed) {
      res.status(403).json({ error: 'Access denied. Trial expired and no active subscription' });
      return;
    }

    // Add user info to request
    req.user = {
      id: user.id,
      email: user.email,
      subscription_status: user.subscription_status,
      trial_end_date: user.trial_end_date,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireSubscription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const subscriptionStatus = await SubscriptionService.getSubscriptionStatus(req.user.id);
    
    if (!subscriptionStatus.isSubscribed) {
      res.status(403).json({ error: 'Active subscription required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ error: 'Subscription validation failed' });
  }
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No auth provided, continue without user
      next();
      return;
    }

    const token = authHeader.substring(7);
    
    if (!token || token === 'invalid') {
      // Invalid token, continue without user
      next();
      return;
    }

    const userId = token; // Simplified
    const user = await UserService.getUserById(userId);
    
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        subscription_status: user.subscription_status,
        trial_end_date: user.trial_end_date,
      };
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    // Continue without user on error
    next();
  }
};
