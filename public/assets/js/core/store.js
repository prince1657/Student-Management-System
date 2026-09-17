/* ==========================================================================
   Local store

   A small relational store kept in localStorage. It is the offline fallback:
   when the Express API is unreachable the whole UI still works against this,
   which is what makes the app demo-able without MongoDB running.

   Avatars are rendered from initials rather than fetched, so the UI does not
   depend on a network round trip to look finished.
   ========================================================================== */

const STORAGE_KEY = 'edupulse.store.v2';

const SEED = {
  school: {
    name: 'Nalanda Public School',
    board: 'CBSE',
    session: '2026-27',
    term: 'Term 2',
    city: 'Pune'
  },
  users: [
    { id: 'usr-adm-1', name: 'Anjali Deshpande', email: 'principal@nalandaps.edu.in', role: 'admin', title: 'Principal', phone: '+91 98220 41785' },
    { id: 'usr-tch-1', name: 'Rakesh Iyer', email: 'rakesh.iyer@nalandaps.edu.in', role: 'teacher', title: 'Head, Mathematics', phone: '+91 98230 55120' },
    { id: 'usr-tch-2', name: 'Fatima Sheikh', email: 'fatima.sheikh@nalandaps.edu.in', role: 'teacher', title: 'Senior Physics Faculty', phone: '+91 97640 33218' },
    { id: 'usr-tch-3', name: 'Joseph Mathew', email: 'joseph.mathew@nalandaps.edu.in', role: 'teacher', title: 'Head, English', phone: '+91 99700 81144' },
    { id: 'usr-tch-4', name: 'Kavita Rao', email: 'kavita.rao@nalandaps.edu.in', role: 'teacher', title: 'Chemistry Faculty', phone: '+91 98811 27099' },
    { id: 'usr-stu-1', name: 'Aarav Mehta', email: 'aarav.mehta@nalandaps.edu.in', role: 'student', phone: '+91 90280 11245' },
    { id: 'usr-stu-2', name: 'Diya Nair', email: 'diya.nair@nalandaps.edu.in', role: 'student', phone: '+91 90280 33417' },
    { id: 'usr-stu-3', name: 'Rohan Kulkarni', email: 'rohan.kulkarni@nalandaps.edu.in', role: 'student', phone: '+91 90280 55908' },
    { id: 'usr-stu-4', name: 'Ishita Bose', email: 'ishita.bose@nalandaps.edu.in', role: 'student', phone: '+91 90280 77621' },
    { id: 'usr-stu-5', name: 'Kabir Singh', email: 'kabir.singh@nalandaps.edu.in', role: 'student', phone: '+91 90280 99034' },
    { id: 'usr-stu-6', name: 'Meera Pillai', email: 'meera.pillai@nalandaps.edu.in', role: 'student', phone: '+91 90281 20458' },
    { id: 'usr-stu-7', name: 'Aditya Verma', email: 'aditya.verma@nalandaps.edu.in', role: 'student', phone: '+91 90281 44870' },
    { id: 'usr-stu-8', name: 'Sana Qureshi', email: 'sana.qureshi@nalandaps.edu.in', role: 'student', phone: '+91 90281 66292' },
    { id: 'usr-par-1', name: 'Sunita Mehta', email: 'sunita.mehta@gmail.com', role: 'parent', title: 'Parent of Aarav Mehta', phone: '+91 98500 63311' }
  ],
  classes: [
    { id: 'cls-10a', name: 'Class X', section: 'A', classTeacherId: 'tch-1', room: 'Room 301', capacity: 40 },
    { id: 'cls-10b', name: 'Class X', section: 'B', classTeacherId: 'tch-2', room: 'Room 302', capacity: 40 },
    { id: 'cls-9a', name: 'Class IX', section: 'A', classTeacherId: 'tch-3', room: 'Room 204', capacity: 38 }
  ],
  teachers: [
    { id: 'tch-1', userId: 'usr-tch-1', employeeId: 'NPS-1041', qualification: 'M.Sc, B.Ed (Mathematics)', designation: 'Head, Mathematics', joinDate: '2016-06-13', subjects: ['sbj-math10', 'sbj-math9'] },
    { id: 'tch-2', userId: 'usr-tch-2', employeeId: 'NPS-1108', qualification: 'M.Sc Physics', designation: 'Senior Physics Faculty', joinDate: '2018-06-11', subjects: ['sbj-phy10'] },
    { id: 'tch-3', userId: 'usr-tch-3', employeeId: 'NPS-0987', qualification: 'M.A English, B.Ed', designation: 'Head, English', joinDate: '2014-07-01', subjects: ['sbj-eng10'] },
    { id: 'tch-4', userId: 'usr-tch-4', employeeId: 'NPS-1192', qualification: 'M.Sc Chemistry', designation: 'Chemistry Faculty', joinDate: '2021-06-14', subjects: ['sbj-chem10'] }
  ],
  students: [
    { id: 'stu-1', userId: 'usr-stu-1', rollNumber: '10A-01', classId: 'cls-10a', parentId: 'par-1', joinDate: '2024-06-12', status: 'Active', bloodGroup: 'O+', address: '12 Sahyadri Residency, Kothrud, Pune 411038' },
    { id: 'stu-2', userId: 'usr-stu-2', rollNumber: '10A-02', classId: 'cls-10a', parentId: null, joinDate: '2024-06-12', status: 'Active', bloodGroup: 'A+', address: '404 Green Meadows, Baner, Pune 411045' },
    { id: 'stu-3', userId: 'usr-stu-3', rollNumber: '10A-03', classId: 'cls-10a', parentId: null, joinDate: '2024-06-12', status: 'Active', bloodGroup: 'B+', address: '7 Shivneri Colony, Karve Nagar, Pune 411052' },
    { id: 'stu-4', userId: 'usr-stu-4', rollNumber: '10A-04', classId: 'cls-10a', parentId: null, joinDate: '2024-06-14', status: 'Active', bloodGroup: 'AB+', address: '21 Lakeview Enclave, Aundh, Pune 411007' },
    { id: 'stu-5', userId: 'usr-stu-5', rollNumber: '10A-05', classId: 'cls-10a', parentId: null, joinDate: '2025-06-10', status: 'Active', bloodGroup: 'O-', address: '88 Ganesh Vihar, Warje, Pune 411058' },
    { id: 'stu-6', userId: 'usr-stu-6', rollNumber: '10B-01', classId: 'cls-10b', parentId: null, joinDate: '2024-06-12', status: 'Active', bloodGroup: 'B-', address: '15 Sun Orchid, Wakad, Pune 411057' },
    { id: 'stu-7', userId: 'usr-stu-7', rollNumber: '10B-02', classId: 'cls-10b', parentId: null, joinDate: '2024-06-12', status: 'On leave', bloodGroup: 'A-', address: '3 Tulip Court, Pimple Saudagar, Pune 411027' },
    { id: 'stu-8', userId: 'usr-stu-8', rollNumber: '9A-01', classId: 'cls-9a', parentId: null, joinDate: '2025-06-09', status: 'Active', bloodGroup: 'O+', address: '56 Rose Villa, Viman Nagar, Pune 411014' }
  ],
  parents: [
    { id: 'par-1', userId: 'usr-par-1', childrenStudentIds: ['stu-1'], occupation: 'Architect' }
  ],
  subjects: [
    { id: 'sbj-math10', name: 'Mathematics', code: 'MAT-10', classId: 'cls-10a', teacherId: 'tch-1' },
    { id: 'sbj-phy10', name: 'Physics', code: 'PHY-10', classId: 'cls-10a', teacherId: 'tch-2' },
    { id: 'sbj-chem10', name: 'Chemistry', code: 'CHE-10', classId: 'cls-10a', teacherId: 'tch-4' },
    { id: 'sbj-eng10', name: 'English', code: 'ENG-10', classId: 'cls-10a', teacherId: 'tch-3' },
    { id: 'sbj-math9', name: 'Mathematics', code: 'MAT-09', classId: 'cls-9a', teacherId: 'tch-1' }
  ],
  attendance: [
    { id: 'att-1', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-08', status: 'Present' },
    { id: 'att-2', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-09', status: 'Present' },
    { id: 'att-3', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-10', status: 'Late', remarks: 'Reached 9:12 am' },
    { id: 'att-4', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-11', status: 'Present' },
    { id: 'att-5', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-12', status: 'Present' },
    { id: 'att-6', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-15', status: 'Absent', remarks: 'Medical leave' },
    { id: 'att-7', studentId: 'stu-1', classId: 'cls-10a', date: '2026-09-16', status: 'Present' },
    { id: 'att-8', studentId: 'stu-2', classId: 'cls-10a', date: '2026-09-16', status: 'Present' },
    { id: 'att-9', studentId: 'stu-3', classId: 'cls-10a', date: '2026-09-16', status: 'Present' },
    { id: 'att-10', studentId: 'stu-4', classId: 'cls-10a', date: '2026-09-16', status: 'Absent', remarks: 'Not informed' },
    { id: 'att-11', studentId: 'stu-5', classId: 'cls-10a', date: '2026-09-16', status: 'Late' },
    { id: 'att-12', studentId: 'stu-2', classId: 'cls-10a', date: '2026-09-15', status: 'Present' },
    { id: 'att-13', studentId: 'stu-3', classId: 'cls-10a', date: '2026-09-15', status: 'Present' },
    { id: 'att-14', studentId: 'stu-4', classId: 'cls-10a', date: '2026-09-15', status: 'Present' },
    { id: 'att-15', studentId: 'stu-5', classId: 'cls-10a', date: '2026-09-15', status: 'Present' }
  ],
  exams: [
    { id: 'exm-1', title: 'Unit Test 2', classId: 'cls-10a', subjectId: 'sbj-math10', date: '2026-08-21', totalMarks: 50, type: 'Written' },
    { id: 'exm-2', title: 'Unit Test 2', classId: 'cls-10a', subjectId: 'sbj-phy10', date: '2026-08-23', totalMarks: 50, type: 'Written' },
    { id: 'exm-3', title: 'Unit Test 2', classId: 'cls-10a', subjectId: 'sbj-eng10', date: '2026-08-25', totalMarks: 50, type: 'Written' },
    { id: 'exm-4', title: 'Unit Test 2', classId: 'cls-10a', subjectId: 'sbj-chem10', date: '2026-08-27', totalMarks: 50, type: 'Written' },
    { id: 'exm-5', title: 'Half-Yearly Examination', classId: 'cls-10a', subjectId: 'sbj-math10', date: '2026-10-06', totalMarks: 80, type: 'Written' }
  ],
  marks: [
    { id: 'mrk-1', examId: 'exm-1', studentId: 'stu-1', marksObtained: 46, grade: 'A+', remarks: 'Clean method work' },
    { id: 'mrk-2', examId: 'exm-2', studentId: 'stu-1', marksObtained: 41, grade: 'A', remarks: 'Check unit conversions' },
    { id: 'mrk-3', examId: 'exm-3', studentId: 'stu-1', marksObtained: 43, grade: 'A', remarks: 'Strong comprehension' },
    { id: 'mrk-4', examId: 'exm-4', studentId: 'stu-1', marksObtained: 38, grade: 'B+', remarks: 'Revise organic naming' },
    { id: 'mrk-5', examId: 'exm-1', studentId: 'stu-2', marksObtained: 48, grade: 'A+' },
    { id: 'mrk-6', examId: 'exm-2', studentId: 'stu-2', marksObtained: 44, grade: 'A' },
    { id: 'mrk-7', examId: 'exm-1', studentId: 'stu-3', marksObtained: 33, grade: 'B' },
    { id: 'mrk-8', examId: 'exm-2', studentId: 'stu-3', marksObtained: 29, grade: 'C' },
    { id: 'mrk-9', examId: 'exm-1', studentId: 'stu-4', marksObtained: 40, grade: 'A' },
    { id: 'mrk-10', examId: 'exm-1', studentId: 'stu-5', marksObtained: 36, grade: 'B+' }
  ],
  fees: [
    { id: 'fee-1', studentId: 'stu-1', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-24', receiptNo: 'NPS/26/0411', method: 'UPI' },
    { id: 'fee-2', studentId: 'stu-1', title: 'Term 2 tuition', amount: 24500, dueDate: '2026-10-05', status: 'Pending', paidDate: null, receiptNo: null },
    { id: 'fee-3', studentId: 'stu-2', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-21', receiptNo: 'NPS/26/0398', method: 'Net banking' },
    { id: 'fee-4', studentId: 'stu-2', title: 'Term 2 tuition', amount: 24500, dueDate: '2026-10-05', status: 'Pending', paidDate: null, receiptNo: null },
    { id: 'fee-5', studentId: 'stu-3', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Overdue', paidDate: null, receiptNo: null },
    { id: 'fee-6', studentId: 'stu-4', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-07-02', receiptNo: 'NPS/26/0433', method: 'Cheque' },
    { id: 'fee-7', studentId: 'stu-5', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Overdue', paidDate: null, receiptNo: null },
    { id: 'fee-8', studentId: 'stu-6', title: 'Term 1 tuition', amount: 24500, dueDate: '2026-06-30', status: 'Paid', paidDate: '2026-06-28', receiptNo: 'NPS/26/0420', method: 'UPI' },
    { id: 'fee-9', studentId: 'stu-1', title: 'Science lab & library', amount: 4800, dueDate: '2026-07-15', status: 'Paid', paidDate: '2026-07-11', receiptNo: 'NPS/26/0461', method: 'UPI' },
    { id: 'fee-10', studentId: 'stu-8', title: 'Term 1 tuition', amount: 21500, dueDate: '2026-06-30', status: 'Pending', paidDate: null, receiptNo: null }
  ],
  collections: [
    { month: 'Apr', amount: 182000 },
    { month: 'May', amount: 96000 },
    { month: 'Jun', amount: 411000 },
    { month: 'Jul', amount: 268000 },
    { month: 'Aug', amount: 154000 },
    { month: 'Sep', amount: 209000 }
  ],
  timetables: [
    { id: 'tt-1', classId: 'cls-10a', dayOfWeek: 'Monday', period: '08:00 – 08:50', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' },
    { id: 'tt-2', classId: 'cls-10a', dayOfWeek: 'Monday', period: '08:55 – 09:45', subjectId: 'sbj-phy10', teacherId: 'tch-2', room: 'Physics Lab' },
    { id: 'tt-3', classId: 'cls-10a', dayOfWeek: 'Monday', period: '10:05 – 10:55', subjectId: 'sbj-eng10', teacherId: 'tch-3', room: 'Room 301' },
    { id: 'tt-4', classId: 'cls-10a', dayOfWeek: 'Monday', period: '11:00 – 11:50', subjectId: 'sbj-chem10', teacherId: 'tch-4', room: 'Chem Lab' },
    { id: 'tt-5', classId: 'cls-10a', dayOfWeek: 'Tuesday', period: '08:00 – 08:50', subjectId: 'sbj-eng10', teacherId: 'tch-3', room: 'Room 301' },
    { id: 'tt-6', classId: 'cls-10a', dayOfWeek: 'Tuesday', period: '08:55 – 09:45', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' },
    { id: 'tt-7', classId: 'cls-10a', dayOfWeek: 'Tuesday', period: '11:00 – 11:50', subjectId: 'sbj-phy10', teacherId: 'tch-2', room: 'Physics Lab' },
    { id: 'tt-8', classId: 'cls-10a', dayOfWeek: 'Wednesday', period: '08:00 – 08:50', subjectId: 'sbj-chem10', teacherId: 'tch-4', room: 'Chem Lab' },
    { id: 'tt-9', classId: 'cls-10a', dayOfWeek: 'Wednesday', period: '10:05 – 10:55', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' },
    { id: 'tt-10', classId: 'cls-10a', dayOfWeek: 'Thursday', period: '08:55 – 09:45', subjectId: 'sbj-eng10', teacherId: 'tch-3', room: 'Room 301' },
    { id: 'tt-11', classId: 'cls-10a', dayOfWeek: 'Thursday', period: '11:00 – 11:50', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' },
    { id: 'tt-12', classId: 'cls-10a', dayOfWeek: 'Friday', period: '08:00 – 08:50', subjectId: 'sbj-phy10', teacherId: 'tch-2', room: 'Physics Lab' },
    { id: 'tt-13', classId: 'cls-10a', dayOfWeek: 'Friday', period: '10:05 – 10:55', subjectId: 'sbj-chem10', teacherId: 'tch-4', room: 'Chem Lab' }
  ],
  assignments: [
    { id: 'asg-1', classId: 'cls-10a', subjectId: 'sbj-math10', teacherId: 'tch-1', title: 'Quadratic equations, exercise 4.3', description: 'Solve questions 1 to 18. Show every step of the factorisation.', dueDate: '2026-09-22', maxMarks: 20 },
    { id: 'asg-2', classId: 'cls-10a', subjectId: 'sbj-phy10', teacherId: 'tch-2', title: 'Light: ray diagrams worksheet', description: 'Draw ray diagrams for all six mirror and lens cases covered on Tuesday.', dueDate: '2026-09-24', maxMarks: 15 },
    { id: 'asg-3', classId: 'cls-10a', subjectId: 'sbj-eng10', teacherId: 'tch-3', title: 'Letter to the editor', description: 'Write a 150 word letter on traffic safety near the school gate.', dueDate: '2026-09-19', maxMarks: 10 },
    { id: 'asg-4', classId: 'cls-10a', subjectId: 'sbj-chem10', teacherId: 'tch-4', title: 'Balancing chemical equations', description: 'Complete the practice set on page 71 and note the type of each reaction.', dueDate: '2026-10-01', maxMarks: 20 }
  ],
  submissions: [
    { id: 'sub-1', assignmentId: 'asg-1', studentId: 'stu-1', submittedAt: '2026-09-16 21:10', status: 'Graded', content: 'Uploaded scanned worksheet.', grade: 18, feedback: 'Neat work. Recheck question 11.' },
    { id: 'sub-2', assignmentId: 'asg-3', studentId: 'stu-1', submittedAt: '2026-09-17 07:40', status: 'Submitted', content: 'Typed letter attached.', grade: null, feedback: null },
    { id: 'sub-3', assignmentId: 'asg-1', studentId: 'stu-2', submittedAt: '2026-09-15 19:05', status: 'Graded', content: 'Uploaded worksheet.', grade: 20, feedback: 'Full marks.' }
  ],
  studyMaterials: [
    { id: 'mat-1', classId: 'cls-10a', subjectId: 'sbj-math10', title: 'Quadratic equations — solved examples', fileType: 'PDF', fileUrl: '#', uploadedBy: 'Rakesh Iyer', uploadedAt: '2026-09-12' },
    { id: 'mat-2', classId: 'cls-10a', subjectId: 'sbj-phy10', title: 'Light and reflection — class slides', fileType: 'PPT', fileUrl: '#', uploadedBy: 'Fatima Sheikh', uploadedAt: '2026-09-10' },
    { id: 'mat-3', classId: 'cls-10a', subjectId: 'sbj-eng10', title: 'Letter writing formats', fileType: 'DOC', fileUrl: '#', uploadedBy: 'Joseph Mathew', uploadedAt: '2026-09-08' },
    { id: 'mat-4', classId: 'cls-10a', subjectId: 'sbj-chem10', title: 'Periodic table reference sheet', fileType: 'PDF', fileUrl: '#', uploadedBy: 'Kavita Rao', uploadedAt: '2026-09-05' }
  ],
  notices: [
    { id: 'ntc-1', title: 'Half-yearly exam timetable is out', content: 'Exams run from 6 to 16 October. The datesheet is on the notice board and in the parent portal.', authorName: 'Anjali Deshpande', date: '2026-09-16', targetRole: 'all', priority: 'high' },
    { id: 'ntc-2', title: 'Parent-teacher meeting on 27 September', content: 'Slots are 9 am to 1 pm, class-wise. Book a slot from the parent portal.', authorName: 'Office', date: '2026-09-15', targetRole: 'parent', priority: 'high' },
    { id: 'ntc-3', title: 'Science exhibition entries close Friday', content: 'Teams of up to three. Submit your abstract to the science staff room.', authorName: 'Fatima Sheikh', date: '2026-09-14', targetRole: 'student', priority: 'normal' },
    { id: 'ntc-4', title: 'Submit Term 2 lesson plans', content: 'All subject heads to upload lesson plans before 20 September.', authorName: 'Academic office', date: '2026-09-11', targetRole: 'teacher', priority: 'normal' }
  ],
  notifications: [
    { id: 'ntf-1', userId: 'usr-stu-1', title: 'Assignment graded', message: 'Mathematics exercise 4.3 — 18 of 20.', date: '2026-09-17 08:05', read: false },
    { id: 'ntf-2', userId: 'usr-stu-1', title: 'New study material', message: 'Periodic table reference sheet added to Chemistry.', date: '2026-09-16 16:30', read: false },
    { id: 'ntf-3', userId: 'usr-par-1', title: 'Attendance alert', message: 'Aarav was marked absent on 15 September.', date: '2026-09-15 09:25', read: false },
    { id: 'ntf-4', userId: 'usr-par-1', title: 'Fee reminder', message: 'Term 2 tuition of ₹24,500 is due on 5 October.', date: '2026-09-14 11:00', read: true },
    { id: 'ntf-5', userId: 'usr-adm-1', title: '2 fee accounts overdue', message: 'Rohan Kulkarni and Kabir Singh have not paid Term 1.', date: '2026-09-16 10:00', read: false }
  ]
};

class Store {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.users) return parsed;
      }
    } catch (err) {
      console.warn('Stored data could not be read, reseeding.', err);
    }
    const fresh = structuredClone(SEED);
    this.persist(fresh);
    return fresh;
  }

  persist(data = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Could not save to localStorage.', err);
    }
  }

  reset() {
    this.data = structuredClone(SEED);
    this.persist();
  }

  /* --- generic access --------------------------------------------------- */

  getTable(name) {
    return this.data[name] || [];
  }

  getById(name, id) {
    return this.getTable(name).find(row => row.id === id) || null;
  }

  create(name, values) {
    if (!this.data[name]) this.data[name] = [];
    const row = { id: this.nextId(name), ...values };
    this.data[name].unshift(row);
    this.persist();
    return row;
  }

  update(name, id, values) {
    const rows = this.getTable(name);
    const i = rows.findIndex(row => row.id === id);
    if (i === -1) return null;
    rows[i] = { ...rows[i], ...values };
    this.persist();
    return rows[i];
  }

  remove(name, id) {
    const rows = this.getTable(name);
    const next = rows.filter(row => row.id !== id);
    if (next.length === rows.length) return false;
    this.data[name] = next;
    this.persist();
    return true;
  }

  // Date.now() alone repeats inside a millisecond, and two rows created in the
  // same tick then shared an id -- which made getById ambiguous and let one
  // delete remove both. The counter makes the key unique regardless of clock
  // resolution.
  nextId(name) {
    this.seq = (this.seq || 0) + 1;
    return `${name.slice(0, 3)}-${Date.now().toString(36)}${this.seq.toString(36)}`;
  }

  get school() {
    return this.data.school;
  }

  /* --- joined reads ----------------------------------------------------- */

  className(classId) {
    const cls = this.getById('classes', classId);
    return cls ? `${cls.name} ${cls.section}` : 'Unassigned';
  }

  studentFull(studentId) {
    const student = this.getById('students', studentId);
    if (!student) return null;
    const user = this.getById('users', student.userId) || {};
    const parent = student.parentId ? this.getById('parents', student.parentId) : null;
    const parentUser = parent ? this.getById('users', parent.userId) : null;
    return {
      ...student,
      name: user.name || 'Unknown',
      email: user.email || '',
      phone: user.phone || '',
      className: this.className(student.classId),
      parentName: parentUser ? parentUser.name : null,
      parentPhone: parentUser ? parentUser.phone : null
    };
  }

  allStudents() {
    return this.getTable('students').map(s => this.studentFull(s.id));
  }

  teacherFull(teacherId) {
    const teacher = this.getById('teachers', teacherId);
    if (!teacher) return null;
    const user = this.getById('users', teacher.userId) || {};
    const subjects = (teacher.subjects || [])
      .map(id => this.getById('subjects', id))
      .filter(Boolean);
    return {
      ...teacher,
      name: user.name || 'Unknown',
      email: user.email || '',
      phone: user.phone || '',
      subjectNames: subjects.map(s => s.name),
      classNames: [...new Set(subjects.map(s => this.className(s.classId)))]
    };
  }

  allTeachers() {
    return this.getTable('teachers').map(t => this.teacherFull(t.id));
  }

  studentsInClass(classId) {
    return this.getTable('students')
      .filter(s => s.classId === classId)
      .map(s => this.studentFull(s.id));
  }

  subjectsForClass(classId) {
    return this.getTable('subjects').filter(s => s.classId === classId);
  }

  /* --- derived numbers -------------------------------------------------- */

  // Late counts as attended. Schools report it separately but a student who
  // walked in at 9:12 was present, and treating it as absent understates the
  // rate by several points.
  attendanceRate(studentId) {
    const rows = this.getTable('attendance').filter(a => a.studentId === studentId);
    if (!rows.length) return null;
    const attended = rows.filter(a => a.status !== 'Absent').length;
    return Math.round((attended / rows.length) * 100);
  }

  classAttendanceRate(classId) {
    const rows = this.getTable('attendance').filter(a => a.classId === classId);
    if (!rows.length) return null;
    const attended = rows.filter(a => a.status !== 'Absent').length;
    return Math.round((attended / rows.length) * 100);
  }

  attendanceOn(classId, date) {
    return this.getTable('attendance').filter(a => a.classId === classId && a.date === date);
  }

  marksFor(studentId) {
    return this.getTable('marks')
      .filter(m => m.studentId === studentId)
      .map(m => {
        const exam = this.getById('exams', m.examId);
        const subject = exam ? this.getById('subjects', exam.subjectId) : null;
        return {
          ...m,
          examTitle: exam ? exam.title : 'Assessment',
          examDate: exam ? exam.date : null,
          totalMarks: exam ? exam.totalMarks : 100,
          subjectName: subject ? subject.name : 'Subject'
        };
      });
  }

  feesFor(studentId) {
    return this.getTable('fees').filter(f => f.studentId === studentId);
  }

  feesWithStudent() {
    return this.getTable('fees').map(f => {
      const s = this.studentFull(f.studentId);
      return {
        ...f,
        studentName: s ? s.name : 'Unknown student',
        rollNumber: s ? s.rollNumber : '',
        className: s ? s.className : ''
      };
    });
  }

  feeTotals() {
    const fees = this.getTable('fees');
    const sum = list => list.reduce((total, f) => total + f.amount, 0);
    return {
      collected: sum(fees.filter(f => f.status === 'Paid')),
      pending: sum(fees.filter(f => f.status === 'Pending')),
      overdue: sum(fees.filter(f => f.status === 'Overdue')),
      overdueCount: fees.filter(f => f.status === 'Overdue').length
    };
  }

  assignmentsFull(classId = null) {
    return this.getTable('assignments')
      .filter(a => !classId || a.classId === classId)
      .map(a => {
        const subject = this.getById('subjects', a.subjectId);
        const subs = this.getTable('submissions').filter(s => s.assignmentId === a.id);
        return {
          ...a,
          subjectName: subject ? subject.name : 'Subject',
          className: this.className(a.classId),
          submissionCount: subs.length,
          classSize: this.studentsInClass(a.classId).length
        };
      })
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }

  submissionFor(assignmentId, studentId) {
    return this.getTable('submissions')
      .find(s => s.assignmentId === assignmentId && s.studentId === studentId) || null;
  }

  timetableFor(classId) {
    return this.getTable('timetables')
      .filter(t => t.classId === classId)
      .map(t => {
        const subject = this.getById('subjects', t.subjectId);
        const teacher = t.teacherId ? this.teacherFull(t.teacherId) : null;
        return {
          ...t,
          subjectName: subject ? subject.name : 'Subject',
          teacherName: teacher ? teacher.name : ''
        };
      });
  }

  noticesFor(role) {
    return this.getTable('notices')
      .filter(n => role === 'admin' || n.targetRole === 'all' || n.targetRole === role)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  notificationsFor(userId) {
    return this.getTable('notifications')
      .filter(n => n.userId === userId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  gradeDistribution(classId) {
    const students = this.studentsInClass(classId).map(s => s.id);
    const buckets = { 'A+': 0, A: 0, 'B+': 0, B: 0, C: 0 };
    this.getTable('marks')
      .filter(m => students.includes(m.studentId) && m.grade in buckets)
      .forEach(m => { buckets[m.grade] += 1; });
    return Object.entries(buckets).map(([grade, count]) => ({ label: grade, value: count }));
  }
}

window.Store = new Store();
