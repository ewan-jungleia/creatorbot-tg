import type { VercelRequest, VercelResponse } from '@vercel/node';
import { webhookCallback } from 'grammy';
import { bot } from '../_bot';
import { env } from '../_env';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // TEMP: logs pour diagnostic rapide
  const q = req.query.secret;
  const secretFromPath = Array.isArray(q) ? q[0] : q;
  console.log('WEBHOOK hit', {
    method: req.method,
    secretFromPath,
    envHasSecret: Boolean(env.WEBHOOK_SECRET),
    same: secretFromPath === env.WEBHOOK_SECRET
  });

  // TEMP: on autorise tout pour lever le 401 et valider le flow
  const handleUpdate = webhookCallback(bot, 'http');
  return handleUpdate(req as any, res as any);
}
