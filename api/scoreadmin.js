// Admin only: remove a score or clear a game's board.
const { send, readJson } = require('./_lib/http');
const { isAdmin, looksLikeOurClient } = require('./_lib/auth');
const store = require('./_lib/store');
const S = require('./_lib/scoring');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!looksLikeOurClient(req)) return send(res, 400, { error: 'Bad request.' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in again.' });
  let body;
  try {
    body = await readJson(req, 2000);
  } catch (e) {
    return send(res, 400, { error: 'Invalid request.' });
  }
  if (!S.GAMES[body.game]) return send(res, 400, { error: 'Unknown game.' });
  try {
    const data = S.normalize(await store.read(S.KEY));
    if (body.action === 'delete') data.games[body.game] = data.games[body.game].filter((e) => e.id !== body.id);
    else if (body.action === 'clear') data.games[body.game] = [];
    else return send(res, 400, { error: 'Unknown action.' });
    await store.write(data, S.KEY);
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { error: 'Could not update scores.' });
  }
};
