const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: 'password123' },
  role: { type: String, enum: ['admin', 'teacher', 'student', 'parent'], required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  phone: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
