const { requireAuth } = require('../../../lib/middleware/requireAuth');

async function profileHandler(req, res) {
  const user = req.user;

  return res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
  });
}

module.exports = requireAuth(profileHandler);
