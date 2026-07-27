/* ==========================================================================
   EDUPULSE - STUDENT PORTAL VIEWS
   ========================================================================== */

class StudentViews {
  renderDashboard() {
    const user = window.Auth.getActiveUser();
    const student = window.DB.getStudentFull(user.studentId || 'stu-1');
    const attendanceLogs = window.DB.getTable('attendance').filter(a => a.studentId === student.id);
    const presentCount = attendanceLogs.filter(a => a.status === 'Present').length;
    const attPct = attendanceLogs.length ? Math.round((presentCount / attendanceLogs.length) * 100) : 92;

    const assignments = window.DB.getTable('assignments');
    const notices = window.DB.getTable('notices').filter(n => n.targetRole === 'all' || n.targetRole === 'student');

    return `
      <!-- Student Banner -->
      <div class="panel-card" style="background: linear-gradient(135deg, #4f46e5, #0ea5e9); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${student.avatar}" class="avatar" style="width: 56px; height: 56px; border-color: white;" alt="" />
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800;">Welcome back, ${student.name}! 🎓</h2>
              <p style="opacity: 0.9;">Roll No: <strong>${student.rollNumber}</strong> | ${student.className}</p>
            </div>
          </div>
          <button class="btn btn-secondary" style="background: white; color: var(--primary);" onclick="App.navigateTo('student-reportcard')">📄 View Report Card</button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-success">🎯</div>
          <div class="stat-details">
            <span class="stat-value">${attPct}%</span>
            <span class="stat-label">Attendance Rate</span>
            <span class="stat-trend up">Good standing</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-primary">📝</div>
          <div class="stat-details">
            <span class="stat-value">${assignments.length}</span>
            <span class="stat-label">Pending Assignments</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-secondary">🏆</div>
          <div class="stat-details">
            <span class="stat-value">3.92</span>
            <span class="stat-label">Cumulative GPA</span>
            <span class="stat-trend up">Rank #2 in Class</span>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="dashboard-grid">
        <div class="panel-card col-8">
          <div class="panel-header">
            <h3 class="panel-title">📝 Upcoming Assignments & Deadlines</h3>
            <span class="panel-action" onclick="App.navigateTo('student-assignments')">View All</span>
          </div>
          <div class="attendance-list">
            ${assignments.map(a => `
              <div class="attendance-item">
                <div>
                  <div style="font-weight: 800; color: var(--primary);">${a.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-secondary);">${a.description}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Due Date: <strong>${a.dueDate}</strong></div>
                </div>
                <button class="btn btn-primary btn-sm" onclick="Student.openSubmitModal('${a.id}')">Submit Work</button>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="panel-card col-4">
          <div class="panel-header">
            <h3 class="panel-title">📢 Student Bulletins</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${notices.slice(0, 3).map(n => `
              <div style="padding: 0.75rem; background-color: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="font-weight: 700; font-size: 0.85rem;">${n.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${n.content}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // View Profile & Update Details
  renderProfileView() {
    const user = window.Auth.getActiveUser();

    return `
      <div class="panel-card" style="max-width: 700px; margin: 0 auto;">
        <div class="panel-header">
          <h3 class="panel-title">👤 Student Profile Details</h3>
        </div>

        <form id="student-profile-form" style="margin-top: 1rem;">
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="${user.avatar}" class="avatar" style="width: 90px; height: 90px; margin-bottom: 0.5rem;" alt="" />
            <h3 style="font-weight: 800;">${user.name}</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">${user.email}</p>
          </div>

          <div class="form-grid">
            <div class="form-group col-6">
              <label class="form-label">Full Name</label>
              <input type="text" name="name" class="form-control" value="${user.name}" required />
            </div>
            <div class="form-group col-6">
              <label class="form-label">Email Address</label>
              <input type="email" name="email" class="form-control" value="${user.email}" required />
            </div>
            <div class="form-group col-6">
              <label class="form-label">Contact Phone</label>
              <input type="text" name="phone" class="form-control" value="${user.phone || '+1 (555) 234-8901'}" />
            </div>
            <div class="form-group col-6">
              <label class="form-label">Blood Group</label>
              <input type="text" class="form-control" value="O+" readonly style="opacity: 0.7;" />
            </div>
            <div class="form-group col-12">
              <label class="form-label">Residential Address</label>
              <input type="text" class="form-control" value="742 Evergreen Terrace, Springfield" />
            </div>
          </div>

          <div style="margin-top: 1.5rem; text-align: right;">
            <button type="button" class="btn btn-primary" onclick="Student.saveProfile()">Update Profile Details</button>
          </div>
        </form>
      </div>
    `;
  }

  saveProfile() {
    const form = document.getElementById('student-profile-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    window.Auth.updateProfile(data);
    window.UI.showToast('Profile updated successfully!');
    App.refreshCurrentView();
  }

  // Weekly Timetable View
  renderTimetableContainer() {
    const timetables = window.DB.getTable('timetables');

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">📅 Class Schedule & Timetable</h3>
          <span class="badge badge-info">Grade 10-A</span>
        </div>

        <div class="timetable-grid">
          <div class="timetable-cell timetable-header-cell">Time Slot</div>
          <div class="timetable-cell timetable-header-cell">Monday</div>
          <div class="timetable-cell timetable-header-cell">Tuesday</div>
          <div class="timetable-cell timetable-header-cell">Wednesday</div>
          <div class="timetable-cell timetable-header-cell">Thursday</div>

          <div class="timetable-cell timetable-time">09:00 - 10:00 AM</div>
          <div class="timetable-cell">
            <span class="subject-badge">Advanced Math</span>
            <span class="teacher-subtext">Prof. Marcus Sterling</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">English Lit</span>
            <span class="teacher-subtext">Mr. David Miller</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">Physics</span>
            <span class="teacher-subtext">Ms. Clara Thorne</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">Advanced Math</span>
            <span class="teacher-subtext">Prof. Marcus Sterling</span>
          </div>

          <div class="timetable-cell timetable-time">10:15 - 11:15 AM</div>
          <div class="timetable-cell">
            <span class="subject-badge">Physics Lab</span>
            <span class="teacher-subtext">Ms. Clara Thorne</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">Advanced Math</span>
            <span class="teacher-subtext">Prof. Marcus Sterling</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">Chemistry</span>
            <span class="teacher-subtext">Dr. Eleanor Vance</span>
          </div>
          <div class="timetable-cell">
            <span class="subject-badge">English Lit</span>
            <span class="teacher-subtext">Mr. David Miller</span>
          </div>
        </div>
      </div>
    `;
  }

  // Report Card View
  renderReportCard() {
    const user = window.Auth.getActiveUser();
    const student = window.DB.getStudentFull(user.studentId || 'stu-1');
    const marks = window.DB.getTable('marks').filter(m => m.studentId === student.id);

    return `
      <div class="report-card-wrapper">
        <div class="report-header">
          <h1 style="font-size: 1.8rem; font-weight: 800; color: var(--primary);">EDUPULSE ACADEMIC ACADEMY</h1>
          <p style="font-size: 0.9rem; color: var(--text-secondary);">OFFICIAL REPORT CARD • ACADEMIC YEAR 2025-2026</p>
          <div style="margin-top: 1rem; display: flex; justify-content: space-between; text-align: left; font-size: 0.85rem;">
            <div>
              <div><strong>Student Name:</strong> ${student.name}</div>
              <div><strong>Roll Number:</strong> ${student.rollNumber}</div>
            </div>
            <div>
              <div><strong>Class / Section:</strong> ${student.className}</div>
              <div><strong>Status:</strong> <span class="badge badge-success">PASSED</span></div>
            </div>
          </div>
        </div>

        <table class="data-table" style="margin-bottom: 1.5rem;">
          <thead>
            <tr>
              <th>Subject / Evaluation</th>
              <th>Marks Obtained</th>
              <th>Total Marks</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>English Literature</td>
              <td><strong>92</strong></td>
              <td>100</td>
              <td><span class="badge badge-success">A+</span></td>
              <td>Exceptional analytical essays</td>
            </tr>
            <tr>
              <td>Advanced Mathematics</td>
              <td><strong>88</strong></td>
              <td>100</td>
              <td><span class="badge badge-success">A</span></td>
              <td>Strong calculus fundamentals</td>
            </tr>
            <tr>
              <td>Physics & Kinetics</td>
              <td><strong>94</strong></td>
              <td>100</td>
              <td><span class="badge badge-success">A+</span></td>
              <td>Outstanding laboratory research</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <div>
            <div style="font-weight: 800; font-size: 1.1rem;">Overall GPA: 3.92 / 4.0</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Class Rank: 2nd out of 35 students</div>
          </div>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print Official Report Card</button>
        </div>
      </div>
    `;
  }

  openSubmitModal(assignmentId) {
    const bodyHtml = `
      <form id="submission-form">
        <div class="form-group">
          <label class="form-label">Submission Content / Drive Link *</label>
          <textarea name="content" class="form-control" rows="4" placeholder="Paste your completed solution, essay text, or document share link here..." required></textarea>
        </div>
      </form>
    `;
    const footerHtml = `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Student.submitAssignment('${assignmentId}')">Submit Assignment</button>
    `;
    window.UI.showModal('📥 Submit Assignment', bodyHtml, footerHtml);
  }

  submitAssignment(assignmentId) {
    const form = document.getElementById('submission-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    window.DB.create('submissions', {
      assignmentId,
      studentId: 'stu-1',
      submittedAt: new Date().toISOString(),
      status: 'Submitted',
      content: form.querySelector('textarea').value
    });

    window.UI.hideModal();
    window.UI.showToast('Assignment submitted successfully!');
  }
}

window.Student = new StudentViews();
