#!/usr/bin/env node
/**
 * generate-readme.js
 * ──────────────────────────────────────────────────────────────────────────────
 * Main entry point for the GitHub profile generator.
 * Reads config/profile.json and outputs:
 *   - svg/*.svg (all visual sections)
 *   - svg/projects/*.svg (individual project cards)
 *   - README.md
 *
 * Usage:
 *   node scripts/generate-readme.js
 *   npm run generate
 * ──────────────────────────────────────────────────────────────────────────────
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.join(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, 'config', 'profile.json');
const SVG_DIR     = path.join(ROOT, 'svg');
const PROJ_DIR    = path.join(SVG_DIR, 'projects');
const README_PATH = path.join(ROOT, 'README.md');

// ─── Ensure output directories exist ────────────────────────────────────────
[SVG_DIR, PROJ_DIR].forEach(d => fs.mkdirSync(d, { recursive: true }));

// ─── Load config ─────────────────────────────────────────────────────────────
if (!fs.existsSync(CONFIG_PATH)) {
  console.error('ERROR: config/profile.json not found.');
  process.exit(1);
}
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
console.log(`[generate] Loaded config for: ${config.personal.name}`);

// ─── Load SVG generators ──────────────────────────────────────────────────────
const { generateHeroSVG }       = require('./svg/hero');
const { generateStatsSVG }      = require('./svg/stats');
const { generateProjectSVG }    = require('./svg/project-card');
const { generateTechStackSVG }  = require('./svg/tech-stack');
const { generateJourneySVG }    = require('./svg/journey');
const { generateConnectSVG }    = require('./svg/connect');

// ─── Generate and write SVGs ──────────────────────────────────────────────────
function writeSVG(filePath, svgContent) {
  fs.writeFileSync(filePath, svgContent, 'utf8');
  console.log(`[svg] wrote ${path.relative(ROOT, filePath)}`);
}

// Hero
writeSVG(path.join(SVG_DIR, 'hero.svg'), generateHeroSVG(config));

// Stats
writeSVG(path.join(SVG_DIR, 'stats.svg'), generateStatsSVG(config));

// Projects
(config.projects || []).forEach(project => {
  writeSVG(path.join(PROJ_DIR, `${project.id}.svg`), generateProjectSVG(project));
});

// Tech Stack
const { svg: techStackSvg } = generateTechStackSVG(config);
writeSVG(path.join(SVG_DIR, 'tech-stack.svg'), techStackSvg);

// Journey
writeSVG(path.join(SVG_DIR, 'journey.svg'), generateJourneySVG(config));

// Connect
writeSVG(path.join(SVG_DIR, 'connect.svg'), generateConnectSVG(config));

// Connector (static — written once, reused)
const connectorSVG = buildConnectorSVG();
writeSVG(path.join(SVG_DIR, 'connector.svg'), connectorSVG);

// ─── Connector SVG (static, reusable between sections) ───────────────────────
function buildConnectorSVG() {
  const { colors } = require('./lib/colors');
  return `<svg width="800" height="52" viewBox="0 0 800 52" xmlns="http://www.w3.org/2000/svg">
<defs>
  <style>@keyframes pulse{0%,100%{opacity:.2}50%{opacity:.8}}.dot{animation:pulse 2.5s ease-in-out infinite}</style>
</defs>
<line x1="400" y1="0" x2="400" y2="36" stroke="${colors.cardBorder}" stroke-width="1"/>
<circle cx="400" cy="42" r="5" fill="none" stroke="${colors.cyanBorder}" stroke-width="1" class="dot"/>
<circle cx="400" cy="42" r="2.5" fill="${colors.cyan}" opacity="0.7" class="dot"/>
</svg>`;
}

// ─── Generate README.md ───────────────────────────────────────────────────────
function generateREADME(config) {
  const { personal, contact } = config;
  const ghUser = contact.github || '';
  const projectIds = (config.projects || []).map(p => p.id);

  const linkedinUrl = contact.linkedin ? `https://linkedin.com/in/${contact.linkedin}` : '';

  // GitHub stats widget URLs (themed to match design)
  const statsTheme = `transparent&hide_border=true&title_color=58d6ff&icon_color=a371f7&text_color=8b949e&bg_color=0d1320&ring_color=58d6ff`;
  const statsUrl   = `https://github-readme-stats.vercel.app/api?username=${ghUser}&show_icons=true&theme=${statsTheme}&line_height=28&include_all_commits=true`;
  const langsUrl   = `https://github-readme-stats.vercel.app/api/top-langs/?username=${ghUser}&layout=compact&theme=${statsTheme}&langs_count=6`;
  const streakUrl  = `https://github-readme-streak-stats.herokuapp.com?user=${ghUser}&theme=transparent&hide_border=true&stroke=1c2333&ring=58d6ff&fire=a371f7&currStreakLabel=58d6ff&sideLabels=8b949e&dates=484f58&background=0d1320`;

  // Section: hero
  const hero = `<div align="center">
<img src="svg/hero.svg" width="100%" alt="${personal.name} — ${personal.title}" />
</div>`;

  // Section: stats
  const stats = `<div align="center">
<img src="svg/stats.svg" width="100%" alt="At a Glance" />
</div>`;

  // Section: featured work
  const featuredLabel = `<div align="center">

<!--suppress HtmlUnknownAttribute -->
<sub><code>FEATURED WORK</code></sub>

</div>`;

  const projectCards = (config.projects || []).map(p =>
    `<div align="center">\n<img src="svg/projects/${p.id}.svg" width="100%" alt="${p.name}" />\n</div>`
  ).join('\n\n');

  // Section: tech stack
  const techStack = `<div align="center">
<img src="svg/tech-stack.svg" width="100%" alt="Tech Stack" />
</div>`;

  // Section: journey
  const journey = `<div align="center">
<img src="svg/journey.svg" width="100%" alt="Journey" />
</div>`;

  // Section: github analytics — wrapped in center div
  const analytics = `<div align="center">

<sub><code>GITHUB</code></sub>

<br/><br/>

<table border="0" cellspacing="0" cellpadding="0">
<tr>
<td align="center">
<img src="${statsUrl}" height="170" alt="GitHub Stats" />
</td>
<td align="center">
<img src="${langsUrl}" height="170" alt="Top Languages" />
</td>
</tr>
</table>

<br/>

<img src="${streakUrl}" height="120" alt="Streak Stats" />

</div>`;

  // Section: connect
  const connect = `<div align="center">
<img src="svg/connect.svg" width="100%" alt="Let's Connect" />
</div>`;

  // Connector div (reusable)
  const connector = `<div align="center">
<img src="svg/connector.svg" width="100%" alt="" />
</div>`;

  // Assemble final README
  const readme = [
    `<!-- ⚠️ This file is auto-generated. Edit config/profile.json and run \`npm run generate\` to update. -->`,
    `<!--`,
    `  ${personal.name} · GitHub Profile`,
    `  Config-driven premium developer profile.`,
    `  Source of truth: config/profile.json`,
    `-->`,
    ``,
    hero,
    ``,
    connector,
    ``,
    stats,
    ``,
    connector,
    ``,
    featuredLabel,
    ``,
    projectCards,
    ``,
    connector,
    ``,
    techStack,
    ``,
    connector,
    ``,
    journey,
    ``,
    connector,
    ``,
    analytics,
    ``,
    connector,
    ``,
    connect,
    ``,
    `<!-- Generated by scripts/generate-readme.js at ${new Date().toISOString()} -->`,
  ].join('\n');

  return readme;
}

const readme = generateREADME(config);
fs.writeFileSync(README_PATH, readme, 'utf8');
console.log(`[readme] wrote README.md`);
console.log(`\n✓ Profile generation complete!`);
console.log(`  Push to GitHub to see your profile at https://github.com/${config.contact.github}`);
