const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'edupulse_jwt_secret_key_2026';

exports.login = async (req, res) => {
  try {
    const { email, role } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      // Find default user by role for demo convenience
      user = await User.findOne({ role: role || 'admin' });
    }

    if (!user) {
      return res.status(404).json({ status: 404, success: false, message: 'User account not found' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      status: 200,
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ status: 200, success: true, data: user });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
