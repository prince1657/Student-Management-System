/* ==========================================================================
   EDUPULSE - PARENT PORTAL VIEWS
   ========================================================================== */

class ParentViews {
  renderDashboard() {
    const parentUser = window.Auth.getActiveUser();
    const child = window.DB.getStudentFull('stu-1');
    const fees = window.DB.getTable('fees').filter(f => f.studentId === child.id);
    const pendingFees = fees.filter(f => f.status !== 'Paid');
    const totalPending = pendingFees.reduce((acc, f) => acc + f.amount, 0);

    return `
      <!-- Parent Header Banner -->
      <div class="panel-card" style="background: linear-gradient(135deg, #0f172a, #334155); color: white;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <img src="${child.avatar}" class="avatar" style="width: 50px; height: 50px;" alt="" />
            <div>
              <h2 style="font-size: 1.4rem; font-weight: 800;">Child: ${child.name}</h2>
              <p style="opacity: 0.8; font-size: 0.85rem;">Roll No: ${child.rollNumber} • ${child.className}</p>
            </div>
          </div>
          <span class="badge badge-success" style="font-size: 0.85rem; padding: 6px 12px;">Active Enrolled</span>
        </div>
      </div>

      <!-- Key Performance Indicators -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-success">🎯</div>
          <div class="stat-details">
            <span class="stat-value">94%</span>
            <span class="stat-label">Attendance Record</span>
            <span class="stat-trend up">Excellent Attendance</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper stat-icon-primary">⭐</div>
          <div class="stat-details">
            <span class="stat-value">A (91.3%)</span>
            <span class="stat-label">Academic Average</span>
            <span class="stat-trend up">Top 5% in Grade</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon-wrapper ${totalPending > 0 ? 'stat-icon-warning' : 'stat-icon-success'}">💳</div>
          <div class="stat-details">
            <span class="stat-value">$${totalPending}</span>
            <span class="stat-label">Pending Dues</span>
            <span class="stat-trend ${totalPending > 0 ? 'down' : 'up'}">${totalPending > 0 ? 'Due soon' : 'All Clear'}</span>
          </div>
        </div>
      </div>

      <!-- Child Academic Progress & Fee Status -->
      <div class="dashboard-grid">
        <div class="panel-card col-8">
          <div class="panel-header">
            <h3 class="panel-title">📚 Recent Subject Grades</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.navigateTo('student-reportcard')">View Full Report</button>
          </div>

          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Evaluation</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>English Literature</td>
                  <td>First Quarterly Evaluation</td>
                  <td><strong>92 / 100</strong></td>
                  <td><span class="badge badge-success">A+</span></td>
                </tr>
                <tr>
                  <td>Advanced Mathematics</td>
                  <td>Calculus Test</td>
                  <td><strong>88 / 100</strong></td>
                  <td><span class="badge badge-success">A</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel-card col-4">
          <div class="panel-header">
            <h3 class="panel-title">💳 Tuition Fee Status</h3>
          </div>
          ${fees.map(f => `
            <div style="padding: 0.85rem; background-color: var(--bg-tertiary); border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 0.75rem;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-weight: 700; font-size: 0.9rem;">${f.title}</div>
                <span class="badge ${f.status === 'Paid' ? 'badge-success' : 'badge-warning'}">${f.status}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span style="font-weight: 800; color: var(--primary);">$${f.amount}</span>
                ${f.status !== 'Paid' ? `
                  <button class="btn btn-primary btn-sm" onclick="Parent.openPaymentModal('${f.id}', ${f.amount})">Pay Online</button>
                ` : `<span style="font-size: 0.75rem; color: var(--success-text);">Receipt: ${f.receiptNo}</span>`}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  openPaymentModal(feeId, amount) {
    const bodyHtml = `
      <form id="payment-form">
        <p style="margin-bottom: 1rem; color: var(--text-secondary);">Simulated Payment Gateway for Fee Invoice <strong>#${feeId}</strong></p>
        <div style="background-color: var(--bg-tertiary); padding: 1rem; border-radius: var(--radius-md); text-align: center; margin-bottom: 1.25rem;">
          <div style="font-size: 0.85rem; color: var(--text-muted);">Total Payable Amount</div>
          <div style="font-size: 2rem; font-weight: 800; color: var(--primary);">$${amount}</div>
        </div>

        <div class="form-grid">
          <div class="form-group col-12">
            <label class="form-label">Cardholder Name</label>
            <input type="text" class="form-control" value="Sarah Rivera" required />
          </div>
          <div class="form-group col-12">
            <label class="form-label">Card Number</label>
            <input type="text" class="form-control" value="•••• •••• •••• 4242" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">Expiry</label>
            <input type="text" class="form-control" value="12/28" required />
          </div>
          <div class="form-group col-6">
            <label class="form-label">CVC</label>
            <input type="text" class="form-control" value="888" required />
          </div>
        </div>
      </form>
    `;

    const footerHtml = `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Cancel</button>
      <button class="btn btn-success" onclick="Parent.processPayment('${feeId}')">🔒 Confirm & Pay $${amount}</button>
    `;

    window.UI.showModal('💳 Secure Online Payment Gateway', bodyHtml, footerHtml);
  }

  async processPayment(feeId) {
    await window.API.payFee(feeId);
    window.UI.hideModal();
    window.UI.showToast('Payment successful! Receipt generated.');
    App.refreshCurrentView();
  }
}

window.Parent = new ParentViews();
