/* ==========================================================================
   Teacher portal
   ========================================================================== */

(() => {

const { html: esc, date: fdate, dateShort, relativeDays, dayOf, monthOf, isOverdue } = window.Format;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// CBSE-style bands. Kept in one place so the marks screen and the report card
// can never disagree about what 74% is worth.
function gradeFor(obtained, total) {
  const pct = (obtained / total) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 75) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 35) return 'C';
  return 'D';
}

function gradeBadge(grade) {
  const kind = ['A+', 'A'].includes(grade) ? 'good' : grade === 'D' ? 'critical' : 'warn';
  return `<span class="badge-status ${kind}">${grade}</span>`;
}

function myTeacher() {
  const id = window.Auth.user.teacherId;
  return id ? window.Store.teacherFull(id) : null;
}

function mySubjects() {
  const teacher = myTeacher();
  if (!teacher) return [];
  return (teacher.subjects || []).map(id => window.Store.getById('subjects', id)).filter(Boolean);
}

function myClasses() {
  const ids = [...new Set(mySubjects().map(s => s.classId))];
  return ids.map(id => window.Store.getById('classes', id)).filter(Boolean);
}

function slotClass(subjectId) {
  const index = window.Store.getTable('subjects').findIndex(s => s.id === subjectId);
  return index > 0 ? ` s${Math.min(4, index + 1)}` : '';
}

window.gradeFor = gradeFor;
window.gradeBadge = gradeBadge;

