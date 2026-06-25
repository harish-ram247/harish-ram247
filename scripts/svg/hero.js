/**
 * Generates svg/hero.svg from profile config.
 * Two-column layout: text content left, cloud illustration right.
 */

const { svgWrap, rect, circle, line, text, textLines, path, glowFilter, linearGrad, radialGrad, dotGridPattern } = require('../lib/svg-helpers');
const { colors, fonts } = require('../lib/colors');

const W = 800, H = 340;

function buildIllustration() {
  // Cloud infrastructure topology — floating connected nodes
  const glow = glowFilter('glow-cyan', 6, colors.cyan);
  const glowGreen = glowFilter('glow-green', 5, colors.green);

  // Central hub node
  const hub = `
  <g class="float d1">
    ${circle({ cx: 340, cy: 140, r: 30, fill: colors.cyanDim, stroke: colors.cyan, sw: 1.2 })}
    ${circle({ cx: 340, cy: 140, r: 6, fill: colors.cyan, cls: 'shimmer' })}
    ${text({ x: 340, y: 175, content: 'harish-ram', size: 9.5, fill: colors.textSecondary, anchor: 'middle', font: fonts.mono })}
  </g>`;

  // Satellite nodes with labels
  const nodes = [
    { cx: 220, cy: 80,  r: 18, label: 'AI/ML',    color: colors.cyan,   delay: 'd2', cls: 'float' },
    { cx: 460, cy: 75,  r: 18, label: 'Cloud',     color: colors.purple, delay: 'd3', cls: 'float' },
    { cx: 180, cy: 210, r: 15, label: 'Backend',   color: colors.cyan,   delay: 'd4', cls: 'float-sm' },
    { cx: 480, cy: 210, r: 15, label: 'IoT',       color: colors.green,  delay: 'd5', cls: 'float-sm' },
    { cx: 340, cy: 258, r: 14, label: 'DevOps',    color: colors.purple, delay: 'd6', cls: 'float-sm' },
    { cx: 260, cy: 285, r: 10, label: 'DB',        color: colors.gold,   delay: 'd2', cls: 'pulse' },
    { cx: 420, cy: 285, r: 10, label: 'Monitor',   color: colors.gold,   delay: 'd4', cls: 'pulse' },
  ];

  const nodesSvg = nodes.map(n => {
    const dimColor = n.color === colors.cyan ? colors.cyanDim :
                     n.color === colors.purple ? colors.purpleDim :
                     n.color === colors.green ? colors.greenDim : colors.goldDim;
    return `<g class="${n.cls} ${n.delay}">
      ${circle({ cx: n.cx, cy: n.cy, r: n.r, fill: dimColor, stroke: n.color, sw: 1 })}
      ${circle({ cx: n.cx, cy: n.cy, r: n.r * 0.28, fill: n.color, opacity: 0.8 })}
      ${text({ x: n.cx, y: n.cy + n.r + 13, content: n.label, size: 9, fill: colors.textSecondary, anchor: 'middle', font: fonts.mono })}
    </g>`;
  }).join('\n');

  // Connection lines
  const conns = [
    [340, 140, 220, 80],
    [340, 140, 460, 75],
    [340, 140, 180, 210],
    [340, 140, 480, 210],
    [340, 140, 340, 258],
    [340, 258, 260, 285],
    [340, 258, 420, 285],
    [220, 80,  180, 210],
    [460, 75,  480, 210],
  ];

  const connsSvg = conns.map(([x1, y1, x2, y2]) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.cyanBorder}" stroke-width="1" opacity="0.5" class="shimmer"/>`
  ).join('\n');

  // Animated flow dots on connections
  const flowDots = `
  <circle r="2.5" fill="${colors.cyan}" opacity="0.7" class="pulse d1">
    <animateMotion dur="3s" repeatCount="indefinite" path="M340,140 L220,80"/>
  </circle>
  <circle r="2" fill="${colors.purple}" opacity="0.6" class="pulse d3">
    <animateMotion dur="3.5s" repeatCount="indefinite" path="M340,140 L460,75"/>
  </circle>
  <circle r="2" fill="${colors.green}" opacity="0.6" class="pulse d5">
    <animateMotion dur="4s" repeatCount="indefinite" path="M340,140 L480,210"/>
  </circle>`;

  // Outer orbit ring (very subtle)
  const orbit = `<circle cx="340" cy="168" r="130" fill="none" stroke="${colors.cyanBorder}" stroke-width="0.5" stroke-dasharray="3 12" opacity="0.4" class="pulse d2"/>`;

  return `<g transform="translate(390, 0)" filter="url(#glow-cyan)">
  ${glow}
  ${glowGreen}
  ${orbit}
  ${connsSvg}
  ${nodesSvg}
  ${hub}
  ${flowDots}
</g>`;
}

