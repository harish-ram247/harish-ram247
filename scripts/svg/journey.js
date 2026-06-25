/**
 * Generates svg/journey.svg — connected timeline.
 */

const { svgWrap, rect, circle, line, text, textLines, glowFilter, dotGridPattern } = require('../lib/svg-helpers');
const { colors, accentMap, fonts } = require('../lib/colors');

const W = 800;
const LINE_X = 90;
const ITEM_START_Y = 54;
const ITEM_GAP = 80;

function generateJourneySVG(config) {
  const { journey } = config;

  const colorMap = {
    cyan: colors.cyan,
    green: colors.green,
    gold: colors.gold,
    purple: colors.purple,
  };

  const dimMap = {
    cyan: colors.cyanDim,
    green: colors.greenDim,
    gold: colors.goldDim,
    purple: colors.purpleDim,
  };

  const borderMap = {
    cyan: colors.cyanBorder,
    green: colors.greenBorder,
    gold: colors.goldBorder,
    purple: colors.purpleBorder,
  };

  const defs = `
  ${dotGridPattern('j-dots', 22, 0.65, '#141c2e')}
  ${glowFilter('j-glow', 6)}`;

  const sectionLabel = text({ x: W / 2, y: 22, content: 'JOURNEY', size: 9, fill: colors.textDim, anchor: 'middle', font: fonts.mono, spacing: 3 });

  const items = journey || [];
  const H = ITEM_START_Y + items.length * ITEM_GAP + 30;

  // Vertical timeline line
  const timelineLineY1 = ITEM_START_Y + 6;
  const timelineLineY2 = ITEM_START_Y + (items.length - 1) * ITEM_GAP + 6;
  const timelineLine = `<line x1="${LINE_X}" y1="${timelineLineY1}" x2="${LINE_X}" y2="${timelineLineY2}" stroke="${colors.cardBorder}" stroke-width="1.5"/>`;

  const itemsSvg = items.map((item, i) => {
    const y = ITEM_START_Y + i * ITEM_GAP;
    const accentColor = colorMap[item.color] || colors.cyan;
    const accentDim = dimMap[item.color] || colors.cyanDim;
    const accentBorder = borderMap[item.color] || colors.cyanBorder;
    const isCurrent = item.type === 'current';

    // Year pill (left of line)
    const yearPill = `<g>
      ${rect({ x: 10, y: y - 8, w: 60, h: 22, rx: 11, fill: accentDim, stroke: accentBorder, sw: 0.7 })}
      ${text({ x: 40, y: y + 7, content: item.year, size: 10, fill: accentColor, anchor: 'middle', font: fonts.mono, weight: isCurrent ? '700' : 'normal' })}
    </g>`;

    // Node on line
    const node = isCurrent
      ? `<g>
          ${circle({ cx: LINE_X, cy: y + 6, r: 8, fill: accentDim, stroke: accentColor, sw: 1.5 })}
          ${circle({ cx: LINE_X, cy: y + 6, r: 4, fill: accentColor, cls: 'pulse-fast' })}
        </g>`
      : `<g>
          ${circle({ cx: LINE_X, cy: y + 6, r: 6, fill: accentDim, stroke: accentColor, sw: 1 })}
          ${circle({ cx: LINE_X, cy: y + 6, r: 2.5, fill: accentColor })}
        </g>`;

    // Content card
    const cardX = LINE_X + 22;
    const cardW = W - cardX - 20;
    const content_ = `<g>
      ${rect({ x: cardX, y: y - 8, w: cardW, h: 58, rx: 8, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
      <line x1="${cardX + 14}" y1="${y - 8}" x2="${cardX + 80}" y2="${y - 8}" stroke="${accentColor}" stroke-width="1.2" opacity="0.7"/>
      ${text({ x: cardX + 14, y: y + 10, content: item.title, size: 13, fill: colors.textPrimary, font: fonts.sans, weight: '600' })}
      ${text({ x: cardX + 14, y: y + 28, content: item.description, size: 11, fill: colors.textSecondary, font: fonts.sans })}
    </g>`;

    return `<g>${yearPill}${node}${content_}</g>`;
  }).join('\n');

  const content = `
  <rect width="${W}" height="${H}" fill="${colors.pageBg}"/>
  <rect width="${W}" height="${H}" fill="url(#j-dots)" opacity="0.5"/>
  ${sectionLabel}
  ${timelineLine}
  ${itemsSvg}`;

  return svgWrap(W, H, content, defs);
}

module.exports = { generateJourneySVG };
