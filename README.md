# LurkingPods API

AI-powered podcast platform backend API built with Express.js and TypeScript.

## Features

- 🤖 AI content generation with Google Gemini
- 🎵 Text-to-speech with ElevenLabs
- 🌍 Bilingual support (English/Turkish)
- 📱 Mobile-optimized API
- 🔐 Authentication with Supabase
- 💳 Subscription management
- 📊 Real-time analytics
- 🔔 Push notifications

## Tech Stack

- **Backend**: Express.js, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **AI**: Google Gemini API
- **TTS**: ElevenLabs API
- **Scheduler**: node-cron
- **Queue**: Bull (Redis-based)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Redis server
- Supabase account
- Google Gemini API key
- ElevenLabs API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lurkingpods-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Redis
REDIS_URL=redis://localhost:6379

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# ElevenLabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Server
PORT=3000
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### Content
- `GET /content/daily-mix` - Get daily podcast mix
- `GET /content/categories` - Get all categories
- `GET /content/category/:id` - Get category podcasts
- `GET /content/podcast/:id` - Get specific podcast
- `POST /content/podcast/:id/play` - Increment play count

### Subscription
- `GET /subscription/status` - Get subscription status
- `POST /subscription/verify` - Verify subscription
- `POST /subscription/cancel` - Cancel subscription
- `GET /subscription/prices` - Get subscription prices

### User
- `GET /user/preferences` - Get user preferences
- `PUT /user/preferences` - Update user preferences
- `POST /user/device-token` - Register device token
- `GET /user/notifications` - Get notification settings

### Admin
- `POST /admin/generate-content` - Generate content
- `GET /admin/jobs` - Get generation jobs
- `POST /admin/jobs/:id/retry` - Retry failed job
- `DELETE /admin/podcasts/expired` - Delete expired podcasts

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

### Database Schema

The API uses Supabase (PostgreSQL) with the following main tables:

- `users` - User accounts and preferences
- `podcasts` - Generated podcast content
- `categories` - Content categories
- `subscriptions` - User subscriptions
- `notifications` - Push notifications
- `content_generation_jobs` - AI generation jobs

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
REDIS_URL=your_production_redis_url
GEMINI_API_KEY=your_gemini_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NODE_ENV=production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
