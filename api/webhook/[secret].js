const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chat_id, text) {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
  const body = { chat_id, text };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(body)
  });
  return res.json().catch(() => ({}));
}

module.exports = async (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }
  try {
    const update = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const msg = update.message || update.edited_message || update.callback_query?.message;
    const chatId = msg?.chat?.id;
    const text = update.message?.text;

    if (chatId && text) {
      await sendMessage(chatId, '✅ Bot en ligne (mode brut).');
    }
    res.status(200).json({ ok:true });
  } catch (e) {
    res.status(200).json({ ok:true });
  }
};