function generateHeroSVG(config) {
  const { personal, contact } = config;

  const defs = `
  ${glowFilter('glow-soft', 8)}
  ${linearGrad('bg-grad', [
    { offset: '0%', color: '#070c16' },
    { offset: '100%', color: colors.pageBg },
  ], '0%', '0%', '100%', '100%')}
  ${linearGrad('bottom-fade', [
    { offset: '0%', color: colors.cardBorder, opacity: 0 },
    { offset: '100%', color: colors.cardBorder, opacity: 0.6 },
  ], '0%', '0%', '100%', '0%')}
  ${radialGrad('hero-glow', [
    { offset: '0%', color: colors.cyan, opacity: 0.06 },
    { offset: '100%', color: colors.cyan, opacity: 0 },
  ], '30%', '50%', '60%')}
  ${dotGridPattern('hero-dots', 28, 0.7, '#1a2235')}`;

  // Availability badge
  const badge = `<g transform="translate(40, 40)">
    ${rect({ x: 0, y: 0, w: 160, h: 26, rx: 13, fill: colors.greenDim, stroke: colors.greenBorder, sw: 0.8 })}
    ${circle({ cx: 14, cy: 13, r: 4, fill: colors.green, cls: 'pulse-fast' })}
    ${text({ x: 25, y: 17.5, content: personal.availability, size: 11, fill: colors.green, font: fonts.sans })}
  </g>`;

  // Name
  const nameEl = text({ x: 40, y: 118, content: personal.name, size: 36, fill: colors.textPrimary, weight: '700', font: fonts.sans });

  // Title
  const titleEl = text({ x: 40, y: 144, content: personal.title, size: 13.5, fill: colors.textSecondary, font: fonts.sans });

  // Bio (wrapped)
  const bioWords = personal.bio.split(' ');
  const line1Words = [], line2Words = [], line3Words = [];
  const bioLines = [];
  let cur = [], len = 0;
  bioWords.forEach(w => {
    if (len + w.length > 46 && cur.length > 0) { bioLines.push(cur.join(' ')); cur = []; len = 0; }
    cur.push(w); len += w.length + 1;
  });
  if (cur.length) bioLines.push(cur.join(' '));
  const bioEl = textLines({ x: 40, y: 172, lines: bioLines.slice(0, 3), size: 13, fill: colors.textSecondary, lineHeight: 20, font: fonts.sans });

  // Buttons
  const btns = [];
  const btnY = 240;
  let btnX = 40;

  if (contact.portfolio) {
    btns.push(`<g>
      ${rect({ x: btnX, y: btnY, w: 140, h: 36, rx: 8, fill: colors.cyan, stroke: colors.cyan, sw: 0 })}
      ${text({ x: btnX + 70, y: btnY + 23, content: 'View Portfolio →', size: 12, fill: colors.pageBg, anchor: 'middle', weight: '600', font: fonts.sans })}
    </g>`);
    btnX += 152;
  }

  if (contact.linkedin) {
    btns.push(`<g>
      ${rect({ x: btnX, y: btnY, w: 100, h: 36, rx: 8, fill: '#081628', stroke: '#1f6feb', sw: 0.8 })}
      ${text({ x: btnX + 50, y: btnY + 23, content: 'LinkedIn', size: 12, fill: '#58a6ff', anchor: 'middle', font: fonts.sans })}
    </g>`);
    btnX += 112;
  }

  if (contact.resume) {
    btns.push(`<g>
      ${rect({ x: btnX, y: btnY, w: 90, h: 36, rx: 8, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
      ${text({ x: btnX + 45, y: btnY + 23, content: 'Resume', size: 12, fill: colors.textSecondary, anchor: 'middle', font: fonts.sans })}
    </g>`);
  }

  // If no portfolio link, show a note
  if (btns.length === 0) {
    btns.push(`<g>
      ${rect({ x: btnX, y: btnY, w: 108, h: 36, rx: 8, fill: '#081628', stroke: '#1f6feb', sw: 0.8 })}
      ${text({ x: btnX + 54, y: btnY + 23, content: 'LinkedIn', size: 12, fill: '#58a6ff', anchor: 'middle', font: fonts.sans })}
    </g>`);
  }

  // Email chip
  const emailEl = `<g transform="translate(40, 290)">
    ${rect({ x: 0, y: 0, w: 22, h: 22, rx: 4, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
    ${text({ x: 11, y: 16, content: '@', size: 12, fill: colors.textDim, anchor: 'middle', font: fonts.mono })}
    ${text({ x: 28, y: 16, content: contact.email || 'contact via LinkedIn', size: 11, fill: colors.textDim, font: fonts.sans })}
  </g>`;

  const content = `
  <rect width="${W}" height="${H}" fill="url(#bg-grad)" rx="16"/>
  <rect width="${W}" height="${H}" fill="url(#hero-dots)" rx="16" opacity="0.7"/>
  <rect width="${W}" height="${H}" fill="url(#hero-glow)" rx="16"/>
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" stroke="${colors.cardBorder}" stroke-width="1" rx="16"/>
  <line x1="0" y1="${H}" x2="${W}" y2="${H}" stroke="url(#bottom-fade)" stroke-width="0.8"/>

  <!-- Left text panel -->
  ${badge}
  ${nameEl}
  ${titleEl}
  ${bioEl}
  ${btns.join('\n')}
  ${emailEl}

  <!-- Right illustration -->
  ${buildIllustration()}
  `;

  return svgWrap(W, H, content, defs);
}

module.exports = { generateHeroSVG };
