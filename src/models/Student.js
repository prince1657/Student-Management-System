const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rollNumber: { type: String, required: true, unique: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  bloodGroup: { type: String, default: 'O+' },
  address: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
