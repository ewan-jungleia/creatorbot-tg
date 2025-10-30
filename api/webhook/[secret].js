const { supabase } = require('../_db');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => (data += c));
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); }
      catch (e) { resolve({}); }
    });
    req.on('error', reject);
  });
}

async function sendMessage(chatId, text, replyMarkup) {
  const body = { chat_id: chatId, text, parse_mode: 'HTML' };
  if (replyMarkup) body.reply_markup = { inline_keyboard: replyMarkup };
  await fetch(`${TG}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function answerCallbackQuery(id) {
  if (!id) return;
  await fetch(`${TG}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: id }),
  });
}

// ---------- Sessions helpers ----------
async function getSession(chatId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('chat_id', chatId)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function upsertSession(partial) {
  const { data, error } = await supabase
    .from('sessions')
    .upsert(partial, { onConflict: 'chat_id' })
    .select()
    .maybeSingle();
  if (error) throw error;
  return data;
}

function parseBudget(text) {
  // Ex: "1 500", "1.500", "1,500.00", "1500", "1 500"
  const cleaned = (text || '')
    .replace(/\s| /g, '')
    .replace(',', '.')
    .replace(/[^0-9.]/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

module.exports = async (req, res) => {
  try {
    // Sécurité
    const secret = req.query.secret;
    if (!secret || secret !== WEBHOOK_SECRET) {
      res.status(403).send('Forbidden');
      return;
    }
    if (req.method === 'GET') {
      res.status(200).json({ ok: true });
      return;
    }

    const update = await readBody(req);
    const msg = update.message || update.edited_message;
    const cb  = update.callback_query;

    // ---- Callbacks: Aide / Nouveau projet
    if (cb && cb.data) {
      await answerCallbackQuery(cb.id);
      const chatId = cb.message?.chat?.id;
      if (!chatId) {
        res.status(200).json({ ok: true });
        return;
      }

      if (cb.data === 'help') {
        await sendMessage(
          chatId,
          'Flow: 1) Titre 2) Budget STOP 3) Alerte 4) Prompt 5) Fichiers 6) Analyse 7) Validation 8) Secrets 9) Dev/Tests 10) Livraison 11) Vérif finale'
        );
      }

      if (cb.data === 'new_project') {
        await upsertSession({ chat_id: chatId, step: 'title', updated_at: new Date().toISOString() });
        await sendMessage(chatId, '1/5 • Envoie le titre du projet (un seul message).');
      }

      res.status(200).json({ ok: true });
      return;
    }

    // ---- Messages
    if (msg && msg.chat && msg.chat.id) {
      const chatId = msg.chat.id;
      const text = (msg.text || '').trim();

      // Commande /start -> menu
      if (text === '/start') {
        await upsertSession({ chat_id: chatId, step: 'title', updated_at: new Date().toISOString() });
        await sendMessage(
          chatId,
          'Bienvenue sur CreatorBotTG V1.\nQue veux-tu faire ?',
          [[{ text: 'Nouveau projet', callback_data: 'new_project' }, { text: 'Aide', callback_data: 'help' }]]
        );
        res.status(200).json({ ok: true });
        return;
      }

      // Récupère la session pour router l'étape
      let session = await getSession(chatId);

      // Si pas de session -> démarre à "title"
      if (!session) {
        session = await upsertSession({ chat_id: chatId, step: 'title', updated_at: new Date().toISOString() });
        await sendMessage(chatId, '1/5 • Envoie le titre du projet (un seul message).');
        res.status(200).json({ ok: true });
        return;
      }

      // ---- Étapes
      if (session.step === 'title') {
        // Sauvegarde du titre -> passe à budget
        await upsertSession({
          chat_id: chatId,
          title: text.slice(0, 200),
          step: 'budget',
          updated_at: new Date().toISOString(),
        });
        await sendMessage(chatId, '2/5 • Indique ton <b>Budget STOP</b> (un nombre). Ex: 1500');
        res.status(200).json({ ok: true });
        return;
      }

      if (session.step === 'budget') {
        const amount = parseBudget(text);
        if (amount === null) {
          await sendMessage(chatId, "❌ Format invalide. Rentre un nombre (ex: 1500).");
          res.status(200).json({ ok: true });
          return;
        }
        await upsertSession({
          chat_id: chatId,
          budget_stop: amount,
          step: 'alert',
          updated_at: new Date().toISOString(),
        });
        await sendMessage(chatId, '3/5 • Écris un <b>message d’alerte</b> (ex: “Stop si > 1500€” ).');
        res.status(200).json({ ok: true });
        return;
      }

      if (session.step === 'alert') {
        await upsertSession({
          chat_id: chatId,
          alert: text.slice(0, 500),
          step: 'done',
          updated_at: new Date().toISOString(),
        });

        // Récap
        const rec = await getSession(chatId);
        const recap =
          `✅ Projet enregistré.\n\n` +
          `<b>Titre:</b> ${rec.title || '-'}\n` +
          `<b>Budget STOP:</b> ${rec.budget_stop ?? '-'}\n` +
          `<b>Alerte:</b> ${rec.alert || '-'}`;
        await sendMessage(chatId, recap);
        res.status(200).json({ ok: true });
        return;
      }

      // Par défaut: accusé de réception
      await sendMessage(chatId, '👋 Reçu.');
      res.status(200).json({ ok: true });
      return;
    }

    // Pas de message ni callback: ok (Telegram peut envoyer d'autres updates)
    res.status(200).json({ ok: true });
  } catch (e) {
    // Évite les retries Telegram
    res.status(200).json({ ok: true, error: 'handled' });
  }
};
