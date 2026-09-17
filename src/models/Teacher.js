const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true, unique: true },
  qualification: { type: String, default: 'Master Degree' },
  designation: { type: String, default: 'Lecturer' },
  subjects: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
