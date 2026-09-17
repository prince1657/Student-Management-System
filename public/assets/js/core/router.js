/* ==========================================================================
   Router

   Each role owns a module of views keyed by id. A view is:
     { label, icon, title, count?, render() -> html, mount?(el) }

   `render` returns markup; `mount` runs after it is in the DOM, which is
   where charts and listeners get attached. Key order sets the nav order.
   ========================================================================== */

class Router {
  constructor() {
    this.current = null;
  }

  modulesFor(role) {
    return {
      admin: window.AdminViews,
      teacher: window.TeacherViews,
      student: window.StudentViews,
      parent: window.ParentViews
    }[role] || {};
  }

  view(id) {
    return this.modulesFor(window.Auth.role)[id] || null;
  }

  buildNav() {
    const role = window.Auth.role;
    const views = this.modulesFor(role);
    const nav = document.getElementById('board-nav');

    const items = Object.entries(views)
      .filter(([, v]) => !v.hidden)
      .map(([id, v]) => {
        const count = typeof v.count === 'function' ? v.count() : null;
        return `<button class="nav-item" data-view="${id}">
          ${window.Icons.get(v.icon, 18)}
          <span>${v.label}</span>
          ${count ? `<span class="nav-count">${count}</span>` : ''}
        </button>`;
      }).join('');

    nav.innerHTML = `<div class="nav-group-label">${window.Auth.roles[role].portal}</div>${items}`;
  }

  go(id) {
    const view = this.view(id);
    if (!view) {
      const first = Object.keys(this.modulesFor(window.Auth.role))[0];
      if (first && first !== id) this.go(first);
      return;
    }

    this.current = id;
    document.getElementById('page-title').textContent = view.title;
    document.title = `${view.title} — EduPulse`;

    const host = document.getElementById('view');
    host.innerHTML = `<div class="view-stack">${view.render()}</div>`;

    document.querySelectorAll('.nav-item').forEach(el => {
      const active = el.dataset.view === id;
      el.classList.toggle('active', active);
      if (active) el.setAttribute('aria-current', 'page');
      else el.removeAttribute('aria-current');
    });

    if (view.mount) view.mount(host);

    // Scroll the window, not the container: scrollIntoView on the content
    // element left the first row sitting under the sticky topbar.
    window.scrollTo({ top: 0 });
    document.getElementById('board').classList.remove('open');
    document.getElementById('board-scrim').hidden = true;
  }

  // Re-render in place: used after a write, and after a theme switch so the
  // charts pick up the new token values.
  reload() {
    if (this.current) {
      this.buildNav();
      this.go(this.current);
    }
  }

  landing() {
    return window.Auth.roles[window.Auth.role].landing;
  }
}

window.Router = new Router();
