/* ==========================================================================
   EDUPULSE - ADMIN PORTAL VIEWS & CRUD OPERATIONS
   ========================================================================== */

class AdminViews {
  // 1. Admin Dashboard View
  renderDashboard() {
    const students = window.DB.getTable('students');
    const teachers = window.DB.getTable('teachers');
    const classes = window.DB.getTable('classes');
    const fees = window.DB.getTable('fees');

    const totalPaid = fees.filter(f => f.status === 'Paid').reduce((acc, f) => acc + f.amount, 0);
    const totalPending = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);

    return `
      <!-- Stats Overview -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-primary">🎓</div>
          <div class="stat-details">
            <span class="stat-value">${students.length}</span>
            <span class="stat-label">Total Students</span>
            <span class="stat-trend up">↑ 12% vs last term</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-secondary">👨‍🏫</div>
          <div class="stat-details">
            <span class="stat-value">${teachers.length}</span>
            <span class="stat-label">Faculty Members</span>
            <span class="stat-trend up">100% active</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-success">💳</div>
          <div class="stat-details">
            <span class="stat-value">$${totalPaid.toLocaleString()}</span>
            <span class="stat-label">Fees Collected</span>
            <span class="stat-trend up">85% total dues</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-warning">⚠️</div>
          <div class="stat-details">
            <span class="stat-value">$${totalPending.toLocaleString()}</span>
            <span class="stat-label">Pending Dues</span>
            <span class="stat-trend down">Requires follow-up</span>
          </div>
        </div>
      </div>

      <!-- Charts & Visual Analytics -->
      <div class="dashboard-grid">
        <div class="panel-card col-8">
          <div class="panel-header">
            <h3 class="panel-title">📈 Fee Revenue & Collection Trend</h3>
            <span class="panel-action">Current Term</span>
          </div>
          <div id="admin-chart-revenue"></div>
        </div>

        <div class="panel-card col-4">
          <div class="panel-header">
            <h3 class="panel-title">📊 Overall Attendance Rate</h3>
          </div>
          <div id="admin-chart-attendance"></div>
        </div>
      </div>

      <!-- Recent Notices & Quick Actions -->
      <div class="dashboard-grid">
        <div class="panel-card col-8">
          <div class="panel-header">
            <h3 class="panel-title">📢 Notice Board & Announcements</h3>
            <button class="btn btn-primary btn-sm" onclick="Admin.openAddNoticeModal()">+ New Announcement</button>
          </div>
          <div class="attendance-list">
            ${window.DB.getTable('notices').map(n => `
              <div class="attendance-item">
                <div>
                  <div style="font-weight: 800; color: var(--text-primary);">${n.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted);">${n.content}</div>
                </div>
                <span class="badge ${n.priority === 'high' ? 'badge-danger' : 'badge-info'}">${n.priority}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="panel-card col-4">
          <div class="panel-header">
            <h3 class="panel-title">⚡ Quick Management</h3>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn btn-secondary" onclick="App.navigateTo('admin-students')">🎓 Add New Student</button>
            <button class="btn btn-secondary" onclick="App.navigateTo('admin-teachers')">👨‍🏫 Register Faculty</button>
            <button class="btn btn-secondary" onclick="App.navigateTo('admin-fees')">💳 Issue Fee Invoice</button>
            <button class="btn btn-secondary" onclick="App.navigateTo('admin-reports')">📄 Download Analytics Report</button>
          </div>
        </div>
      </div>
    `;
  }

  // 2. Students Management View (Full CRUD)
  async renderStudentsView() {
    const res = await window.API.getStudents();
    const students = res.data.students;

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">🎓 Student Directory</h3>
          <button class="btn btn-primary" onclick="Admin.openAddStudentModal()">+ Add New Student</button>
        </div>

        <div class="table-toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" id="student-search" class="search-input" placeholder="Search by name, roll number or email..." oninput="Admin.filterStudentsTable()">
          </div>
          <div class="filter-group">
            <select id="student-class-filter" class="select-input" onchange="Admin.filterStudentsTable()">
              <option value="all">All Classes</option>
              ${window.DB.getTable('classes').map(c => `<option value="${c.id}">${c.name} (${c.section})</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="table-responsive">
          <table class="data-table" id="students-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Parent</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this._renderStudentRows(students)}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  _renderStudentRows(students) {
    if (!students.length) {
      return `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">No student records found.</td></tr>`;
    }
    return students.map(s => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <img src="${s.avatar}" class="avatar" style="width: 32px; height: 32px;" alt="" />
            <div>
              <div style="font-weight: 700;">${s.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${s.email}</div>
            </div>
          </div>
        </td>
        <td><strong>${s.rollNumber}</strong></td>
        <td><span class="badge badge-info">${s.className}</span></td>
        <td>${s.parentName}</td>
        <td>${s.phone}</td>
        <td><span class="badge badge-success">${s.status}</span></td>
        <td>
          <div class="action-btn-group">
            <button class="btn-icon" title="Edit Student" onclick="Admin.openEditStudentModal('${s.id}')">✏️</button>
            <button class="btn-icon btn-icon-danger" title="Delete Student" onclick="Admin.deleteStudent('${s.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // 3. Teachers Management View
  async renderTeachersView() {
    const res = await window.API.getTeachers();
    const teachers = res.data;

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">👨‍🏫 Faculty Directory</h3>
          <button class="btn btn-primary" onclick="Admin.openAddTeacherModal()">+ Add New Faculty</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Faculty Member</th>
                <th>Employee ID</th>
                <th>Designation</th>
                <th>Qualification</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${teachers.map(t => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${t.avatar}" class="avatar" style="width: 32px; height: 32px;" alt="" />
                      <div>
                        <div style="font-weight: 700;">${t.name}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>${t.employeeId}</strong></td>
                  <td>${t.designation}</td>
                  <td><span class="badge badge-secondary">${t.qualification}</span></td>
                  <td>${t.phone}</td>
                  <td>
                    <button class="btn-icon btn-icon-danger" onclick="Admin.deleteTeacher('${t.id}')">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 4. Fee Management View
  async renderFeesView() {
    const res = await window.API.getFees();
    const fees = res.data;

    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">💳 Student Fee Tracking</h3>
          <button class="btn btn-primary" onclick="Admin.openAddFeeModal()">+ Issue Fee Invoice</button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Invoice Title</th>
                <th>Student</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${fees.map(f => `
                <tr>
                  <td><strong>${f.title}</strong></td>
                  <td>${f.studentName} (${f.rollNumber})</td>
                  <td style="font-weight: 800; color: var(--primary);">$${f.amount}</td>
                  <td>${f.dueDate}</td>
                  <td>
                    <span class="badge ${f.status === 'Paid' ? 'badge-success' : f.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}">
                      ${f.status}
                    </span>
                  </td>
                  <td>${f.receiptNo || 'N/A'}</td>
                  <td>
                    ${f.status !== 'Paid' ? `
                      <button class="btn btn-sm btn-success" onclick="Admin.markFeePaid('${f.id}')">Mark Paid</button>
                    ` : `<span style="font-size: 0.8rem; color: var(--success-text); font-weight: 700;">✔ Completed</span>`}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 5. Reports & Analytics View
  renderReportsView() {
    return `
      <div class="panel-card">
        <div class="panel-header">
          <h3 class="panel-title">📊 System Performance & Reports</h3>
          <button class="btn btn-primary" onclick="Admin.exportReportJSON()">📥 Export JSON Data</button>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Comprehensive system metrics, student count distributions, fee collection logs, and academic progress summaries.</p>

        <div class="dashboard-grid">
          <div class="panel-card col-6" style="background-color: var(--bg-tertiary);">
            <h4 style="margin-bottom: 1rem;">🎓 Class Enrollment Breakdown</h4>
            <div id="admin-report-chart-class"></div>
          </div>
          <div class="panel-card col-6" style="background-color: var(--bg-tertiary);">
            <h4 style="margin-bottom: 1rem;">🏆 Grade Distribution Summary</h4>
            <div id="admin-report-chart-grades"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Helper Modals & Handlers
  openAddStudentModal() {
    const classes = window.DB.getTable('classes');
    const parents = window.DB.getTable('parents').map(p => {
      const u = window.DB.getById('users', p.userId);
      return { id: p.id, name: u ? u.name : 'Parent' };
    });

    const bodyHtml = `
      <form id="add-student-form">
        <div class="form-grid">
          <div class="form-group col-6">
            <label class="form-label">Full Name *</label>
            <input type="text" name="name" class="form-control" placeholder="e.g. Liam Vance" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Email Address *</label>
            <input type="email" name="email" class="form-control" placeholder="e.g. liam@edupulse.edu" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Assign Class *</label>
            <select name="classId" class="select-input" required>
              ${classes.map(c => `<option value="${c.id}">${c.name} (${c.section})</option>`).join('')}
            </select>
          </div>
          <div class="form-group col-6">
            <label class="form-label">Assign Parent</label>
            <select name="parentId" class="select-input">
              <option value="">No Parent Linked</option>
              ${parents.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group col-6">
            <label class="form-label">Phone Number</label>
            <input type="text" name="phone" class="form-control" placeholder="+1 (555) 000-0000" />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Blood Group</label>
            <input type="text" name="bloodGroup" class="form-control" placeholder="O+" />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
      <button class="btn btn-primary" onclick="Admin.submitAddStudentForm()">Save Student</button>
    `;

    window.UI.showModal('➕ Register New Student', bodyHtml, footerHtml);
  }

  async submitAddStudentForm() {
    const form = document.getElementById('add-student-form');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await window.API.createStudent(data);
    if (res.success) {
      window.UI.hideModal();
      window.UI.showToast('Student registered successfully!');
      App.refreshCurrentView();
    } else {
      window.UI.showToast(res.message, 'danger');
    }
  }

  async deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
      await window.API.deleteStudent(id);
      window.UI.showToast('Student record deleted');
      App.refreshCurrentView();
    }
  }

  markFeePaid(feeId) {
    window.API.payFee(feeId).then(() => {
      window.UI.showToast('Fee status updated to Paid');
      App.refreshCurrentView();
    });
  }

  exportReportJSON() {
    const data = JSON.stringify(window.DB.data, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edupulse_system_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.UI.showToast('Report exported to JSON!');
  }
}

window.Admin = new AdminViews();
