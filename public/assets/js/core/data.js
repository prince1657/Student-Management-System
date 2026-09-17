/* ==========================================================================
   Data layer

   Every write in the app goes through here rather than touching the store
   from a view, so the rules that go with a write live in one place: what a
   new roll number looks like, what re-marking a register does to the old
   rows, what happens to a student's fees when they leave.
   ========================================================================== */

const Data = {
  async createStudent(values) {
    const user = window.Store.create('users', {
      name: values.name,
      email: values.email,
      role: 'student',
      phone: values.phone || ''
    });

    // Take the roll prefix from the students already in the class. Deriving it
    // from the class name gave "XA-06" in a class whose rolls read "10A-01",
    // because the class is named in Roman numerals and the rolls are not.
    const peers = window.Store.studentsInClass(values.classId);
    const cls = window.Store.getById('classes', values.classId);
    const prefix = peers.length
      ? peers[0].rollNumber.split('-')[0]
      : (cls ? `${cls.name.replace('Class ', '')}${cls.section}` : 'NEW');

    // One past the highest roll in use, so removing a student and adding
    // another does not reissue a number that is already on a record.
    const highest = peers.reduce((max, s) => {
      const n = Number(s.rollNumber.split('-')[1]);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 0);
    const next = highest + 1;

    return window.Store.create('students', {
      userId: user.id,
      rollNumber: `${prefix}-${String(next).padStart(2, '0')}`,
      classId: values.classId,
      status: 'Active',
      joinDate: window.Format.today(),
      bloodGroup: values.bloodGroup || '—',
      address: values.address || ''
    });
  },

  // Removing a student takes their attendance and fee rows with them.
  // Leaving those behind skewed the class attendance rate and the fee totals
  // with rows that no longer pointed at anybody.
  async deleteStudent(id) {
    const student = window.Store.getById('students', id);
    if (!student) return false;

    window.Store.remove('users', student.userId);
    window.Store.getTable('fees')
      .filter(f => f.studentId === id)
      .forEach(f => window.Store.remove('fees', f.id));
    window.Store.getTable('attendance')
      .filter(a => a.studentId === id)
      .forEach(a => window.Store.remove('attendance', a.id));
    window.Store.getTable('submissions')
      .filter(s => s.studentId === id)
      .forEach(s => window.Store.remove('submissions', s.id));

    return window.Store.remove('students', id);
  },

  async createTeacher(values) {
    const user = window.Store.create('users', {
      name: values.name,
      email: values.email,
      role: 'teacher',
      phone: values.phone || '',
      title: values.designation
    });

    return window.Store.create('teachers', {
      userId: user.id,
      employeeId: `NPS-${Math.floor(Math.random() * 900 + 1100)}`,
      designation: values.designation || 'Faculty',
      qualification: values.qualification || '',
      joinDate: window.Format.today(),
      subjects: []
    });
  },

  async payFee(feeId, method = 'UPI') {
    return window.Store.update('fees', feeId, {
      status: 'Paid',
      paidDate: window.Format.today(),
      method,
      receiptNo: `NPS/26/${Math.floor(Math.random() * 9000 + 1000)}`
    });
  },

  // Saving a register replaces that day's rows instead of appending a second
  // set, which used to double-count every correction a teacher made.
  async saveAttendance(classId, date, records) {
    window.Store.getTable('attendance')
      .filter(a => a.classId === classId && a.date === date)
      .forEach(a => window.Store.remove('attendance', a.id));

    records.forEach(rec => window.Store.create('attendance', {
      classId,
      date,
      studentId: rec.studentId,
      status: rec.status
    }));
    return true;
  },

  async saveMarks(examId, entries) {
    entries.forEach(entry => {
      const existing = window.Store.getTable('marks')
        .find(m => m.examId === examId && m.studentId === entry.studentId);
      if (existing) window.Store.update('marks', existing.id, entry);
      else window.Store.create('marks', { examId, ...entry });
    });
    return true;
  },

  async createAssignment(values) {
    return window.Store.create('assignments', values);
  },

  async createMaterial(values) {
    return window.Store.create('studyMaterials', values);
  },

  async createNotice(values) {
    return window.Store.create('notices', values);
  },

  async submitAssignment(values) {
    return window.Store.create('submissions', values);
  }
};

window.Data = Data;
