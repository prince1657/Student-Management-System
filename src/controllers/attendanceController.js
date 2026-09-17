const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res) => {
  try {
    const { classId, date, studentId } = req.query;
    let filter = {};
    if (classId) filter.classId = classId;
    if (date) filter.date = date;
    if (studentId) filter.student = studentId;

    const logs = await Attendance.find(filter).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' }
    });
    res.json({ status: 200, success: true, data: logs });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};

exports.saveBatchAttendance = async (req, res) => {
  try {
    const { classId, date, records } = req.body;
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ status: 400, success: false, message: 'Records array is required' });
    }

    for (const rec of records) {
      await Attendance.findOneAndUpdate(
        { student: rec.studentId, date, classId },
        { status: rec.status, remarks: rec.remarks || '' },
        { upsert: true, new: true }
      );
    }

    res.json({ status: 200, success: true, message: 'Batch attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ status: 500, success: false, message: err.message });
  }
};
