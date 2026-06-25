/**
 * Generates svg/tech-stack.svg — tech categories with chips.
 */

const { svgWrap, rect, text, glowFilter, dotGridPattern, linearGrad } = require('../lib/svg-helpers');
const { colors, accentMap, fonts } = require('../lib/colors');

const W = 800;

function generateTechStackSVG(config) {
  const { techStack } = config;
  const categories = Object.entries(techStack || {});

  const defs = `
  ${dotGridPattern('ts-dots', 22, 0.65, '#141c2e')}`;

  const sectionLabel = text({ x: W / 2, y: 22, content: 'TECH STACK', size: 9, fill: colors.textDim, anchor: 'middle', font: fonts.mono, spacing: 3 });

  const CARD_GAP = 16;
  const START_X = 20;
  const START_Y = 36;
  const CARD_W = (W - 2 * START_X - CARD_GAP * (Math.min(categories.length, 2) - 1)) / 2;

  let parts = [];
  let maxEndY = START_Y;

  // Layout in 2-column grid
  categories.forEach(([category, data], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const items = data.items || data;
    const accentKey = data.accent || 'cyan';
    const accent = accentMap[accentKey] || accentMap.cyan;
    const accentColor = accent.main;
    const accentDim = accent.dim;
    const accentBorder = accent.border;

    // Calculate chip layout
    const chipH = 22, chipGap = 7, chipRowGap = 8;
    let chipX = 0, chipY = 0, chipW = CARD_W - 40;
    let chipParts = [], maxChipY = 0;

    (items || []).forEach(tech => {
      const w = tech.length * 7.5 + 22;
      if (chipX + w > chipW && chipX > 0) {
        chipX = 0;
        chipY += chipH + chipRowGap;
      }
      chipParts.push(`<g>
        ${rect({ x: chipX, y: chipY, w, h: chipH, rx: 11, fill: accentDim, stroke: accentBorder, sw: 0.7 })}
        ${text({ x: chipX + w / 2, y: chipY + 15.5, content: tech, size: 10, fill: accentColor, anchor: 'middle', font: fonts.mono })}
      </g>`);
      chipX += w + chipGap;
      maxChipY = chipY + chipH;
    });

    const cardInnerH = maxChipY + 28 + 18; // padding
    const cardH = Math.max(80, cardInnerH);
    const cardX = START_X + col * (CARD_W + CARD_GAP);
    const cardY = row === 0 ? START_Y : maxEndY + CARD_GAP;

    // Only update maxEndY at end of row (col 1 or last)
    const thisEndY = cardY + cardH;
    if (col === 1 || i === categories.length - 1) {
      maxEndY = Math.max(maxEndY, thisEndY);
    }

    parts.push(`<g>
      ${rect({ x: cardX, y: cardY, w: CARD_W, h: cardH, rx: 10, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.8 })}
      <line x1="${cardX + 18}" y1="${cardY}" x2="${cardX + 100}" y2="${cardY}" stroke="${accentColor}" stroke-width="1.5" opacity="0.7"/>
      ${text({ x: cardX + 18, y: cardY + 22, content: category, size: 10.5, fill: accentColor, font: fonts.sans, weight: '600', spacing: 0.5 })}
      <g transform="translate(${cardX + 18}, ${cardY + 34})">${chipParts.join('\n')}</g>
    </g>`);
  });

  const H = maxEndY + 24;

  const content = `
  <rect width="${W}" height="${H}" fill="${colors.pageBg}"/>
  <rect width="${W}" height="${H}" fill="url(#ts-dots)" opacity="0.5"/>
  ${sectionLabel}
  ${parts.join('\n')}`;

  return { svg: svgWrap(W, H, content, defs), height: H };
}

module.exports = { generateTechStackSVG };
