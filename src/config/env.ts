import dotenv from 'dotenv';
import { z } from 'zod';
dotenv.config();

const s = z.object({
  NODE_ENV:    z.enum(['development','production','test']).default('development'),
  PORT:        z.coerce.number().default(4000),
  API_VERSION: z.string().default('v1'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL:   z.string().default('redis://localhost:6379'),
  JWT_SECRET:              z.string().min(32),
  JWT_EXPIRES_IN:          z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:  z.string().default('7d'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  FRONTEND_URL:    z.string().default('http://localhost:5173'),
  ENCRYPTION_KEY:  z.string().min(32).optional(),
  STORAGE_PROVIDER: z.enum(['local','s3','r2']).default('local'),
  AWS_ACCESS_KEY_ID:     z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION:            z.string().optional(),
  S3_BUCKET:             z.string().optional(),
  S3_ENDPOINT:           z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  // Stripe
  STRIPE_SECRET_KEY:         z.string().optional(),
  STRIPE_PUBLISHABLE_KEY:    z.string().optional(),
  STRIPE_WEBHOOK_SECRET:     z.string().optional(),
  STRIPE_PRICE_STARTER:      z.string().optional(),
  STRIPE_PRICE_PROFESSIONAL: z.string().optional(),
  STRIPE_PRICE_ENTERPRISE:   z.string().optional(),
  STRIPE_PRICE_AGENCY:       z.string().optional(),
  // Existing platforms
  META_ACCESS_TOKEN:      z.string().optional(),
  FACEBOOK_APP_ID:        z.string().optional(),
  FACEBOOK_APP_SECRET:    z.string().optional(),
  TWITTER_BEARER_TOKEN:   z.string().optional(),
  TWITTER_CLIENT_ID:      z.string().optional(),
  TWITTER_CLIENT_SECRET:  z.string().optional(),
  LINKEDIN_CLIENT_ID:     z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  TIKTOK_CLIENT_ID:       z.string().optional(),
  TIKTOK_CLIENT_SECRET:   z.string().optional(),
  YOUTUBE_API_KEY:        z.string().optional(),
  PINTEREST_ACCESS_TOKEN: z.string().optional(),
  TWITCH_CLIENT_ID:       z.string().optional(),
  TWITCH_CLIENT_SECRET:   z.string().optional(),
  // New platforms
  BLUESKY_CLIENT_ID:         z.string().optional(),
  BLUESKY_CLIENT_SECRET:     z.string().optional(),
  THREADS_APP_ID:            z.string().optional(),
  THREADS_APP_SECRET:        z.string().optional(),
  TRUTHSOCIAL_CLIENT_ID:     z.string().optional(),
  TRUTHSOCIAL_CLIENT_SECRET: z.string().optional(),
  RUMBLE_API_KEY:            z.string().optional(),
  KICK_CLIENT_ID:            z.string().optional(),
  KICK_CLIENT_SECRET:        z.string().optional(),
  SPOTIFY_CLIENT_ID:         z.string().optional(),
  SPOTIFY_CLIENT_SECRET:     z.string().optional(),
  GOOGLE_CLIENT_ID:          z.string().optional(),
  GOOGLE_CLIENT_SECRET:      z.string().optional(),
  GOOGLE_API_KEY:            z.string().optional(),
  SHOPIFY_API_KEY:           z.string().optional(),
  SHOPIFY_API_SECRET:        z.string().optional(),
  OAUTH_CALLBACK_BASE_URL: z.string().default('http://localhost:4000'),
  // Email
  SMTP_HOST:  z.string().optional(),
  SMTP_PORT:  z.coerce.number().optional(),
  SMTP_USER:  z.string().optional(),
  SMTP_PASS:  z.string().optional(),
  EMAIL_FROM: z.string().default('noreply@nexussocial.app'),
});

const r = s.safeParse(process.env);
if (!r.success) {
  console.error('❌ Invalid environment:');
  r.error.errors.forEach(e => console.error(`  ${e.path.join('.')}: ${e.message}`));
  process.exit(1);
}
export const env = r.data;
