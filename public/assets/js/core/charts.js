/* ==========================================================================
   Charts

   Hand-built SVG, no chart library. Three rules the previous version broke:

   1. Charts are measured, then drawn at 1:1. The old line chart used
      preserveAspectRatio="none" on a 500-unit viewBox, which stretched the
      stroke and the type horizontally on wide screens.
   2. Every plot has a hover layer. A chart you cannot interrogate is a picture.
   3. Colours come from the token file, so a theme switch restyles the plot
      (Router redraws on toggle).
   ========================================================================== */

const uid = (() => {
  let n = 0;
  return prefix => `${prefix}-${++n}`;
})();

// Round a max up to something a human would label an axis with.
function niceCeiling(value) {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const steps = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  return magnitude * steps.find(s => magnitude * s >= value);
}

function readVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

class Charts {
  constructor() {
    this.observed = new Map();
    this.watchResize();
  }

  // Redraw on container resize, once per frame, so plots stay crisp when the
  // sidebar opens or the window changes.
  watchResize() {
    let frame = null;
    this.observer = new ResizeObserver(() => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        this.observed.forEach((draw, el) => {
          if (el.isConnected) draw();
          else this.observed.delete(el);
        });
      });
    });
  }

  mount(el, draw) {
    if (!el) return;
    el.classList.add('chart-plot');
    this.observed.set(el, draw);
    this.observer.observe(el);
    draw();
  }

  /* --- line / area ------------------------------------------------------ */

  line(el, { points, format = v => v, height = 208, caption = '' }) {
    if (!el || !points || !points.length) return;

    const draw = () => {
      const width = Math.max(el.clientWidth || 560, 280);
      const pad = { top: 18, right: 14, bottom: 28, left: 52 };
      const plotW = width - pad.left - pad.right;
      const plotH = height - pad.top - pad.bottom;
      const max = niceCeiling(Math.max(...points.map(p => p.value)));
      const gradId = uid('area');

      const x = i => pad.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
      const y = v => pad.top + plotH - (v / max) * plotH;

      const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(max * t));
      const grid = ticks.map(t => `
        <line class="grid-rule" x1="${pad.left}" x2="${width - pad.right}" y1="${y(t)}" y2="${y(t)}"/>
        <text class="axis-label" x="${pad.left - 8}" y="${y(t) + 4}" text-anchor="end">${format(t)}</text>
      `).join('');

      const line = points.map((p, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(p.value)}`).join(' ');
      const area = `${line} L ${x(points.length - 1)} ${y(0)} L ${x(0)} ${y(0)} Z`;

      const markers = points.map((p, i) => `
        <circle cx="${x(i)}" cy="${y(p.value)}" r="4.5"
          style="fill: var(--series-1); stroke: var(--surface); stroke-width: 2"/>
      `).join('');

      const xLabels = points.map((p, i) => `
        <text class="axis-label" x="${x(i)}" y="${height - 8}" text-anchor="middle">${p.label}</text>
      `).join('');

      // One hit column per point, so the pointer never has to find a 9px dot.
      const hits = points.map((p, i) => {
        const w = plotW / points.length;
        return `<rect class="chart-hit" x="${x(i) - w / 2}" y="${pad.top}" width="${w}" height="${plotH}"
          data-i="${i}" data-x="${x(i)}" data-y="${y(p.value)}"/>`;
      }).join('');

      el.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"
          aria-label="${points.map(p => `${p.label}: ${format(p.value)}`).join(', ')}">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style="stop-color: var(--series-1)" stop-opacity="0.22"/>
              <stop offset="100%" style="stop-color: var(--series-1)" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${grid}
          <path d="${area}" fill="url(#${gradId})"/>
          <path d="${line}" fill="none" style="stroke: var(--series-1)" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"/>
          <line class="crosshair" x1="0" x2="0" y1="${pad.top}" y2="${pad.top + plotH}"
            style="stroke: var(--rule-strong); stroke-width: 1" opacity="0"/>
          ${markers}
          ${xLabels}
          ${hits}
        </svg>
        <div class="chart-tip" hidden></div>
      `;

      this.bindTooltip(el, i => ({
        head: points[i].label,
        rows: [{ color: 'var(--series-1)', text: format(points[i].value) }]
      }));
    };

    this.mount(el, draw);
    if (caption) el.insertAdjacentHTML('beforebegin', `<p class="chart-caption">${caption}</p>`);
  }

  /* --- vertical bars ---------------------------------------------------- */

  // One measure across several labels is ONE series, so every bar is the same
  // colour -- painting them green/amber/blue would imply four different things
  // are being measured. `ramp: true` is for an ordinal scale (grades A+ to C),
  // where the single-hue ramp runs dark for the top of the scale to light for
  // the bottom.
  bars(el, { items, format = v => v, height = 208, ramp = false }) {
    if (!el || !items || !items.length) return;

    const draw = () => {
      const width = Math.max(el.clientWidth || 480, 260);
      const pad = { top: 26, right: 8, bottom: 30, left: 8 };
      const plotH = height - pad.top - pad.bottom;
      const max = niceCeiling(Math.max(...items.map(d => d.value), 1));
      const slot = (width - pad.left - pad.right) / items.length;
      const barW = Math.min(46, slot - 12); // >= 12px of surface between bars

      const colorFor = i => ramp
        ? `var(--ramp-${Math.max(2, 6 - i)})`
        : 'var(--series-1)';

      const bars = items.map((d, i) => {
        const h = Math.max((d.value / max) * plotH, d.value > 0 ? 3 : 0);
        const cx = pad.left + slot * i + slot / 2;
        return `
          <rect x="${cx - barW / 2}" y="${pad.top + plotH - h}" width="${barW}" height="${h}"
            rx="4" style="fill: ${colorFor(i)}"/>
          <text class="value-label" x="${cx}" y="${pad.top + plotH - h - 8}" text-anchor="middle">${format(d.value)}</text>
          <text class="axis-label" x="${cx}" y="${height - 10}" text-anchor="middle">${d.label}</text>
          <rect class="chart-hit" x="${cx - slot / 2}" y="${pad.top}" width="${slot}" height="${plotH}"
            data-i="${i}" data-x="${cx}" data-y="${pad.top + plotH - h}"/>
        `;
      }).join('');

      el.innerHTML = `
        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img"
          aria-label="${items.map(d => `${d.label}: ${format(d.value)}`).join(', ')}">
          <line class="grid-rule" x1="${pad.left}" x2="${width - pad.right}"
            y1="${pad.top + plotH}" y2="${pad.top + plotH}"/>
          ${bars}
        </svg>
        <div class="chart-tip" hidden></div>
      `;

      this.bindTooltip(el, i => ({
        head: items[i].label,
        rows: [{ color: colorFor(i), text: format(items[i].value) }]
      }));
    };

    this.mount(el, draw);
  }

  /* --- gauge ------------------------------------------------------------ */

  // A single percentage with a status reading. Status colour carries the
  // threshold, and the words under the arc say it too.
  gauge(el, { value, label, thresholds = { good: 90, warn: 75 } }) {
    if (!el) return;
    const pct = Math.max(0, Math.min(100, Math.round(value || 0)));
    const kind = pct >= thresholds.good ? 'good' : pct >= thresholds.warn ? 'warn' : 'critical';
    const r = 62;
    const circumference = 2 * Math.PI * r;

    el.classList.remove('chart-plot');
    el.innerHTML = `
      <div class="gauge">
        <div class="gauge-wrap">
          <svg width="156" height="156" viewBox="0 0 156 156" role="img"
            aria-label="${label}: ${pct} percent">
            <g transform="rotate(-90 78 78)">
              <circle class="gauge-track" cx="78" cy="78" r="${r}" fill="none" stroke-width="11"/>
              <circle class="gauge-arc" cx="78" cy="78" r="${r}" fill="none" stroke-width="11"
                stroke-linecap="round" style="stroke: var(--${kind})"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${circumference - (pct / 100) * circumference}"/>
            </g>
          </svg>
          <div class="gauge-centre">
            <span class="gauge-value">${pct}%</span>
            <span class="gauge-label">${window.Format.html(label)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /* --- shared tooltip --------------------------------------------------- */

  bindTooltip(el, describe) {
    const tip = el.querySelector('.chart-tip');
    const crosshair = el.querySelector('.crosshair');
    if (!tip) return;

    const show = e => {
      const hit = e.target.closest('.chart-hit');
      if (!hit) return;
      const i = Number(hit.dataset.i);
      const { head, rows } = describe(i);
      tip.innerHTML = `<div class="chart-tip-head">${window.Format.html(head)}</div>
        ${rows.map(r => `<div class="chart-tip-row">
          <span class="legend-swatch" style="background: ${r.color}"></span>${r.text}
        </div>`).join('')}`;
      tip.hidden = false;

      const svg = el.querySelector('svg');
      const scale = svg.clientWidth / svg.viewBox.baseVal.width || 1;
      tip.style.left = `${Number(hit.dataset.x) * scale}px`;
      tip.style.top = `${Number(hit.dataset.y) * scale}px`;

      if (crosshair) {
        crosshair.setAttribute('x1', hit.dataset.x);
        crosshair.setAttribute('x2', hit.dataset.x);
        crosshair.setAttribute('opacity', '1');
      }
    };

    const hide = () => {
      tip.hidden = true;
      if (crosshair) crosshair.setAttribute('opacity', '0');
    };

    el.addEventListener('pointermove', show);
    el.addEventListener('pointerleave', hide);
  }

  /* --- legend ----------------------------------------------------------- */

  // Only for two or more series. A single series is named by the panel title.
  legend(keys) {
    if (!keys || keys.length < 2) return '';
    return `<div class="legend">${keys.map(k => `
      <span class="legend-key"><span class="legend-swatch" style="background: ${k.color}"></span>${window.Format.html(k.label)}</span>
    `).join('')}</div>`;
  }
}

window.Charts = new Charts();
window.readCssVar = readVar;
