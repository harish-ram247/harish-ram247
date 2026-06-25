/**
 * Design token constants.
 * All colors, fonts, and spacing values for the profile system.
 */

const colors = {
  pageBg:       '#0a0e17',
  cardBg:       '#0d1320',
  cardBgAlt:    '#0b1018',
  cardBorder:   '#1c2333',
  cardBorderHover: '#2a3a50',

  textPrimary:   '#e6edf3',
  textSecondary: '#8b949e',
  textDim:       '#484f58',

  cyan:          '#58d6ff',
  cyanDim:       '#071c2e',
  cyanBorder:    '#1a3a52',
  cyanMid:       '#1e4a6a',

  purple:        '#a371f7',
  purpleDim:     '#120b2a',
  purpleBorder:  '#2a1860',

  green:         '#3fb950',
  greenDim:      '#0a1f0d',
  greenBorder:   '#1a3a1a',

  gold:          '#e3b341',
  goldDim:       '#1e1502',
  goldBorder:    '#3a2804',

  red:           '#f85149',
};

const accentMap = {
  cyan:   { main: colors.cyan,   dim: colors.cyanDim,   border: colors.cyanBorder },
  purple: { main: colors.purple, dim: colors.purpleDim, border: colors.purpleBorder },
  green:  { main: colors.green,  dim: colors.greenDim,  border: colors.greenBorder },
  gold:   { main: colors.gold,   dim: colors.goldDim,   border: colors.goldBorder },
};

const fonts = {
  sans:  "'Segoe UI', -apple-system, BlinkMacSystemFont, Arial, sans-serif",
  mono:  "'SF Mono', 'Fira Code', 'Fira Mono', 'Cascadia Code', 'Courier New', monospace",
};

module.exports = { colors, accentMap, fonts };
