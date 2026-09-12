const { supabase } = require('../../../lib/supabaseClient');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data?.session) {
    return res.status(401).json({ error: 'Invalid login credentials' });
  }

  return res.status(200).json({
    user: data.user,
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
};
