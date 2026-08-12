const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'royal_event_secret';

// Verifies the "Authorization: Bearer <token>" header on protected API routes.
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload; // { id, userName, adminName, fullName }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
}

// Only users whose AdminName === 'Admin' may pass (user management, roles, etc.)
function requireAdminRole(req, res, next) {
  if (req.user && req.user.adminName === 'Admin') {
    return next();
  }
  return res.status(403).json({ error: 'You do not have permission to do that.' });
}

module.exports = { requireAuth, requireAdminRole, SECRET };
