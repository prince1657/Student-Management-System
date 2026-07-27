/* ==========================================================================
   EDUPULSE - TEACHER PORTAL VIEWS & CLASS MANAGEMENT
   ========================================================================== */

class TeacherViews {
  renderDashboard() {
    const user = window.Auth.getActiveUser();
    const teacher = window.DB.getTable('teachers').find(t => t.userId === user.id) || window.DB.getTable('teachers')[0];
    const teacherSubjects = window.DB.getTable('subjects').filter(s => s.teacherId === teacher.id);
    const assignments = window.DB.getTable('assignments').filter(a => a.teacherId === teacher.id);

    return `
      <!-- Faculty Welcome Header -->
      <div class="panel-card" style="background: linear-gradient(135deg, var(--primary), var(--secondary)); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h2 style="font-size: 1.6rem; font-weight: 800;">Welcome back, ${user.name}! 👋</h2>
            <p style="opacity: 0.9; margin-top: 4px;">${teacher.designation} • ${teacher.qualification}</p>
          </div>
          <button class="btn btn-secondary" style="background: white; color: var(--primary);" onclick="App.navigateTo('teacher-attendance')">📋 Mark Today's Attendance</button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-primary">📚</div>
          <div class="stat-details">
            <span class="stat-value">${teacherSubjects.length}</span>
            <span class="stat-label">Assigned Subjects</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-secondary">📝</div>
          <div class="stat-details">
            <span class="stat-value">${assignments.length}</span>
            <span class="stat-label">Active Assignments</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-success">🏫</div>
          <div class="stat-details">
            <span class="stat-value">35</span>
            <span class="stat-label">Students in Class 10-A</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="dashboard-grid">
        <div class="panel-card col-8">
          <div class="panel-header">
            <h3 class="panel-title">📋 Today's Assigned Schedule</h3>
          </div>
          <div class="timetable-grid">
            <div class="timetable-cell timetable-header-cell">Time</div>
            <div class="timetable-cell timetable-header-cell">Subject</div>
            <div class="timetable-cell timetable-header-cell">Class</div>
            <div class="timetable-cell timetable-header-cell">Room</div>

            <div class="timetable-cell timetable-time">09:00 - 10:00</div>
            <div class="timetable-cell"><span class="subject-badge">Advanced Math</span></div>
            <div class="timetable-cell">Grade 10-A</div>
            <div class="timetable-cell">Room 301</div>

            <div class="timetable-cell timetable-time">10:15 - 11:15</div>
            <div class="timetable-cell"><span class="subject-badge">Physics</span></div>
            <div class="timetable-cell">Grade 10-B</div>
            <div class="timetable-cell">Science Lab</div>
          </div>
        </div>

        <div class="panel-card col-4">
          <div class="panel-header">
            <h3 class="panel-title">⚡ Quick Tasks</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn btn-primary" onclick="App.navigateTo('teacher-attendance')">📋 Mark Class Attendance</button>
            <button class="btn btn-secondary" onclick="Teacher.openAddAssignmentModal()">📝 Post New Assignment</button>
            <button class="btn btn-secondary" onclick="App.navigateTo('teacher-marks')">💯 Enter Exam Marks</button>
            <button class="btn btn-secondary" onclick="Teacher.openUploadMaterialModal()">📂 Upload Study Guide</button>
          </div>
        </div>
      </div>
    `;
  }

