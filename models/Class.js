const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  section: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  room: { type: String, default: 'Room 101' },
  capacity: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
