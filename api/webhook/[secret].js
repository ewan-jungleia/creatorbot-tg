module.exports = (req, res) => {
  console.log('WEBHOOK', { method: req.method, headers: req.headers, body: req.body });
  res.status(200).end('ok');
};
