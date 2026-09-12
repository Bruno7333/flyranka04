const { supabase } = require('../../../lib/supabaseClient');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data?.user) {
    return res.status(400).json({
      error: error?.message || 'Unable to create user account',
    });
  }

  return res.status(201).json({ user: data.user, session: data.session });
};
