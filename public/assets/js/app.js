/* ==========================================================================
   Boot and shell wiring
   ========================================================================== */

const signinEl = document.getElementById('signin');
const appEl = document.getElementById('app');

/* --- sign in ------------------------------------------------------------- */

function buildRoleChoice() {
  const host = document.getElementById('role-choice');
  host.innerHTML = Object.entries(window.Auth.roles).map(([key, role], i) => `
    <label>
      <input type="radio" name="role" value="${key}" ${i === 0 ? 'checked' : ''}/>
      ${window.Icons.get(role.icon, 17)}
      <span>${role.label}</span>
    </label>
  `).join('');

  const email = document.getElementById('signin-email');
  const sync = () => {
    const picked = host.querySelector('input:checked').value;
    email.value = window.Auth.roles[picked].demoEmail;
  };
  host.addEventListener('change', sync);
  sync();
}

document.getElementById('signin-form').addEventListener('submit', e => {
  e.preventDefault();
  const role = document.querySelector('#role-choice input:checked').value;
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;

  if (!email) {
    window.Ui.toast('Enter the school email for this portal.', 'warn');
    return;
  }
  if (!password) {
    window.Ui.toast('Enter a password. Any value works in this demo.', 'warn');
    return;
  }

  window.Auth.signIn(role, email);
});

/* --- shell --------------------------------------------------------------- */

function renderShell() {
  const user = window.Auth.user;
  const role = window.Auth.role;
  if (!user) {
    window.Auth.signOut();
    return;
  }

  document.getElementById('user-initials').textContent = window.Format.initials(user.name);
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = user.title || window.Auth.roles[role].label;
  document.getElementById('board-school').textContent = window.Store.school.name;

  document.getElementById('viewas-toggle').innerHTML = window.Icons.get(window.Auth.roles[role].icon, 18);
  document.getElementById('notif-toggle').innerHTML = renderBellIcon();
  document.getElementById('menu-toggle').innerHTML = window.Icons.get('menu', 18);
  document.querySelector('#signout').innerHTML = `${window.Icons.get('signout', 16)}<span>Sign out</span>`;
  document.querySelector('[data-close-modal]').innerHTML = window.Icons.get('close', 18);

  renderTermChip();
  renderViewAsMenu();
  window.Ui.applyTheme();
  window.Router.buildNav();
  window.Router.go(window.Router.landing());
}

function renderBellIcon() {
  const user = window.Auth.user;
  const unread = user ? window.Store.notificationsFor(user.id).filter(n => !n.read).length : 0;
  return window.Icons.get('bell', 18) + (unread ? `<span class="badge">${unread}</span>` : '');
}

function renderTermChip() {
  const { term, session } = window.Store.school;
  const online = window.Api.online;
  document.getElementById('term-chip').innerHTML = `
    <span class="dot${online ? '' : ' offline'}"></span>
    <span>${term} · ${session}</span>
  `;
  document.getElementById('term-chip').title = online
    ? 'Connected to the MongoDB API'
    : 'API or database offline — showing browser-local data';
}

function renderViewAsMenu() {
  const menu = document.getElementById('viewas-menu');
  menu.innerHTML = `<div class="viewas-menu-label">Open another portal</div>
    ${Object.entries(window.Auth.roles).map(([key, role]) => `
      <button data-role="${key}" role="menuitem"
        aria-current="${key === window.Auth.role}">
        ${window.Icons.get(role.icon, 16)}<span>${role.label}</span>
      </button>
    `).join('')}`;
}

/* --- events -------------------------------------------------------------- */

document.addEventListener('click', e => {
  const nav = e.target.closest('.nav-item');
  if (nav) window.Router.go(nav.dataset.view);

  const viewAs = e.target.closest('#viewas-menu button');
  if (viewAs) {
    document.getElementById('viewas-menu').hidden = true;
    const role = viewAs.dataset.role;
    if (role !== window.Auth.role) {
      window.Auth.viewAs(role);
      window.Ui.toast(`Now viewing as ${window.Auth.roles[role].label.toLowerCase()}.`, 'info');
    }
    return;
  }

  const toggle = e.target.closest('#viewas-toggle');
  const menu = document.getElementById('viewas-menu');
  if (toggle) {
    menu.hidden = !menu.hidden;
    toggle.setAttribute('aria-expanded', String(!menu.hidden));
  } else if (!e.target.closest('.viewas')) {
    menu.hidden = true;
  }

  if (e.target.closest('#theme-toggle')) window.Ui.toggleTheme();

  if (e.target.closest('#menu-toggle')) {
    document.getElementById('board').classList.add('open');
    document.getElementById('board-scrim').hidden = false;
  }

  if (e.target.id === 'board-scrim') {
    document.getElementById('board').classList.remove('open');
    e.target.hidden = true;
  }

  if (e.target.closest('#signout')) {
    window.Auth.signOut();
    window.Ui.toast('Signed out.', 'info');
  }

  if (e.target.closest('#notif-toggle')) showNotifications();
});

function showNotifications() {
  const user = window.Auth.user;
  const items = window.Store.notificationsFor(user.id);

  const body = items.length
    ? `<div class="feed">${items.map(n => `
        <div class="feed-item" style="padding-left: 0; padding-right: 0">
          <span class="feed-rail${n.read ? '' : ' high'}"></span>
          <div class="feed-body">
            <div class="feed-title">${window.Format.html(n.title)}</div>
            <div class="feed-text">${window.Format.html(n.message)}</div>
            <div class="feed-meta">${window.Format.html(n.date)}</div>
          </div>
        </div>`).join('')}</div>`
    : window.Ui.empty('inbox', 'Nothing new', 'Alerts about attendance, marks and fees will show up here.');

  window.Ui.modal('Notifications', body, `
    <button class="btn btn-secondary" data-close-modal>Close</button>
    ${items.some(n => !n.read) ? '<button class="btn btn-primary" id="mark-read">Mark all as read</button>' : ''}
  `);

  const btn = document.getElementById('mark-read');
  if (btn) {
    btn.addEventListener('click', () => {
      items.forEach(n => window.Store.update('notifications', n.id, { read: true }));
      document.getElementById('notif-toggle').innerHTML = renderBellIcon();
      window.Ui.closeModal();
      window.Ui.toast('All notifications marked as read.');
    });
  }
}

/* --- lifecycle ----------------------------------------------------------- */

function showApp() {
  signinEl.hidden = true;
  appEl.hidden = false;
  renderShell();
}

function showSignin() {
  appEl.hidden = true;
  signinEl.hidden = false;
  document.getElementById('signin-password').value = 'demo1234';
}

window.addEventListener('auth:signedin', showApp);
window.addEventListener('auth:signedout', showSignin);
window.addEventListener('api:status', () => {
  if (window.Auth.isSignedIn()) renderTermChip();
});

buildRoleChoice();
if (window.Auth.isSignedIn()) showApp();
else showSignin();
