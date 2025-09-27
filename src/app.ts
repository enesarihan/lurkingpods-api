import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import subscriptionRoutes from './routes/subscription';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import { authenticateUser, optionalAuth } from './middleware/auth';
import { generalRateLimit, authRateLimit, contentRateLimit, subscriptionRateLimit } from './middleware/rateLimit';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { corsOptions, securityHeaders, validateApiKey, requestSizeLimiter, sanitizeRequest } from './middleware/security';

const app = express();

// Logging middleware (should be first)
app.use(requestLogger);
app.use(performanceLogger);

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(requestSizeLimiter);
app.use(sanitizeRequest);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
app.use(generalRateLimit.middleware());

// Routes with specific rate limiting
app.use('/auth', authRateLimit.middleware(), authRoutes);
app.use('/content', contentRateLimit.middleware(), optionalAuth, contentRoutes);
app.use('/subscription', subscriptionRateLimit.middleware(), authenticateUser, subscriptionRoutes);
app.use('/user', authenticateUser, userRoutes);
app.use('/admin', validateApiKey, authenticateUser, adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorLogger);

export default app;
