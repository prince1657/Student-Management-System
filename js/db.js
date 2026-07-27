/* ==========================================================================
   EDUPULSE - RELATIONAL DATABASE ENGINE & SAMPLE DATA persister
   ========================================================================== */

const STORAGE_KEY = 'edupulse_db_v1';

// Seed Initial Sample Data
const initialSeedData = {
  users: [
    { id: 'usr-admin', name: 'Dr. Eleanor Vance', email: 'admin@edupulse.edu', role: 'admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', phone: '+1 (555) 019-2834' },
    { id: 'usr-tch-1', name: 'Prof. Marcus Sterling', email: 'marcus.sterling@edupulse.edu', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', phone: '+1 (555) 438-9201' },
    { id: 'usr-tch-2', name: 'Ms. Clara Thorne', email: 'clara.thorne@edupulse.edu', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', phone: '+1 (555) 782-1190' },
    { id: 'usr-tch-3', name: 'Mr. David Miller', email: 'david.miller@edupulse.edu', role: 'teacher', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', phone: '+1 (555) 902-3341' },
    { id: 'usr-stu-1', name: 'Alex Rivera', email: 'alex.rivera@student.edupulse.edu', role: 'student', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', phone: '+1 (555) 234-8901' },
    { id: 'usr-stu-2', name: 'Sophia Chen', email: 'sophia.chen@student.edupulse.edu', role: 'student', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', phone: '+1 (555) 345-9012' },
    { id: 'usr-stu-3', name: 'Ethan Hunt', email: 'ethan.hunt@student.edupulse.edu', role: 'student', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', phone: '+1 (555) 456-0123' },
    { id: 'usr-par-1', name: 'Sarah Rivera', email: 'sarah.rivera@gmail.com', role: 'parent', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', phone: '+1 (555) 888-4321' }
  ],
  classes: [
    { id: 'cls-10a', name: 'Grade 10', section: 'A', classTeacherId: 'tch-1', room: 'Room 301', capacity: 35 },
    { id: 'cls-10b', name: 'Grade 10', section: 'B', classTeacherId: 'tch-2', room: 'Room 302', capacity: 30 },
    { id: 'cls-9a',  name: 'Grade 9',  section: 'A', classTeacherId: 'tch-3', room: 'Room 201', capacity: 32 }
  ],
  teachers: [
    { id: 'tch-1', userId: 'usr-tch-1', employeeId: 'EMP-1001', qualification: 'Ph.D. in Applied Mathematics', designation: 'Head of Mathematics', subjects: ['sbj-math10', 'sbj-alg9'] },
    { id: 'tch-2', userId: 'usr-tch-2', employeeId: 'EMP-1002', qualification: 'M.Sc. Physics', designation: 'Senior Science Lecturer', subjects: ['sbj-phy10'] },
    { id: 'tch-3', userId: 'usr-tch-3', employeeId: 'EMP-1003', qualification: 'M.A. English Literature', designation: 'English Dept Chair', subjects: ['sbj-eng10'] }
  ],
  students: [
    { id: 'stu-1', userId: 'usr-stu-1', rollNumber: '10A-01', classId: 'cls-10a', parentId: 'par-1', joinDate: '2024-09-01', status: 'Active', bloodGroup: 'O+', address: '742 Evergreen Terrace, Springfield' },
    { id: 'stu-2', userId: 'usr-stu-2', rollNumber: '10A-02', classId: 'cls-10a', parentId: null, joinDate: '2024-09-01', status: 'Active', bloodGroup: 'A+', address: '123 Innovation Way, Tech City' },
    { id: 'stu-3', userId: 'usr-stu-3', rollNumber: '10A-03', classId: 'cls-10a', parentId: null, joinDate: '2024-09-01', status: 'Active', bloodGroup: 'B+', address: '456 Oak Avenue, Metroville' }
  ],
  parents: [
    { id: 'par-1', userId: 'usr-par-1', childrenStudentIds: ['stu-1'], occupation: 'Architect' }
  ],
  subjects: [
    { id: 'sbj-math10', name: 'Advanced Mathematics', code: 'MATH-10', classId: 'cls-10a', teacherId: 'tch-1' },
    { id: 'sbj-phy10',  name: 'Physics & Kinetics',   code: 'PHYS-10', classId: 'cls-10a', teacherId: 'tch-2' },
    { id: 'sbj-eng10',  name: 'English Literature',   code: 'ENG-10',  classId: 'cls-10a', teacherId: 'tch-3' },
    { id: 'sbj-alg9',   name: 'Algebra I',            code: 'MATH-09', classId: 'cls-9a',  teacherId: 'tch-1' }
  ],
  attendance: [
    { id: 'att-1', studentId: 'stu-1', classId: 'cls-10a', date: '2026-07-22', status: 'Present', remarks: 'On time' },
    { id: 'att-2', studentId: 'stu-1', classId: 'cls-10a', date: '2026-07-23', status: 'Present', remarks: 'On time' },
    { id: 'att-3', studentId: 'stu-1', classId: 'cls-10a', date: '2026-07-24', status: 'Late',    remarks: '10 mins late' },
    { id: 'att-4', studentId: 'stu-1', classId: 'cls-10a', date: '2026-07-25', status: 'Present', remarks: 'On time' },
    { id: 'att-5', studentId: 'stu-2', classId: 'cls-10a', date: '2026-07-25', status: 'Present', remarks: 'On time' },
    { id: 'att-6', studentId: 'stu-3', classId: 'cls-10a', date: '2026-07-25', status: 'Absent',  remarks: 'Sick leave' }
  ],
  exams: [
    { id: 'exm-1', title: 'Mid-Term Examinations', classId: 'cls-10a', subjectId: 'sbj-math10', date: '2026-08-10', totalMarks: 100, type: 'Written' },
    { id: 'exm-2', title: 'Physics Practical Assessment', classId: 'cls-10a', subjectId: 'sbj-phy10', date: '2026-08-14', totalMarks: 50, type: 'Practical' },
    { id: 'exm-3', title: 'First Quarterly Evaluation', classId: 'cls-10a', subjectId: 'sbj-eng10', date: '2026-07-15', totalMarks: 100, type: 'Written' }
  ],
  marks: [
    { id: 'mrk-1', examId: 'exm-3', studentId: 'stu-1', marksObtained: 92, grade: 'A+', remarks: 'Exceptional analytical essays' },
    { id: 'mrk-2', examId: 'exm-3', studentId: 'stu-2', marksObtained: 88, grade: 'A',  remarks: 'Very strong vocabulary' },
    { id: 'mrk-3', examId: 'exm-3', studentId: 'stu-3', marksObtained: 74, grade: 'B',  remarks: 'Needs improvement in grammar' }
  ],
  fees: [
    { id: 'fee-1', studentId: 'stu-1', title: 'Q1 Tuition & Lab Fee', amount: 1250, dueDate: '2026-07-15', status: 'Paid', paidDate: '2026-07-10', receiptNo: 'REC-2026-0891' },
    { id: 'fee-2', studentId: 'stu-1', title: 'Q2 Tuition Fee', amount: 1250, dueDate: '2026-10-15', status: 'Pending', paidDate: null, receiptNo: null },
    { id: 'fee-3', studentId: 'stu-2', title: 'Q1 Tuition & Lab Fee', amount: 1250, dueDate: '2026-07-15', status: 'Paid', paidDate: '2026-07-12', receiptNo: 'REC-2026-0892' },
    { id: 'fee-4', studentId: 'stu-3', title: 'Q1 Tuition & Lab Fee', amount: 1250, dueDate: '2026-07-15', status: 'Overdue', paidDate: null, receiptNo: null }
  ],
  timetables: [
    { id: 'tt-1', classId: 'cls-10a', dayOfWeek: 'Monday', period: '09:00 - 10:00 AM', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' },
    { id: 'tt-2', classId: 'cls-10a', dayOfWeek: 'Monday', period: '10:15 - 11:15 AM', subjectId: 'sbj-phy10',  teacherId: 'tch-2', room: 'Physics Lab' },
    { id: 'tt-3', classId: 'cls-10a', dayOfWeek: 'Monday', period: '11:30 - 12:30 PM', subjectId: 'sbj-eng10',  teacherId: 'tch-3', room: 'Room 301' },
    { id: 'tt-4', classId: 'cls-10a', dayOfWeek: 'Tuesday', period: '09:00 - 10:00 AM', subjectId: 'sbj-eng10',  teacherId: 'tch-3', room: 'Room 301' },
    { id: 'tt-5', classId: 'cls-10a', dayOfWeek: 'Tuesday', period: '10:15 - 11:15 AM', subjectId: 'sbj-math10', teacherId: 'tch-1', room: 'Room 301' }
  ],
  assignments: [
    { id: 'asg-1', classId: 'cls-10a', subjectId: 'sbj-math10', teacherId: 'tch-1', title: 'Quadratic Equations Worksheet', description: 'Complete problems 1 through 25 on page 142. Show all step-by-step working.', dueDate: '2026-07-30', maxMarks: 50, attachmentUrl: 'https://example.com/math-ws1.pdf' },
    { id: 'asg-2', classId: 'cls-10a', subjectId: 'sbj-phy10',  teacherId: 'tch-2', title: 'Newtonian Motion Lab Report', description: 'Submit experimental findings and acceleration graphs from Tuesday lab session.', dueDate: '2026-08-02', maxMarks: 30, attachmentUrl: 'https://example.com/physics-lab.pdf' }
  ],
  submissions: [
    { id: 'sub-1', assignmentId: 'asg-1', studentId: 'stu-1', submittedAt: '2026-07-25 14:30', status: 'Graded', content: 'Completed worksheet uploaded via document link.', grade: 48, feedback: 'Great work! Minor slip on problem #18.' }
  ],
  studyMaterials: [
    { id: 'mat-1', classId: 'cls-10a', subjectId: 'sbj-math10', title: 'Calculus Fundamentals & Derivatives PDF', fileType: 'PDF', fileUrl: '#', uploadedBy: 'Prof. Marcus Sterling', uploadedAt: '2026-07-20' },
    { id: 'mat-2', classId: 'cls-10a', subjectId: 'sbj-phy10', title: 'Electromagnetism Lecture Slides', fileType: 'PPTX', fileUrl: '#', uploadedBy: 'Ms. Clara Thorne', uploadedAt: '2026-07-18' },
    { id: 'mat-3', classId: 'cls-10a', subjectId: 'sbj-eng10', title: 'Shakespeare Hamlet Critical Guide', fileType: 'DOCX', fileUrl: '#', uploadedBy: 'Mr. David Miller', uploadedAt: '2026-07-15' }
  ],
  notices: [
    { id: 'ntc-1', title: 'Annual Science & Tech Fair 2026', content: 'Students interested in entering projects must register their teams by August 5th in the Main Auditorium.', authorName: 'Dr. Eleanor Vance', date: '2026-07-25', targetRole: 'all', priority: 'high' },
    { id: 'ntc-2', title: 'Parent-Teacher Conference Schedule', content: 'Quarterly Parent-Teacher discussions will be hosted on August 15th from 9:00 AM to 4:00 PM.', authorName: 'Administration', date: '2026-07-24', targetRole: 'parent', priority: 'high' },
    { id: 'ntc-3', title: 'Faculty Curriculum Review Meeting', content: 'All department chairs please prepare course outlines for Term 2 by Friday afternoon.', authorName: 'Academic Directorate', date: '2026-07-21', targetRole: 'teacher', priority: 'normal' }
  ],
  notifications: [
    { id: 'notif-1', userId: 'usr-stu-1', title: 'Assignment Graded', message: 'Prof. Marcus Sterling graded your Quadratic Equations Worksheet (48/50).', date: '2026-07-25 15:00', read: false },
    { id: 'notif-2', userId: 'usr-stu-1', title: 'New Notice Posted', message: 'Annual Science & Tech Fair registration is now open.', date: '2026-07-25 09:12', read: true },
    { id: 'notif-3', userId: 'usr-par-1', title: 'Attendance Alert', message: 'Alex Rivera marked Late on 2026-07-24.', date: '2026-07-24 09:30', read: false }
  ]
};

// Database Engine Class
class DatabaseEngine {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load DB from localStorage, initializing seed data', e);
    }
    // Set seed data if none exists
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeedData));
    return JSON.parse(JSON.stringify(initialSeedData));
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to persist DB state to localStorage', e);
    }
  }

  resetToSeed() {
    this.data = JSON.parse(JSON.stringify(initialSeedData));
    this.save();
    return this.data;
  }

  // Generic CRUD Helpers
  getTable(tableName) {
    return this.data[tableName] || [];
  }

  getById(tableName, id) {
    const list = this.getTable(tableName);
    return list.find(item => item.id === id) || null;
  }

  create(tableName, itemData) {
    if (!this.data[tableName]) this.data[tableName] = [];
    const prefix = tableName.substring(0, 3);
    const newId = `${prefix}-${Date.now().toString().slice(-6)}`;
    const newItem = { id: newId, ...itemData };
    this.data[tableName].unshift(newItem);
    this.save();
    return newItem;
  }

  update(tableName, id, updateData) {
    const list = this.getTable(tableName);
    const index = list.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[tableName][index] = { ...list[index], ...updateData };
      this.save();
      return this.data[tableName][index];
    }
    return null;
  }

  delete(tableName, id) {
    const list = this.getTable(tableName);
    const filtered = list.filter(item => item.id !== id);
    if (filtered.length !== list.length) {
      this.data[tableName] = filtered;
      this.save();
      return true;
    }
    return false;
  }

  // Relational Lookups
  getStudentFull(studentId) {
    const student = this.getById('students', studentId);
    if (!student) return null;
    const user = this.getById('users', student.userId);
    const cls = this.getById('classes', student.classId);
    const parent = student.parentId ? this.getById('parents', student.parentId) : null;
    const parentUser = parent ? this.getById('users', parent.userId) : null;
    return {
      ...student,
      name: user ? user.name : 'Unknown',
      email: user ? user.email : '',
      avatar: user ? user.avatar : '',
      phone: user ? user.phone : '',
      className: cls ? `${cls.name} (${cls.section})` : 'Unassigned',
      parentName: parentUser ? parentUser.name : 'N/A'
    };
  }

  getTeacherFull(teacherId) {
    const teacher = this.getById('teachers', teacherId);
    if (!teacher) return null;
    const user = this.getById('users', teacher.userId);
    return {
      ...teacher,
      name: user ? user.name : 'Unknown',
      email: user ? user.email : '',
      avatar: user ? user.avatar : '',
      phone: user ? user.phone : ''
    };
  }
}

// Global Singleton Export
window.DB = new DatabaseEngine();
