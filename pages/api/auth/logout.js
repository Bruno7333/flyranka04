const { supabase } = require('../../../lib/supabaseClient');
const { requireAuth } = require('../../../lib/middleware/requireAuth');

async function logoutHandler(req, res) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(500).json({ error: error.message || 'Unable to log out' });
  }

  return res.status(204).end();
}

module.exports = requireAuth(logoutHandler);
