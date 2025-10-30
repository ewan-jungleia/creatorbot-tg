import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webhookCallback } from 'grammy';
import { bot } from '../_bot';
import { env } from '../_env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const q = req.query.secret;
  const secret = Array.isArray(q) ? q[0] : q;
  if (!secret || secret !== env.WEBHOOK_SECRET) {
    res.status(403).send('Forbidden');
    return;
  }
  const handleUpdate = webhookCallback(bot, 'http');
  return handleUpdate(req as any, res as any);
}
