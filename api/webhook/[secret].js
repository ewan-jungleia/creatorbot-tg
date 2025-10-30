const { webhookCallback } = require('grammy');
const bot = require('../_bot');

module.exports = (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }
  const handle = webhookCallback(bot, 'http');
  return handle(req, res);
};
