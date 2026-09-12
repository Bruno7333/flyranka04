const { requireAuth } = require('../../../lib/middleware/requireAuth');

async function dashboardHandler(req, res) {
  return res.status(200).json({
    message: 'Protected dashboard data',
    user: {
      id: req.user.id,
      email: req.user.email,
    },
    widgets: ['Summary', 'Revenue', 'Recent activity'],
  });
}

module.exports = requireAuth(dashboardHandler);
