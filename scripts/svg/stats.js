/**
 * Generates svg/stats.svg — "At a Glance" stats cards.
 */

const { svgWrap, rect, text, circle, glowFilter, linearGrad, dotGridPattern } = require('../lib/svg-helpers');
const { colors, fonts } = require('../lib/colors');

const W = 800, H = 130;
const CARD_W = 238, CARD_H = 90, CARD_GAP = 23, START_X = 30, START_Y = 20;

function generateStatsSVG(config) {
  const { stats } = config;

  const defs = `
  ${dotGridPattern('stats-dots', 22, 0.65, '#1a2235')}
  ${glowFilter('glow-cyan', 5, colors.cyan)}`;

  const sectionLabel = text({ x: W / 2, y: 14, content: 'AT A GLANCE', size: 9, fill: colors.textDim, anchor: 'middle', font: fonts.mono, spacing: 3 });

  const cardsSvg = (stats || []).slice(0, 3).map((s, i) => {
    const x = START_X + i * (CARD_W + CARD_GAP);
    const y = START_Y;
    const isLast = i === stats.length - 1;

    // Accent colors cycle
    const accent = [colors.cyan, colors.textSecondary, colors.gold][i] || colors.cyan;
    const accentDim = [colors.cyanDim, colors.cardBg, colors.goldDim][i] || colors.cyanDim;
    const accentBorder = [colors.cyanBorder, colors.cardBorder, colors.goldBorder][i] || colors.cyanBorder;

    const isEmoji = /\p{Emoji}/u.test(String(s.value));
    const valueSize = isEmoji ? 22 : 28;

    return `<g>
    ${rect({ x, y, w: CARD_W, h: CARD_H, rx: 10, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
    <!-- Top accent line -->
    <line x1="${x + 20}" y1="${y}" x2="${x + CARD_W - 20}" y2="${y}" stroke="${accent}" stroke-width="1.5" opacity="0.7"/>
    ${text({ x: x + 22, y: y + 40, content: s.value, size: valueSize, fill: accent, weight: '700', font: fonts.sans })}
    ${text({ x: x + 22, y: y + 62, content: s.label, size: 11.5, fill: colors.textSecondary, font: fonts.sans })}
  </g>`;
  }).join('\n');

  const content = `
  <rect width="${W}" height="${H}" fill="${colors.pageBg}" rx="0"/>
  <rect width="${W}" height="${H}" fill="url(#stats-dots)" opacity="0.5"/>
  ${sectionLabel}
  ${cardsSvg}`;

  return svgWrap(W, H, content, defs);
}

module.exports = { generateStatsSVG };
