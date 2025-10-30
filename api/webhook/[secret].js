const https = require('https');

function sendMessage(token, chatId, text) {
  return new Promise((resolve) => {
    const data = JSON.stringify({ chat_id: chatId, text });
    const req = https.request(
      {
        hostname: 'api.telegram.org',
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
      },
      (res) => { res.on('data',()=>{}); res.on('end', resolve); }
    );
    req.on('error', resolve);
    req.write(data);
    req.end();
  });
}

module.exports = async (req, res) => {
  if (req.method === 'GET') { res.status(200).send('ok'); return; }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const msg = body.message || body.edited_message || (body.callback_query && body.callback_query.message) || null;
    const chatId = msg && msg.chat && msg.chat.id;
    if (token && chatId) {
      await sendMessage(token, chatId, '✅ Bot en ligne (réponse directe).');
    }
    res.status(200).json({ ok: true });
  } catch {
    res.status(200).json({ ok: true });
  }
};
