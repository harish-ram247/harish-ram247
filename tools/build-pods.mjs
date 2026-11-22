// Builds assets/pods.svg: projects shown as `kubectl get pods` output.
// AGE is computed from each repo's creation date, so the daily workflow keeps it current.
// Edit the `pods` list below to add projects or change their status.
// Run: node tools/build-pods.mjs   (set GITHUB_TOKEN to avoid REST rate limits)
import { writeFile } from 'node:fs/promises';

const USER = 'harish-ram247';

// status: Running | Pending | ContainerCreating | Completed | CrashLoopBackOff
const pods = [
  { name: 'kavrix-ai-safety',  repo: 'Kavrix',          ready: '3/3', status: 'Running', restarts: 2, image: 'python · yolov8' },
  { name: 'spendwise-app',     repo: 'Expense_Tracker', ready: '1/1', status: 'Running', restarts: 0, image: 'react-native · sqlite' },
  { name: 'trace-rag-backend', repo: 'TRACE',           ready: '0/2', status: 'Pending', restarts: 0, image: 'python · rag · docker' },
  { name: 'portfolio-web',     repo: 'My-Portfolio',    ready: '1/1', status: 'Running', restarts: 5, image: 'next.js · gsap' },
];
const footer = { event: 'Awarded', note: 'runner-up · IEEE TEMS × IIM Indore Hackathon' };

const C = { bg: '#0d1117', line: '#30363d', sep: '#21262d', text: '#c9d1d9', hi: '#e6edf3', dim: '#6e7681', mute: '#8b949e', ok: '#7ee787', blue: '#79c0ff', crystal: '#C5DAFF', warn: '#e3b341', bad: '#f85149' };
const STATUS = { Running: C.ok, Pending: C.warn, ContainerCreating: C.warn, Completed: C.blue, CrashLoopBackOff: C.bad };
const FONT = `'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, Menlo, monospace`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const headers = { 'User-Agent': 'profile-pods-builder', Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

function age(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 864e5);
  if (days >= 365) { const y = Math.floor(days / 365), m = Math.floor((days % 365) / 30); return m ? `${y}y${m}mo` : `${y}y`; }
  if (days >= 60) return `${Math.floor(days / 30)}mo`;
  if (days >= 14) return `${Math.floor(days / 7)}w`;
  return `${days}d`;
}

for (const p of pods) {
  try {
    const r = await fetch(`https://api.github.com/repos/${USER}/${p.repo}`, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    p.age = age((await r.json()).created_at);
  } catch (e) {
    console.warn(`${p.repo}: ${e.message}`);
    p.age = '<unknown>';
  }
}

const W = 880, PAD = 32, TOP = 76, ROW = 30;
const cols = [PAD, 250, 316, 498, 594, 666]; // NAME READY STATUS RESTARTS AGE IMAGE
const H = TOP + pods.length * ROW + 78;
const running = pods.filter(p => p.status === 'Running').length;

let rows = '';
pods.forEach((p, i) => {
  const y = TOP + 24 + i * ROW;
  const color = STATUS[p.status] || C.mute;
  const begin = (0.9 + i * 0.25).toFixed(2);
  const pulse = p.status === 'Pending' || p.status === 'ContainerCreating'
    ? `<animate attributeName="opacity" values="1;0.25;1" dur="1.4s" repeatCount="indefinite"/>`
    : `<animate attributeName="r" values="3.5;5;3.5" dur="2.4s" begin="${(i * 0.4).toFixed(1)}s" repeatCount="indefinite"/>`;
  rows += `<g opacity="0"><set attributeName="opacity" to="1" begin="${begin}s" fill="freeze"/>`
    + `<text x="${cols[0]}" y="${y}" fill="${C.hi}">${esc(p.name)}</text>`
    + `<text x="${cols[1]}" y="${y}" fill="${C.text}">${esc(p.ready)}</text>`
    + `<circle cx="${cols[2] + 4}" cy="${y - 4.5}" r="3.5" fill="${color}">${pulse}</circle>`
    + `<text x="${cols[2] + 16}" y="${y}" fill="${color}">${esc(p.status)}</text>`
    + `<text x="${cols[3]}" y="${y}" fill="${C.text}">${p.restarts}</text>`
    + `<text x="${cols[4]}" y="${y}" fill="${C.text}">${esc(p.age)}</text>`
    + `<text x="${cols[5]}" y="${y}" fill="${C.mute}">${esc(p.image)}</text>`
    + `</g>`;
});

const heads = ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE', 'IMAGE'];
const fy = H - 28;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Projects as Kubernetes pods: ${pods.map(p => `${p.name} ${p.status}`).join(', ')}">
<style>text{font-family:${FONT};font-size:13px}</style>
<defs><clipPath id="cmd"><rect x="${PAD + 40}" y="14" height="24" width="0"><animate attributeName="width" from="0" to="260" begin="0.2s" dur="0.6s" fill="freeze"/></rect></clipPath></defs>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>
<text x="${PAD}" y="30"><tspan fill="${C.ok}">λ</tspan> <tspan fill="${C.blue}">~</tspan></text>
<g clip-path="url(#cmd)"><text x="${PAD + 40}" y="30" fill="${C.text}">kubectl get pods -n harish</text></g>
<text x="${W - PAD}" y="30" fill="${C.dim}" font-size="11" text-anchor="end">context: agentic-ai</text>
<line x1="0" y1="44" x2="${W}" y2="44" stroke="${C.sep}"/>
<g opacity="0"><set attributeName="opacity" to="1" begin="0.8s" fill="freeze"/>${heads.map((h, i) => `<text x="${i === 2 ? cols[i] + 16 : cols[i]}" y="${TOP}" fill="${C.dim}" font-size="11.5">${h}</text>`).join('')}</g>
${rows}
<line x1="${PAD}" y1="${fy - 22}" x2="${W - PAD}" y2="${fy - 22}" stroke="${C.sep}"/>
<g opacity="0"><set attributeName="opacity" to="1" begin="${(1.2 + pods.length * 0.25).toFixed(2)}s" fill="freeze"/>
<text x="${PAD}" y="${fy}" fill="${C.dim}">pods: <tspan fill="${C.crystal}">${running}/${pods.length} running</tspan>  ·  last event: <tspan fill="${C.blue}">Normal</tspan> <tspan fill="${C.hi}">${esc(footer.event)}</tspan>  <tspan fill="${C.mute}">${esc(footer.note)}</tspan></text>
</g>
</svg>
`;

await writeFile(new URL('../assets/pods.svg', import.meta.url), svg);
console.log(`pods: ${pods.map(p => `${p.name}=${p.age}`).join(', ')}`);
