const { webhookCallback } = require('grammy');
const { bot } = require('../_bot');
const { WEBHOOK_SECRET } = require('../_env');

module.exports = async (req, res) => {
  try {
    const secret = req.query.secret;
    if (!secret || secret !== WEBHOOK_SECRET) {
      res.status(403).send('Forbidden');
      return;
    }
    if (req.method === 'GET') {
      res.status(200).json({ ok: true });
      return;
    }
    const handle = webhookCallback(bot, 'http');
    await handle(req, res);
  } catch (e) {
    console.error('webhook_error', e);
    res.status(200).json({ ok: true });
  }
};
