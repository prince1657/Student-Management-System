/* ==========================================================================
   Formatting helpers shared by every view
   ========================================================================== */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Format = {
  // Indian digit grouping: 1,02,800 rather than 102,800.
  money(value) {
    return '₹' + Number(value || 0).toLocaleString('en-IN');
  },

  // Compact for axis ticks, where 4.1L reads faster than 4,11,000.
  moneyShort(value) {
    const n = Number(value || 0);
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1).replace('.0', '') + 'Cr';
    if (n >= 100000) return '₹' + (n / 100000).toFixed(1).replace('.0', '') + 'L';
    if (n >= 1000) return '₹' + Math.round(n / 1000) + 'k';
    return '₹' + n;
  },

  date(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  },

  dateShort(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  },

  dayOf(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : String(d.getDate());
  },

  monthOf(iso) {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? '' : MONTHS[d.getMonth()];
  },

  // "in 3 days" / "2 days ago" reads faster than a date when the whole point
  // is whether something is late.
  relativeDays(iso) {
    const target = new Date(iso);
    if (Number.isNaN(target.getTime())) return '';
    const today = new Date();
    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const days = Math.round((target - today) / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'tomorrow';
    if (days === -1) return 'yesterday';
    return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
  },

  isOverdue(iso) {
    const target = new Date(iso);
    if (Number.isNaN(target.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return target < today;
  },

  initials(name) {
    return String(name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
  },

  percent(value) {
    return value === null || value === undefined ? '—' : `${value}%`;
  },

  // Escapes anything interpolated into a template string. Names and remarks
  // come from user input, and views build HTML as strings.
  html(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  },

  today() {
    return new Date().toISOString().slice(0, 10);
  }
};

window.Format = Format;
