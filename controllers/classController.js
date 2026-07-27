const Class = require('../models/Class');

exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find().populate({
      path: 'classTeacher',
      populate: { path: 'user', select: 'name email' }
    });
    res.json({ status: 200, success: true, data: classes });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.createClass = async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json({ status: 201, success: true, data: newClass });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
