/* ==========================================================================
   Database seeder:  npm run seed

   Loads the same school the UI ships with (Nalanda Public School, session
   2026-27) into MongoDB, so the REST endpoints return the same content the
   browser shows. Clears the collections first, so it is safe to re-run.
   ========================================================================== */

const mongoose = require('mongoose');
const { mongoUri } = require('./config/env');

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

const MODELS = [User, Student, Teacher, Class, Subject, Attendance, Exam, Mark,
  Fee, Assignment, Submission, StudyMaterial, Notice];

async function seed() {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`\n  seeding ${mongoose.connection.name}`);

  await Promise.all(MODELS.map(M => M.deleteMany({})));
  console.log('  cleared    13 collections');

  /* --- people ----------------------------------------------------------- */

  const staff = await User.insertMany([
    { name: 'Anjali Deshpande', email: 'principal@nalandaps.edu.in', role: 'admin', phone: '+91 98220 41785' },
    { name: 'Rakesh Iyer', email: 'rakesh.iyer@nalandaps.edu.in', role: 'teacher', phone: '+91 98230 55120' },
    { name: 'Fatima Sheikh', email: 'fatima.sheikh@nalandaps.edu.in', role: 'teacher', phone: '+91 97640 33218' },
    { name: 'Joseph Mathew', email: 'joseph.mathew@nalandaps.edu.in', role: 'teacher', phone: '+91 99700 81144' },
    { name: 'Kavita Rao', email: 'kavita.rao@nalandaps.edu.in', role: 'teacher', phone: '+91 98811 27099' }
  ]);
  const [, iyer, sheikh, mathew, rao] = staff;

  const parent = await User.create({
    name: 'Sunita Mehta', email: 'sunita.mehta@gmail.com', role: 'parent', phone: '+91 98500 63311'
  });

  const studentUsers = await User.insertMany([
    { name: 'Aarav Mehta', email: 'aarav.mehta@nalandaps.edu.in', role: 'student', phone: '+91 90280 11245' },
    { name: 'Diya Nair', email: 'diya.nair@nalandaps.edu.in', role: 'student', phone: '+91 90280 33417' },
    { name: 'Rohan Kulkarni', email: 'rohan.kulkarni@nalandaps.edu.in', role: 'student', phone: '+91 90280 55908' },
    { name: 'Ishita Bose', email: 'ishita.bose@nalandaps.edu.in', role: 'student', phone: '+91 90280 77621' },
    { name: 'Kabir Singh', email: 'kabir.singh@nalandaps.edu.in', role: 'student', phone: '+91 90280 99034' },
    { name: 'Meera Pillai', email: 'meera.pillai@nalandaps.edu.in', role: 'student', phone: '+91 90281 20458' },
    { name: 'Aditya Verma', email: 'aditya.verma@nalandaps.edu.in', role: 'student', phone: '+91 90281 44870' },
    { name: 'Sana Qureshi', email: 'sana.qureshi@nalandaps.edu.in', role: 'student', phone: '+91 90281 66292' }
  ]);

  const teachers = await Teacher.insertMany([
    { user: iyer._id, employeeId: 'NPS-1041', qualification: 'M.Sc, B.Ed (Mathematics)', designation: 'Head, Mathematics' },
    { user: sheikh._id, employeeId: 'NPS-1108', qualification: 'M.Sc Physics', designation: 'Senior Physics Faculty' },
    { user: mathew._id, employeeId: 'NPS-0987', qualification: 'M.A English, B.Ed', designation: 'Head, English' },
    { user: rao._id, employeeId: 'NPS-1192', qualification: 'M.Sc Chemistry', designation: 'Chemistry Faculty' }
  ]);
  const [tIyer, tSheikh, tMathew, tRao] = teachers;

  /* --- structure -------------------------------------------------------- */

  const classes = await Class.insertMany([
    { name: 'Class X', section: 'A', classTeacher: tIyer._id, room: 'Room 301' },
    { name: 'Class X', section: 'B', classTeacher: tSheikh._id, room: 'Room 302' },
    { name: 'Class IX', section: 'A', classTeacher: tMathew._id, room: 'Room 204' }
  ]);
  const [x10a, x10b, x9a] = classes;

  const subjects = await Subject.insertMany([
    { name: 'Mathematics', code: 'MAT-10', classId: x10a._id, teacherId: tIyer._id },
    { name: 'Physics', code: 'PHY-10', classId: x10a._id, teacherId: tSheikh._id },
    { name: 'Chemistry', code: 'CHE-10', classId: x10a._id, teacherId: tRao._id },
    { name: 'English', code: 'ENG-10', classId: x10a._id, teacherId: tMathew._id },
    { name: 'Mathematics', code: 'MAT-09', classId: x9a._id, teacherId: tIyer._id }
  ]);
  const [sMath, sPhy, sChem, sEng] = subjects;

  const rolls = ['10A-01', '10A-02', '10A-03', '10A-04', '10A-05', '10B-01', '10B-02', '9A-01'];
  const homeClass = [x10a, x10a, x10a, x10a, x10a, x10b, x10b, x9a];

  const students = await Student.insertMany(studentUsers.map((u, i) => ({
    user: u._id,
    rollNumber: rolls[i],
    classId: homeClass[i]._id,
    parentId: i === 0 ? parent._id : null,
    joinDate: i > 4 ? '2025-06-10' : '2024-06-12',
    status: 'Active',
    bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-', 'B-', 'A-', 'O+'][i],
    address: 'Pune, Maharashtra'
  })));

  /* --- records ---------------------------------------------------------- */

  const days = ['2026-09-11', '2026-09-12', '2026-09-15', '2026-09-16'];
  const attendance = [];
  students.slice(0, 5).forEach((s, si) => {
    days.forEach((date, di) => {
      // One absence and one late arrival, so the rate is not a flat 100%.
      let status = 'Present';
      if (si === 0 && date === '2026-09-15') status = 'Absent';
      if (si === 4 && di === 3) status = 'Late';
      attendance.push({ student: s._id, classId: x10a._id, date, status });
    });
  });
  await Attendance.insertMany(attendance);

  const exams = await Exam.insertMany([
    { title: 'Unit Test 2', classId: x10a._id, subjectId: sMath._id, date: '2026-08-21', totalMarks: 50 },
    { title: 'Unit Test 2', classId: x10a._id, subjectId: sPhy._id, date: '2026-08-23', totalMarks: 50 },
    { title: 'Unit Test 2', classId: x10a._id, subjectId: sEng._id, date: '2026-08-25', totalMarks: 50 },
    { title: 'Unit Test 2', classId: x10a._id, subjectId: sChem._id, date: '2026-08-27', totalMarks: 50 }
  ]);

  await Mark.insertMany([
    { exam: exams[0]._id, student: students[0]._id, marksObtained: 46, grade: 'A+', remarks: 'Clean method work' },
    { exam: exams[1]._id, student: students[0]._id, marksObtained: 41, grade: 'A', remarks: 'Check unit conversions' },
    { exam: exams[2]._id, student: students[0]._id, marksObtained: 43, grade: 'A', remarks: 'Strong comprehension' },
    { exam: exams[3]._id, student: students[0]._id, marksObtained: 38, grade: 'B+', remarks: 'Revise organic naming' },
    { exam: exams[0]._id, student: students[1]._id, marksObtained: 48, grade: 'A+' },
    { exam: exams[0]._id, student: students[2]._id, marksObtained: 33, grade: 'B' },
    { exam: exams[0]._id, student: students[3]._id, marksObtained: 40, grade: 'A' },
    { exam: exams[0]._id, student: students[4]._id, marksObtained: 36, grade: 'B+' }
  ]);

  await Fee.insertMany([
    { student: students[0]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-24', receiptNo: 'NPS/26/0411' },
    { student: students[0]._id, title: 'Term 2 tuition', amount: 24500, dueDate: '2026-10-05', status: 'Pending' },
    { student: students[0]._id, title: 'Science lab & library', amount: 4800, dueDate: '2026-07-15', status: 'Paid', paidDate: '2026-07-11', receiptNo: 'NPS/26/0461' },
    { student: students[1]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-21', receiptNo: 'NPS/26/0398' },
    { student: students[1]._id, title: 'Term 2 tuition', amount: 24500, dueDate: '2026-10-05', status: 'Pending' },
    { student: students[2]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Overdue' },
    { student: students[3]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-07-02', receiptNo: 'NPS/26/0433' },
    { student: students[4]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Overdue' },
    { student: students[5]._id, title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-28', receiptNo: 'NPS/26/0420' },
    { student: students[7]._id, title: 'Term 1 tuition', amount: 21500, dueDate: '2026-06-30', status: 'Pending' }
  ]);

  const assignments = await Assignment.insertMany([
    { classId: x10a._id, subjectId: sMath._id, teacherId: tIyer._id, title: 'Quadratic equations, exercise 4.3', description: 'Solve questions 1 to 18. Show every step of the factorisation.', dueDate: '2026-09-22', maxMarks: 20 },
    { classId: x10a._id, subjectId: sPhy._id, teacherId: tSheikh._id, title: 'Light: ray diagrams worksheet', description: 'Draw ray diagrams for all six mirror and lens cases.', dueDate: '2026-09-24', maxMarks: 15 },
    { classId: x10a._id, subjectId: sEng._id, teacherId: tMathew._id, title: 'Letter to the editor', description: 'Write a 150 word letter on traffic safety near the school gate.', dueDate: '2026-09-19', maxMarks: 10 },
    { classId: x10a._id, subjectId: sChem._id, teacherId: tRao._id, title: 'Balancing chemical equations', description: 'Complete the practice set on page 71.', dueDate: '2026-10-01', maxMarks: 20 }
  ]);

  await Submission.insertMany([
    { assignment: assignments[0]._id, student: students[0]._id, content: 'Uploaded scanned worksheet.', status: 'Graded', grade: 18, feedback: 'Neat work. Recheck question 11.' },
    { assignment: assignments[2]._id, student: students[0]._id, content: 'Typed letter attached.', status: 'Submitted' },
    { assignment: assignments[0]._id, student: students[1]._id, content: 'Uploaded worksheet.', status: 'Graded', grade: 20, feedback: 'Full marks.' }
  ]);

  await StudyMaterial.insertMany([
    { classId: x10a._id, subjectId: sMath._id, title: 'Quadratic equations — solved examples', fileType: 'PDF', uploadedBy: 'Rakesh Iyer' },
    { classId: x10a._id, subjectId: sPhy._id, title: 'Light and reflection — class slides', fileType: 'PPT', uploadedBy: 'Fatima Sheikh' },
    { classId: x10a._id, subjectId: sEng._id, title: 'Letter writing formats', fileType: 'DOC', uploadedBy: 'Joseph Mathew' },
    { classId: x10a._id, subjectId: sChem._id, title: 'Periodic table reference sheet', fileType: 'PDF', uploadedBy: 'Kavita Rao' }
  ]);

  await Notice.insertMany([
    { title: 'Half-yearly exam timetable is out', content: 'Exams run from 6 to 16 October. The datesheet is on the notice board.', targetRole: 'all', priority: 'high' },
    { title: 'Parent-teacher meeting on 27 September', content: 'Slots are 9 am to 1 pm, class-wise.', targetRole: 'parent', priority: 'high' },
    { title: 'Science exhibition entries close Friday', content: 'Teams of up to three. Submit your abstract to the science staff room.', targetRole: 'student', priority: 'normal' },
    { title: 'Submit Term 2 lesson plans', content: 'All subject heads to upload lesson plans before 20 September.', targetRole: 'teacher', priority: 'normal' }
  ]);

  const counts = await Promise.all(MODELS.map(async M => `${M.modelName} ${await M.countDocuments()}`));
  console.log(`  seeded     ${counts.join(', ')}`);
  console.log('\n  done. start the app with: npm start\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n  seed failed:', err.message);
  console.error('  is MongoDB running and reachable at', mongoUri, '?\n');
  process.exit(1);
});
