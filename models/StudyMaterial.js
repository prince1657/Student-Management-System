const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  title: { type: String, required: true },
  fileType: { type: String, default: 'PDF' },
  fileUrl: { type: String, default: '#' },
  uploadedBy: { type: String, default: 'Faculty Member' },
  uploadedAt: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
