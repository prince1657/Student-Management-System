/* ==========================================================================
   Student portal
   ========================================================================== */

(() => {

const { html: esc, money, date: fdate, relativeDays, dayOf, monthOf, isOverdue } = window.Format;

const WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function me() {
  const user = window.Auth.user;
  return user && user.studentId ? window.Store.studentFull(user.studentId) : null;
}

function slotClass(subjectId) {
  const index = window.Store.getTable('subjects').findIndex(s => s.id === subjectId);
  return index > 0 ? ` s${Math.min(4, index + 1)}` : '';
}

// Report-card figures, shared by the student view and the parent view.
function academicSummary(studentId) {
  const marks = window.Store.marksFor(studentId);
  const obtained = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const total = marks.reduce((sum, m) => sum + m.totalMarks, 0);
  const pct = total ? Math.round((obtained / total) * 100) : null;
  return {
    marks,
    obtained,
    total,
    pct,
    grade: pct === null ? '—' : window.gradeFor(obtained, total)
  };
}

function marksheet(studentId) {
  const { marks, obtained, total, pct, grade } = academicSummary(studentId);

  if (!marks.length) {
    return window.Ui.empty('marks', 'No marks yet',
      'Assessment results appear here as teachers enter them.');
  }

  return `
    <div class="report-head">
      <span class="grade-seal">${grade}</span>
      <div>
        <div class="hero-figure">
          <span class="figure-value">${pct}%</span>
          <span class="figure-unit">overall</span>
        </div>
        <p style="color: var(--ink-2); margin-top: var(--s2)">
          ${obtained} of ${total} marks across ${marks.length} assessments this term.
        </p>
      </div>
    </div>
    <div class="table-scroll">
      <table class="data-table">
        <thead><tr>
          <th>Subject</th><th>Assessment</th>
          <th class="col-right">Marks</th><th>Grade</th><th>Teacher's remark</th>
        </tr></thead>
        <tbody>
          ${marks.map(m => `<tr>
            <td><span class="person-name">${esc(m.subjectName)}</span></td>
            <td>${esc(m.examTitle)}<div class="person-sub">${fdate(m.examDate)}</div></td>
            <td class="col-right num">${m.marksObtained} / ${m.totalMarks}</td>
            <td>${window.gradeBadge(m.grade)}</td>
            <td>${m.remarks ? esc(m.remarks) : '<span class="person-sub">—</span>'}</td>
          </tr>`).join('')}
          <tr class="marksheet-total">
            <td colspan="2">Total</td>
            <td class="col-right num">${obtained} / ${total}</td>
            <td>${window.gradeBadge(grade)}</td>
            <td class="num">${pct}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function subjectBreakdown(studentId) {
  const marks = window.Store.marksFor(studentId);
  if (!marks.length) return '';

  return marks.map(m => {
    const pct = Math.round((m.marksObtained / m.totalMarks) * 100);
    return `<div class="subject-row">
      <span class="subject-name">${esc(m.subjectName)}</span>
      <div class="meter">
        <div class="meter-fill${pct < 50 ? ' critical' : pct < 75 ? ' warn' : ''}"
             style="width: ${pct}%"></div>
      </div>
      <span class="subject-score">${pct}%</span>
    </div>`;
  }).join('');
}

// The parent portal shows the same academic figures for their child.
window.StudentShared = { academicSummary, marksheet, subjectBreakdown };

window.StudentViews = {
  'student-overview': {
    label: 'Overview',
    icon: 'dashboard',
    title: 'Overview',

    render() {
      const student = me();
      if (!student) {
        return window.Ui.panel({
          body: window.Ui.empty('profile', 'No student record',
            'This account is not linked to a student on the roll.')
        });
      }

      const rate = window.Store.attendanceRate(student.id);
      const summary = academicSummary(student.id);
      const dues = window.Store.feesFor(student.id).filter(f => f.status !== 'Paid');
      const duesTotal = dues.reduce((sum, f) => sum + f.amount, 0);

      const pending = window.Store.assignmentsFull(student.classId)
        .filter(a => !window.Store.submissionFor(a.id, student.id) && !isOverdue(a.dueDate));

      const today = new Date().toLocaleDateString('en-IN', { weekday: 'long' });
      const todaySlots = window.Store.timetableFor(student.classId)
        .filter(t => t.dayOfWeek === today)
        .sort((a, b) => a.period.localeCompare(b.period));

      const notices = window.Store.noticesFor('student');

      return `
        ${window.Ui.ledger([
          {
            value: window.Format.percent(rate),
            label: 'Attendance',
            meta: rate >= 90 ? 'above the 90% requirement' : 'below the 90% requirement',
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
            label: 'Assignments to hand in',
            meta: pending.length ? `next due ${relativeDays(pending[0].dueDate)}` : 'nothing pending'
          },
          {
            value: duesTotal ? money(duesTotal) : 'Clear',
            label: 'Fees outstanding',
            attention: duesTotal > 0,
            meta: dues.length ? `due ${relativeDays(dues[0].dueDate)}` : 'all paid',
            metaKind: duesTotal ? 'attention' : '',
            metaIcon: duesTotal ? 'warning' : 'check'
          }
        ])}

        <div class="grid-2">
          ${window.Ui.panel({
            title: `${today}'s classes`,
            flush: true,
            body: todaySlots.length
              ? `<table class="timetable"><tbody>${todaySlots.map(t => `
                  <tr>
                    <td class="slot-time">${esc(t.period)}</td>
                    <td><div class="slot${slotClass(t.subjectId)}">
                      <div class="slot-subject">${esc(t.subjectName)}</div>
                      <div class="slot-meta">${esc(t.teacherName)} · ${esc(t.room)}</div>
                    </div></td>
                  </tr>`).join('')}</tbody></table>`
              : window.Ui.empty('clock', 'No classes today', 'Check the timetable for the week ahead.')
          })}

          ${window.Ui.panel({
            title: 'Marks by subject',
            flush: true,
            body: subjectBreakdown(student.id) || window.Ui.empty('marks', 'No marks yet',
              'Results appear as teachers enter them.')
          })}
        </div>

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Due soon',
            flush: true,
            actions: `<button class="btn btn-sm btn-secondary" data-view-jump="student-coursework">
              All coursework</button>`,
            body: pending.length
              ? pending.slice(0, 3).map(a => `
                  <div class="task">
                    <div class="task-due">
                      <div class="day">${dayOf(a.dueDate)}</div>
                      <div class="month">${monthOf(a.dueDate)}</div>
                    </div>
                    <div class="task-body">
                      <div class="task-title">${esc(a.title)}</div>
                      <div class="task-desc">${esc(a.description)}</div>
                      <div class="task-meta">
                        <span class="tag">${esc(a.subjectName)}</span>
                        <span class="person-sub">due ${relativeDays(a.dueDate)}</span>
                      </div>
                    </div>
                    <div class="task-side">
                      <button class="btn btn-sm btn-primary" data-submit="${a.id}">Hand in</button>
                    </div>
                  </div>`).join('')
              : window.Ui.empty('check', 'Nothing due', 'Every assignment set for your class is handed in.')
          })}

          ${window.Ui.panel({
            title: 'Notices',
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
        const jump = e.target.closest('[data-view-jump]');
        if (jump) window.Router.go(jump.dataset.viewJump);

        const submit = e.target.closest('[data-submit]');
        if (submit) openSubmitModal(submit.dataset.submit);
      });
    }
  },

  'student-timetable': {
    label: 'Timetable',
    icon: 'timetable',
    title: 'Weekly timetable',

    render() {
      const student = me();
      if (!student) return '';

      const slots = window.Store.timetableFor(student.classId);
      const periods = [...new Set(slots.map(s => s.period))].sort();

      if (!periods.length) {
        return window.Ui.panel({
          body: window.Ui.empty('timetable', 'Timetable not published',
            'It appears here once the office publishes it for your class.')
        });
      }

      return window.Ui.panel({
        title: `${student.className} · ${window.Store.school.term}`,
        flush: true,
        body: `<div class="table-scroll"><table class="timetable">
          <thead><tr><th>Period</th>${WEEK.map(d => `<th>${d}</th>`).join('')}</tr></thead>
          <tbody>
            ${periods.map(period => `<tr>
              <td class="slot-time">${esc(period)}</td>
              ${WEEK.map(day => {
                const slot = slots.find(s => s.period === period && s.dayOfWeek === day);
                return `<td>${slot
                  ? `<div class="slot${slotClass(slot.subjectId)}">
                      <div class="slot-subject">${esc(slot.subjectName)}</div>
                      <div class="slot-meta">${esc(slot.room)}</div>
                    </div>`
                  : '<div class="slot-free">Free</div>'}</td>`;
              }).join('')}
            </tr>`).join('')}
          </tbody>
        </table></div>`
      });
    }
  },

  'student-coursework': {
    label: 'Coursework',
    icon: 'assignments',
    title: 'Coursework',

    render() {
      const student = me();
      if (!student) return '';

      const assignments = window.Store.assignmentsFull(student.classId);
      const materials = window.Store.getTable('studyMaterials')
        .filter(m => m.classId === student.classId);

      return `
        ${window.Ui.panel({
          title: 'Assignments',
          note: `${assignments.length} set for ${student.className}`,
          flush: true,
          body: assignments.length
            ? assignments.map(a => {
                const submission = window.Store.submissionFor(a.id, student.id);
                const late = isOverdue(a.dueDate) && !submission;
                const status = submission
                  ? (submission.status === 'Graded' ? 'Graded' : 'Submitted')
                  : (late ? 'Overdue' : 'Not submitted');

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
                      <span class="tag">${a.maxMarks} marks</span>
                      ${window.Ui.badge(status)}
                      ${submission && submission.status === 'Graded'
                        ? `<span class="person-sub num">scored ${submission.grade} of ${a.maxMarks}</span>`
                        : `<span class="person-sub">due ${relativeDays(a.dueDate)}</span>`}
                    </div>
                    ${submission && submission.feedback
                      ? `<div class="task-desc" style="margin-top: var(--s2); color: var(--good-ink)">
                          ${esc(submission.feedback)}</div>`
                      : ''}
                  </div>
                  <div class="task-side">
                    ${submission
                      ? `<span class="person-sub">handed in ${esc(submission.submittedAt.split(' ')[0])}</span>`
                      : `<button class="btn btn-sm btn-primary" data-submit="${a.id}">Hand in</button>`}
                  </div>
                </div>`;
              }).join('')
            : window.Ui.empty('assignments', 'Nothing set',
                'Assignments from your teachers will show up here.')
        })}

        ${window.Ui.panel({
          title: 'Study material',
          flush: true,
          body: materials.length
            ? materials.map(m => `
                <div class="file-row">
                  <span class="file-kind">${esc(m.fileType)}</span>
                  <div class="file-text">
                    <div class="person-name">${esc(m.title)}</div>
                    <div class="person-sub">${esc(m.uploadedBy)} · ${fdate(m.uploadedAt)}</div>
                  </div>
                  <button class="btn btn-sm btn-ghost">${window.Icons.get('download', 15)} Get</button>
                </div>`).join('')
            : window.Ui.empty('book', 'No files yet',
                'Notes and slides your teachers share will appear here.')
        })}
      `;
    },

    mount(host) {
      host.addEventListener('click', e => {
        const submit = e.target.closest('[data-submit]');
        if (submit) openSubmitModal(submit.dataset.submit);
      });
    }
  },

  'student-report': {
    label: 'Report card',
    icon: 'reportcard',
    title: 'Report card',

    render() {
      const student = me();
      if (!student) return '';

      const rate = window.Store.attendanceRate(student.id);
      const history = window.Store.getTable('attendance')
        .filter(a => a.studentId === student.id)
        .sort((a, b) => a.date.localeCompare(b.date));

      return `
        ${window.Ui.panel({
          title: `${student.name} · ${student.rollNumber}`,
          note: `${student.className} · ${window.Store.school.term}, ${window.Store.school.session}`,
          flush: true,
          actions: `<button class="btn btn-sm btn-secondary" id="print-report">
            ${window.Icons.get('print', 15)} Print</button>`,
          body: marksheet(student.id)
        })}

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Attendance record',
            flush: true,
            body: `<div class="table-scroll"><table class="data-table">
              <thead><tr><th>Date</th><th>Marked</th><th>Note</th></tr></thead>
              <tbody>${history.map(a => `<tr>
                <td class="num">${fdate(a.date)}</td>
                <td>${window.Ui.badge(a.status)}</td>
                <td>${a.remarks ? esc(a.remarks) : '<span class="person-sub">—</span>'}</td>
              </tr>`).join('')}</tbody>
            </table></div>`,
            foot: `<span>${window.Format.percent(rate)} attended across ${history.length} marked days</span>`
          })}

          ${window.Ui.panel({
            title: 'Marks by assessment',
            body: '<div id="s-marks-chart"></div>'
          })}
        </div>
      `;
    },

    mount() {
      const student = me();
      if (!student) return;

      const marks = window.Store.marksFor(student.id);
      window.Charts.bars(document.getElementById('s-marks-chart'), {
        items: marks.map(m => ({
          label: m.subjectName.slice(0, 4),
          value: Math.round((m.marksObtained / m.totalMarks) * 100)
        })),
        format: v => `${v}%`
      });

      const print = document.getElementById('print-report');
      if (print) print.addEventListener('click', () => window.print());
    }
  },

  'student-profile': {
    label: 'My details',
    icon: 'profile',
    title: 'My details',

    render() {
      const student = me();
      const user = window.Auth.user;
      if (!student) return '';

      return `
        ${window.Ui.panel({
          flush: true,
          body: `
            <div class="profile-head">
              ${window.Ui.avatar(student.name, 'avatar avatar-lg')}
              <div class="profile-head-text">
                <h2>${esc(student.name)}</h2>
                <div class="profile-head-meta">
                  <span class="tag">${esc(student.rollNumber)}</span>
                  <span class="tag">${esc(student.className)}</span>
                  ${window.Ui.badge(student.status)}
                </div>
              </div>
            </div>
            <div style="padding: var(--s5)">
              <div class="details-list">
                <div><dt>Email</dt><dd>${esc(student.email)}</dd></div>
                <div><dt>Phone</dt><dd class="num">${esc(student.phone)}</dd></div>
                <div><dt>Guardian</dt><dd>${student.parentName
                  ? `${esc(student.parentName)} · ${esc(student.parentPhone || '')}`
                  : 'Not linked'}</dd></div>
                <div><dt>Blood group</dt><dd>${esc(student.bloodGroup)}</dd></div>
                <div><dt>Address</dt><dd>${esc(student.address)}</dd></div>
                <div><dt>On roll since</dt><dd>${fdate(student.joinDate)}</dd></div>
              </div>
            </div>
          `
        })}

        ${window.Ui.panel({
          title: 'Update contact details',
          note: 'the office is notified of changes',
          body: `
            <div class="field-row">
              <div class="field">
                <label for="p-name">Name</label>
                <input class="input" id="p-name" value="${esc(user.name)}"/>
              </div>
              <div class="field">
                <label for="p-phone">Phone</label>
                <input class="input" id="p-phone" value="${esc(user.phone || '')}"/>
              </div>
            </div>
            <div class="field">
              <label for="p-email">Email</label>
              <input class="input" type="email" id="p-email" value="${esc(user.email)}"/>
            </div>
            <button class="btn btn-primary" id="save-profile">Save changes</button>
          `
        })}

        ${window.Ui.panel({
          title: 'Fee statement',
          flush: true,
          body: (() => {
            const fees = window.Store.feesFor(student.id);
            return `<div class="table-scroll"><table class="data-table">
              <thead><tr>
                <th>Item</th><th class="col-right">Amount</th>
                <th>Due</th><th>Status</th><th>Receipt</th>
              </tr></thead>
              <tbody>${fees.map(f => `<tr>
                <td>${esc(f.title)}</td>
                <td class="col-right num">${money(f.amount)}</td>
                <td class="num">${fdate(f.dueDate)}</td>
                <td>${window.Ui.badge(f.status)}</td>
                <td class="num">${f.receiptNo ? esc(f.receiptNo) : '<span class="person-sub">—</span>'}</td>
              </tr>`).join('')}</tbody>
            </table></div>`;
          })()
        })}
      `;
    },

    mount() {
      const save = document.getElementById('save-profile');
      if (!save) return;

      save.addEventListener('click', () => {
        const name = document.getElementById('p-name').value.trim();
        const email = document.getElementById('p-email').value.trim();

        if (!name || !email) {
          window.Ui.toast('Name and email cannot be blank.', 'warn');
          return;
        }

        window.Auth.updateProfile({
          name,
          email,
          phone: document.getElementById('p-phone').value.trim()
        });

        window.Ui.toast('Details updated.');
        window.location.reload();
      });
    }
  }
};

/* --- modals -------------------------------------------------------------- */

function openSubmitModal(assignmentId) {
  const student = me();
  const assignment = window.Store.assignmentsFull().find(a => a.id === assignmentId);
  if (!assignment) return;

  const late = isOverdue(assignment.dueDate);

  window.Ui.modal(`Hand in: ${assignment.title}`, `
    <div class="details-list" style="margin-bottom: var(--s5)">
      <div><dt>Subject</dt><dd>${esc(assignment.subjectName)}</dd></div>
      <div><dt>Out of</dt><dd class="num">${assignment.maxMarks} marks</dd></div>
      <div><dt>Due</dt><dd>${fdate(assignment.dueDate)} · ${relativeDays(assignment.dueDate)}</dd></div>
    </div>
    ${late ? `<p style="color: var(--serious-ink); margin-bottom: var(--s4)">
      This is past the due date. Your teacher will see it as a late submission.</p>` : ''}
    <div class="field">
      <label for="sub-content">Your answer or a link to it</label>
      <textarea class="textarea" id="sub-content"
        placeholder="Paste your working, or a link to the file you scanned"></textarea>
      <p class="field-hint">This demo records the text you enter; it does not upload files.</p>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="confirm-submit">Hand in</button>
  `);

  document.getElementById('confirm-submit').addEventListener('click', async () => {
    const content = document.getElementById('sub-content').value.trim();
    if (!content) {
      window.Ui.toast('Add your answer or a link before handing in.', 'warn');
      return;
    }

    await window.Data.submitAssignment({
      assignmentId,
      studentId: student.id,
      content,
      status: 'Submitted',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      grade: null,
      feedback: null
    });

    window.Ui.closeModal();
    window.Ui.toast(`Handed in. ${esc(assignment.subjectName)} teacher will see it.`);
    window.Router.reload();
  });
}

})();
