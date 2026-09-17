/* ==========================================================================
   Administrator portal
   ========================================================================== */

(() => {

const { html: esc, money, moneyShort, date: fdate, relativeDays } = window.Format;

/* --- shared bits --------------------------------------------------------- */

function classOptions(selected = '') {
  return window.Store.getTable('classes').map(c => `
    <option value="${c.id}" ${c.id === selected ? 'selected' : ''}>
      ${c.name} ${c.section}
    </option>`).join('');
}

function feeRow(fee, compact = false) {
  const late = fee.status === 'Overdue';
  return `<tr>
    <td>${window.Ui.person(fee.studentName, `${fee.rollNumber} · ${fee.className}`)}</td>
    ${compact ? '' : `<td>${esc(fee.title)}</td>`}
    <td class="col-right num">${money(fee.amount)}</td>
    <td class="num">${fdate(fee.dueDate)}${late ? `<div class="person-sub">${relativeDays(fee.dueDate)}</div>` : ''}</td>
    <td>${window.Ui.badge(fee.status)}</td>
    <td class="col-actions">
      ${fee.status === 'Paid'
        ? `<span class="person-sub num">${esc(fee.receiptNo || '')}</span>`
        : `<button class="btn btn-sm btn-secondary" data-pay="${fee.id}">Record payment</button>`}
    </td>
  </tr>`;
}

function openPaymentModal(feeId) {
  const fee = window.Store.feesWithStudent().find(f => f.id === feeId);
  if (!fee) return;

  window.Ui.modal('Record a payment', `
    <div class="details-list" style="margin-bottom: var(--s5)">
      <div><dt>Student</dt><dd>${esc(fee.studentName)} · ${esc(fee.rollNumber)}</dd></div>
      <div><dt>Item</dt><dd>${esc(fee.title)}</dd></div>
      <div><dt>Amount</dt><dd class="num">${money(fee.amount)}</dd></div>
      <div><dt>Due</dt><dd>${fdate(fee.dueDate)}</dd></div>
    </div>
    <div class="field">
      <label for="pay-method">How was it paid</label>
      <select class="select" id="pay-method">
        <option>UPI</option>
        <option>Net banking</option>
        <option>Cheque</option>
        <option>Cash at office</option>
      </select>
      <p class="field-hint">A receipt number is generated when you record it.</p>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="pay-confirm">Record ${money(fee.amount)}</button>
  `);

  document.getElementById('pay-confirm').addEventListener('click', async () => {
    const method = document.getElementById('pay-method').value;
    const updated = await window.Data.payFee(feeId, method);
    window.Ui.closeModal();
    window.Ui.toast(`Payment recorded. Receipt ${updated.receiptNo}.`);
    window.Router.reload();
  });
}

/* --- views --------------------------------------------------------------- */

window.AdminViews = {
  'admin-overview': {
    label: 'Overview',
    icon: 'dashboard',
    title: 'Overview',

    render() {
      const totals = window.Store.feeTotals();
      const classes = window.Store.getTable('classes');
      const students = window.Store.getTable('students');
      const teachers = window.Store.getTable('teachers');
      const followUp = window.Store.feesWithStudent()
        .filter(f => f.status !== 'Paid')
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      const notices = window.Store.noticesFor('admin');

      return `
        ${window.Ui.ledger([
          {
            value: students.length,
            label: 'Students on roll',
            meta: `across ${classes.length} classes`
          },
          {
            value: teachers.length,
            label: 'Teaching staff',
            meta: `${window.Store.getTable('subjects').length} subjects timetabled`
          },
          {
            value: money(totals.collected),
            label: 'Fees collected',
            meta: `${Math.round(totals.collected / (totals.collected + totals.pending + totals.overdue) * 100)}% of billed`,
            metaKind: 'up',
            metaIcon: 'arrowUp'
          },
          {
            value: money(totals.overdue),
            label: 'Overdue',
            attention: true,
            meta: `${totals.overdueCount} accounts past due`,
            metaKind: 'attention',
            metaIcon: 'warning'
          }
        ])}

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Fee collection by month',
            note: 'session 2026-27',
            body: '<div id="chart-collections"></div>'
          })}
          ${window.Ui.panel({
            title: 'Attendance, Class X A',
            note: 'last 2 weeks',
            body: `<div id="chart-attendance"></div>
              <p class="chart-caption" style="margin: var(--s3) 0 0; text-align: center">
                Late arrivals count as attended.
              </p>`
          })}
        </div>

        <div class="grid-2">
          ${window.Ui.panel({
            title: 'Fees to chase',
            note: `${followUp.length} open`,
            flush: true,
            actions: `<button class="btn btn-sm btn-secondary" data-view-jump="admin-fees">
              Open fee book</button>`,
            body: followUp.length
              ? `<div class="table-scroll"><table class="data-table">
                  <thead><tr>
                    <th>Student</th><th class="col-right">Amount</th>
                    <th>Due</th><th>Status</th><th></th>
                  </tr></thead>
                  <tbody>${followUp.map(f => feeRow(f, true)).join('')}</tbody>
                </table></div>`
              : window.Ui.empty('check', 'Every account is settled',
                  'Nothing is pending or overdue for this session.')
          })}

          ${window.Ui.panel({
            title: 'Notice board',
            flush: true,
            actions: `<button class="btn btn-sm btn-primary" id="new-notice">
              ${window.Icons.get('plus', 15)} Post</button>`,
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
      window.Charts.line(document.getElementById('chart-collections'), {
        points: window.Store.getTable('collections').map(c => ({ label: c.month, value: c.amount })),
        format: moneyShort
      });

      window.Charts.gauge(document.getElementById('chart-attendance'), {
        value: window.Store.classAttendanceRate('cls-10a'),
        label: 'attended'
      });

      host.addEventListener('click', e => {
        const pay = e.target.closest('[data-pay]');
        if (pay) openPaymentModal(pay.dataset.pay);

        const jump = e.target.closest('[data-view-jump]');
        if (jump) window.Router.go(jump.dataset.viewJump);

        if (e.target.closest('#new-notice')) openNoticeModal();
      });
    }
  },

  'admin-students': {
    label: 'Students',
    icon: 'students',
    title: 'Students',
    count: () => window.Store.getTable('students').length,

    render() {
      return window.Ui.panel({
        flush: true,
        body: `
          <div class="toolbar">
            <div class="search">
              ${window.Icons.get('search', 16)}
              <input class="input" type="search" id="student-search"
                     placeholder="Search name or roll number" aria-label="Search students"/>
            </div>
            <select class="select" id="student-class" style="width: auto" aria-label="Filter by class">
              <option value="">All classes</option>
              ${classOptions()}
            </select>
            <span class="spacer"></span>
            <button class="btn btn-primary" id="add-student">
              ${window.Icons.get('plus', 16)} Add student
            </button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr>
                <th>Roll</th><th>Student</th><th>Class</th>
                <th>Guardian</th><th>Status</th><th></th>
              </tr></thead>
              <tbody id="student-rows"></tbody>
            </table>
          </div>
          <div id="student-empty"></div>
        `,
        foot: '<span id="student-count"></span>'
      });
    },

    mount(host) {
      const draw = () => {
        const term = document.getElementById('student-search').value.trim().toLowerCase();
        const classId = document.getElementById('student-class').value;

        const rows = window.Store.allStudents().filter(s =>
          (!classId || s.classId === classId) &&
          (!term || s.name.toLowerCase().includes(term) || s.rollNumber.toLowerCase().includes(term)));

        document.getElementById('student-rows').innerHTML = rows.map(s => `
          <tr>
            <td class="col-num">${esc(s.rollNumber)}</td>
            <td>${window.Ui.person(s.name, s.email)}</td>
            <td>${esc(s.className)}</td>
            <td>${s.parentName
              ? `${esc(s.parentName)}<div class="person-sub">${esc(s.parentPhone || '')}</div>`
              : '<span class="person-sub">Not linked</span>'}</td>
            <td>${window.Ui.badge(s.status)}</td>
            <td class="col-actions"><div class="row-actions">
              <button class="icon-btn" data-open="${s.id}" title="Open record"
                aria-label="Open record for ${esc(s.name)}">${window.Icons.get('eye', 17)}</button>
              <button class="icon-btn" data-remove="${s.id}" title="Remove from roll"
                aria-label="Remove ${esc(s.name)}">${window.Icons.get('trash', 17)}</button>
            </div></td>
          </tr>`).join('');

        document.getElementById('student-empty').innerHTML = rows.length ? '' : window.Ui.empty(
          'search',
          'No student matches that',
          'Try a different name, roll number or class.'
        );

        const total = window.Store.getTable('students').length;
        document.getElementById('student-count').textContent =
          rows.length === total ? `${total} students on roll` : `${rows.length} of ${total} students`;
      };

      draw();
      document.getElementById('student-search').addEventListener('input', draw);
      document.getElementById('student-class').addEventListener('change', draw);
      document.getElementById('add-student').addEventListener('click', openStudentModal);

      host.addEventListener('click', e => {
        const open = e.target.closest('[data-open]');
        if (open) showStudentRecord(open.dataset.open);

        const remove = e.target.closest('[data-remove]');
        if (remove) {
          const student = window.Store.studentFull(remove.dataset.remove);
          window.Ui.confirm({
            title: `Remove ${student.name}?`,
            message: `This deletes the roll entry, attendance history and fee records for ${student.name} (${student.rollNumber}). It cannot be undone.`,
            confirmLabel: 'Remove from roll',
            onConfirm: async () => {
              await window.Data.deleteStudent(student.id);
              window.Ui.toast(`${student.name} removed from the roll.`, 'info');
              window.Router.reload();
            }
          });
        }
      });
    }
  },

  'admin-faculty': {
    label: 'Faculty',
    icon: 'faculty',
    title: 'Faculty',
    count: () => window.Store.getTable('teachers').length,

    render() {
      const teachers = window.Store.allTeachers();
      return window.Ui.panel({
        flush: true,
        body: `
          <div class="toolbar">
            <div class="search">
              ${window.Icons.get('search', 16)}
              <input class="input" type="search" id="faculty-search"
                     placeholder="Search name or subject" aria-label="Search faculty"/>
            </div>
            <span class="spacer"></span>
            <button class="btn btn-primary" id="add-faculty">
              ${window.Icons.get('plus', 16)} Add faculty
            </button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr>
                <th>Employee ID</th><th>Name</th><th>Teaches</th>
                <th>Classes</th><th>Contact</th>
              </tr></thead>
              <tbody id="faculty-rows"></tbody>
            </table>
          </div>
          <div id="faculty-empty"></div>
        `,
        foot: `<span>${teachers.length} teaching staff</span>`
      });
    },

    mount(host) {
      const draw = () => {
        const term = document.getElementById('faculty-search').value.trim().toLowerCase();
        const rows = window.Store.allTeachers().filter(t =>
          !term || t.name.toLowerCase().includes(term) ||
          t.subjectNames.join(' ').toLowerCase().includes(term));

        document.getElementById('faculty-rows').innerHTML = rows.map(t => `
          <tr>
            <td class="col-num">${esc(t.employeeId)}</td>
            <td>${window.Ui.person(t.name, t.designation)}</td>
            <td>${t.subjectNames.length
              ? t.subjectNames.map(s => `<span class="tag">${esc(s)}</span>`).join(' ')
              : '<span class="person-sub">No subject assigned</span>'}</td>
            <td>${t.classNames.length ? esc(t.classNames.join(', ')) : '<span class="person-sub">—</span>'}</td>
            <td>
              <a href="mailto:${esc(t.email)}">${esc(t.email)}</a>
              <div class="person-sub num">${esc(t.phone)}</div>
            </td>
          </tr>`).join('');

        document.getElementById('faculty-empty').innerHTML = rows.length ? '' : window.Ui.empty(
          'search', 'No match', 'No staff member matches that name or subject.');
      };

      draw();
      document.getElementById('faculty-search').addEventListener('input', draw);
      document.getElementById('add-faculty').addEventListener('click', openFacultyModal);
    }
  },

  'admin-fees': {
    label: 'Fee book',
    icon: 'fees',
    title: 'Fee book',

    render() {
      const t = window.Store.feeTotals();
      const billed = t.collected + t.pending + t.overdue;

      return `
        ${window.Ui.ledger([
          { value: money(t.collected), label: 'Collected' },
          { value: money(t.pending), label: 'Pending' },
          {
            value: money(t.overdue),
            label: 'Overdue',
            attention: t.overdue > 0,
            meta: `${t.overdueCount} accounts`,
            metaKind: 'attention',
            metaIcon: 'warning'
          },
          { value: `${Math.round(t.collected / billed * 100)}%`, label: 'Of billed amount recovered' }
        ])}

        ${window.Ui.panel({
          flush: true,
          body: `
            <div class="toolbar">
              <div class="segmented" id="fee-filter" role="group" aria-label="Filter by status">
                <button data-status="" aria-pressed="true">All</button>
                <button data-status="Paid" aria-pressed="false">Paid</button>
                <button data-status="Pending" aria-pressed="false">Pending</button>
                <button data-status="Overdue" aria-pressed="false">Overdue</button>
              </div>
              <div class="search">
                ${window.Icons.get('search', 16)}
                <input class="input" type="search" id="fee-search"
                       placeholder="Search student" aria-label="Search fee records"/>
              </div>
            </div>
            <div class="table-scroll">
              <table class="data-table">
                <thead><tr>
                  <th>Student</th><th>Item</th><th class="col-right">Amount</th>
                  <th>Due</th><th>Status</th><th>Receipt</th>
                </tr></thead>
                <tbody id="fee-rows"></tbody>
              </table>
            </div>
            <div id="fee-empty"></div>
          `,
          foot: '<span id="fee-summary"></span>'
        })}
      `;
    },

    mount(host) {
      let status = '';

      const draw = () => {
        const term = document.getElementById('fee-search').value.trim().toLowerCase();
        const rows = window.Store.feesWithStudent()
          .filter(f => (!status || f.status === status) &&
            (!term || f.studentName.toLowerCase().includes(term) ||
              f.rollNumber.toLowerCase().includes(term)))
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

        document.getElementById('fee-rows').innerHTML = rows.map(f => feeRow(f)).join('');
        document.getElementById('fee-empty').innerHTML = rows.length ? '' : window.Ui.empty(
          'inbox', 'Nothing here', 'No fee record matches this filter.');
        document.getElementById('fee-summary').textContent =
          `${rows.length} records · ${money(rows.reduce((sum, f) => sum + f.amount, 0))} billed`;
      };

      draw();
      document.getElementById('fee-search').addEventListener('input', draw);

      document.getElementById('fee-filter').addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn) return;
        status = btn.dataset.status;
        document.querySelectorAll('#fee-filter button').forEach(b =>
          b.setAttribute('aria-pressed', String(b === btn)));
        draw();
      });

      host.addEventListener('click', e => {
        const pay = e.target.closest('[data-pay]');
        if (pay) openPaymentModal(pay.dataset.pay);
      });
    }
  },

  'admin-analytics': {
    label: 'Reports',
    icon: 'analytics',
    title: 'Reports',

    render() {
      return `
        <div class="grid-halves">
          ${window.Ui.panel({
            title: 'Students per class',
            body: '<div id="chart-strength"></div>'
          })}
          ${window.Ui.panel({
            title: 'Grades awarded, Class X A',
            note: 'Unit Test 2',
            body: `<div id="chart-grades"></div>
              <p class="chart-caption" style="margin-top: var(--s3)">
                Darker bars are higher grades.
              </p>`
          })}
        </div>

        <div class="grid-halves">
          ${(() => {
            const marked = window.Store.getTable('classes')
              .filter(c => window.Store.classAttendanceRate(c.id) !== null);
            const unmarked = window.Store.getTable('classes').length - marked.length;
            return window.Ui.panel({
              title: 'Attendance by class',
              note: unmarked ? `${unmarked} not marked yet` : '',
              body: marked.length
                ? '<div id="chart-class-attendance"></div>'
                : window.Ui.empty('attendance', 'No registers marked',
                    'Attendance percentages appear once teachers start marking.')
            });
          })()}
          ${window.Ui.panel({
            title: 'Export',
            body: `
              <p style="color: var(--ink-2); margin-bottom: var(--s4)">
                Download the current roll, fee book and attendance as one JSON file,
                for a spreadsheet or a backup.
              </p>
              <button class="btn btn-secondary" id="export-json">
                ${window.Icons.get('download', 16)} Download data
              </button>`
          })}
        </div>
      `;
    },

    mount() {
      window.Charts.bars(document.getElementById('chart-strength'), {
        items: window.Store.getTable('classes').map(c => ({
          label: `${c.name.replace('Class ', '')} ${c.section}`,
          value: window.Store.studentsInClass(c.id).length
        }))
      });

      window.Charts.bars(document.getElementById('chart-grades'), {
        items: window.Store.gradeDistribution('cls-10a'),
        ramp: true
      });

      window.Charts.bars(document.getElementById('chart-class-attendance'), {
        items: window.Store.getTable('classes')
          .filter(c => window.Store.classAttendanceRate(c.id) !== null)
          .map(c => ({
            label: `${c.name.replace('Class ', '')} ${c.section}`,
            value: window.Store.classAttendanceRate(c.id)
          })),
        format: v => `${v}%`
      });

      document.getElementById('export-json').addEventListener('click', () => {
        const payload = {
          exportedAt: new Date().toISOString(),
          school: window.Store.school,
          students: window.Store.allStudents(),
          faculty: window.Store.allTeachers(),
          fees: window.Store.feesWithStudent(),
          attendance: window.Store.getTable('attendance')
        };
        const url = URL.createObjectURL(
          new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `edupulse-${window.Format.today()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.Ui.toast('Data downloaded.');
      });
    }
  }
};

/* --- modals -------------------------------------------------------------- */

function openStudentModal() {
  window.Ui.modal('Add a student', `
    <div class="field">
      <label for="f-name">Full name</label>
      <input class="input" id="f-name" placeholder="As it should appear on records"/>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="f-email">School email</label>
        <input class="input" type="email" id="f-email" placeholder="name@nalandaps.edu.in"/>
      </div>
      <div class="field">
        <label for="f-phone">Phone</label>
        <input class="input" id="f-phone" placeholder="+91"/>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="f-class">Class</label>
        <select class="select" id="f-class">${classOptions('cls-10a')}</select>
      </div>
      <div class="field">
        <label for="f-blood">Blood group</label>
        <input class="input" id="f-blood" placeholder="O+"/>
      </div>
    </div>
    <div class="field">
      <label for="f-address">Address</label>
      <textarea class="textarea" id="f-address" placeholder="House, area, city, PIN"></textarea>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="save-student">Add to roll</button>
  `);

  document.getElementById('save-student').addEventListener('click', async () => {
    const values = {
      name: document.getElementById('f-name').value.trim(),
      email: document.getElementById('f-email').value.trim(),
      phone: document.getElementById('f-phone').value.trim(),
      classId: document.getElementById('f-class').value,
      bloodGroup: document.getElementById('f-blood').value.trim(),
      address: document.getElementById('f-address').value.trim()
    };

    if (!values.name || !values.email) {
      window.Ui.toast('A name and school email are needed to create a roll entry.', 'warn');
      return;
    }

    const student = await window.Data.createStudent(values);
    window.Ui.closeModal();
    window.Ui.toast(`${values.name} added as ${student.rollNumber}.`);
    window.Router.reload();
  });
}

function openFacultyModal() {
  window.Ui.modal('Add faculty', `
    <div class="field">
      <label for="t-name">Full name</label>
      <input class="input" id="t-name"/>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="t-email">School email</label>
        <input class="input" type="email" id="t-email" placeholder="name@nalandaps.edu.in"/>
      </div>
      <div class="field">
        <label for="t-phone">Phone</label>
        <input class="input" id="t-phone" placeholder="+91"/>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="t-designation">Designation</label>
        <input class="input" id="t-designation" placeholder="Physics Faculty"/>
      </div>
      <div class="field">
        <label for="t-qualification">Qualification</label>
        <input class="input" id="t-qualification" placeholder="M.Sc, B.Ed"/>
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="save-faculty">Add faculty</button>
  `);

  document.getElementById('save-faculty').addEventListener('click', async () => {
    const values = {
      name: document.getElementById('t-name').value.trim(),
      email: document.getElementById('t-email').value.trim(),
      phone: document.getElementById('t-phone').value.trim(),
      designation: document.getElementById('t-designation').value.trim(),
      qualification: document.getElementById('t-qualification').value.trim()
    };

    if (!values.name || !values.email) {
      window.Ui.toast('A name and school email are needed.', 'warn');
      return;
    }

    const teacher = await window.Data.createTeacher(values);
    window.Ui.closeModal();
    window.Ui.toast(`${values.name} added as ${teacher.employeeId}.`);
    window.Router.reload();
  });
}

function openNoticeModal() {
  window.Ui.modal('Post a notice', `
    <div class="field">
      <label for="n-title">Headline</label>
      <input class="input" id="n-title" placeholder="What is happening"/>
    </div>
    <div class="field">
      <label for="n-content">Details</label>
      <textarea class="textarea" id="n-content" placeholder="Dates, venue, what people need to do"></textarea>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="n-target">Who sees it</label>
        <select class="select" id="n-target">
          <option value="all">Everyone</option>
          <option value="teacher">Teachers</option>
          <option value="student">Students</option>
          <option value="parent">Parents</option>
        </select>
      </div>
      <div class="field">
        <label for="n-priority">Priority</label>
        <select class="select" id="n-priority">
          <option value="normal">Normal</option>
          <option value="high">Pin to top</option>
        </select>
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="save-notice">Post notice</button>
  `);

  document.getElementById('save-notice').addEventListener('click', async () => {
    const title = document.getElementById('n-title').value.trim();
    const content = document.getElementById('n-content').value.trim();

    if (!title || !content) {
      window.Ui.toast('A notice needs a headline and details.', 'warn');
      return;
    }

    await window.Data.createNotice({
      title,
      content,
      targetRole: document.getElementById('n-target').value,
      priority: document.getElementById('n-priority').value,
      authorName: window.Auth.user.name,
      date: window.Format.today()
    });

    window.Ui.closeModal();
    window.Ui.toast('Notice posted.');
    window.Router.reload();
  });
}

function showStudentRecord(studentId) {
  const s = window.Store.studentFull(studentId);
  const rate = window.Store.attendanceRate(studentId);
  const marks = window.Store.marksFor(studentId);
  const fees = window.Store.feesFor(studentId);
  const due = fees.filter(f => f.status !== 'Paid');

  window.Ui.modal(s.name, `
    <div class="details-list">
      <div><dt>Roll number</dt><dd class="num">${esc(s.rollNumber)}</dd></div>
      <div><dt>Class</dt><dd>${esc(s.className)}</dd></div>
      <div><dt>Status</dt><dd>${window.Ui.badge(s.status)}</dd></div>
      <div><dt>Email</dt><dd>${esc(s.email)}</dd></div>
      <div><dt>Phone</dt><dd class="num">${esc(s.phone)}</dd></div>
      <div><dt>Guardian</dt><dd>${s.parentName ? esc(s.parentName) : 'Not linked'}</dd></div>
      <div><dt>Blood group</dt><dd>${esc(s.bloodGroup)}</dd></div>
      <div><dt>Address</dt><dd>${esc(s.address)}</dd></div>
      <div><dt>On roll since</dt><dd>${fdate(s.joinDate)}</dd></div>
      <div><dt>Attendance</dt><dd class="num">${window.Format.percent(rate)}</dd></div>
      <div><dt>Assessments</dt><dd>${marks.length
        ? marks.map(m => `${esc(m.subjectName)} ${m.marksObtained}/${m.totalMarks}`).join(' · ')
        : 'None recorded'}</dd></div>
      <div><dt>Fees</dt><dd>${due.length
        ? `${money(due.reduce((sum, f) => sum + f.amount, 0))} outstanding`
        : 'All settled'}</dd></div>
    </div>
  `);
}

})();
