const TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.WEBHOOK_SECRET;

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(raw); } catch { return {}; }
}

async function sendMessage(chat_id, text, reply_markup) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const body = { chat_id, text, reply_markup };
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.ok;
}

module.exports = async (req, res) => {
  try {
    if (!TOKEN || !SECRET) { res.status(200).json({ ok: true, skip: 'missing_env' }); return; }
    const secret = req.query.secret;
    if (!secret || secret !== SECRET) { res.status(403).send('Forbidden'); return; }
    if (req.method === 'GET') { res.status(200).json({ ok: true }); return; }

    const update = await readBody(req);
    const msg = update.message || update.edited_message;
    const cb  = update.callback_query;

    if (msg && msg.chat && msg.chat.id) {
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();
      if (text === '/start') {
        await sendMessage(
          chatId,
          'Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?',
          { inline_keyboard: [[
            { text: 'Nouveau projet', callback_data: 'new_project' },
            { text: 'Aide',           callback_data: 'help' }
          ]]}
        );
      } else {
        await sendMessage(chatId, '👋 Reçu.');
      }
    } else if (cb && cb.message && cb.message.chat) {
      const chatId = cb.message.chat.id;
      if (cb.data === 'help')       await sendMessage(chatId, 'Flow: 1) Titre 2) Budget STOP 3) Alerte 4) Prompt 5) Fichiers 6) Analyse 7) Validation 8) Secrets 9) Dev/Tests 10) Livraison 11) Vérif finale');
      if (cb.data === 'new_project') await sendMessage(chatId, '1/5 • Envoie le titre du projet (un seul message).');
    }

    res.status(200).json({ ok: true });
  } catch {
    res.status(200).json({ ok: true, error: 'handled' });
  }
};
