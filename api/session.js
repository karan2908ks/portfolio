const { send } = require('./_lib/http');
const { isAdmin } = require('./_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  return send(res, 200, { admin: isAdmin(req) });
};
