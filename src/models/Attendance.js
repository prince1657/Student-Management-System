const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date: { type: String, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
