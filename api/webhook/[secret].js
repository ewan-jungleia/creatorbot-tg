const { webhookCallback } = require('grammy');
const bot = require('../_bot');

module.exports = (req, res) => {
  // Répondre 200 sur GET (ping Telegram)
  if (req.method === 'GET') {
    res.status(200).send('ok');
    return;
  }
  // Passer toutes les requêtes POST au bot, sans check
  const handle = webhookCallback(bot, 'http');
  return handle(req, res);
};
