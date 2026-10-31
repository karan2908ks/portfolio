// Password check + signed session cookie. No database needed.
const crypto = require('crypto');

const COOKIE = 'ks_admin';
const TTL_SECONDS = 60 * 60 * 8; // admin stays logged in for 8 hours

function sessionKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET is missing or shorter than 16 characters');
  }
  // Mixing in the password means changing ADMIN_PASSWORD logs every session out.
  return secret + ':' + (process.env.ADMIN_PASSWORD || '');
}

const sha = (value) => crypto.createHash('sha256').update(String(value)).digest();

function checkPassword(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error('ADMIN_PASSWORD is not set');
  return crypto.timingSafeEqual(sha(input), sha(real));
}

function sign(payload) {
  return crypto.createHmac('sha256', sessionKey()).update(payload).digest('base64url');
}

function makeToken() {
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL_SECONDS, n: crypto.randomBytes(8).toString('hex') })
  ).toString('base64url');
  return payload + '.' + sign(payload);
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const given = Buffer.from(parts[1]);
  const wanted = Buffer.from(sign(parts[0]));
  if (given.length !== wanted.length || !crypto.timingSafeEqual(given, wanted)) return false;
  try {
    const data = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    return typeof data.exp === 'number' && data.exp > Date.now() / 1000;
  } catch (e) {
    return false;
  }
}

function parseCookies(header) {
  const out = {};
  String(header || '')
    .split(';')
    .forEach((pair) => {
      const i = pair.indexOf('=');
      if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
    });
  return out;
}

function isAdmin(req) {
  try {
    return verifyToken(parseCookies(req.headers.cookie)[COOKIE]);
  } catch (e) {
    return false; // not configured yet
  }
}

function cookie(value, maxAge, req) {
  const https = String(req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https';
  return `${COOKIE}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${https ? '; Secure' : ''}`;
}

// Extra CSRF guard on top of SameSite=Strict: browsers will not add this header
// on a cross-site form post.
function looksLikeOurClient(req) {
  return req.headers['x-requested-with'] === 'portfolio' && /application\/json/i.test(req.headers['content-type'] || '');
}

module.exports = { TTL_SECONDS, checkPassword, makeToken, isAdmin, cookie, looksLikeOurClient };
