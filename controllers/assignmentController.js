const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

exports.getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().sort({ createdAt: -1 });
    res.json({ status: 200, success: true, data: assignments });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    res.status(201).json({ status: 201, success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const submission = await Submission.create(req.body);
    res.status(201).json({ status: 201, success: true, data: submission });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
