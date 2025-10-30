import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(10),
  OPENAI_API_KEY: z.string().min(10),
  WEBHOOK_SECRET: z.string().min(16),
  ADMIN_TELEGRAM_ID: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),
  SUPABASE_STORAGE_BUCKET: z.string().min(1)
});

export const env = EnvSchema.parse({
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET,
  ADMIN_TELEGRAM_ID: process.env.ADMIN_TELEGRAM_ID,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_STORAGE_BUCKET: process.env.SUPABASE_STORAGE_BUCKET
});
