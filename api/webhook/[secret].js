const https = require('https');
const db = require('../_db');
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

const send = (id, text, extra) => tg('sendMessage', { chat_id: id, text, ...(extra||{}) });
const answerCb = (id) => tg('answerCallbackQuery', { callback_query_id: id });

async function getSession(chat_id) {
  const { data } = await db.from('sessions').select('*').eq('chat_id', chat_id).single();
  return data;
}

async function setSession(chat_id, patch) {
  const s = await getSession(chat_id);
  if (s) await db.from('sessions').update(patch).eq('chat_id', chat_id);
  else await db.from('sessions').insert({ chat_id, ...patch });
}

module.exports = async (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }

  try {
    const u = typeof req.body === 'string' ? JSON.parse(req.body||'{}') : (req.body||{});
    const msg = u.message || u.edited_message;
    const cb  = u.callback_query;

    if (msg && msg.text === '/start') {
      const kb = { inline_keyboard: [
        [{ text: 'Nouveau projet', callback_data: 'new_project' }],
        [{ text: 'Aide', callback_data: 'help' }]
      ]};
      await send(msg.chat.id, 'Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?', { reply_markup: kb });
      res.status(200).json({ ok:true }); return;
    }

    if (cb && cb.data === 'help') {
      await answerCb(cb.id);
      await send(cb.message.chat.id, 'Flow : 1) Titre  2) Budget STOP  3) Alerte  4) Prompt  5) Fichiers  6) Analyse  7) Validation  8) Secrets  9) Dev/Tests  10) Livraison');
      res.status(200).json({ ok:true }); return;
    }

    if (cb && cb.data === 'new_project') {
      await answerCb(cb.id);
      await setSession(cb.message.chat.id, { step: 'title' });
      await send(cb.message.chat.id, '1/5 • Envoie le *titre du projet* en un message.', { parse_mode: 'Markdown' });
      res.status(200).json({ ok:true }); return;
    }

    if (msg && msg.text) {
      const s = await getSession(msg.chat.id);

      if (!s || !s.step) {
        await send(msg.chat.id, '👋 Reçu.');
        res.status(200).json({ ok:true }); return;
      }

      if (s.step === 'title') {
        await setSession(msg.chat.id, { title: msg.text, step: 'budget_stop' });
        await send(msg.chat.id, `✅ Titre enregistré : *${msg.text}*\n\n2/5 • Envoie le *budget STOP* (en €).`, { parse_mode: 'Markdown' });
        res.status(200).json({ ok:true }); return;
      }

      if (s.step === 'budget_stop') {
        const num = parseFloat(msg.text.replace(/[^0-9.]/g, ''));
        await setSession(msg.chat.id, { budget_stop: num, step: 'alert' });
        await send(msg.chat.id, `💰 Budget STOP : *${num.toFixed(2)} €*\n\n3/5 • Décris les *alertes importantes* à surveiller.`, { parse_mode: 'Markdown' });
        res.status(200).json({ ok:true }); return;
      }

      if (s.step === 'alert') {
        await setSession(msg.chat.id, { alert: msg.text, step: null });
        await send(msg.chat.id, `⚠️ Alerte enregistrée : *${msg.text}*\n\n✅ Étapes 1–3 terminées !`, { parse_mode: 'Markdown' });
        res.status(200).json({ ok:true }); return;
      }

      await send(msg.chat.id, '✅ Terminé pour cette section.');
      res.status(200).json({ ok:true }); return;
    }

    res.status(200).json({ ok:true });
  } catch {
    res.status(200).json({ ok:true });
  }
};