window.TeacherViews = {
  'teacher-overview': {
    label: 'Today',
    icon: 'dashboard',
    title: 'Today',

    render() {
      const classes = myClasses();
      const subjects = mySubjects();
      const classIds = classes.map(c => c.id);
      const headcount = classes.reduce((n, c) => n + window.Store.studentsInClass(c.id).length, 0);

      const assignments = window.Store.assignmentsFull()
        .filter(a => subjects.some(s => s.id === a.subjectId));
      const open = assignments.filter(a => !isOverdue(a.dueDate));
      const ungraded = window.Store.getTable('submissions')
        .filter(s => s.status === 'Submitted' &&
          assignments.some(a => a.id === s.assignmentId)).length;

      const today = DAYS[new Date().getDay()];
      const todaySlots = classIds
        .flatMap(id => window.Store.timetableFor(id))
        .filter(t => t.dayOfWeek === today)
        .sort((a, b) => a.period.localeCompare(b.period));

      const notices = window.Store.noticesFor('teacher');

      return `
        ${window.Ui.ledger([
          { value: classes.length, label: 'Classes assigned', meta: classes.map(c => `${c.name} ${c.section}`).join(', ') },
          { value: headcount, label: 'Students taught' },
          { value: open.length, label: 'Assignments open', meta: open.length ? `next due ${relativeDays(open[0].dueDate)}` : 'nothing pending' },
          {
            value: ungraded,
            label: 'Waiting to be graded',
            attention: ungraded > 0,
            meta: ungraded ? 'needs your marks' : 'all caught up',
            metaKind: ungraded ? 'attention' : '',
            metaIcon: ungraded ? 'warning' : 'check'
          }
        ])}

        <div class="grid-2">
          ${window.Ui.panel({
            title: `${today}'s periods`,
            note: todaySlots.length ? `${todaySlots.length} periods` : '',
            flush: true,
            body: todaySlots.length
              ? `<table class="timetable"><tbody>${todaySlots.map(t => `
                  <tr>
                    <td class="slot-time">${esc(t.period)}</td>
                    <td><div class="slot${slotClass(t.subjectId)}">
                      <div class="slot-subject">${esc(t.subjectName)}</div>
                      <div class="slot-meta">${esc(window.Store.className(t.classId))} · ${esc(t.room)}</div>
                    </div></td>
                  </tr>`).join('')}</tbody></table>`
              : window.Ui.empty('clock', 'No periods today',
                  'Your next scheduled class is on the weekly timetable.')
          })}

          ${window.Ui.panel({
            title: 'Attendance this fortnight',
            note: classes.length ? `${classes[0].name} ${classes[0].section}` : '',
            body: `<div id="t-attendance"></div>
              <div style="margin-top: var(--s4)">
                <button class="btn btn-secondary btn-block" data-view-jump="teacher-attendance">
                  ${window.Icons.get('attendance', 16)} Mark today's register
                </button>
              </div>`
          })}
        </div>

        ${window.Ui.panel({
          title: 'From the office',
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
      `;
    },

    mount(host) {
      const cls = myClasses()[0];
      if (cls) {
        window.Charts.gauge(document.getElementById('t-attendance'), {
          value: window.Store.classAttendanceRate(cls.id),
          label: 'attended'
        });
      }

      host.addEventListener('click', e => {
        const jump = e.target.closest('[data-view-jump]');
        if (jump) window.Router.go(jump.dataset.viewJump);
      });
    }
  },

  'teacher-attendance': {
    label: 'Register',
    icon: 'attendance',
    title: 'Attendance register',

    render() {
      const classes = myClasses();
      if (!classes.length) {
        return window.Ui.panel({
          body: window.Ui.empty('attendance', 'No class assigned',
            'The office assigns classes to faculty. Ask them to add yours.')
        });
      }

      return window.Ui.panel({
        flush: true,
        body: `
          <div class="toolbar">
            <select class="select" id="reg-class" style="width: auto" aria-label="Class">
              ${classes.map(c => `<option value="${c.id}">${c.name} ${c.section} · ${c.room}</option>`).join('')}
            </select>
            <input class="input" type="date" id="reg-date" style="width: auto"
                   value="${window.Format.today()}" aria-label="Date"/>
            <span class="spacer"></span>
            <button class="btn btn-secondary btn-sm" id="reg-all-present">Mark all present</button>
            <button class="btn btn-primary" id="reg-save">Save register</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr>
                <th>Roll</th><th>Student</th><th>Mark</th><th>Last 5 days</th>
              </tr></thead>
              <tbody id="reg-rows"></tbody>
            </table>
          </div>
        `,
        foot: '<span id="reg-summary"></span>'
      });
    },

    mount(host) {
      const classSelect = document.getElementById('reg-class');
      if (!classSelect) return;
      const dateInput = document.getElementById('reg-date');

      const summarise = () => {
        const counts = { Present: 0, Late: 0, Absent: 0 };
        host.querySelectorAll('.mark-btn[aria-pressed="true"]')
          .forEach(btn => { counts[btn.dataset.status] += 1; });
        document.getElementById('reg-summary').textContent =
          `${counts.Present} present · ${counts.Late} late · ${counts.Absent} absent`;
      };

      const draw = () => {
        const classId = classSelect.value;
        const date = dateInput.value;
        const students = window.Store.studentsInClass(classId);
        const existing = window.Store.attendanceOn(classId, date);

        document.getElementById('reg-rows').innerHTML = students.map(s => {
          const already = existing.find(a => a.studentId === s.id);
          const marked = already ? already.status : 'Present';
          const history = window.Store.getTable('attendance')
            .filter(a => a.studentId === s.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 5)
            .reverse();

          return `<tr data-student="${s.id}">
            <td class="col-num">${esc(s.rollNumber)}</td>
            <td>${window.Ui.person(s.name, s.email)}</td>
            <td><div class="mark-group" role="group" aria-label="Attendance for ${esc(s.name)}">
              ${['Present', 'Late', 'Absent'].map(status => `
                <button class="mark-btn ${status.toLowerCase()}" data-status="${status}"
                  aria-pressed="${status === marked}">${status}</button>`).join('')}
            </div></td>
            <td>${history.length
              ? history.map(h => window.Ui.badge(h.status)).join(' ')
              : '<span class="person-sub">No history</span>'}</td>
          </tr>`;
        }).join('');

        summarise();
      };

      draw();
      classSelect.addEventListener('change', draw);
      dateInput.addEventListener('change', draw);

      host.addEventListener('click', e => {
        const btn = e.target.closest('.mark-btn');
        if (btn) {
          btn.closest('.mark-group').querySelectorAll('.mark-btn')
            .forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
          summarise();
        }
      });

      document.getElementById('reg-all-present').addEventListener('click', () => {
        host.querySelectorAll('.mark-group').forEach(group => {
          group.querySelectorAll('.mark-btn').forEach(b =>
            b.setAttribute('aria-pressed', String(b.dataset.status === 'Present')));
        });
        summarise();
      });

      document.getElementById('reg-save').addEventListener('click', async () => {
        const records = [...host.querySelectorAll('#reg-rows tr')].map(row => ({
          studentId: row.dataset.student,
          status: row.querySelector('.mark-btn[aria-pressed="true"]').dataset.status
        }));

        await window.Data.saveAttendance(classSelect.value, dateInput.value, records);
        const absent = records.filter(r => r.status === 'Absent').length;
        window.Ui.toast(absent
          ? `Register saved for ${dateShort(dateInput.value)}. ${absent} marked absent.`
          : `Register saved for ${dateShort(dateInput.value)}. Full attendance.`);
        draw();
      });
    }
  },

  'teacher-assignments': {
    label: 'Coursework',
    icon: 'assignments',
    title: 'Coursework',

    render() {
      const subjects = mySubjects();
      const assignments = window.Store.assignmentsFull()
        .filter(a => subjects.some(s => s.id === a.subjectId));
      const materials = window.Store.getTable('studyMaterials')
        .filter(m => subjects.some(s => s.id === m.subjectId));

      return `
        ${window.Ui.panel({
          title: 'Assignments',
          note: `${assignments.length} set`,
          flush: true,
          actions: `<button class="btn btn-sm btn-primary" id="new-assignment">
            ${window.Icons.get('plus', 15)} Set assignment</button>`,
          body: assignments.length
            ? assignments.map(a => {
                const late = isOverdue(a.dueDate);
                const pct = a.classSize ? Math.round(a.submissionCount / a.classSize * 100) : 0;
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
                      <span class="tag">${esc(a.className)}</span>
                      <span class="tag">${a.maxMarks} marks</span>
                      <span class="person-sub">${late ? 'closed' : `due ${relativeDays(a.dueDate)}`}</span>
                    </div>
                  </div>
                  <div class="task-side">
                    <span class="person-sub num">${a.submissionCount} of ${a.classSize} in</span>
                    <div class="meter" style="width: 92px">
                      <div class="meter-fill${pct < 50 ? ' warn' : ''}" style="width: ${pct}%"></div>
                    </div>
                  </div>
                </div>`;
              }).join('')
            : window.Ui.empty('assignments', 'No assignments yet',
                'Set one and it shows up in every student\'s portal straight away.')
        })}

        ${window.Ui.panel({
          title: 'Study material',
          note: `${materials.length} files`,
          flush: true,
          actions: `<button class="btn btn-sm btn-secondary" id="new-material">
            ${window.Icons.get('upload', 15)} Add file</button>`,
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
            : window.Ui.empty('book', 'Nothing shared yet',
                'Notes, slides and reference sheets you add here are visible to your classes.')
        })}
      `;
    },

    mount() {
      const newAssignment = document.getElementById('new-assignment');
      if (newAssignment) newAssignment.addEventListener('click', openAssignmentModal);

      const newMaterial = document.getElementById('new-material');
      if (newMaterial) newMaterial.addEventListener('click', openMaterialModal);
    }
  },

  'teacher-marks': {
    label: 'Marks',
    icon: 'marks',
    title: 'Enter marks',

    render() {
      const subjects = mySubjects();
      const exams = window.Store.getTable('exams')
        .filter(e => subjects.some(s => s.id === e.subjectId));

      if (!exams.length) {
        return window.Ui.panel({
          body: window.Ui.empty('marks', 'No assessment scheduled',
            'Marks can be entered once the office schedules an exam for your subject.')
        });
      }

      return window.Ui.panel({
        flush: true,
        body: `
          <div class="toolbar">
            <select class="select" id="mk-exam" style="width: auto" aria-label="Assessment">
              ${exams.map(e => {
                const subject = window.Store.getById('subjects', e.subjectId);
                return `<option value="${e.id}">${e.title} · ${subject ? subject.name : ''} · ${e.totalMarks} marks</option>`;
              }).join('')}
            </select>
            <span class="spacer"></span>
            <button class="btn btn-primary" id="mk-save">Save marks</button>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead><tr>
                <th>Roll</th><th>Student</th><th style="width: 132px">Marks</th>
                <th>Grade</th><th>Remark</th>
              </tr></thead>
              <tbody id="mk-rows"></tbody>
            </table>
          </div>
        `,
        foot: '<span id="mk-summary"></span>'
      });
    },

    mount(host) {
      const examSelect = document.getElementById('mk-exam');
      if (!examSelect) return;

      const summarise = () => {
        const values = [...host.querySelectorAll('.mk-input')]
          .map(i => Number(i.value))
          .filter(v => !Number.isNaN(v) && v > 0);
        const exam = window.Store.getById('exams', examSelect.value);
        if (!values.length) {
          document.getElementById('mk-summary').textContent = 'No marks entered yet';
          return;
        }
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        document.getElementById('mk-summary').textContent =
          `${values.length} entered · class average ${avg.toFixed(1)} of ${exam.totalMarks}`;
      };

      const draw = () => {
        const exam = window.Store.getById('exams', examSelect.value);
        const students = window.Store.studentsInClass(exam.classId);

        document.getElementById('mk-rows').innerHTML = students.map(s => {
          const existing = window.Store.getTable('marks')
            .find(m => m.examId === exam.id && m.studentId === s.id);
          const value = existing ? existing.marksObtained : '';
          return `<tr data-student="${s.id}">
            <td class="col-num">${esc(s.rollNumber)}</td>
            <td>${window.Ui.person(s.name, s.className)}</td>
            <td><input class="input mk-input" type="number" min="0" max="${exam.totalMarks}"
                   value="${value}" placeholder="of ${exam.totalMarks}"
                   aria-label="Marks for ${esc(s.name)}"/></td>
            <td class="mk-grade">${value === ''
              ? '<span class="person-sub">—</span>'
              : gradeBadge(gradeFor(value, exam.totalMarks))}</td>
            <td><input class="input mk-remark" value="${esc(existing && existing.remarks || '')}"
                   placeholder="Optional" aria-label="Remark for ${esc(s.name)}"/></td>
          </tr>`;
        }).join('');

        summarise();
      };

      draw();
      examSelect.addEventListener('change', draw);

      host.addEventListener('input', e => {
        if (!e.target.classList.contains('mk-input')) return;
        const exam = window.Store.getById('exams', examSelect.value);
        const row = e.target.closest('tr');
        const value = Number(e.target.value);

        if (e.target.value === '' || Number.isNaN(value)) {
          row.querySelector('.mk-grade').innerHTML = '<span class="person-sub">—</span>';
        } else if (value > exam.totalMarks) {
          row.querySelector('.mk-grade').innerHTML =
            `<span class="badge-status critical">${window.Icons.get('warning', 12)}Over ${exam.totalMarks}</span>`;
        } else {
          row.querySelector('.mk-grade').innerHTML = gradeBadge(gradeFor(value, exam.totalMarks));
        }
        summarise();
      });

      document.getElementById('mk-save').addEventListener('click', async () => {
        const exam = window.Store.getById('exams', examSelect.value);
        const rows = [...host.querySelectorAll('#mk-rows tr')];

        const over = rows.filter(r => Number(r.querySelector('.mk-input').value) > exam.totalMarks);
        if (over.length) {
          window.Ui.toast(`${over.length} entries are above the ${exam.totalMarks} mark total. Fix those first.`, 'critical');
          return;
        }

        const entries = rows
          .filter(r => r.querySelector('.mk-input').value !== '')
          .map(r => {
            const marksObtained = Number(r.querySelector('.mk-input').value);
            return {
              studentId: r.dataset.student,
              marksObtained,
              grade: gradeFor(marksObtained, exam.totalMarks),
              remarks: r.querySelector('.mk-remark').value.trim()
            };
          });

        if (!entries.length) {
          window.Ui.toast('Enter at least one mark before saving.', 'warn');
          return;
        }

        await window.Data.saveMarks(exam.id, entries);
        window.Ui.toast(`Marks saved for ${entries.length} students.`);
      });
    }
  }
};

/* --- modals -------------------------------------------------------------- */

function openAssignmentModal() {
  const subjects = mySubjects();

  window.Ui.modal('Set an assignment', `
    <div class="field">
      <label for="a-title">Title</label>
      <input class="input" id="a-title" placeholder="Quadratic equations, exercise 4.3"/>
    </div>
    <div class="field">
      <label for="a-desc">What to do</label>
      <textarea class="textarea" id="a-desc" placeholder="Which questions, what to show, how to submit"></textarea>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="a-subject">Subject</label>
        <select class="select" id="a-subject">
          ${subjects.map(s => `<option value="${s.id}">${s.name} · ${window.Store.className(s.classId)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="a-due">Due date</label>
        <input class="input" type="date" id="a-due" value="${window.Format.today()}"/>
      </div>
      <div class="field">
        <label for="a-marks">Out of</label>
        <input class="input" type="number" id="a-marks" value="20" min="1"/>
      </div>
    </div>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="save-assignment">Set assignment</button>
  `);

  document.getElementById('save-assignment').addEventListener('click', async () => {
    const title = document.getElementById('a-title').value.trim();
    const description = document.getElementById('a-desc').value.trim();
    const subjectId = document.getElementById('a-subject').value;

    if (!title || !description) {
      window.Ui.toast('Students need a title and instructions to work from.', 'warn');
      return;
    }

    const subject = window.Store.getById('subjects', subjectId);
    await window.Data.createAssignment({
      title,
      description,
      subjectId,
      classId: subject.classId,
      teacherId: window.Auth.user.teacherId,
      dueDate: document.getElementById('a-due').value,
      maxMarks: Number(document.getElementById('a-marks').value) || 20
    });

    window.Ui.closeModal();
    window.Ui.toast(`Assignment set for ${window.Store.className(subject.classId)}.`);
    window.Router.reload();
  });
}

function openMaterialModal() {
  const subjects = mySubjects();

  window.Ui.modal('Add study material', `
    <div class="field">
      <label for="m-title">What is it</label>
      <input class="input" id="m-title" placeholder="Periodic table reference sheet"/>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="m-subject">Subject</label>
        <select class="select" id="m-subject">
          ${subjects.map(s => `<option value="${s.id}">${s.name} · ${window.Store.className(s.classId)}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="m-type">File type</label>
        <select class="select" id="m-type">
          <option>PDF</option><option>PPT</option><option>DOC</option><option>Link</option>
        </select>
      </div>
    </div>
    <p class="field-hint">This demo records the entry without storing a file.</p>
  `, `
    <button class="btn btn-secondary" data-close-modal>Cancel</button>
    <button class="btn btn-primary" id="save-material">Add file</button>
  `);

  document.getElementById('save-material').addEventListener('click', async () => {
    const title = document.getElementById('m-title').value.trim();
    if (!title) {
      window.Ui.toast('Give the file a name students will recognise.', 'warn');
      return;
    }

    const subjectId = document.getElementById('m-subject').value;
    const subject = window.Store.getById('subjects', subjectId);

    await window.Data.createMaterial({
      title,
      subjectId,
      classId: subject.classId,
      fileType: document.getElementById('m-type').value,
      fileUrl: '#',
      uploadedBy: window.Auth.user.name,
      uploadedAt: window.Format.today()
    });

    window.Ui.closeModal();
    window.Ui.toast('File added for your classes.');
    window.Router.reload();
  });
}

})();
