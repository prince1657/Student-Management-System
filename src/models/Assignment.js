const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  dueDate: { type: String, required: true },
  maxMarks: { type: Number, default: 50 },
  attachmentUrl: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
