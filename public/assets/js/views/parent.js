/* ==========================================================================
   Parent portal

   A parent sees one child, read-only, plus the one action they actually have:
   paying a fee.
   ========================================================================== */

(() => {

const { html: esc, money, date: fdate, relativeDays, dayOf, monthOf } = window.Format;

function myChild() {
  const user = window.Auth.user;
  return user && user.childId ? window.Store.studentFull(user.childId) : null;
}

window.ParentViews = {
  'parent-overview': {
    label: 'Overview',
    icon: 'dashboard',
    title: 'Overview',

    render() {
      const child = myChild();
      if (!child) {
        return window.Ui.panel({
          body: window.Ui.empty('parent', 'No child linked',
            'Ask the school office to link your account to your child\'s roll number.')
        });
      }

      const rate = window.Store.attendanceRate(child.id);
      const summary = window.StudentShared.academicSummary(child.id);
      const dues = window.Store.feesFor(child.id).filter(f => f.status !== 'Paid');
      const duesTotal = dues.reduce((sum, f) => sum + f.amount, 0);

      const absences = window.Store.getTable('attendance')
        .filter(a => a.studentId === child.id && a.status !== 'Present')
        .sort((a, b) => b.date.localeCompare(a.date));

      const pending = window.Store.assignmentsFull(child.classId)
        .filter(a => !window.Store.submissionFor(a.id, child.id));

      const notices = window.Store.noticesFor('parent');

      return `
        ${window.Ui.panel({
          flush: true,
          body: `<div class="profile-head">
            ${window.Ui.avatar(child.name, 'avatar avatar-lg')}
            <div class="profile-head-text">
              <h2>${esc(child.name)}</h2>
              <div class="profile-head-meta">
                <span class="tag">${esc(child.rollNumber)}</span>
                <span class="tag">${esc(child.className)}</span>
                <span class="tag">Class teacher: ${esc(classTeacherName(child.classId))}</span>
              </div>
            </div>
          </div>`
        })}

        ${window.Ui.ledger([
          {
            value: window.Format.percent(rate),
            label: 'Attendance',
            meta: `${absences.length} days missed or late`,
            metaKind: rate >= 90 ? 'up' : 'attention',
            metaIcon: rate >= 90 ? 'check' : 'warning',
            attention: rate < 90
          },
          {
            value: summary.pct === null ? '—' : `${summary.pct}%`,
            label: 'Term average',
            meta: `grade ${summary.grade}`
          },
          {
            value: pending.length,
            label: 'Assignments not handed in',
            meta: pending.length ? `earliest due ${relativeDays(pending[0].dueDate)}` : 'all submitted',
            attention: pending.length > 1
          },
          {
            value: duesTotal ? money(duesTotal) : 'Clear',
            label: 'Fees due',
            attention: duesTotal > 0,
            meta: dues.length ? `due ${relativeDays(dues[0].dueDate)}` : 'nothing outstanding',
            metaKind: duesTotal ? 'attention' : '',
            metaIcon: duesTotal ? 'warning' : 'check'
          }
        ])}

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Subject performance',
            flush: true,
            body: window.StudentShared.subjectBreakdown(child.id)
              || window.Ui.empty('marks', 'No marks yet', 'Results appear as teachers enter them.')
          })}

          ${window.Ui.panel({
            title: 'Days missed or late',
            note: 'this term',
            flush: true,
            body: absences.length
              ? `<div class="table-scroll"><table class="data-table">
                  <thead><tr><th>Date</th><th>Marked</th><th>Reason given</th></tr></thead>
                  <tbody>${absences.map(a => `<tr>
                    <td class="num">${fdate(a.date)}</td>
                    <td>${window.Ui.badge(a.status)}</td>
                    <td>${a.remarks ? esc(a.remarks) : '<span class="person-sub">None recorded</span>'}</td>
                  </tr>`).join('')}</tbody>
                </table></div>`
              : window.Ui.empty('check', 'Present every day',
                  `${child.name.split(' ')[0]} has not missed a marked day this term.`)
          })}
        </div>

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Fees',
            flush: true,
            body: `<div class="table-scroll"><table class="data-table">
              <thead><tr>
                <th>Item</th><th class="col-right">Amount</th>
                <th>Due</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>${window.Store.feesFor(child.id).map(f => `<tr>
                <td>${esc(f.title)}</td>
                <td class="col-right num">${money(f.amount)}</td>
                <td class="num">${fdate(f.dueDate)}</td>
                <td>${window.Ui.badge(f.status)}</td>
                <td class="col-actions">${f.status === 'Paid'
                  ? `<span class="person-sub num">${esc(f.receiptNo || '')}</span>`
                  : `<button class="btn btn-sm btn-primary" data-pay="${f.id}">Pay now</button>`}</td>
              </tr>`).join('')}</tbody>
            </table></div>`
          })}

          ${window.Ui.panel({
            title: 'From the school',
            flush: true,
            body: `<div class="feed">${notices.map(n => `
              <div class="feed-item">
                <span class="feed-rail${n.priority === 'high' ? ' high' : ''}"></span>
                <div class="feed-body">
                  <div class="feed-title">${esc(n.title)}</div>
                  <div class="feed-text">${esc(n.content)}</div>
                  <div class="feed-meta">${esc(n.authorName)} · ${fdate(n.date)}</div>
                </div>
              </div>`).join('')}</div>`
          })}
        </div>
      `;
    },

    mount(host) {
      host.addEventListener('click', e => {
        const pay = e.target.closest('[data-pay]');
        if (pay) openParentPayment(pay.dataset.pay);
      });
    }
  },

  'parent-report': {
    label: 'Report card',
    icon: 'reportcard',
    title: 'Report card',

    render() {
      const child = myChild();
      if (!child) return '';

      return window.Ui.panel({
        title: `${child.name} · ${child.rollNumber}`,
        note: `${child.className} · ${window.Store.school.term}, ${window.Store.school.session}`,
        flush: true,
        actions: `<button class="btn btn-sm btn-secondary" id="print-report">
          ${window.Icons.get('print', 15)} Print</button>`,
        body: window.StudentShared.marksheet(child.id)
      });
    },

    mount() {
      const print = document.getElementById('print-report');
      if (print) print.addEventListener('click', () => window.print());
    }
  },

  'parent-coursework': {
    label: 'Coursework',
    icon: 'assignments',
    title: 'Coursework',

    render() {
      const child = myChild();
      if (!child) return '';

      const assignments = window.Store.assignmentsFull(child.classId);

      return window.Ui.panel({
        title: 'Assignments set for the class',
        note: `${assignments.length} this term`,
        flush: true,
        body: assignments.length
          ? assignments.map(a => {
              const submission = window.Store.submissionFor(a.id, child.id);
              const status = submission
                ? (submission.status === 'Graded' ? 'Graded' : 'Submitted')
                : (window.Format.isOverdue(a.dueDate) ? 'Overdue' : 'Not submitted');

              return `<div class="task">
                <div class="task-due">
                  <div class="day">${dayOf(a.dueDate)}</div>
                  <div class="month">${monthOf(a.dueDate)}</div>
                </div>
                <div class="task-body">
                  <div class="task-title">${esc(a.title)}</div>
                  <div class="task-desc">${esc(a.description)}</div>
                  <div class="task-meta">
                    <span class="tag">${esc(a.subjectName)}</span>
                    ${window.Ui.badge(status)}
                    ${submission && submission.status === 'Graded'
                      ? `<span class="person-sub num">scored ${submission.grade} of ${a.maxMarks}</span>`
                      : ''}
                  </div>
                  ${submission && submission.feedback
                    ? `<div class="task-desc" style="margin-top: var(--s2); color: var(--good-ink)">
                        ${esc(submission.feedback)}</div>`
                    : ''}
                </div>
              </div>`;
            }).join('')
          : window.Ui.empty('assignments', 'Nothing set',
              'Assignments appear here as teachers set them.')
      });
    }
  }
};

function classTeacherName(classId) {
  const cls = window.Store.getById('classes', classId);
  if (!cls) return '—';
  const teacher = window.Store.teacherFull(cls.classTeacherId);
  return teacher ? teacher.name : '—';
}

function openParentPayment(feeId) {
  const fee = window.Store.getById('fees', feeId);
  if (!fee) return;

  window.Ui.modal('Pay school fees', `
    <div class="details-list" style="margin-bottom: var(--s5)">
      <div><dt>Item</dt><dd>${esc(fee.title)}</dd></div>
      <div><dt>Amount</dt><dd class="num">${money(fee.amount)}</dd></div>
      <div><dt>Due</dt><dd>${fdate(fee.dueDate)} · ${relativeDays(fee.dueDate)}</dd></div>
    </div>
    <div class="field">
      <label for="pp-method">Pay using</label>
      <select class="select" id="pp-method">
        <option>UPI</option>
        <option>Net banking</option>
        <option>Debit card</option>
      </select>
    </div>
    <p class="field-hint">This demo records the payment and issues a receipt number.
       No money moves and no card details are taken.</p>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="pp-confirm">Pay ${money(fee.amount)}</button>
  `);

  document.getElementById('pp-confirm').addEventListener('click', async () => {
    const updated = await window.Data.payFee(feeId, document.getElementById('pp-method').value);
    window.Ui.closeModal();
    window.Ui.toast(`Paid. Receipt ${updated.receiptNo}.`);
    window.Router.reload();
  });
}

})();
