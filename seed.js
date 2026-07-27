const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Mark = require('./models/Mark');
const Fee = require('./models/Fee');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const StudyMaterial = require('./models/StudyMaterial');
const Notice = require('./models/Notice');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/edupulse';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🌱 Connected to MongoDB for full database seeding...');

    // Clear existing collections
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Attendance.deleteMany({});
    await Exam.deleteMany({});
    await Mark.deleteMany({});
    await Fee.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    await StudyMaterial.deleteMany({});
    await Notice.deleteMany({});

    // 1. Create Users
    const adminUser = await User.create({ name: 'Dr. Eleanor Vance', email: 'admin@edupulse.edu', role: 'admin' });
    const teacherUser1 = await User.create({ name: 'Prof. Marcus Sterling', email: 'marcus.sterling@edupulse.edu', role: 'teacher' });
    const teacherUser2 = await User.create({ name: 'Ms. Clara Thorne', email: 'clara.thorne@edupulse.edu', role: 'teacher' });
    const studentUser1 = await User.create({ name: 'Alex Rivera', email: 'alex.rivera@student.edupulse.edu', role: 'student' });
    const studentUser2 = await User.create({ name: 'Sophia Chen', email: 'sophia.chen@student.edupulse.edu', role: 'student' });
    const parentUser1 = await User.create({ name: 'Sarah Rivera', email: 'sarah.rivera@gmail.com', role: 'parent' });

    // 2. Create Teachers
    const teacher1 = await Teacher.create({ user: teacherUser1._id, employeeId: 'EMP-1001', designation: 'Head of Mathematics' });
    const teacher2 = await Teacher.create({ user: teacherUser2._id, employeeId: 'EMP-1002', designation: 'Senior Science Lecturer' });

    // 3. Create Classes
    const cls10a = await Class.create({ name: 'Grade 10', section: 'A', classTeacher: teacher1._id, room: 'Room 301' });

    // 4. Create Subjects
    const sbjMath = await Subject.create({ name: 'Advanced Mathematics', code: 'MATH-10', classId: cls10a._id, teacherId: teacher1._id });
    const sbjPhy = await Subject.create({ name: 'Physics & Kinetics', code: 'PHYS-10', classId: cls10a._id, teacherId: teacher2._id });

    // 5. Create Students
    const student1 = await Student.create({ user: studentUser1._id, rollNumber: '10A-01', classId: cls10a._id, parentId: parentUser1._id });
    const student2 = await Student.create({ user: studentUser2._id, rollNumber: '10A-02', classId: cls10a._id });

    // 6. Create Attendance
    await Attendance.create([
      { student: student1._id, classId: cls10a._id, date: '2026-07-25', status: 'Present', remarks: 'On time' },
      { student: student2._id, classId: cls10a._id, date: '2026-07-25', status: 'Present', remarks: 'On time' }
    ]);

    // 7. Create Exams & Marks
    const exam1 = await Exam.create({ title: 'First Quarterly Evaluation', classId: cls10a._id, subjectId: sbjMath._id, date: '2026-07-15', totalMarks: 100 });
    await Mark.create([
      { exam: exam1._id, student: student1._id, marksObtained: 92, grade: 'A+', remarks: 'Exceptional analytical essays' },
      { exam: exam1._id, student: student2._id, marksObtained: 88, grade: 'A', remarks: 'Very strong calculus' }
    ]);

    // 8. Create Fees
    await Fee.create([
      { student: student1._id, title: 'Q1 Tuition & Lab Fee', amount: 1250, dueDate: '2026-07-15', status: 'Paid', receiptNo: 'REC-2026-0891' },
      { student: student1._id, title: 'Q2 Tuition Fee', amount: 1250, dueDate: '2026-10-15', status: 'Pending' },
      { student: student2._id, title: 'Q1 Tuition & Lab Fee', amount: 1250, dueDate: '2026-07-15', status: 'Paid', receiptNo: 'REC-2026-0892' }
    ]);

    // 9. Create Assignments
    const asg1 = await Assignment.create({ classId: cls10a._id, subjectId: sbjMath._id, teacherId: teacher1._id, title: 'Quadratic Equations Worksheet', description: 'Complete problems 1 through 25 on page 142.', dueDate: '2026-07-30', maxMarks: 50 });
    await Submission.create({ assignment: asg1._id, student: student1._id, content: 'Completed solution link uploaded.', status: 'Graded', grade: 48, feedback: 'Great work!' });

    // 10. Create Study Materials
    await StudyMaterial.create([
      { classId: cls10a._id, subjectId: sbjMath._id, title: 'Calculus Fundamentals PDF', fileType: 'PDF', uploadedBy: 'Prof. Marcus Sterling' }
    ]);

    // 11. Create Notices
    await Notice.create([
      { title: 'Annual Science & Tech Fair 2026', content: 'Register your teams by August 5th in the Auditorium.', targetRole: 'all', priority: 'high' },
      { title: 'Parent-Teacher Conference Schedule', content: 'Scheduled for August 15th from 9 AM to 4 PM.', targetRole: 'parent', priority: 'high' }
    ]);

    console.log('✅ Full MongoDB database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seedDatabase();
