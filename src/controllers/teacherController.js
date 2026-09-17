const Teacher = require('../models/Teacher');
const User = require('../models/User');

exports.getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('user', 'name email phone avatar');
    res.json({ status: 200, success: true, data: teachers });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const { name, email, qualification, designation, phone } = req.body;
    const user = await User.create({ name, email, role: 'teacher', phone });
    const teacher = await Teacher.create({
      user: user._id,
      employeeId: `EMP-${Math.floor(Math.random()*9000 + 1000)}`,
      qualification: qualification || 'Master Degree',
      designation: designation || 'Lecturer'
    });
    const fullTeacher = await Teacher.findById(teacher._id).populate('user');
    res.status(201).json({ status: 201, success: true, data: fullTeacher });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
