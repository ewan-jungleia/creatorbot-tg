const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function tg(path, payload) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload || {});
    const req = https.request(
      { hostname: 'api.telegram.org', path: `/bot${TOKEN}/${path}`, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      (res) => { res.on('data',()=>{}); res.on('end', resolve); }
    );
    req.on('error', resolve);
    req.write(data); req.end();
  });
}

function sendMessage(chat_id, text, extra) {
  return tg('sendMessage', { chat_id, text, ...(extra||{}) });
}

function answerCallbackQuery(id) {
  return tg('answerCallbackQuery', { callback_query_id: id });
}

module.exports = async (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }

  try {
    const u = typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body||{});
    const msg = u.message || u.edited_message || null;
    const cb  = u.callback_query || null;

    if (!TOKEN) { res.status(200).json({ ok:true }); return; }

    if (msg && msg.chat && msg.text === '/start') {
      const kb = {
        inline_keyboard: [
          [{ text: 'Nouveau projet', callback_data: 'new_project' }],
          [{ text: 'Aide', callback_data: 'help' }]
        ]
      };
      await sendMessage(msg.chat.id, 'Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?', { reply_markup: kb });
      res.status(200).json({ ok:true }); return;
    }

    if (cb && cb.data === 'help') {
      await answerCallbackQuery(cb.id);
      await sendMessage(cb.message.chat.id, 'Flow: 1) Titre 2) Budget STOP 3) Alerte 4) Prompt 5) Fichiers 6) Analyse 7) Validation 8) Secrets 9) Dev/Tests 10) Livraison 11) Vérif finale');
      res.status(200).json({ ok:true }); return;
    }

    if (cb && cb.data === 'new_project') {
      await answerCallbackQuery(cb.id);
      await sendMessage(cb.message.chat.id, '1/5 • Envoie le titre du projet (un seul message).');
      res.status(200).json({ ok:true }); return;
    }

    if (msg && msg.chat && msg.text) {
      await sendMessage(msg.chat.id, '👋 Reçu.');
      res.status(200).json({ ok:true }); return;
    }

    res.status(200).json({ ok:true });
  } catch {
    res.status(200).json({ ok:true });
  }
};
