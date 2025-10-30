const { TELEGRAM_BOT_TOKEN, WEBHOOK_SECRET } = require('../_env');

const TG = (method, payload) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

module.exports = async (req, res) => {
  try {
    // 1) Secret
    const secret = req.query.secret;
    if (!secret || secret !== WEBHOOK_SECRET) {
      res.status(403).send('Forbidden');
      return;
    }

    // 2) Health GET
    if (req.method === 'GET') {
      res.status(200).json({ ok: true });
      return;
    }

    // 3) Telegram update (body peut être string)
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    // 4) Router minimal
    if (update.message) {
      const chatId = update.message.chat.id;
      const txt = update.message.text || '';

      if (txt === '/start') {
        await TG('sendMessage', {
          chat_id: chatId,
          text: 'Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?',
          reply_markup: {
            inline_keyboard: [
              [{ text: 'Nouveau projet', callback_data: 'new_project' }],
              [{ text: 'Aide', callback_data: 'help' }],
            ],
          },
        });
      } else {
        // Texte libre → accusé de réception
        await TG('sendMessage', { chat_id: chatId, text: '👋 Reçu.' });
      }
    } else if (update.callback_query) {
      const chatId = update.callback_query.message.chat.id;
      const data = update.callback_query.data;

      if (data === 'help') {
        await TG('answerCallbackQuery', { callback_query_id: update.callback_query.id });
        await TG('sendMessage', { chat_id: chatId, text: '✅ Bot en ligne (réponse directe).' });
      } else if (data === 'new_project') {
        await TG('answerCallbackQuery', { callback_query_id: update.callback_query.id });
        await TG('sendMessage', { chat_id: chatId, text: '1/5 • Envoie le titre du projet (un seul message).' });
      } else {
        await TG('answerCallbackQuery', { callback_query_id: update.callback_query.id });
      }
    }

    // 5) Toujours 200 pour éviter les retries Telegram
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('webhook_error', e);
    res.status(200).json({ ok: true });
  }
};
