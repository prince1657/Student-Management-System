const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: String, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  paidDate: { type: String, default: null },
  receiptNo: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
