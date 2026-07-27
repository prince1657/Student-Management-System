const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  marksObtained: { type: Number, required: true },
  grade: { type: String, default: 'A' },
  remarks: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Mark', markSchema);
