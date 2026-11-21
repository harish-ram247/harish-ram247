// Builds assets/stats.svg and assets/activity.svg from public GitHub data.
// No third-party image services: the README shows files from this repo, and a
// scheduled workflow (.github/workflows/stats.yml) re-runs this daily.
// Run: node tools/build-stats.mjs   (set GITHUB_TOKEN to avoid REST rate limits)
import { writeFile } from 'node:fs/promises';

const USER = 'harish-ram247';
const headers = { 'User-Agent': 'profile-stats-builder', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

const C = { bg: '#0d1117', line: '#30363d', sep: '#21262d', text: '#c9d1d9', hi: '#e6edf3', dim: '#6e7681', mute: '#8b949e', acc: '#ff7a59', ok: '#7ee787', blue: '#79c0ff' };
const LANG = { Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a', Java: '#b07219', 'Jupyter Notebook': '#DA5B0B', HTML: '#e34c26', CSS: '#663399', Shell: '#89e051', Dockerfile: '#384d54' };
const FONT = `'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, Menlo, monospace`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function api(path) {
  const r = await fetch(`https://api.github.com${path}`, { headers });
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return r.json();
}

// ---- data -------------------------------------------------------------------
const user = await api(`/users/${USER}`);
const repos = (await api(`/users/${USER}/repos?per_page=100&type=owner`)).filter(r => !r.fork);
const stars = repos.reduce((n, r) => n + r.stargazers_count, 0);

const bytes = {};
for (const r of repos) {
  const langs = await api(`/repos/${USER}/${r.name}/languages`);
  for (const [l, b] of Object.entries(langs)) bytes[l] = (bytes[l] || 0) + b;
}
const totalBytes = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
const top = Object.entries(bytes).sort((a, b) => b[1] - a[1]).slice(0, 6)
  .map(([name, b]) => ({ name, pct: (b / totalBytes) * 100, color: LANG[name] || C.mute }));

// Public contribution calendar (same data as the green grid on the profile).
const html = await (await fetch(`https://github.com/users/${USER}/contributions`, { headers: { 'User-Agent': headers['User-Agent'] } })).text();
const counts = {};
for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
  const n = m[2].match(/^(\d[\d,]*) contribution/);
  counts[m[1]] = n ? Number(n[1].replace(/,/g, '')) : 0;
}
const days = [];
for (const m of html.matchAll(/<td[^>]*data-date="([^"]+)"[^>]*>/g)) {
  const id = m[0].match(/id="([^"]+)"/)?.[1];
  days.push({ date: m[1], n: counts[id] ?? 0 });
}
if (!days.length) throw new Error('could not read the contribution calendar');
days.sort((a, b) => a.date.localeCompare(b.date));

