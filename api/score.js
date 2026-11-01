// Public: start a run (get a signed token) and submit a score.
const { send, readJson } = require('./_lib/http');
const { looksLikeOurClient } = require('./_lib/auth');
const store = require('./_lib/store');
const S = require('./_lib/scoring');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!looksLikeOurClient(req)) return send(res, 400, { error: 'Bad request.' });
  let body;
  try {
    body = await readJson(req, 4000);
  } catch (e) {
    return send(res, 400, { error: 'Invalid request.' });
  }
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 16) {
    return send(res, 503, { error: 'The leaderboard is not set up yet (SESSION_SECRET is missing).' });
  }

  if (body.action === 'start') {
    if (!S.GAMES[body.game]) return send(res, 400, { error: 'Unknown game.' });
    return send(res, 200, { token: S.makeRunToken(body.game) });
  }

  if (body.action === 'submit') {
    const run = S.readRunToken(body.token);
    if (!run) return send(res, 400, { error: 'This run could not be verified. Play a new round.' });
    const age = Date.now() - run.t;
    if (age > S.MAX_AGE_MS) return send(res, 400, { error: 'This run is too old. Play a new round.' });
    const score = Number(body.score);
    const bad = S.checkRun(run.g, score, age);
    if (bad) return send(res, 400, { error: bad });
    const name = S.cleanName(body.name);
    if (!name) return send(res, 400, { error: 'Pick a name of 2 to 14 letters, numbers or spaces.' });
    const av = S.cleanAvatar(body.avatar);
    try {
      const data = S.normalize(await store.read(S.KEY));
      if (data.used.some((u) => u.n === run.n)) return send(res, 400, { error: 'This run was already submitted.' });
      data.used.push({ n: run.n, t: Date.now() });
      const list = data.games[run.g];
      const same = list.find((e) => e.name.toLowerCase() === name.toLowerCase());
      let kept = false;
      if (!same) {
        list.push({ id: crypto.randomBytes(4).toString('hex'), name, av, score, t: Date.now() });
        kept = true;
      } else if (S.better(run.g, score, same.score)) {
        same.score = score; same.av = av; same.t = Date.now(); kept = true;
      }
      data.games[run.g] = S.sorted(run.g, list).slice(0, S.KEEP);
      await store.write(data, S.KEY);
      const rank = S.sorted(run.g, data.games[run.g]).findIndex((e) => e.name.toLowerCase() === name.toLowerCase()) + 1;
      return send(res, 200, { ok: true, kept, rank });
    } catch (e) {
      return send(res, 500, { error: e.message && /Storage/.test(e.message) ? e.message : 'Could not save the score.' });
    }
  }
  return send(res, 400, { error: 'Unknown action.' });
};
