const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorName: { type: String, default: 'Administration' },
  date: { type: String, default: () => new Date().toISOString().split('T')[0] },
  targetRole: { type: String, enum: ['all', 'teacher', 'student', 'parent'], default: 'all' },
  priority: { type: String, enum: ['normal', 'high'], default: 'normal' }
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
