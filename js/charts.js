/* ==========================================================================
   EDUPULSE - CRISP DYNAMIC SVG & CANVAS CHART ENGINE
   ========================================================================== */

class ChartEngine {
  // 1. Donut / Gauge SVG Chart
  renderGauge(containerId, percentage, label, color = 'var(--primary)') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const strokeWidth = 12;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    container.innerHTML = `
      <div style="position: relative; width: 140px; height: 140px; margin: 0 auto; display: flex; align-items: center; justify-content: center;">
        <svg width="140" height="140" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
          <circle cx="60" cy="60" r="${radius}" stroke="var(--bg-tertiary)" stroke-width="${strokeWidth}" fill="none" />
          <circle cx="60" cy="60" r="${radius}" stroke="${color}" stroke-width="${strokeWidth}" fill="none"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round"
            style="transition: stroke-dashoffset 1s ease-in-out;" />
        </svg>
        <div style="position: absolute; text-align: center;">
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">${percentage}%</div>
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${label}</div>
        </div>
      </div>
    `;
  }

  // 2. Bar Chart SVG Generator
  renderBarChart(containerId, data = [], height = 180) {
    // data: Array of { label: 'Math', value: 85 }
    const container = document.getElementById(containerId);
    if (!container || !data.length) return;

    const maxValue = Math.max(...data.map(d => d.value), 100);
    const barsHtml = data.map(item => {
      const barHeightPct = (item.value / maxValue) * 100;
      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; gap: 8px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);">${item.value}</div>
          <div style="width: 70%; max-width: 36px; height: ${barHeightPct}%; background: linear-gradient(180deg, var(--primary), var(--secondary)); border-radius: var(--radius-sm); transition: height 0.6s ease;"></div>
          <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${item.label}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: flex-end; justify-content: space-around; height: ${height}px; width: 100%; padding-top: 20px;">
        ${barsHtml}
      </div>
    `;
  }

  // 3. Line Chart SVG Generator
  renderLineChart(containerId, dataPoints = [40, 65, 80, 75, 90, 85, 95], labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], height = 180) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const width = 500;
    const maxVal = Math.max(...dataPoints, 100);
    const minVal = 0;

    const points = dataPoints.map((val, idx) => {
      const x = (idx / (dataPoints.length - 1)) * (width - 40) + 20;
      const y = height - 30 - ((val - minVal) / (maxVal - minVal)) * (height - 50);
      return { x, y, val, label: labels[idx] };
    });

    const pathD = points.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 20} L ${points[0].x} ${height - 20} Z`;

    const svgHtml = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="overflow: visible;">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3" />
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#lineGrad)" />
        <path d="${pathD}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" />
        ${points.map(pt => `
          <circle cx="${pt.x}" cy="${pt.y}" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" stroke-width="3" />
        `).join('')}
      </svg>
      <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">
        ${labels.map(l => `<span>${l}</span>`).join('')}
      </div>
    `;

    container.innerHTML = svgHtml;
  }
}

window.Charts = new ChartEngine();
