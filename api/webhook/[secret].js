const { webhookCallback } = require('grammy');
const bot = require('../_bot');
const env = require('../_env');

module.exports = (req, res) => {
  const q = req.query.secret;
  const secret = Array.isArray(q) ? q[0] : q;

  // TEMP: logs pour vérif (Vercel -> Logs)
  console.log('WEBHOOK hit', {
    method: req.method,
    secretFromPath: secret && String(secret).slice(0, 8) + '…',
    envHasSecret: Boolean(env.WEBHOOK_SECRET)
  });

  if (!secret || secret !== env.WEBHOOK_SECRET) {
    res.status(403).send('Forbidden');
    return;
  }

  const handle = webhookCallback(bot, 'http');
  return handle(req, res);
};
