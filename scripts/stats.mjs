// Live cards: GitHub stats and featured repositories, refreshed by the workflow.
import { C, ACCENTS, rng, esc, n, textWidth, wrap, svg, baseDefs, baseCss, sparkle, panel, ICON } from './theme.mjs';

async function gh(path) {
  const headers = { 'User-Agent': 'vacucity-profile', Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

export async function fetchGitHub(login) {
  const [user, repos] = await Promise.all([gh(`/users/${login}`), gh(`/users/${login}/repos?per_page=100&type=owner`)]);
  const own = repos.filter((r) => !r.fork);
  // Notebook outputs dwarf everything by bytes, so each repo gets one equal vote,
  // split across its languages by byte share.
  const share = {};
  await Promise.all(
    own.map(async (r) => {
      const langs = await gh(`/repos/${login}/${r.name}/languages`);
      const total = Object.values(langs).reduce((a, b) => a + b, 0);
      for (const [k, v] of Object.entries(langs)) share[k] = (share[k] || 0) + v / total;
    }),
  );
  const sum = Object.values(share).reduce((a, b) => a + b, 0);
  const languages = Object.entries(share)
    .map(([name, v]) => ({ name, pct: (v / sum) * 100 }))
    .sort((a, b) => b.pct - a.pct);
  const colors = Object.fromEntries(languages.map((l, i) => [l.name, ACCENTS[i % ACCENTS.length]]));
  return {
    user,
    repos,
    languages,
    colors,
    stars: own.reduce((a, r) => a + r.stargazers_count, 0),
  };
}

export function statsCard(G) {
  const W = 1200, H = 300, p = 's';
  const r = rng(77);
  const pan = panel(p, W, H, r, { discs: 4, starCount: 34 });
  const tiles = [
    ['REPOSITORIES', G.user.public_repos, C.glow],
    ['STARS EARNED', G.stars, C.amber],
    ['FOLLOWERS', G.user.followers, C.lavender],
    ['LANGUAGES', G.languages.length, C.blush],
  ];
  let tileSvg = '';
  tiles.forEach(([label, value, col], i) => {
    const x = 48 + (i % 2) * 278;
    const y = 86 + Math.floor(i / 2) * 102;
    tileSvg += `<rect x="${x}" y="${y}" width="262" height="88" rx="14" fill="#ffffff" fill-opacity=".035" stroke="${col}" stroke-opacity=".22"/>
<circle cx="${x + 220}" cy="${y + 30}" r="26" fill="${col}" opacity=".16" filter="url(#${p}b3)"/>
${sparkle(x + 222, y + 30, 8, col, ` class="tw t${1 + i}"`)}
<text x="${x + 24}" y="${y + 52}" font-size="40" font-weight="200" fill="${C.text}" filter="url(#${p}soft)">${value}</text>
<text x="${x + 24}" y="${y + 74}" font-size="11" font-weight="700" letter-spacing="3" fill="${C.muted}">${label}</text>`;
  });

  const top = G.languages.slice(0, 6);
  const rest = G.languages.slice(6).reduce((a, l) => a + l.pct, 0);
  if (rest > 0.05) top.push({ name: 'Other', pct: rest });
  const BX = 652, BW = 500;
  let bx = BX;
  let bar = '';
  top.forEach((l) => {
    const w = Math.max(3, (l.pct / 100) * BW);
    bar += `<rect x="${n(bx)}" y="124" width="${n(w)}" height="14" fill="${G.colors[l.name] || C.dim}"/>`;
    bx += w;
  });
  let legend = '';
  top.forEach((l, i) => {
    const x = BX + (i % 2) * 260;
    const y = 178 + Math.floor(i / 2) * 32;
    const col = G.colors[l.name] || C.dim;
    legend += `<circle cx="${x + 6}" cy="${y - 5}" r="6" fill="${col}"/>
<text x="${x + 22}" y="${y}" font-size="15" fill="${C.frost}">${esc(l.name)}</text>
<text class="mono" x="${x + 222}" y="${y}" text-anchor="end" font-size="13" fill="${C.muted}">${l.pct.toFixed(1)}%</text>`;
  });

  const body = `<style>${baseCss}</style>
<defs>
${baseDefs(p)}
${pan.defs}
<clipPath id="${p}bar"><rect x="${BX}" y="124" width="${BW}" height="14" rx="7"/></clipPath>
<linearGradient id="${p}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.glow}" stop-opacity="0"/><stop offset=".5" stop-color="${C.glow}" stop-opacity=".35"/><stop offset="1" stop-color="${C.glow}" stop-opacity="0"/></linearGradient>
</defs>
${pan.body}
${sparkle(56, 50, 6, C.glow)}
<text x="72" y="55" font-size="12" font-weight="700" letter-spacing="4" fill="${C.muted}">GITHUB  CONSTELLATION</text>
<text class="mono" x="${W - 48}" y="55" text-anchor="end" font-size="12" fill="${C.dim}">@${esc(G.user.login)}  ·  since ${G.user.created_at.slice(0, 4)}</text>
${tileSvg}
<rect x="618" y="86" width="1" height="190" fill="url(#${p}v)"/>
<text x="${BX}" y="104" font-size="12" font-weight="700" letter-spacing="4" fill="${C.muted}">LANGUAGES</text>
<text class="mono" x="${BX + BW}" y="104" text-anchor="end" font-size="11" fill="${C.dim}">each repo weighted equally</text>
<rect x="${BX}" y="122" width="${BW}" height="18" rx="9" fill="${C.glow}" opacity=".25" filter="url(#${p}b2)"/>
<g clip-path="url(#${p}bar)">${bar}</g>
${legend}
${pan.border}`;
  return svg(W, H, `GitHub stats for ${G.user.login}`, body);
}

export function repoCard(G, f, i) {
  const W = 600, H = 200, p = `r${i}`;
  const repo = G.repos.find((x) => x.name.toLowerCase() === f.repo.toLowerCase());
  if (!repo) throw new Error(`featured repo not found: ${f.repo}`);
  const r = rng(1000 + i);
  const accent = ACCENTS[i % ACCENTS.length];
  const pan = panel(p, W, H, r, { rx: 16, blooms: 1, discs: 3, starCount: 18 });
  const tagW = textWidth(f.tag, 10.5, 1.5) + 24;
  const desc = wrap(f.desc || repo.description || '', 15, W - 60, 2);
  const lang = repo.language || 'Markdown';
  const langCol = G.colors[lang] || C.dim;
  const lw = textWidth(lang, 14);
  const starX = 48 + lw + 26;
  const forkX = starX + textWidth(String(repo.stargazers_count), 14) + 50;

  const body = `<style>${baseCss}
.scan{animation:scan 8s ease-in-out infinite;animation-delay:-${i * 2}s}
@keyframes scan{0%{transform:translateX(-200px)}50%,100%{transform:translateX(${W + 200}px)}}
</style>
<defs>
${baseDefs(p)}
${pan.defs}
<linearGradient id="${p}line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${accent}" stop-opacity="0"/><stop offset=".5" stop-color="${accent}"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></linearGradient>
</defs>
${pan.body}
<g clip-path="url(#${p}clip)">
  <circle cx="${W - 40}" cy="10" r="120" fill="${accent}" opacity=".2" filter="url(#${p}b4)"/>
  <g class="scan"><rect x="0" y="${H - 2}" width="200" height="2" fill="url(#${p}line)"/></g>
</g>
${ICON.repo(26, 28, 1.05, accent)}
<text x="62" y="49" font-size="21" font-weight="600" fill="${C.text}">${esc(repo.name)}</text>
<rect x="${n(W - 28 - tagW)}" y="30" width="${n(tagW)}" height="24" rx="12" fill="${accent}" fill-opacity=".12" stroke="${accent}" stroke-opacity=".5"/>
<text x="${n(W - 28 - tagW / 2)}" y="46" text-anchor="middle" font-size="10.5" font-weight="700" letter-spacing="1.5" fill="${accent}">${esc(f.tag)}</text>
${desc.map((l, k) => `<text x="30" y="${94 + k * 24}" font-size="15" fill="${C.muted}">${esc(l)}</text>`).join('\n')}
<circle cx="36" cy="161" r="6" fill="${langCol}"/>
<text x="48" y="166" font-size="14" fill="${C.frost}">${esc(lang)}</text>
${ICON.star(starX, 151, 0.72, C.amber)}
<text x="${n(starX + 22)}" y="166" font-size="14" fill="${C.frost}">${repo.stargazers_count}</text>
${ICON.fork(forkX, 151, 0.68, C.muted)}
<text x="${n(forkX + 22)}" y="166" font-size="14" fill="${C.frost}">${repo.forks_count}</text>
${pan.border}`;
  return svg(W, H, `${repo.name}: ${f.desc || repo.description || ''}`, body);
}
