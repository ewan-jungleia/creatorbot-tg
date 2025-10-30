const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL       = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY  = process.env.SUPABASE_ANON_KEY;
const WEBHOOK_SECRET     = process.env.WEBHOOK_SECRET;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sendMessage(chatId, text, keyboard) {
  const body = { chat_id: chatId, text, parse_mode: 'Markdown' };
  if (keyboard) body.reply_markup = { inline_keyboard: keyboard };
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (err) { reject(err); }
    });
  });
}

module.exports = async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== WEBHOOK_SECRET) return res.status(403).send('Forbidden');

    if (req.method === 'GET') return res.status(200).json({ ok: true });

    const update = await readBody(req);
    const msg = update.message || update.edited_message;
    const cb  = update.callback_query;

    if (msg && msg.chat && msg.chat.id) {
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();

      // charge session (si existe)
      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('chat_id', chatId)
        .maybeSingle();

      if (text === '/start') {
        await sendMessage(
          chatId,
          'Bienvenue sur *CreatorBotTG V1*.\nQue veux-tu faire ?',
          [
            [{ text: 'Nouveau projet', callback_data: 'new_project' }],
            [{ text: 'Aide',           callback_data: 'help' }]
          ]
        );
      } else if (session && session.step === 'title') {
        await supabase.from('sessions').update({ title: text, step: 'budget' }).eq('chat_id', chatId);
        await sendMessage(chatId, '2️⃣ Envoie ton *budget STOP* (en euros).');
      } else if (session && session.step === 'budget') {
        const budget = parseFloat(text);
        if (Number.isNaN(budget)) {
          await sendMessage(chatId, '⚠️ Merci d’entrer un nombre valide pour le budget.');
        } else {
          await supabase.from('sessions').update({ budget_stop: budget, step: 'alert' }).eq('chat_id', chatId);
          await sendMessage(chatId, '3️⃣ Quelle *alerte* veux-tu définir ?');
        }
      } else if (session && session.step === 'alert') {
        await supabase.from('sessions').update({ alert: text, step: 'recap' }).eq('chat_id', chatId);
        const recap =
          `🧾 *Récapitulatif du projet :*\n\n` +
          `• Titre : ${session.title ?? '—'}\n` +
          `• Budget STOP : ${session.budget_stop ?? '—'} €\n` +
          `• Alerte : ${text}`;
        await sendMessage(chatId, recap);
      } else {
        await sendMessage(chatId, '👋 Reçu.');
      }
    } else if (cb && cb.data) {
      const chatId = cb.message.chat.id;

      if (cb.data === 'new_project') {
        await supabase.from('sessions').upsert({
          chat_id: chatId,
          step: 'title',
          updated_at: new Date().toISOString(),
        });
        await sendMessage(chatId, '1️⃣ Envoie le *titre du projet* (un seul message).');
      } else if (cb.data === 'help') {
        await sendMessage(chatId, 'Flow : 1️⃣ Titre → 2️⃣ Budget STOP → 3️⃣ Alerte → ✅ Récapitulatif');
      }
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Webhook error:', e);
    res.status(200).json({ ok: true, error: 'handled' });
  }
};
