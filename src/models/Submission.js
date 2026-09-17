const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedAt: { type: String, default: () => new Date().toISOString() },
  status: { type: String, enum: ['Submitted', 'Graded'], default: 'Submitted' },
  content: { type: String, required: true },
  grade: { type: Number, default: null },
  feedback: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
