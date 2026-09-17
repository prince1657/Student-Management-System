/* ==========================================================================
   Session and roles

   Sign-in is a demo gate: any password is accepted for a known demo address.
   It exists so the app has a real entry point and a real sign-out, and so
   each portal opens as one identity instead of a floating role toggle.
   ========================================================================== */

const ROLES = {
  admin: {
    label: 'Administrator',
    icon: 'admin',
    portal: 'School office',
    demoEmail: 'principal@nalandaps.edu.in',
    landing: 'admin-overview'
  },
  teacher: {
    label: 'Teacher',
    icon: 'faculty',
    portal: 'Staff room',
    demoEmail: 'rakesh.iyer@nalandaps.edu.in',
    landing: 'teacher-overview'
  },
  student: {
    label: 'Student',
    icon: 'student',
    portal: 'My classes',
    demoEmail: 'aarav.mehta@nalandaps.edu.in',
    landing: 'student-overview'
  },
  parent: {
    label: 'Parent',
    icon: 'parent',
    portal: 'My child',
    demoEmail: 'sunita.mehta@gmail.com',
    landing: 'parent-overview'
  }
};

const SESSION_KEY = 'edupulse.session.v2';

class Auth {
  constructor() {
    this.roles = ROLES;
    this.session = this.restore();
  }

  restore() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && ROLES[parsed.role]) return parsed;
    } catch (err) {
      // A corrupt session should land on the sign-in screen, not throw.
    }
    return null;
  }

  isSignedIn() {
    return Boolean(this.session);
  }

  get role() {
    return this.session ? this.session.role : null;
  }

  // The person behind the session, with the role-specific ids a view needs
  // (which student's marks, which teacher's classes, whose child).
  get user() {
    if (!this.session) return null;
    const role = this.session.role;
    const users = window.Store.getTable('users');
    const user = users.find(u => u.email === this.session.email && u.role === role)
      || users.find(u => u.role === role);
    if (!user) return null;

    const context = { ...user, roleLabel: ROLES[role].label };

    if (role === 'teacher') {
      const teacher = window.Store.getTable('teachers').find(t => t.userId === user.id);
      context.teacherId = teacher ? teacher.id : null;
    }
    if (role === 'student') {
      const student = window.Store.getTable('students').find(s => s.userId === user.id);
      context.studentId = student ? student.id : null;
      context.classId = student ? student.classId : null;
    }
    if (role === 'parent') {
      const parent = window.Store.getTable('parents').find(p => p.userId === user.id);
      context.parentId = parent ? parent.id : null;
      context.childId = parent ? parent.childrenStudentIds[0] : null;
    }
    return context;
  }

  signIn(role, email) {
    if (!ROLES[role]) throw new Error(`Unknown role: ${role}`);
    this.session = { role, email: email || ROLES[role].demoEmail, since: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    window.dispatchEvent(new CustomEvent('auth:signedin', { detail: { role } }));
  }

  // Switching portals keeps you signed in; it is the demo path between the
  // four views without four sign-ins.
  viewAs(role) {
    if (!ROLES[role] || role === this.role) return;
    this.signIn(role, ROLES[role].demoEmail);
  }

  signOut() {
    this.session = null;
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('auth:signedout'));
  }

  updateProfile(values) {
    const user = this.user;
    if (!user) return null;
    const updated = window.Store.update('users', user.id, values);
    if (updated && values.email) {
      this.session.email = values.email;
      localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
    }
    return updated;
  }
}

window.Auth = new Auth();
