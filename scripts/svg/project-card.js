/**
 * Generates svg/projects/{id}.svg — individual project cards.
 * Full-width (800px) with left text, right architecture mini-diagram.
 */

const { svgWrap, rect, circle, line, text, textLines, path, glowFilter, linearGrad, dotGridPattern } = require('../lib/svg-helpers');
const { colors, accentMap, fonts } = require('../lib/colors');

const W = 800, H = 190;

function architectureMiniDiagram(steps, accentColor, startX, startY) {
  if (!steps || steps.length === 0) return '';

  const nodeH = 28, gap = 8;
  const totalH = steps.length * (nodeH + gap) - gap;
  const offsetY = startY + Math.max(0, (H - 80 - totalH) / 2);

  let parts = [];

  steps.forEach((step, i) => {
    const y = offsetY + i * (nodeH + gap);
    const w = Math.min(step.length * 8 + 28, 170);
    const x = startX + (170 - w) / 2;

    parts.push(rect({ x, y, w, h: nodeH, rx: 6, fill: colors.cardBg, stroke: accentColor, sw: 0.6 }));
    parts.push(text({ x: x + w / 2, y: y + 18.5, content: step, size: 10.5, fill: colors.textSecondary, anchor: 'middle', font: fonts.sans }));

    if (i < steps.length - 1) {
      const lineX = startX + 85;
      const lineY1 = y + nodeH;
      const lineY2 = lineY1 + gap;
      parts.push(line({ x1: lineX, y1: lineY1, x2: lineX, y2: lineY2, stroke: accentColor, sw: 1, opacity: 0.5 }));
      // Arrow head
      parts.push(`<polygon points="${lineX},${lineY2 - 1} ${lineX - 3},${lineY2 - 5} ${lineX + 3},${lineY2 - 5}" fill="${accentColor}" opacity="0.7"/>`);
    }
  });

  return parts.join('\n');
}

function generateProjectSVG(project) {
  const theme = accentMap[project.theme] || accentMap.cyan;
  const accent = theme.main;
  const accentDim = theme.dim;
  const accentBorder = theme.border;

  const hasArch = project.architecture && project.architecture.length > 0;
  const textWidth = hasArch ? 500 : 700;

  const defs = `
  ${glowFilter('pg-glow', 4, accent)}
  ${dotGridPattern('pg-dots', 24, 0.7, '#141c2e')}
  ${linearGrad('pg-top', [
    { offset: '0%', color: accent, opacity: 0.08 },
    { offset: '100%', color: accent, opacity: 0 },
  ], '0%', '0%', '0%', '100%')}`;

  // Top accent left border
  const leftAccent = `<rect x="0" y="16" width="2.5" height="${H - 32}" rx="1.25" fill="${accent}" opacity="0.8"/>`;

  // Category pill
  const catPill = `<g>
    ${rect({ x: W - 160, y: 20, w: 140, h: 22, rx: 11, fill: accentDim, stroke: accentBorder, sw: 0.8 })}
    ${text({ x: W - 90, y: 35, content: project.category, size: 10.5, fill: accent, anchor: 'middle', font: fonts.sans })}
  </g>`;

  // Project title
  const titleEl = text({ x: 32, y: 56, content: project.name, size: 20, fill: colors.textPrimary, weight: '700', font: fonts.sans });

  // Description (word-wrap at ~60 chars)
  const desc = project.description || '';
  const words = desc.split(' ');
  const descLines = [];
  let cur = [], len = 0;
  words.forEach(w => {
    if (len + w.length > 62 && cur.length > 0) { descLines.push(cur.join(' ')); cur = []; len = 0; }
    cur.push(w); len += w.length + 1;
  });
  if (cur.length) descLines.push(cur.join(' '));
  const descEl = textLines({ x: 32, y: 82, lines: descLines.slice(0, 2), size: 12.5, fill: colors.textSecondary, lineHeight: 19, font: fonts.sans });

  // Tech chips
  const chipGap = 8, chipH = 22;
  let chipX = 32, chipY = 130;
  const chipsSvg = (project.stack || []).map(tech => {
    const w = tech.length * 7.5 + 22;
    const el = `<g>
      ${rect({ x: chipX, y: chipY, w, h: chipH, rx: 11, fill: accentDim, stroke: accentBorder, sw: 0.7 })}
      ${text({ x: chipX + w / 2, y: chipY + 15.5, content: tech, size: 10, fill: accent, anchor: 'middle', font: fonts.mono })}
    </g>`;
    chipX += w + chipGap;
    return el;
  }).join('\n');

  // Buttons
  const btnY = 154;
  let btnX = 32;
  const btnsSvg = [];

  if (project.github) {
    const bw = 90;
    btnsSvg.push(`<g>
      ${rect({ x: btnX, y: btnY, w: bw, h: 26, rx: 6, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
      ${text({ x: btnX + bw / 2, y: btnY + 17, content: 'GitHub →', size: 11, fill: colors.textSecondary, anchor: 'middle', font: fonts.sans })}
    </g>`);
    btnX += bw + 10;
  }

  if (project.demo) {
    const bw = 98;
    btnsSvg.push(`<g>
      ${rect({ x: btnX, y: btnY, w: bw, h: 26, rx: 6, fill: accentDim, stroke: accent, sw: 0.8 })}
      ${text({ x: btnX + bw / 2, y: btnY + 17, content: 'Live Demo →', size: 11, fill: accent, anchor: 'middle', font: fonts.sans })}
    </g>`);
  }

  // Architecture mini-diagram (right side)
  const archSvg = hasArch ? architectureMiniDiagram(project.architecture, accent, 600, 20) : '';

  // Divider if arch present
  const divider = hasArch
    ? `<line x1="590" y1="20" x2="590" y2="${H - 20}" stroke="${colors.cardBorder}" stroke-width="0.6" opacity="0.8"/>`
    : '';

  const content = `
  ${rect({ x: 0, y: 0, w: W, h: H, rx: 12, fill: colors.cardBg })}
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#pg-top)" rx="12"/>
  <rect x="0" y="0" width="${W}" height="${H}" fill="url(#pg-dots)" rx="12" opacity="0.4"/>
  ${rect({ x: 0.5, y: 0.5, w: W - 1, h: H - 1, rx: 12, stroke: colors.cardBorder, sw: 0.8 })}
  ${leftAccent}
  ${catPill}
  ${titleEl}
  ${descEl}
  ${chipsSvg}
  ${btnsSvg.join('\n')}
  ${divider}
  ${archSvg}`;

  return svgWrap(W, H, content, defs);
}

module.exports = { generateProjectSVG };
