const { webhookCallback } = require('grammy');
const bot = require('../_bot');

module.exports = (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }
  return webhookCallback(bot, 'http')(req, res);
};
