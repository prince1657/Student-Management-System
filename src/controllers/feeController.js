const Fee = require('../models/Fee');

exports.getFees = async (req, res) => {
  try {
    const fees = await Fee.find().populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' }
    });
    res.json({ status: 200, success: true, data: fees });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.payFee = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ status: 404, success: false, message: 'Fee invoice not found' });

    fee.status = 'Paid';
    fee.paidDate = new Date().toISOString().split('T')[0];
    fee.receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(Math.random()*9000 + 1000)}`;
    await fee.save();

    res.json({ status: 200, success: true, message: 'Fee paid successfully', data: fee });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
