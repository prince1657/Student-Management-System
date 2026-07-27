/* ==========================================================================
   EDUPULSE - APPLICATION INITIALIZER & ROUTER
   ========================================================================== */

class Application {
  constructor() {
    this.currentView = 'dashboard';
    this.init();
  }

  init() {
    // Listen to role changes
    window.addEventListener('auth:roleChanged', (e) => {
      this.updateSidebarForRole(e.detail.role);
      this.updateUserBadge(e.detail.user, e.detail.role);
      this.navigateToDefaultRoleView(e.detail.role);
    });

    // Theme toggle listener
    document.getElementById('theme-toggle').addEventListener('click', () => {
      window.UI.toggleTheme();
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('mobile-open');
      });
    }

    // Set initial sidebar & user view
    const initialRole = window.Auth.getCurrentRole();
    this.updateSidebarForRole(initialRole);
    this.updateUserBadge(window.Auth.getActiveUser(), initialRole);
    this.navigateToDefaultRoleView(initialRole);
  }

  updateUserBadge(user, role) {
    if (!user) return;
    document.getElementById('user-name-display').textContent = user.name;
    document.getElementById('user-role-display').textContent = role.toUpperCase();
    document.getElementById('user-avatar-display').src = user.avatar;
    document.getElementById('sidebar-role-tag').textContent = role.toUpperCase();
  }

  updateSidebarForRole(role) {
    const nav = document.getElementById('sidebar-navigation');
    const roleBtns = document.querySelectorAll('.role-btn');

    roleBtns.forEach(btn => {
      if (btn.getAttribute('data-role') === role) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    let items = [];
    if (role === 'admin') {
      items = [
        { id: 'admin-dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'admin-students', label: 'Students Directory', icon: '🎓' },
        { id: 'admin-teachers', label: 'Faculty Directory', icon: '👨‍🏫' },
        { id: 'admin-fees', label: 'Fee Management', icon: '💳' },
        { id: 'admin-reports', label: 'System Analytics', icon: '📈' }
      ];
    } else if (role === 'teacher') {
      items = [
        { id: 'teacher-dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'teacher-attendance', label: 'Mark Attendance', icon: '📋' },
        { id: 'teacher-assignments', label: 'Assignments & Resources', icon: '📝' },
        { id: 'teacher-marks', label: 'Grade & Enter Marks', icon: '💯' }
      ];
    } else if (role === 'student') {
      items = [
        { id: 'student-dashboard', label: 'Dashboard', icon: '📊' },
        { id: 'student-profile', label: 'My Profile', icon: '👤' },
        { id: 'student-timetable', label: 'Weekly Timetable', icon: '📅' },
        { id: 'student-reportcard', label: 'Report Card', icon: '📄' },
        { id: 'student-assignments', label: 'My Assignments', icon: '📝' }
      ];
    } else if (role === 'parent') {
      items = [
        { id: 'parent-dashboard', label: 'Child Dashboard', icon: '👨‍👩‍👧' },
        { id: 'student-reportcard', label: 'Academic Performance', icon: '📄' }
      ];
    }

    nav.innerHTML = `
      <div class="nav-section-title">Navigation</div>
      ${items.map(item => `
        <div class="nav-item" data-view="${item.id}" onclick="App.navigateTo('${item.id}')">
          <span class="icon">${item.icon}</span>
          <span>${item.label}</span>
        </div>
      `).join('')}
    `;
  }

  navigateToDefaultRoleView(role) {
    if (role === 'admin') this.navigateTo('admin-dashboard');
    else if (role === 'teacher') this.navigateTo('teacher-dashboard');
    else if (role === 'student') this.navigateTo('student-dashboard');
    else if (role === 'parent') this.navigateTo('parent-dashboard');
  }

  async navigateTo(viewId) {
    this.currentView = viewId;

    // Highlight sidebar active item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) item.classList.add('active');
      else item.classList.remove('active');
    });

    const content = document.getElementById('view-content');
    const title = document.getElementById('page-title');

    // Close mobile menu if open
    document.querySelector('.sidebar').classList.remove('mobile-open');

    if (viewId === 'admin-dashboard') {
      title.textContent = 'Admin Overview Dashboard';
      content.innerHTML = window.Admin.renderDashboard();
      window.Charts.renderLineChart('admin-chart-revenue', [2500, 3200, 4800, 5100, 6200, 7500], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']);
      window.Charts.renderGauge('admin-chart-attendance', 94, 'Present');
    } else if (viewId === 'admin-students') {
      title.textContent = 'Manage Students Directory';
      content.innerHTML = await window.Admin.renderStudentsView();
    } else if (viewId === 'admin-teachers') {
      title.textContent = 'Manage Faculty Members';
      content.innerHTML = await window.Admin.renderTeachersView();
    } else if (viewId === 'admin-fees') {
      title.textContent = 'Fee Tracking & Invoicing';
      content.innerHTML = await window.Admin.renderFeesView();
    } else if (viewId === 'admin-reports') {
      title.textContent = 'System Analytics & Reports';
      content.innerHTML = window.Admin.renderReportsView();
      window.Charts.renderBarChart('admin-report-chart-class', [
        { label: 'Grade 10-A', value: 35 },
        { label: 'Grade 10-B', value: 30 },
        { label: 'Grade 9-A', value: 32 }
      ]);
      window.Charts.renderBarChart('admin-report-chart-grades', [
        { label: 'A+', value: 45 },
        { label: 'A', value: 30 },
        { label: 'B', value: 15 },
        { label: 'C', value: 10 }
      ]);
    } else if (viewId === 'teacher-dashboard') {
      title.textContent = 'Faculty Dashboard';
      content.innerHTML = window.Teacher.renderDashboard();
    } else if (viewId === 'teacher-attendance') {
      title.textContent = 'Class Attendance Checklist';
      content.innerHTML = window.Teacher.renderAttendanceView();
    } else if (viewId === 'teacher-assignments') {
      title.textContent = 'Assignments & Study Materials';
      content.innerHTML = window.Teacher.renderAssignmentsView();
    } else if (viewId === 'teacher-marks') {
      title.textContent = 'Grade & Enter Marks';
      content.innerHTML = window.Teacher.renderMarksView();
    } else if (viewId === 'student-dashboard') {
      title.textContent = 'Student Learning Portal';
      content.innerHTML = window.Student.renderDashboard();
    } else if (viewId === 'student-profile') {
      title.textContent = 'Student Profile & Settings';
      content.innerHTML = window.Student.renderProfileView();
    } else if (viewId === 'student-timetable') {
      title.textContent = 'Weekly Class Schedule';
      content.innerHTML = window.Student.renderTimetableContainer();
    } else if (viewId === 'student-reportcard') {
      title.textContent = 'Academic Report Card';
      content.innerHTML = window.Student.renderReportCard();
    } else if (viewId === 'student-assignments') {
      title.textContent = 'Course Assignments';
      content.innerHTML = window.Teacher.renderAssignmentsView();
    } else if (viewId === 'parent-dashboard') {
      title.textContent = 'Parent Portal & Child Overview';
      content.innerHTML = window.Parent.renderDashboard();
    }
  }

  refreshCurrentView() {
    this.navigateTo(this.currentView);
  }
}

// Global initialization when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App = new Application();
});
