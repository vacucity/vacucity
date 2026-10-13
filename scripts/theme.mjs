// Night-harbour palette and drawing helpers shared by every generated SVG.

export const C = {
  night0: '#050920',
  night1: '#0b1236',
  night2: '#141d52',
  indigo: '#24307a',
  horizon: '#3b58c4',
  sea0: '#6fb6ff',
  sea1: '#3f86f0',
  sea2: '#2459c0',
  sea3: '#13358a',
  sea4: '#08194a',
  glow: '#8fd3ff',
  ice: '#e8f4ff',
  frost: '#c9dcff',
  lavender: '#b9a8ff',
  blush: '#f6c1d9',
  amber: '#ffe0c2',
  ribbon: '#e0435c',
  text: '#eef4ff',
  muted: '#a8bbea',
  dim: '#6f82bd',
  linkedin: '#0a66c2',
  maroon: '#800000',
  rose: '#f28b9b',
};

// Bokeh colours seen along the horizon in the reference art.
export const LIGHTS = ['#fff3e0', '#ffe0c2', '#f6c1d9', '#d9ccff', '#b9a8ff', '#9cc8ff', '#ffffff'];
// Ranked accents for languages / cards.
export const ACCENTS = ['#8fd3ff', '#b9a8ff', '#f6c1d9', '#ffe0c2', '#6f9bff', '#9ff0dc', '#d6e2ff'];

export const FONT = `'Segoe UI Variable Display','Segoe UI','SF Pro Display',-apple-system,BlinkMacSystemFont,'Helvetica Neue','PingFang SC','Hiragino Sans GB','Microsoft YaHei',sans-serif`;
export const MONO = `'Cascadia Code','SF Mono','JetBrains Mono',Consolas,Menlo,monospace`;

// Deterministic randomness so regenerated art never produces a diff.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const n = (v, d = 1) => +v.toFixed(d);
export const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

// Rough advance width, good enough for centring, wrapping and sizing chips.
export function textWidth(str, size, spacing = 0) {
  let w = 0;
  for (const ch of str) {
    if (/[⺀-鿿＀-￯]/.test(ch)) w += 1.0;
    else if (/[A-Z]/.test(ch)) w += 0.64;
    else if (/[0-9]/.test(ch)) w += 0.56;
    else if (/[a-z]/.test(ch)) w += 0.52;
    else if (ch === ' ') w += 0.28;
    else w += 0.38;
  }
  return w * size + spacing * [...str].length;
}

export function wrap(str, size, maxWidth, maxLines = 2) {
  const words = str.split(/(\s+)/).filter(Boolean);
  const lines = [''];
  for (const word of words) {
    const cur = lines[lines.length - 1];
    if (textWidth(cur + word, size) <= maxWidth || !cur.trim()) lines[lines.length - 1] = cur + word;
    else if (lines.length < maxLines) lines.push(word.trimStart());
    else {
      lines[lines.length - 1] = cur.trimEnd().replace(/[,.;:]?$/, '…');
      return lines;
    }
  }
  return lines.map((l) => l.trim());
}

