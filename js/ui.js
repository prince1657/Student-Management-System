/* ==========================================================================
   EDUPULSE - CORE UI CONTROLLER, MODALS & TOAST MANAGER
   ========================================================================== */

class UIManager {
  constructor() {
    this.currentTheme = localStorage.getItem('edupulse_theme') || 'light';
    this.initTheme();
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('edupulse_theme', this.currentTheme);
    this.initTheme();
    this.showToast(`Switched to ${this.currentTheme} mode`, 'info');
  }

  // Toast Notifications System
  showToast(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = '✔';
    if (type === 'danger') icon = '✖';
    if (type === 'warning') icon = '⚠️';
    if (type === 'info') icon = 'ℹ';

    toast.innerHTML = `
      <span style="font-weight: bold; font-size: 1.1rem;">${icon}</span>
      <span style="font-size: 0.9rem; font-weight: 600;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Modal Manager
  showModal(title, bodyHtml, footerButtonsHtml = '') {
    const backdrop = document.getElementById('modal-backdrop');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const footerEl = document.getElementById('modal-footer');

    if (!backdrop || !bodyEl) return;

    titleEl.textContent = title;
    bodyEl.innerHTML = bodyHtml;
    footerEl.innerHTML = footerButtonsHtml || `
      <button class="btn btn-secondary" onclick="UI.hideModal()">Close</button>
    `;

    backdrop.classList.add('active');
  }

  hideModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  // Table Helpers: Search & Filter
  filterData(items, searchKey, searchTerm, categoryKey = null, categoryValue = null) {
    let result = [...items];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(item => {
        const val = item[searchKey];
        return val && String(val).toLowerCase().includes(term);
      });
    }
    if (categoryKey && categoryValue && categoryValue !== 'all') {
      result = result.filter(item => String(item[categoryKey]) === String(categoryValue));
    }
    return result;
  }
}

window.UI = new UIManager();
