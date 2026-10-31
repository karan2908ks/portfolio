const { send } = require('./_lib/http');
const store = require('./_lib/store');

// Public: the page loads its content from here. If nothing has been saved yet
// the page falls back to /site.json (the starting content in public/).
module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const data = await store.read();
    if (!data) return send(res, 404, { error: 'No saved content yet.' });
    return send(res, 200, data, { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' });
  } catch (e) {
    return send(res, 500, { error: 'Could not read saved content.' });
  }
};
