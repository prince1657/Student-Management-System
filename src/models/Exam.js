const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  date: { type: String, required: true },
  totalMarks: { type: Number, default: 100 },
  type: { type: String, default: 'Written' }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