const total = days.reduce((s, d) => s + d.n, 0);
let longest = 0, run = 0;
for (const d of days) { run = d.n ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0, i = days.length - 1;
if (days[i].n === 0) i--; // today may simply not have commits yet
for (; i >= 0 && days[i].n; i--) current++;
const activeDays = days.filter(d => d.n).length;

// ---- icons (16×16, stroke) ---------------------------------------------------
const ic = {
  repo: `<path d="M3 2.5h8.5a1 1 0 0 1 1 1V13H4.5a1.5 1.5 0 0 1 0-3h8"/><path d="M3 2.5v9"/>`,
  star: `<path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/>`,
  people: `<circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5c.5-2.5 2.3-4 4.5-4s4 1.5 4.5 4"/><path d="M10.5 3.3a2.4 2.4 0 0 1 0 4.5M12 9.8c1.3.6 2.2 1.9 2.5 3.7"/>`,
  commit: `<circle cx="8" cy="8" r="2.8"/><path d="M1 8h4.2M10.8 8H15"/>`,
  flame: `<path d="M8 1.5c.5 2.6 4.5 4.3 4.5 8a4.5 4.5 0 0 1-9 0c0-2 1-3.2 2-4 0 1.5.8 2.5 1.8 2.8C6.8 6.5 7 4 8 1.5z"/>`,
  trophy: `<path d="M5 2h6v4a3 3 0 0 1-6 0z"/><path d="M5 3.5H2.5a2.5 2.5 0 0 0 2.6 3M11 3.5h2.5a2.5 2.5 0 0 1-2.6 3M8 9v3M5.5 14h5M6.5 12h3"/>`,
  calendar: `<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>`,
};
const icon = (name, x, y, color = C.acc) =>
  `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${ic[name]}</g>`;

const card = (w, h, cmd, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(cmd)}">
<style>text{font-family:${FONT}}</style>
<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
<text x="32" y="30" font-size="13" fill="${C.text}"><tspan fill="${C.ok}">λ</tspan> <tspan fill="${C.blue}">~</tspan>  ${esc(cmd)}</text>
<line x1="0" y1="44" x2="${w}" y2="44" stroke="${C.sep}"/>
${body}</svg>
`;

// ---- stats card ---------------------------------------------------------------
const W = 880, H = 270;
const metrics = [
  ['repo', 'public repos', repos.length],
  ['star', 'stars earned', stars],
  ['people', 'followers', user.followers],
  ['commit', 'contributions (1y)', total],
  ['flame', 'current streak', `${current} day${current === 1 ? '' : 's'}`],
  ['trophy', 'longest streak', `${longest} day${longest === 1 ? '' : 's'}`],
];
let s = '';
metrics.forEach(([ic_, label, value], k) => {
  const y = 66 + k * 30;
  s += icon(ic_, 32, y);
  s += `<text x="58" y="${y + 12.5}" font-size="13.5" fill="${C.mute}">${esc(label)}</text>`;
  s += `<text x="372" y="${y + 12.5}" font-size="13.5" fill="${C.hi}" font-weight="700" text-anchor="end">${esc(value)}</text>`;
});
s += `<line x1="412" y1="64" x2="412" y2="246" stroke="${C.sep}"/>`;
// languages
const LX = 444, LW = W - LX - 32;
s += icon('calendar', LX, 65, C.acc);
s += `<text x="${LX + 26}" y="77" font-size="13" fill="${C.dim}">// top languages · by bytes</text>`;
let bx = LX;
s += `<clipPath id="bar"><rect x="${LX}" y="94" width="${LW}" height="8" rx="4"/></clipPath><g clip-path="url(#bar)">`;
for (const l of top) { const w = (l.pct / 100) * LW; s += `<rect x="${bx}" y="94" width="${w + 0.5}" height="8" fill="${l.color}"/>`; bx += w; }
s += `<rect x="${bx}" y="94" width="${LX + LW - bx}" height="8" fill="${C.sep}"/></g>`;
top.forEach((l, k) => {
  const x = LX + (k % 2) * (LW / 2), y = 132 + Math.floor(k / 2) * 34;
  s += `<circle cx="${x + 5}" cy="${y - 4.5}" r="5" fill="${l.color}"/>`;
  s += `<text x="${x + 18}" y="${y}" font-size="13" fill="${C.text}">${esc(l.name)}</text>`;
  s += `<text x="${x + LW / 2 - 16}" y="${y}" font-size="13" fill="${C.dim}" text-anchor="end">${l.pct.toFixed(1)}%</text>`;
});
const stamp = new Date().toISOString().slice(0, 10);
s += `<text x="${W - 32}" y="${H - 18}" font-size="10.5" fill="${C.dim}" text-anchor="end">updated ${stamp}</text>`;
await writeFile(new URL('../assets/stats.svg', import.meta.url), card(W, H, 'git stats --me', s));

// ---- activity heatmap ---------------------------------------------------------
const CELL = 12, GAPX = 3, AX = 56, AY = 84;
const levels = [C.sep, '#5a2f24', '#8f442d', '#c95a3a', C.acc];
const max = Math.max(...days.map(d => d.n), 1);
const lvl = n => (n === 0 ? 0 : Math.min(4, Math.ceil((n / max) * 4)));
const first = new Date(days[0].date + 'T00:00:00Z');
const offset = first.getUTCDay();
let a = '';
let lastMonth = -1;
days.forEach((d, k) => {
  const idx = k + offset, col = Math.floor(idx / 7), row = idx % 7;
  const x = AX + col * (CELL + GAPX), y = AY + row * (CELL + GAPX);
  a += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="${levels[lvl(d.n)]}"/>`;
  const dt = new Date(d.date + 'T00:00:00Z');
  if (row === 0 && dt.getUTCMonth() !== lastMonth && dt.getUTCDate() <= 7) {
    lastMonth = dt.getUTCMonth();
    a += `<text x="${x}" y="${AY - 10}" font-size="10.5" fill="${C.dim}">${dt.toLocaleString('en', { month: 'short', timeZone: 'UTC' }).toLowerCase()}</text>`;
  }
});
['mon', 'wed', 'fri'].forEach((d, k) => { a += `<text x="${AX - 10}" y="${AY + (1 + 2 * k) * (CELL + GAPX) + 10}" font-size="10" fill="${C.dim}" text-anchor="end">${d}</text>`; });
const AH = AY + 7 * (CELL + GAPX) + 44;
a += `<text x="32" y="${AH - 18}" font-size="12" fill="${C.mute}"><tspan fill="${C.hi}" font-weight="700">${total}</tspan> contributions · <tspan fill="${C.hi}" font-weight="700">${activeDays}</tspan> active days in the last year</text>`;
a += `<text x="${W - 32 - 5 * 15 - 34}" y="${AH - 18}" font-size="10.5" fill="${C.dim}" text-anchor="end">less</text>`;
levels.forEach((c, k) => { a += `<rect x="${W - 32 - 5 * 15 - 28 + k * 15}" y="${AH - 28}" width="${CELL}" height="${CELL}" rx="2.5" fill="${c}"/>`; });
a += `<text x="${W - 32}" y="${AH - 18}" font-size="10.5" fill="${C.dim}" text-anchor="end">more</text>`;
await writeFile(new URL('../assets/activity.svg', import.meta.url), card(W, AH, 'git log --graph --since=1.year', a));

console.log(`stats: ${repos.length} repos, ${stars} stars, ${total} contributions, streak ${current}/${longest}`);
