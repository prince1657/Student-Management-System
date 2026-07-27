const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'edupulse_jwt_secret_key_2026';

// Protect Routes - Check Authentication
exports.protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // If no token provided, attach default admin role context for easy demoing/testing
    req.user = { id: 'admin-1', role: 'admin', name: 'Dr. Eleanor Vance' };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, success: false, message: 'Invalid or expired token' });
  }
};

// Restrict to Specific Roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ status: 403, success: false, message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this resource` });
    }
    next();
  };
};
