/* ==========================================================================
   EDUPULSE - HYBRID REST API CLIENT (EXPRESS.JS BACKEND + LOCAL DB FALLBACK)
   ========================================================================== */

class RESTApiClient {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.useLiveBackend = true;
  }

  async _fetchLive(endpoint, options = {}) {
    if (!this.useLiveBackend) return null;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s connection timeout check
      const res = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      // Server offline, seamlessly fallback
      this.useLiveBackend = false;
      console.warn('Express backend offline, utilizing local DB fallback mode.');
    }
    return null;
  }

  _formatResponse(data, status = 200, message = 'Success') {
    return { status, success: status >= 200 && status < 300, message, data };
  }

  // 1. STUDENTS ENDPOINTS
  async getStudents(query = {}) {
    const live = await this._fetchLive(`/students?search=${query.search || ''}&classId=${query.classId || ''}`);
    if (live) return live;

    // Fallback to local DB state
    let students = window.DB.getTable('students').map(s => window.DB.getStudentFull(s.id));
    if (query.search) {
      const q = query.search.toLowerCase();
      students = students.filter(s => s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q));
    }
    return this._formatResponse({ students, pagination: { total: students.length, page: 1, limit: 10 } });
  }

  async createStudent(studentData) {
    const live = await this._fetchLive('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
    if (live) return live;

    const user = window.DB.create('users', {
      name: studentData.name,
      email: studentData.email,
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      phone: studentData.phone || '+1 (555) 000-0000'
    });
    const student = window.DB.create('students', {
      userId: user.id,
      rollNumber: `10A-${Math.floor(Math.random()*90 + 10)}`,
      classId: studentData.classId,
      status: 'Active'
    });
    return this._formatResponse(window.DB.getStudentFull(student.id), 201, 'Student created');
  }

  async deleteStudent(id) {
    const live = await this._fetchLive(`/students/${id}`, { method: 'DELETE' });
    if (live) return live;

    const s = window.DB.getById('students', id);
    if (s) {
      window.DB.delete('users', s.userId);
      window.DB.delete('students', id);
    }
    return this._formatResponse(null, 200, 'Student deleted');
  }

  // 2. TEACHERS ENDPOINTS
  async getTeachers(query = {}) {
    const live = await this._fetchLive('/teachers');
    if (live) return live;
    return this._formatResponse(window.DB.getTable('teachers').map(t => window.DB.getTeacherFull(t.id)));
  }

  async createTeacher(teacherData) {
    const live = await this._fetchLive('/teachers', {
      method: 'POST',
      body: JSON.stringify(teacherData)
    });
    if (live) return live;

    const user = window.DB.create('users', { name: teacherData.name, email: teacherData.email, role: 'teacher' });
    const teacher = window.DB.create('teachers', { userId: user.id, employeeId: `EMP-${Math.floor(Math.random()*9000 + 1000)}` });
    return this._formatResponse(window.DB.getTeacherFull(teacher.id), 201, 'Teacher created');
  }

  // 3. ATTENDANCE ENDPOINTS
  async saveBatchAttendance(classId, date, records) {
    // Local DB save
    records.forEach(rec => {
      window.DB.create('attendance', { classId, date, studentId: rec.studentId, status: rec.status });
    });
    return this._formatResponse(null, 200, 'Attendance saved');
  }

  // 4. FEES ENDPOINTS
  async getFees() {
    const live = await this._fetchLive('/fees');
    if (live) return live;

    const fees = window.DB.getTable('fees').map(f => {
      const s = window.DB.getStudentFull(f.studentId);
      return { ...f, studentName: s ? s.name : 'Student', rollNumber: s ? s.rollNumber : '' };
    });
    return this._formatResponse(fees);
  }

  async payFee(feeId) {
    const live = await this._fetchLive(`/fees/${feeId}/pay`, { method: 'POST' });
    if (live) return live;

    const fee = window.DB.update('fees', feeId, {
      status: 'Paid',
      paidDate: new Date().toISOString().split('T')[0],
      receiptNo: `REC-${new Date().getFullYear()}-${Math.floor(Math.random()*9000 + 1000)}`
    });
    return this._formatResponse(fee, 200, 'Payment recorded');
  }
}

window.API = new RESTApiClient();
