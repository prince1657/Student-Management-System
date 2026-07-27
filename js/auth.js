/* ==========================================================================
   EDUPULSE - ROLE-BASED AUTH & CONTEXT MANAGER
   ========================================================================== */

class AuthManager {
  constructor() {
    this.currentRole = localStorage.getItem('edupulse_current_role') || 'admin';
    this.activeUser = null;
    this.initUserForRole(this.currentRole);
  }

  initUserForRole(role) {
    this.currentRole = role;
    localStorage.setItem('edupulse_current_role', role);

    const users = window.DB.getTable('users');
    if (role === 'admin') {
      this.activeUser = users.find(u => u.role === 'admin') || users[0];
    } else if (role === 'teacher') {
      const tUser = users.find(u => u.role === 'teacher');
      const teacher = window.DB.getTable('teachers').find(t => t.userId === tUser.id);
      this.activeUser = { ...tUser, teacherId: teacher ? teacher.id : 'tch-1' };
    } else if (role === 'student') {
      const sUser = users.find(u => u.role === 'student');
      const student = window.DB.getTable('students').find(s => s.userId === sUser.id);
      this.activeUser = { ...sUser, studentId: student ? student.id : 'stu-1', classId: student ? student.classId : 'cls-10a' };
    } else if (role === 'parent') {
      const pUser = users.find(u => u.role === 'parent');
      const parent = window.DB.getTable('parents').find(p => p.userId === pUser.id);
      this.activeUser = { ...pUser, parentId: parent ? parent.id : 'par-1', childStudentId: 'stu-1' };
    }
  }

  switchRole(role) {
    this.initUserForRole(role);
    window.dispatchEvent(new CustomEvent('auth:roleChanged', { detail: { role, user: this.activeUser } }));
  }

  getCurrentRole() {
    return this.currentRole;
  }

  getActiveUser() {
    return this.activeUser;
  }

  updateProfile(data) {
    if (!this.activeUser) return;
    const updated = window.DB.update('users', this.activeUser.id, data);
    this.activeUser = { ...this.activeUser, ...updated };
    return this.activeUser;
  }
}

window.Auth = new AuthManager();
