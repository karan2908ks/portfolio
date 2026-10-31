const { send, readJson } = require('./_lib/http');
const { isAdmin, looksLikeOurClient } = require('./_lib/auth');
const store = require('./_lib/store');

function problem(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return 'Content must be an object.';
  if (!data.profile || typeof data.profile !== 'object') return 'Content is missing the profile.';
  for (const key of ['skills', 'projects', 'stats', 'facts']) {
    if (data[key] !== undefined && !Array.isArray(data[key])) return key + ' must be a list.';
  }
  if (JSON.stringify(data).length > 100000) return 'Content is too large (limit 100 KB).';
  return null;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  if (!looksLikeOurClient(req)) return send(res, 400, { error: 'Bad request.' });
  if (!isAdmin(req)) return send(res, 401, { error: 'Please log in again.' });

  let data;
  try {
    data = await readJson(req, 150000);
  } catch (e) {
    return send(res, 400, { error: 'Invalid or oversized request.' });
  }
  const bad = problem(data);
  if (bad) return send(res, 400, { error: bad });

  try {
    await store.write(data);
    return send(res, 200, { ok: true });
  } catch (e) {
    return send(res, 500, { error: e.message || 'Could not save.' });
  }
};
