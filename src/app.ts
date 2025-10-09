import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import subscriptionRoutes from './routes/subscription';
import userRoutes from './routes/user';
import adminRoutes from './routes/admin';
import { authenticateUser, optionalAuth } from './middleware/auth';
import { generalRateLimit, authRateLimit, contentRateLimit, subscriptionRateLimit } from './middleware/rateLimit';
import { requestLogger, errorLogger, performanceLogger } from './middleware/logging';
import { corsOptions, securityHeaders, validateApiKey, requestSizeLimiter, sanitizeRequest } from './middleware/security';
import { GeminiService } from './services/GeminiService';
import { ElevenLabsService } from './services/ElevenLabsService';

// Load env early
dotenv.config();

const app = express();

// Initialize external services from env
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
  GeminiService.initialize(geminiKey);
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('GEMINI_API_KEY missing – GeminiService not initialized');
}

const elevenKey = process.env.ELEVENLABS_API_KEY;
if (elevenKey) {
  ElevenLabsService.initialize(elevenKey);
} else if (process.env.NODE_ENV !== 'test') {
  console.warn('ELEVENLABS_API_KEY missing – ElevenLabsService not initialized');
}

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

// Global rate limiting (disabled)
// app.use(generalRateLimit.middleware());

// Routes with specific rate limiting (disabled)
app.use('/auth', /* authRateLimit.middleware(), */ authRoutes);
app.use('/content', /* contentRateLimit.middleware(), */ optionalAuth, contentRoutes);
app.use('/subscription', /* subscriptionRateLimit.middleware(), */ authenticateUser, subscriptionRoutes);
app.use('/user', authenticateUser, userRoutes);
// Temporarily bypass auth for testing
app.use('/admin', adminRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware (should be last)
app.use(errorLogger);

export default app;
