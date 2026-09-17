/* ==========================================================================
   Icons

   One stroke-based set, drawn on a 24px grid at 1.6 stroke weight so icons
   look like siblings. Emoji were the previous icon system; they render
   differently on every OS and can't inherit text colour.
   ========================================================================== */

const PATHS = {
  dashboard: '<path d="M4 4h6v6H4zM14 4h6v4h-6zM14 12h6v8h-6zM4 14h6v6H4z"/>',
  students: '<path d="M16 19v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1"/><circle cx="9.5" cy="7" r="3.2"/><path d="M17 11a3 3 0 0 0 0-6M21 19v-1a3.6 3.6 0 0 0-2.5-3.4"/>',
  faculty: '<path d="M3 4h18v11H3zM12 15v5M8 20h8M9 11l2.5-3 2.5 3"/>',
  fees: '<path d="M4 6h16v12H4zM4 10h16"/><circle cx="8.5" cy="14" r="1.2"/><path d="M13 14h4"/>',
  analytics: '<path d="M4 20V4M4 20h16M8 20v-6M12.5 20V9M17 20v-4"/>',
  attendance: '<path d="M8 4H6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2"/><path d="M9 2.5h6v3H9z"/><path d="m8.5 13 2.2 2.2L15.5 10.5"/>',
  assignments: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  marks: '<circle cx="12" cy="9" r="5.5"/><path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5"/>',
  profile: '<circle cx="12" cy="8" r="3.6"/><path d="M5 20v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1"/>',
  timetable: '<path d="M4 6h16v15H4zM4 11h16M9 3v4M15 3v4M9 11v10M15 11v10"/>',
  reportcard: '<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9.5 12h5M9.5 16h3"/>',
  notices: '<path d="M4 10v4l10 5V5L4 10zM14 8h3a3 3 0 0 1 0 8h-3M7 15v5h3"/>',
  performance: '<path d="M3 17l5-6 4 3 4-6 5 4"/><path d="M3 21h18"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  bell: '<path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"/><path d="M10.3 19a2 2 0 0 0 3.4 0"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  check: '<path d="m5 13 4.5 4.5L19 7"/>',
  warning: '<path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
  critical: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v4.5M12 15.7v.3"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11.5V16M12 8.2v.3"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19h14"/>',
  upload: '<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 19h14"/>',
  signout: '<path d="M10 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4"/><path d="M15 8l4 4-4 4M19 12H9"/>',
  chevronDown: '<path d="m6 9.5 6 6 6-6"/>',
  chevronRight: '<path d="m9.5 6 6 6-6 6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  mail: '<path d="M3 6h18v12H3z"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 5.2 2 2 0 0 1 6 3z"/>',
  admin: '<path d="M4 8l4 3 4-6 4 6 4-3-2 10H6z"/><path d="M6 21h12"/>',
  student: '<path d="M2.5 8.5 12 4l9.5 4.5L12 13z"/><path d="M6 10.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-5.5"/>',
  parent: '<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9.5" r="2.2"/><path d="M2.5 19v-1.2A4.3 4.3 0 0 1 7 14h2a4.3 4.3 0 0 1 4.5 3.8V19M15 14h1.5a3.5 3.5 0 0 1 3.5 3.4V19"/>',
  book: '<path d="M5 4h6a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2H5z"/><path d="M19 4h-5v14h5z"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  inbox: '<path d="M4 13 6.5 5h11L20 13v6H4z"/><path d="M4 13h4l1 2.5h6l1-2.5h4"/>',
  attach: '<path d="M20 11.5 12.5 19a4.6 4.6 0 0 1-6.5-6.5l7.5-7.5a3.2 3.2 0 0 1 4.5 4.5l-7.5 7.5a1.8 1.8 0 0 1-2.5-2.5l6.5-6.5"/>',
  print: '<path d="M7 9V4h10v5M7 18H5v-7h14v7h-2"/><path d="M7 14h10v6H7z"/>',
  eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.8"/>',
  rupee: '<path d="M7 4h10M7 9h10M15.5 4c0 3.3-2.7 5-6 5h-2l7.5 11"/>',
  calendar: '<path d="M4 6h16v15H4zM4 11h16M9 3v4M15 3v4"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>'
};

const Icons = {
  get(name, size = 20) {
    const body = PATHS[name];
    if (!body) return '';
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none"
      stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  },

  has(name) {
    return Boolean(PATHS[name]);
  }
};

window.Icons = Icons;
