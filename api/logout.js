const { send } = require('./_lib/http');
const { cookie, looksLikeOurClient } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!looksLikeOurClient(req)) return send(res, 400, { error: 'Bad request.' });
  return send(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0, req) });
};
