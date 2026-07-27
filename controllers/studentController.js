const Student = require('../models/Student');
const User = require('../models/User');

// Get All Students with query filtering & search
exports.getStudents = async (req, res) => {
  try {
    const { search, classId, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (classId) filter.classId = classId;

    let students = await Student.find(filter)
      .populate('user', 'name email phone avatar')
      .populate('classId', 'name section')
      .populate('parentId', 'name email');

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        (s.user && s.user.name.toLowerCase().includes(q)) ||
        s.rollNumber.toLowerCase().includes(q)
      );
    }

    const total = students.length;
    const startIndex = (page - 1) * limit;
    const paginated = students.slice(startIndex, startIndex + parseInt(limit));

    res.json({
      status: 200,
      success: true,
      data: {
        students: paginated,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) }
      }
    });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

// Create Student
exports.createStudent = async (req, res) => {
  try {
    const { name, email, classId, parentId, phone, bloodGroup, address } = req.body;

    if (!name || !email) {
      return res.status(400).json({ status: 400, success: false, message: 'Name and email are required' });
    }

    const user = await User.create({
      name,
      email,
      role: 'student',
      phone: phone || '+1 (555) 000-0000'
    });

    const rollNumber = `10A-${Math.floor(Math.random() * 900 + 100)}`;
    const student = await Student.create({
      user: user._id,
      rollNumber,
      classId: classId || null,
      parentId: parentId || null,
      bloodGroup: bloodGroup || 'O+',
      address: address || ''
    });

    const fullStudent = await Student.findById(student._id).populate('user').populate('classId');
    res.status(201).json({ status: 201, success: true, message: 'Student created', data: fullStudent });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

// Delete Student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ status: 404, success: false, message: 'Student not found' });

    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);

    res.json({ status: 200, success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
