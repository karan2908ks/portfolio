// Public: the top scores for every game.
const { send } = require('./_lib/http');
const store = require('./_lib/store');
const S = require('./_lib/scoring');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const data = S.normalize(await store.read(S.KEY));
    const games = {};
    Object.keys(S.GAMES).forEach((g) => {
      games[g] = S.sorted(g, data.games[g]).slice(0, 10).map((e) => ({ id: e.id, name: e.name, av: e.av, score: e.score, t: e.t }));
    });
    return send(res, 200, { games, better: Object.fromEntries(Object.keys(S.GAMES).map((g) => [g, S.GAMES[g].better])) }, { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30' });
  } catch (e) {
    return send(res, 500, { error: 'Could not load scores.' });
  }
};
