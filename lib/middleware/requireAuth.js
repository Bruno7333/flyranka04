const { supabase } = require('../supabaseClient');

function requireAuth(handler) {
  return async function protectedHandler(req, res) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = data.user;
    return handler(req, res);
  };
}

module.exports = {
  requireAuth,
};
