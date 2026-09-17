/* ==========================================================================
   UI plumbing: theme, toasts, modal, small shared markup
   ========================================================================== */

const THEME_KEY = 'edupulse.theme';

class Ui {
  constructor() {
    this.theme = localStorage.getItem(THEME_KEY)
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme();
    this.modalCleanup = null;
  }

  /* --- theme ------------------------------------------------------------ */

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = window.Icons.get(this.theme === 'dark' ? 'sun' : 'moon', 18);
      btn.title = this.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    }
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, this.theme);
    this.applyTheme();
    // Charts read their colours from CSS variables at draw time, so they have
    // to be redrawn when those variables change.
    if (window.Router) window.Router.reload();
  }

  /* --- toasts ----------------------------------------------------------- */

  toast(message, kind = 'good', ms = 3600) {
    const host = document.getElementById('toasts');
    if (!host) return;

    const icons = { good: 'check', warn: 'warning', critical: 'critical', info: 'info' };
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.setAttribute('role', kind === 'critical' ? 'alert' : 'status');
    el.innerHTML = `${window.Icons.get(icons[kind] || 'info', 17)}
      <span class="toast-text">${window.Format.html(message)}</span>`;
    host.appendChild(el);

    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 220);
    }, ms);
  }

  /* --- modal ------------------------------------------------------------ */

  modal(title, bodyHtml, footerHtml = '') {
    const scrim = document.getElementById('modal-scrim');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-foot').innerHTML = footerHtml
      || `<button class="btn btn-secondary" data-close-modal>Close</button>`;

    scrim.hidden = false;

    const onKey = e => {
      if (e.key === 'Escape') this.closeModal();
    };
    document.addEventListener('keydown', onKey);
    this.modalCleanup = () => document.removeEventListener('keydown', onKey);

    const first = scrim.querySelector('input, select, textarea, button');
    if (first) first.focus();
  }

  closeModal() {
    document.getElementById('modal-scrim').hidden = true;
    if (this.modalCleanup) {
      this.modalCleanup();
      this.modalCleanup = null;
    }
  }

  /* --- confirm ---------------------------------------------------------- */

  // Destructive actions get a named consequence, not "Are you sure?".
  confirm({ title, message, confirmLabel = 'Delete', onConfirm }) {
    this.modal(title, `<p>${window.Format.html(message)}</p>`, `
      <button class="btn btn-secondary" data-close-modal>Cancel</button>
      <button class="btn btn-danger" id="confirm-action">${window.Format.html(confirmLabel)}</button>
    `);
    document.getElementById('confirm-action').addEventListener('click', () => {
      this.closeModal();
      onConfirm();
    });
  }

  /* --- shared markup ---------------------------------------------------- */

  avatar(name, size = 'avatar') {
    return `<span class="${size} avatar-initials" aria-hidden="true">${window.Format.initials(name)}</span>`;
  }

  person(name, sub) {
    return `<div class="person">${this.avatar(name)}
      <span class="person-text">
        <span class="person-name">${window.Format.html(name)}</span>
        ${sub ? `<span class="person-sub">${window.Format.html(sub)}</span>` : ''}
      </span>
    </div>`;
  }

  // Status colour is never the only signal: every badge carries an icon and
  // the word itself.
  badge(status) {
    const map = {
      Paid: ['good', 'check'],
      Present: ['good', 'check'],
      Active: ['good', 'check'],
      Graded: ['good', 'check'],
      Pending: ['warn', 'clock'],
      Late: ['warn', 'warning'],
      Submitted: ['info', 'check'],
      'On leave': ['neutral', 'info'],
      Overdue: ['critical', 'warning'],
      Absent: ['critical', 'close'],
      'Not submitted': ['neutral', 'clock']
    };
    const [kind, icon] = map[status] || ['neutral', 'info'];
    return `<span class="badge-status ${kind}">${window.Icons.get(icon, 12)}${window.Format.html(status)}</span>`;
  }

  empty(icon, title, message, actionHtml = '') {
    return `<div class="empty">
      ${window.Icons.get(icon, 28)}
      <h3>${window.Format.html(title)}</h3>
      <p>${window.Format.html(message)}</p>
      ${actionHtml}
    </div>`;
  }

  panel({ title, note = '', actions = '', body, flush = false, foot = '' }) {
    return `<section class="panel">
      ${title ? `<header class="panel-head">
        <h2>${window.Format.html(title)}</h2>
        ${note ? `<span class="panel-note">${window.Format.html(note)}</span>` : ''}
        ${actions ? `<div class="panel-actions">${actions}</div>` : ''}
      </header>` : ''}
      <div class="panel-body${flush ? ' flush' : ''}">${body}</div>
      ${foot ? `<footer class="panel-foot">${foot}</footer>` : ''}
    </section>`;
  }

  ledger(cells) {
    return `<div class="ledger">${cells.map(cell => `
      <div class="ledger-cell${cell.attention ? ' attention' : ''}">
        <span class="stat-figure">${cell.value}</span>
        <span class="stat-label">${window.Format.html(cell.label)}</span>
        ${cell.meta ? `<span class="stat-meta ${cell.metaKind || ''}">
          ${cell.metaIcon ? window.Icons.get(cell.metaIcon, 13) : ''}${window.Format.html(cell.meta)}
        </span>` : ''}
      </div>`).join('')}</div>`;
  }
}

window.Ui = new Ui();

// One delegated listener covers every close affordance in the app.
document.addEventListener('click', e => {
  if (e.target.closest('[data-close-modal]')) window.Ui.closeModal();
  if (e.target.id === 'modal-scrim') window.Ui.closeModal();
});
