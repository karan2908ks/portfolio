const { send, readJson, sleep } = require('./_lib/http');
const { checkPassword, makeToken, cookie, looksLikeOurClient, TTL_SECONDS } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!looksLikeOurClient(req)) return send(res, 400, { error: 'Bad request.' });

  let body;
  try {
    body = await readJson(req, 2000);
  } catch (e) {
    return send(res, 400, { error: 'Invalid request.' });
  }
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

  let ok;
  let token;
  try {
    ok = checkPassword(password);
    if (ok) token = makeToken();
  } catch (e) {
    return send(res, 500, { error: 'Server is not set up yet: ' + e.message + '. See README, step 5.' });
  }
  if (!ok) {
    await sleep(900); // slows down guessing
    return send(res, 401, { error: 'Wrong password.' });
  }
  return send(res, 200, { ok: true }, { 'Set-Cookie': cookie(token, TTL_SECONDS, req) });
};