export function svg(w, h, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
${body}
</svg>
`;
}

// Blur + coloured glow filters, twinkle keyframes and reduced-motion opt-out.
export function baseDefs(p) {
  return `<filter id="${p}b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.2"/></filter>
<filter id="${p}b2" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3"/></filter>
<filter id="${p}b3" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="${p}b4" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="${p}glow" x="-30%" y="-80%" width="160%" height="260%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="9" result="a"/>
  <feFlood flood-color="${C.glow}" flood-opacity=".75"/>
  <feComposite in2="a" operator="in" result="g"/>
  <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="s"/>
  <feMerge><feMergeNode in="g"/><feMergeNode in="g"/><feMergeNode in="s"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
<filter id="${p}soft" x="-30%" y="-80%" width="160%" height="260%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="a"/>
  <feFlood flood-color="${C.glow}" flood-opacity=".45"/>
  <feComposite in2="a" operator="in" result="g"/>
  <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>`;
}

export const baseCss = `
text{font-family:${FONT}}
.mono{font-family:${MONO}}
.tw{animation:tw 4s ease-in-out infinite}
.t1{animation-duration:2.6s}.t2{animation-duration:3.4s}.t3{animation-duration:4.6s}.t4{animation-duration:6s}
@keyframes tw{0%,100%{opacity:.12}50%{opacity:1}}
.float{animation:float 9s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
.pulse{animation:pulse 2.8s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes pulse{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.2)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}`;

// Four-point star, the sparkle motif used as bullets and decoration.
export function sparkle(x, y, s, fill, extra = '') {
  const k = s * 0.18;
  return `<path d="M${n(x)} ${n(y - s)}Q${n(x + k)} ${n(y - k)} ${n(x + s)} ${n(y)}Q${n(x + k)} ${n(y + k)} ${n(x)} ${n(y + s)}Q${n(x - k)} ${n(y + k)} ${n(x - s)} ${n(y)}Q${n(x - k)} ${n(y - k)} ${n(x)} ${n(y - s)}Z" fill="${fill}"${extra}/>`;
}

const delay = (r, max) => ` style="animation-delay:-${n(r() * max, 2)}s"`;

export function stars(r, count, x0, y0, x1, y1, maxR = 1.3) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + Math.pow(r(), 1.3) * (y1 - y0);
    const rad = 0.4 + r() * maxR;
    out += `<circle class="tw t${1 + Math.floor(r() * 4)}" cx="${n(x)}" cy="${n(y)}" r="${n(rad, 2)}" fill="${pick(r, ['#ffffff', C.frost, C.ice, '#dcd2ff'])}"${delay(r, 6)}/>`;
  }
  return out;
}

// Soft out-of-focus discs with a slightly brighter rim, like camera bokeh.
export function bokehDefs(p) {
  return LIGHTS.map(
    (c, i) => `<radialGradient id="${p}k${i}"><stop offset="0" stop-color="${c}" stop-opacity=".16"/><stop offset=".78" stop-color="${c}" stop-opacity=".24"/><stop offset=".93" stop-color="${c}" stop-opacity=".42"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`,
  ).join('');
}

export function bokehDisc(p, r, x, y, rad, opacity, cls = 'float') {
  const i = Math.floor(r() * LIGHTS.length);
  return `<g class="${cls}"${delay(r, 9)}><circle cx="${n(x)}" cy="${n(y)}" r="${n(rad)}" fill="url(#${p}k${i})" opacity="${n(opacity, 2)}" filter="url(#${p}b1)"/></g>`;
}

// Glass panel used behind every card: night gradient, corner blooms, hairline border.
export function panel(p, w, h, r, { rx = 18, blooms = 3, discs = 5, starCount = 30 } = {}) {
  const defs = `<linearGradient id="${p}bg" x1="0" y1="0" x2=".35" y2="1">
  <stop offset="0" stop-color="${C.night0}"/><stop offset=".55" stop-color="${C.night1}"/><stop offset="1" stop-color="#16246a"/>
</linearGradient>
<linearGradient id="${p}edge" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${C.glow}" stop-opacity=".55"/><stop offset=".45" stop-color="${C.lavender}" stop-opacity=".12"/><stop offset="1" stop-color="${C.blush}" stop-opacity=".45"/>
</linearGradient>
<clipPath id="${p}clip"><rect width="${w}" height="${h}" rx="${rx}"/></clipPath>
${bokehDefs(p)}`;
  let bloom = '';
  const spots = [
    [w * 0.92, h * 0.05, C.lavender],
    [w * 0.04, h * 0.98, C.sea1],
    [w * 0.55, h * 1.1, C.glow],
  ];
  for (const [x, y, c] of spots.slice(0, blooms)) {
    bloom += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(Math.min(w, h) * 0.55)}" fill="${c}" opacity=".22" filter="url(#${p}b4)"/>`;
  }
  let disc = '';
  for (let i = 0; i < discs; i++) {
    const edge = r() < 0.5;
    const x = edge ? (r() < 0.5 ? r() * w * 0.12 : w - r() * w * 0.12) : r() * w;
    const y = edge ? r() * h : (r() < 0.5 ? r() * h * 0.15 : h - r() * h * 0.15);
    disc += bokehDisc(p, r, x, y, 14 + r() * 34, 0.3 + r() * 0.35);
  }
  const body = `<g clip-path="url(#${p}clip)">
<rect width="${w}" height="${h}" fill="url(#${p}bg)"/>
${bloom}
${stars(r, starCount, 0, 0, w, h, 1)}
${disc}
</g>`;
  const border = `<rect x=".75" y=".75" width="${w - 1.5}" height="${h - 1.5}" rx="${rx - 0.75}" fill="none" stroke="url(#${p}edge)" stroke-width="1.5"/>`;
  return { defs, body, border };
}

// Small line icons (24px grid).
export const ICON = {
  linkedin: (x, y, s = 1, fill = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${fill}"><circle cx="6.4" cy="6.2" r="2.1"/><rect x="4.6" y="9.4" width="3.6" height="10" rx=".4"/><rect x="10.4" y="9.4" width="3.5" height="10" rx=".4"/><path d="M13.9 13.4c0-2.6 1.7-4.2 3.8-4.2 2.4 0 3.6 1.6 3.6 4.4v5.8h-3.6v-5.3c0-1.2-.5-1.9-1.5-1.9-1.1 0-2.3.7-2.3 2.2z"/></g>`,
  globe: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="9.2"/><ellipse cx="12" cy="12" rx="4" ry="9.2"/><path d="M3 12h18M4.6 7.4h14.8M4.6 16.6h14.8"/></g>`,
  mail: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="2.5" y="5" width="19" height="14" rx="2.6"/><path d="M3.5 6.5l8.5 6.4 8.5-6.4"/></g>`,
  repo: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M5 18.5V5.2C5 4 6 3 7.2 3H19v13.2H7.4C6 16.2 5 17.1 5 18.5s1 2.5 2.4 2.5H19"/><path d="M9 7h6"/></g>`,
  star: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}"><path d="M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.85l-5.5 2.9 1.05-6.12L3.1 9.3l6.15-.9z"/></g>`,
  code: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.6 4.5l-3.2 15"/></g>`,
  fork: (x, y, s = 1, c = '#fff') =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round"><circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="5" r="2.2"/><circle cx="12" cy="19" r="2.2"/><path d="M6 7.2v1.6c0 1.6 1.2 2.8 2.8 2.8h6.4c1.6 0 2.8-1.2 2.8-2.8V7.2M12 11.6v5.2"/></g>`,
};
