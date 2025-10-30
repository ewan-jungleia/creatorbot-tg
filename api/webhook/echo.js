const https = require('https');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function tgSend(chatId, text) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ chat_id: chatId, text });
    const req = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
    }, (res) => { res.on('data', ()=>{}); res.on('end', resolve); });
    req.on('error', resolve);
    req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  console.log('ECHO_WEBHOOK_HIT', req.method, new Date().toISOString());
  if (req.method === 'GET') { res.status(200).json({ ok: true }); return; }

  try {
    let body = '';
    for await (const chunk of req) body += chunk;
    const update = body ? JSON.parse(body) : {};
    const msg = update.message || update.edited_message || {};
    const chatId = msg.chat?.id;

    if (chatId) await tgSend(chatId, '✅ Echo webhook OK');
    res.status(200).json({ ok: true, seen: Boolean(chatId) });
  } catch (e) {
    console.log('ECHO_WEBHOOK_ERR', e?.message || String(e));
    res.status(200).json({ ok: true, err: 'handled' });
  }
};
