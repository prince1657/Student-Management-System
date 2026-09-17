const jwt = require('jsonwebtoken');
const { jwtSecret, nodeEnv } = require('../config/env');

// Demo builds ship without a real login wall so the portals can be explored
// straight after `npm run seed`. In production a missing token is a 401 —
// previously it silently granted admin, which made every protected route public.
const DEMO_USER = { id: 'demo-admin', role: 'admin', name: 'Demo Administrator' };

exports.protect = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    if (nodeEnv === 'production') {
      return res.status(401).json({ status: 401, success: false, message: 'Sign in to continue' });
    }
    req.user = DEMO_USER;
    return next();
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch (err) {
    res.status(401).json({ status: 401, success: false, message: 'Your session has expired. Sign in again.' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const who = req.user ? req.user.role : 'a signed-out visitor';
    return res.status(403).json({ status: 403, success: false, message: `This area is not available to ${who}` });
  }
  next();
};