  // Attendance Checklist Page
  renderAttendanceView() {
    const students = window.DB.getTable('students').map(s => window.DB.getStudentFull(s.id));
    const today = new Date().toISOString().split('T')[0];

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">📋 Class Attendance Checklist</h3>
          <div style="display: flex; gap: 0.75rem;">
            <input type="date" id="att-date" class="form-control" value="${today}" />
            <button class="btn btn-primary" onclick="Teacher.saveAttendance()">Save Attendance</button>
          </div>
        </div>

        <div class="attendance-list">
          ${students.map(s => `
            <div class="attendance-item" id="att-row-${s.id}">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <img src="${s.avatar}" class="avatar" style="width: 36px; height: 36px;" alt="" />
                <div>
                  <div style="font-weight: 700;">${s.name}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">Roll: ${s.rollNumber} | Class: ${s.className}</div>
                </div>
              </div>

              <div class="status-toggle-group" data-student-id="${s.id}">
                <button type="button" class="btn-toggle active-p" onclick="Teacher.setToggleState(this, 'Present')">Present</button>
                <button type="button" class="btn-toggle" onclick="Teacher.setToggleState(this, 'Absent')">Absent</button>
                <button type="button" class="btn-toggle" onclick="Teacher.setToggleState(this, 'Late')">Late</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  setToggleState(btn, status) {
    const parent = btn.parentElement;
    Array.from(parent.children).forEach(b => {
      b.className = 'btn-toggle';
    });
    if (status === 'Present') btn.className = 'btn-toggle active-p';
    if (status === 'Absent') btn.className = 'btn-toggle active-a';
    if (status === 'Late') btn.className = 'btn-toggle active-l';
    parent.setAttribute('data-selected-status', status);
  }

  async saveAttendance() {
    const date = document.getElementById('att-date').value;
    const groups = document.querySelectorAll('.status-toggle-group');
    const records = [];

    groups.forEach(g => {
      const studentId = g.getAttribute('data-student-id');
      const status = g.getAttribute('data-selected-status') || 'Present';
      records.push({ studentId, status });
    });

    await window.API.saveBatchAttendance('cls-10a', date, records);
    window.UI.showToast('Class attendance saved successfully!');
  }

  // Assignments & Materials View
  renderAssignmentsView() {
    const assignments = window.DB.getTable('assignments');
    const materials = window.DB.getTable('studyMaterials');

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">📝 Course Assignments & Study Materials</h3>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary" onclick="Teacher.openAddAssignmentModal()">+ Post Assignment</button>
            <button class="btn btn-secondary" onclick="Teacher.openUploadMaterialModal()">+ Upload Material</button>
          </div>
        </div>

        <h4 style="margin: 1rem 0;">Posted Assignments</h4>
        <div class="attendance-list" style="margin-bottom: 2rem;">
          ${assignments.map(a => `
            <div class="attendance-item">
              <div>
                <div style="font-weight: 800; color: var(--primary);">${a.title}</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">${a.description}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">Due Date: <strong>${a.dueDate}</strong> | Max Marks: ${a.maxMarks}</div>
              </div>
              <span class="badge badge-info">Active</span>
            </div>
          `).join('')}
        </div>

        <h4 style="margin: 1rem 0;">Uploaded Study Materials</h4>
        <div class="attendance-list">
          ${materials.map(m => `
            <div class="attendance-item">
              <div>
                <div style="font-weight: 700;">${m.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">Uploaded by ${m.uploadedBy} on ${m.uploadedAt}</div>
              </div>
              <span class="badge badge-success">${m.fileType}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  openAddAssignmentModal() {
    const bodyHtml = `
      <form id="assignment-form">
        <div class="form-grid">
          <div class="form-group col-12">
            <label class="form-label">Assignment Title *</label>
            <input type="text" name="title" class="form-control" placeholder="e.g. Calculus Problems Set #2" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Due Date *</label>
            <input type="date" name="dueDate" class="form-control" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Maximum Marks *</label>
            <input type="number" name="maxMarks" class="form-control" value="50" required />
          </div>
          <div class="form-group col-12">
            <label class="form-label">Description & Instructions</label>
            <textarea name="description" class="form-control" rows="3" placeholder="Provide problem numbers or instructions..."></textarea>
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Teacher.submitAssignmentForm()">Post Assignment</button>
    `;

    window.UI.showModal('📝 Create New Assignment', bodyHtml, footerHtml);
  }

  submitAssignmentForm() {
    const form = document.getElementById('assignment-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    window.DB.create('assignments', {
      ...data,
      classId: 'cls-10a',
      subjectId: 'sbj-math10',
      teacherId: 'tch-1'
    });

    window.UI.hideModal();
    window.UI.showToast('Assignment posted to class');
    App.refreshCurrentView();
  }

  openUploadMaterialModal() {
    const bodyHtml = `
      <form id="material-form">
        <div class="form-grid">
          <div class="form-group col-12">
            <label class="form-label">Resource Title *</label>
            <input type="text" name="title" class="form-control" placeholder="e.g. Optics & Light Study Guide" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">File Type</label>
            <select name="fileType" class="select-input">
              <option value="PDF">PDF Document</option>
              <option value="PPTX">Presentation Slides</option>
              <option value="DOCX">Word Document</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label class="form-label">File Attachment Link</label>
            <input type="text" name="fileUrl" class="form-control" value="#" />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Teacher.submitMaterialForm()">Upload Material</button>
    `;

    window.UI.showModal('📂 Upload Study Material', bodyHtml, footerHtml);
  }

  submitMaterialForm() {
    const form = document.getElementById('material-form');
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    window.DB.create('studyMaterials', {
      ...data,
      classId: 'cls-10a',
      subjectId: 'sbj-phy10',
      uploadedBy: window.Auth.getActiveUser().name,
      uploadedAt: new Date().toISOString().split('T')[0]
    });

    window.UI.hideModal();
    window.UI.showToast('Study material published');
    App.refreshCurrentView();
  }

  // Enter Marks View
  renderMarksView() {
    const students = window.DB.getTable('students').map(s => window.DB.getStudentFull(s.id));
    const exams = window.DB.getTable('exams');

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">💯 Enter Exam Marks & Grade Evaluation</h3>
          <button class="btn btn-primary" onclick="Teacher.saveMarks()">Save All Marks</button>
        </div>

        <div class="table-toolbar">
          <div class="filter-group col-6">
            <label class="form-label">Select Exam:</label>
            <select id="exam-select" class="select-input">
              ${exams.map(e => `<option value="${e.id}">${e.title} (Max: ${e.totalMarks})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Roll Number</th>
                <th>Marks Obtained</th>
                <th>Grade Letter</th>
                <th>Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.rollNumber}</td>
                  <td>
                    <input type="number" class="form-control mark-input" data-student-id="${s.id}" value="85" max="100" style="width: 90px;" />
                  </td>
                  <td><span class="badge badge-success">A</span></td>
                  <td>
                    <input type="text" class="form-control remark-input" data-student-id="${s.id}" placeholder="e.g. Excellent work" />
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  saveMarks() {
    const examId = document.getElementById('exam-select').value;
    const markInputs = document.querySelectorAll('.mark-input');

    markInputs.forEach(inp => {
      const studentId = inp.getAttribute('data-student-id');
      const val = parseInt(inp.value) || 0;
      let grade = 'F';
      if (val >= 90) grade = 'A+';
      else if (val >= 80) grade = 'A';
      else if (val >= 70) grade = 'B';
      else if (val >= 60) grade = 'C';

      window.DB.create('marks', {
        examId,
        studentId,
        marksObtained: val,
        grade,
        remarks: 'Recorded by teacher'
      });
    });

    window.UI.showToast('Marks saved and published to student portals!');
  }
}

window.Teacher = new TeacherViews();
