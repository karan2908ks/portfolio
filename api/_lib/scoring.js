// Rules for the global leaderboard. Scores come from games running in the visitor's browser, so
// they cannot be proven. What the server does instead: it only accepts a score that comes with a
// signed "run token" issued when the run started, it checks the run lasted long enough for that
// score, it rejects a token used twice, and it caps each game at what is physically possible.
const crypto = require('crypto');
const { sign } = require('./auth');

const KEY = 'scores.json';
const KEEP = 50; // entries stored per game
const GAMES = {
  // better: 'high' or 'low'.  rate: most points a player can earn per second.  min/max: allowed range.
  snake: { better: 'high', min: 1, max: 321, rate: 8, slack: 3, minSeconds: 2 },
  dino: { better: 'high', min: 1, max: 99999, rate: 40, slack: 20, minSeconds: 2 },
  dodge: { better: 'high', min: 1, max: 99999, rate: 24, slack: 60, minSeconds: 2 },
  typing: { better: 'high', min: 10, max: 99999, rate: 160, slack: 120, minSeconds: 3 },
  memory: { better: 'low', min: 8, max: 200, perMoveSeconds: 0.3, minSeconds: 4 }, // 8 pairs, so at least 8 moves
};
const AVATAR_KEYS = ['skin', 'hair', 'hairColor', 'eyes', 'mouth', 'gear', 'top', 'outfit', 'bgStyle', 'bg'];
const BAD = ['fuck', 'shit', 'bitch', 'cunt', 'nigg', 'fag', 'rape', 'nazi'];
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

function makeRunToken(game) {
  const payload = Buffer.from(JSON.stringify({ g: game, t: Date.now(), n: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  return payload + '.' + sign('run:' + payload);
}

function readRunToken(token) {
  if (typeof token !== 'string' || token.length > 400) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const want = Buffer.from(sign('run:' + parts[0]));
  const got = Buffer.from(parts[1]);
  if (want.length !== got.length || !crypto.timingSafeEqual(want, got)) return null;
  try {
    const d = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    if (!GAMES[d.g] || typeof d.t !== 'number' || typeof d.n !== 'string') return null;
    return d;
  } catch (e) {
    return null;
  }
}

function cleanName(raw) {
  let s = String(raw == null ? '' : raw).normalize('NFKC').replace(/[^A-Za-z0-9 _.\-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 14);
  if (s.length < 2) return null;
  const flat = s.toLowerCase().replace(/[^a-z]/g, '');
  if (BAD.some((w) => flat.includes(w))) return null;
  return s;
}

function cleanAvatar(raw) {
  const out = {};
  const a = raw && typeof raw === 'object' ? raw : {};
  AVATAR_KEYS.forEach((k) => {
    const v = Math.floor(Number(a[k]));
    out[k] = Number.isFinite(v) ? Math.max(0, Math.min(40, v)) : 0;
  });
  return out;
}

// Returns an error message, or null when the run looks possible.
function checkRun(game, score, elapsedMs) {
  const rule = GAMES[game];
  if (!Number.isInteger(score) || score < rule.min || score > rule.max) return 'That score is outside what this game allows.';
  const sec = elapsedMs / 1000;
  if (sec < rule.minSeconds) return 'That run was too short to count.';
  if (rule.better === 'high' && score > sec * rule.rate + rule.slack) return 'That score is too high for the time played.';
  if (rule.better === 'low' && sec < score * rule.perMoveSeconds) return 'That run was too fast to count.';
  return null;
}

function emptyBoard() {
  const games = {};
  Object.keys(GAMES).forEach((g) => (games[g] = []));
  return { games, used: [] };
}

function normalize(data) {
  const b = emptyBoard();
  if (data && typeof data === 'object') {
    Object.keys(GAMES).forEach((g) => {
      if (data.games && Array.isArray(data.games[g])) b.games[g] = data.games[g].slice(0, KEEP);
    });
    if (Array.isArray(data.used)) b.used = data.used.slice(-400);
  }
  return b;
}

function better(game, a, b) {
  return GAMES[game].better === 'high' ? a > b : a < b;
}

function sorted(game, list) {
  const dir = GAMES[game].better === 'high' ? -1 : 1;
  return list.slice().sort((x, y) => dir * (x.score - y.score) || x.t - y.t);
}

module.exports = { KEY, KEEP, GAMES, makeRunToken, readRunToken, cleanName, cleanAvatar, checkRun, normalize, better, sorted, MAX_AGE_MS };
