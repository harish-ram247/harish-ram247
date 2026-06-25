/**
 * Generates svg/connect.svg — premium contact footer.
 * Only shows links that have values set in config.contact.
 */

const { svgWrap, rect, text, circle, glowFilter, dotGridPattern, linearGrad } = require('../lib/svg-helpers');
const { colors, fonts } = require('../lib/colors');

const W = 800, H = 110;

const LINK_DEFS = [
  { key: 'github',     label: 'GitHub',      color: colors.textSecondary, prefix: 'github.com/' },
  { key: 'linkedin',   label: 'LinkedIn',    color: '#58a6ff',            prefix: 'linkedin.com/in/' },
  { key: 'portfolio',  label: 'Portfolio',   color: colors.cyan,          prefix: '' },
  { key: 'email',      label: 'Email',       color: colors.textSecondary, prefix: 'mailto:' },
  { key: 'leetcode',   label: 'LeetCode',    color: '#ffa116',            prefix: '' },
  { key: 'hackerrank', label: 'HackerRank',  color: '#00ea64',            prefix: '' },
  { key: 'medium',     label: 'Medium',      color: colors.textSecondary, prefix: '' },
  { key: 'devto',      label: 'Dev.to',      color: colors.textSecondary, prefix: '' },
  { key: 'twitter',    label: 'Twitter / X', color: colors.textSecondary, prefix: '' },
  { key: 'youtube',    label: 'YouTube',     color: '#ff4040',            prefix: '' },
];

function generateConnectSVG(config) {
  const { contact, personal } = config;

  const defs = `
  ${dotGridPattern('c-dots', 22, 0.65, '#141c2e')}
  ${linearGrad('c-top', [
    { offset: '0%', color: colors.cyanBorder, opacity: 0 },
    { offset: '50%', color: colors.cyanBorder, opacity: 0.5 },
    { offset: '100%', color: colors.purpleBorder, opacity: 0.5 },
  ])}`;

  const sectionLabel = text({ x: W / 2, y: 20, content: "LET'S CONNECT", size: 9, fill: colors.textDim, anchor: 'middle', font: fonts.mono, spacing: 3 });

  // Only render links that have values
  const activeLinks = LINK_DEFS.filter(l => contact[l.key] && contact[l.key].trim() !== '');

  // Horizontal layout
  const btnH = 30, btnGap = 10;
  const totalBtnW = activeLinks.reduce((sum, l) => sum + l.label.length * 7.5 + 28 + btnGap, 0) - btnGap;
  let btnX = (W - totalBtnW) / 2;
  const btnY = 38;

  const btnsSvg = activeLinks.map(l => {
    const bw = l.label.length * 7.5 + 28;
    const el = `<g>
      ${rect({ x: btnX, y: btnY, w: bw, h: btnH, rx: 6, fill: colors.cardBg, stroke: colors.cardBorder, sw: 0.7 })}
      ${text({ x: btnX + bw / 2, y: btnY + 20, content: l.label, size: 11, fill: l.color, anchor: 'middle', font: fonts.sans })}
    </g>`;
    btnX += bw + btnGap;
    return el;
  }).join('\n');

  // Footer note
  const footerNote = [
    personal.availability ? `Open to internships · collaborations · research · interesting problems` : null,
    `${personal.timezone} (${personal.location})`,
  ].filter(Boolean).join('  ·  ');

  const footerEl = text({ x: W / 2, y: 94, content: footerNote, size: 10, fill: colors.textDim, anchor: 'middle', font: fonts.sans });

  const content = `
  <rect width="${W}" height="${H}" fill="${colors.pageBg}"/>
  <rect width="${W}" height="${H}" fill="url(#c-dots)" opacity="0.5"/>
  <line x1="0" y1="0" x2="${W}" y2="0" stroke="url(#c-top)" stroke-width="1"/>
  ${sectionLabel}
  ${btnsSvg}
  ${footerEl}`;

  return svgWrap(W, H, content, defs);
}

module.exports = { generateConnectSVG };
