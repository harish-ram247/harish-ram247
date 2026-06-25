/**
 * SVG primitive helpers.
 * All functions return raw SVG string fragments.
 */

const { fonts } = require('./colors');

/**
 * Wrap content in an SVG root element with shared animations.
 */
function svgWrap(width, height, content, extraDefs = '') {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs>
  <style>
    @keyframes pulse      { 0%,100%{opacity:.2}  50%{opacity:.75} }
    @keyframes pulse-fast { 0%,100%{opacity:.15} 50%{opacity:.9}  }
    @keyframes float      { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-6px)} }
    @keyframes float-sm   { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-3px)} }
    @keyframes blink      { 0%,49%{opacity:1} 50%,100%{opacity:0} }
    @keyframes flow       { 0%{stroke-dashoffset:24} 100%{stroke-dashoffset:0} }
    @keyframes spin-slow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes shimmer    { 0%,100%{opacity:.5} 50%{opacity:1} }
    .pulse      { animation: pulse 3s ease-in-out infinite; }
    .pulse-fast { animation: pulse-fast 1.8s ease-in-out infinite; }
    .float      { animation: float 4s ease-in-out infinite; }
    .float-sm   { animation: float-sm 3s ease-in-out infinite; }
    .blink      { animation: blink 1s step-end infinite; }
    .flow       { animation: flow 2s linear infinite; stroke-dasharray:8 5; }
    .shimmer    { animation: shimmer 3s ease-in-out infinite; }
    .d1 { animation-delay: 0s; }
    .d2 { animation-delay: .4s; }
    .d3 { animation-delay: .8s; }
    .d4 { animation-delay: 1.2s; }
    .d5 { animation-delay: 1.6s; }
    .d6 { animation-delay: 2.0s; }
  </style>
  ${extraDefs}
</defs>
${content}
</svg>`;
}

/** Rectangle */
function rect({ x = 0, y = 0, w, h, rx = 0, fill = 'none', stroke = null, sw = 1, opacity = null, cls = '' }) {
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"`;
  if (stroke) s += ` stroke="${stroke}" stroke-width="${sw}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  if (cls) s += ` class="${cls}"`;
  return s + '/>';
}

/** Circle */
function circle({ cx, cy, r, fill = 'none', stroke = null, sw = 1, opacity = null, cls = '' }) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"`;
  if (stroke) s += ` stroke="${stroke}" stroke-width="${sw}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  if (cls) s += ` class="${cls}"`;
  return s + '/>';
}

/** Line */
function line({ x1, y1, x2, y2, stroke, sw = 1, opacity = null, cls = '' }) {
  let s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  if (cls) s += ` class="${cls}"`;
  return s + '/>';
}

/** Text */
function text({ x, y, content, size, fill, anchor = 'start', weight = 'normal', font = null, spacing = null, cls = '', opacity = null }) {
  const f = font || fonts.sans;
  let s = `<text x="${x}" y="${y}" font-family="${f}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"`;
  if (spacing) s += ` letter-spacing="${spacing}"`;
  if (cls) s += ` class="${cls}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  return s + `>${content}</text>`;
}

/** Wrapped text (multi-line via tspan) */
function textLines({ x, y, lines, size, fill, lineHeight = 18, anchor = 'start', weight = 'normal', font = null, opacity = null }) {
  const f = font || fonts.sans;
  let s = `<text font-family="${f}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  s += '>';
  lines.forEach((l, i) => {
    s += `<tspan x="${x}" ${i === 0 ? `y="${y}"` : `dy="${lineHeight}"`}>${l}</tspan>`;
  });
  return s + '</text>';
}

/** Chip/pill */
function chip({ x, y, label, fill, border, textColor, mono = false, h = 24 }) {
  const charW = mono ? 7.5 : 7.2;
  const w = Math.ceil(label.length * charW) + 24;
  const f = mono ? fonts.mono : fonts.sans;
  const fs = mono ? 10 : 11;
  return `<g>
  ${rect({ x, y, w, h, rx: h / 2, fill, stroke: border, sw: 0.8 })}
  ${text({ x: x + w / 2, y: y + h / 2 + 4, content: label, size: fs, fill: textColor, anchor: 'middle', font: f })}
</g>`;
}

/**
 * Lay chips left-to-right. Returns { svg, totalWidth, rows }.
 * If chips overflow maxWidth, wraps to next row.
 */
function chipRow({ chips: chipDefs, startX, startY, gap = 8, maxWidth = 700, rowGap = 10, chipH = 24 }) {
  const charW = 7.2;
  let svgParts = [];
  let x = startX;
  let y = startY;
  let maxW = 0;

  chipDefs.forEach(c => {
    const w = Math.ceil(c.label.length * charW) + 24;
    if (x + w > startX + maxWidth && x > startX) {
      x = startX;
      y += chipH + rowGap;
    }
    svgParts.push(chip({ x, y, ...c }));
    x += w + gap;
    if (x > maxW) maxW = x;
  });

  return { svg: svgParts.join('\n'), endY: y + chipH };
}

/** Glow filter def */
function glowFilter(id, stdDeviation = 4, color = null) {
  const flood = color
    ? `<feFlood result="colored" flood-color="${color}" flood-opacity="1"/><feComposite in="colored" in2="SourceGraphic" operator="in" result="coloredSource"/><feGaussianBlur in="coloredSource" stdDeviation="${stdDeviation}" result="blur"/>`
    : `<feGaussianBlur stdDeviation="${stdDeviation}" result="blur"/>`;
  return `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">
  ${flood}
  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`;
}

/** Linear gradient def */
function linearGrad(id, stops, x1 = '0%', y1 = '0%', x2 = '100%', y2 = '0%') {
  const stopsStr = stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}"/>`).join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stopsStr}</linearGradient>`;
}

/** Radial gradient def */
function radialGrad(id, stops, cx = '50%', cy = '50%', r = '50%') {
  const stopsStr = stops.map(s => `<stop offset="${s.offset}" stop-color="${s.color}" stop-opacity="${s.opacity ?? 1}"/>`).join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stopsStr}</radialGradient>`;
}

/** Path */
function path({ d, fill = 'none', stroke = null, sw = 1, opacity = null, cls = '' }) {
  let s = `<path d="${d}" fill="${fill}"`;
  if (stroke) s += ` stroke="${stroke}" stroke-width="${sw}"`;
  if (opacity !== null) s += ` opacity="${opacity}"`;
  if (cls) s += ` class="${cls}"`;
  return s + '/>';
}

/** Dot grid pattern def */
function dotGridPattern(id, spacing = 24, r = 0.8, color = '#1c2333') {
  return `<pattern id="${id}" x="0" y="0" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
  <circle cx="${spacing / 2}" cy="${spacing / 2}" r="${r}" fill="${color}" opacity="0.8"/>
</pattern>`;
}

module.exports = {
  svgWrap, rect, circle, line, text, textLines, chip, chipRow,
  glowFilter, linearGrad, radialGrad, path, dotGridPattern
};
