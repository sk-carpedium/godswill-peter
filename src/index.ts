import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import db from './config/database';
import { redis } from './config/redis';
import { startCrons } from './jobs';
import fs from 'fs';
import path from 'path';

async function bootstrap(): Promise<void> {
  ['uploads','uploads/media','uploads/reports','logs'].forEach(dir =>
    fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true })
  );

  try { await db.$connect(); logger.info('✅ PostgreSQL connected'); }
  catch (err) { logger.error('❌ Database connection failed', { error: err }); process.exit(1); }

  try { await startCrons(); }
  catch (err) { logger.warn('⚠️  Cron jobs unavailable (Redis may be offline)', { error: err }); }

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Nexus Social API v2.0.0`);
    logger.info(`   Listening on  http://localhost:${env.PORT}`);
    logger.info(`   API base URL  http://localhost:${env.PORT}/${env.API_VERSION}`);
    logger.info(`   Health check  http://localhost:${env.PORT}/health`);
    logger.info(`   Environment   ${env.NODE_ENV}`);
    logger.info(`   Platforms     16 (Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube, Pinterest, Twitch, Bluesky, Threads, TruthSocial, Rumble, Kick, Spotify, Google Business, Shopify)`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — graceful shutdown`);
    server.close(async () => {
      await db.$disconnect();
      await redis.quit();
      logger.info('Shutdown complete');
      process.exit(0);
    });
    setTimeout(() => { logger.error('Forced shutdown after 10s'); process.exit(1); }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('uncaughtException',  (e) => { logger.error('Uncaught exception',  { error: e.message, stack: e.stack }); process.exit(1); });
  process.on('unhandledRejection', (r) => { logger.error('Unhandled rejection', { reason: r }); });
}

bootstrap();
