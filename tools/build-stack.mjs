// Builds assets/stack.svg: a self-hosted tech-stack card.
// Icons come from skillicons.dev (MIT, github.com/tandpfun/skill-icons) and are
// inlined so the README never depends on a third-party image service at view time.
// Run: node tools/build-stack.mjs
import { writeFile } from 'node:fs/promises';

const groups = [
  { label: 'languages', icons: [['java', 'java'], ['python', 'python'], ['ts', 'typescript'], ['js', 'javascript']] },
  { label: 'web',       icons: [['nodejs', 'node.js'], ['react', 'react'], ['nextjs', 'next.js'], ['tailwind', 'tailwind']] },
  { label: 'cloud/ops', icons: [['aws', 'aws'], ['docker', 'docker'], ['kubernetes', 'k8s'], ['linux', 'linux'], ['git', 'git']] },
];

const W = 880, PAD = 32, ROW = 86, TOP = 56, ICON = 44, GAP = 34, X0 = 200;
const H = TOP + groups.length * ROW + 8;

async function icon(id, prefix) {
  const res = await fetch(`https://skillicons.dev/icons?i=${id}&theme=dark`);
  if (!res.ok) throw new Error(`${id}: HTTP ${res.status}`);
  const svg = await res.text();
  const inner = svg.match(/<g transform="translate\(0, 0\)">\s*(<svg[\s\S]*<\/svg>)\s*<\/g>/);
  if (!inner) throw new Error(`${id}: unexpected SVG shape`);
  // Prefix ids so gradients from different icons never collide.
  return inner[1]
    .replace(/^<svg([^>]*)>/, (_, a) => `<svg${a.replace(/\s(width|height)="[^"]*"/g, '')}>`)
    .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${prefix}-$1"`);
}

let body = '';
for (const [r, g] of groups.entries()) {
  const y = TOP + r * ROW;
  body += `<text x="${PAD}" y="${y + ICON / 2 + 5}" class="mono dim">// ${g.label}</text>\n`;
  for (const [i, [id, name]] of g.icons.entries()) {
    const x = X0 + i * (ICON + GAP);
    const svg = (await icon(id, `${id}${r}${i}`))
      .replace(/^<svg /, `<svg x="${x}" y="${y}" width="${ICON}" height="${ICON}" `);
    body += svg + '\n';
    body += `<text x="${x + ICON / 2}" y="${y + ICON + 16}" text-anchor="middle" class="mono name">${name}</text>\n`;
  }
}

const out = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Tech stack: ${groups.flatMap(g => g.icons.map(i => i[1])).join(', ')}">
<style>
  .mono { font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Consolas, Menlo, monospace; }
  .dim  { fill: #6e7681; font-size: 14px; }
  .name { fill: #8b949e; font-size: 10.5px; }
  .ttl  { fill: #c9d1d9; font-size: 13px; }
</style>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="#0d1117" stroke="#30363d"/>
<text x="${PAD}" y="30" class="mono ttl"><tspan fill="#7ee787">λ</tspan> <tspan fill="#79c0ff">~</tspan>  ls ./stack</text>
<line x1="0" y1="44" x2="${W}" y2="44" stroke="#21262d"/>
${body}</svg>
`;

await writeFile(new URL('../assets/stack.svg', import.meta.url), out);
console.log('wrote assets/stack.svg');
