// Static artwork: header banner, link buttons, LinkedIn card, divider, footer.
import {
  C, LIGHTS, ACCENTS, rng, esc, n, pick, textWidth, svg, baseDefs, baseCss,
  sparkle, stars, bokehDefs, bokehDisc, panel, ICON,
} from './theme.mjs';

const delay = (r, max) => ` style="animation-delay:-${n(r() * max, 2)}s"`;

// Repeating wave whose period matches the drift keyframes, so the loop is seamless.
function wave(y, amp, period, width, close) {
  let d = `M0 ${y}Q${period / 4} ${y - amp} ${period / 2} ${y}`;
  for (let x = period; x <= width + period; x += period / 2) d += `T${x} ${y}`;
  return close ? `${d}L${width + period} ${close}L0 ${close}Z` : d;
}

// Horizon lights with bloom and their streaky reflections on the water.
function harbourLights(p, r, W, HZ, count, { centreDim = 0.35, reflect = true, spread = 26 } = {}) {
  let lights = '';
  let halos = '';
  let refl = '';
  for (let i = 0; i < count; i++) {
    const u = r();
    const x = u < 0.45 ? 10 + r() * 400 : u < 0.9 ? W - 10 - r() * 400 : 400 + r() * (W - 800);
    const centre = x > 400 && x < W - 400;
    const y = HZ - 2 - Math.pow(r(), 2.2) * spread;
    const c = pick(r, LIGHTS);
    const o = (centre ? centreDim : 1) * (0.55 + r() * 0.45);
    const flick = r() < 0.3 ? ` class="flick"${delay(r, 5)}` : '';
    lights += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(0.9 + r() * 2.2)}" fill="${c}" opacity="${n(o, 2)}"${flick}/>`;
    if (r() < 0.4) {
      halos += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(6 + r() * 13)}" fill="${c}" opacity="${n(o * (0.3 + r() * 0.35), 2)}" filter="url(#${p}b2)"/>`;
      if (reflect && r() < 0.55) {
        const ry = 10 + r() * 30;
        refl += `<ellipse class="flick"${delay(r, 5)} cx="${n(x + (r() - 0.5) * 4)}" cy="${n(HZ + 4 + ry * 0.8)}" rx="${n(1.6 + r() * 4)}" ry="${n(ry)}" fill="${c}" opacity="${n(o * 0.22, 2)}" filter="url(#${p}b2)"/>`;
      }
    }
  }
  return { lights: halos + lights, refl };
}

function glitter(r, W, top, bottom, count, scale = 1) {
  let out = '';
  for (let i = 0; i < count; i++) {
    const t = Math.pow(r(), 1.7);
    const y = top + 3 + t * (bottom - top - 6);
    const rx = (0.6 + t * 4 + r() * 1.1) * scale;
    out += `<ellipse class="tw t${1 + Math.floor(r() * 4)}"${delay(r, 6)} cx="${n(r() * W)}" cy="${n(y)}" rx="${n(rx, 2)}" ry="${n(rx * (0.2 + r() * 0.12), 2)}" fill="${pick(r, ['#ffffff', C.ice, '#cfe8ff', C.glow])}"/>`;
  }
  return out;
}

const motes = (r, W, top, bottom, count) => {
  let out = '';
  for (let i = 0; i < count; i++) {
    out += `<circle class="rise" style="animation-delay:-${n(r() * 10, 2)}s;animation-duration:${n(8 + r() * 6, 1)}s" cx="${n(r() * W)}" cy="${n(top + r() * (bottom - top))}" r="${n(0.7 + r() * 1.3, 2)}" fill="${pick(r, [C.amber, C.ice, C.blush])}"/>`;
  }
  return out;
};

const animCss = `
.flick{animation:flick 5s ease-in-out infinite}
@keyframes flick{0%,100%{opacity:.9}40%{opacity:.4}70%{opacity:1}}
.rise{opacity:0;animation:rise 10s linear infinite}
@keyframes rise{0%{opacity:0;transform:translateY(0)}20%{opacity:.85}100%{opacity:0;transform:translateY(-170px)}}
.drift{animation:drift 22s linear infinite}
.drift2{animation:drift 34s linear infinite}
.drift3{animation:drift 52s linear infinite}
@keyframes drift{from{transform:translateX(0)}to{transform:translateX(-300px)}}`;

// ───────────────────────────── header ─────────────────────────────

// Soft oval fade plus a lift of the shadows, so the portrait reads as a pale backdrop.
function heroineDefs(p) {
  return `<radialGradient id="${p}fade" cx=".5" cy=".4" r=".5">
  <stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#fff" stop-opacity=".95"/><stop offset=".75" stop-color="#fff" stop-opacity=".4"/><stop offset=".95" stop-color="#fff" stop-opacity="0"/>
</radialGradient>
<filter id="${p}pale" color-interpolation-filters="sRGB">
  <feColorMatrix type="saturate" values=".8"/>
  <feComponentTransfer><feFuncR type="linear" slope=".75" intercept=".22"/><feFuncG type="linear" slope=".75" intercept=".22"/><feFuncB type="linear" slope=".72" intercept=".27"/></feComponentTransfer>
</filter>`;
}

function heroineLayer(p, img, W) {
  const w = 430, h = (w * img.height) / img.width;
  const x = W - w + 20, y = -84;
  return `<circle cx="${x + w * 0.45}" cy="${n(y + h * 0.36)}" r="190" fill="${C.lavender}" opacity=".3" filter="url(#${p}b4)"/>
<mask id="${p}mask"><rect x="${x}" y="${y}" width="${w}" height="${n(h)}" fill="url(#${p}fade)"/></mask>
<g class="breathe" opacity=".8" mask="url(#${p}mask)"><image href="${img.href}" x="${x}" y="${y}" width="${w}" height="${n(h)}" filter="url(#${p}pale)"/></g>`;
}

// heroine: optional { href, width, height } raster placed on the right as a soft, lightened backdrop.
export function header(P, heroine) {
  const W = 1200, H = 420, HZ = 274, p = 'h';
  const r = rng(20261012);
  const title = P.name.toUpperCase();
  const ls = 22;
  // With a portrait on the right, the title block shifts left to share the frame.
  const CX = heroine ? 430 : 600;
  // Each tagline owns an equal slice of the cycle: fade in, hold, fade out.
  const seg = 100 / P.taglines.length;

  const css = `<style>${baseCss}${animCss}
.sub{opacity:0;animation:sub ${P.taglines.length * 5}s ease-in-out infinite}
.s0{opacity:1}
.breathe{animation:breathe 8s ease-in-out infinite}
@keyframes breathe{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
@keyframes sub{0%{opacity:0;transform:translateY(10px)}${n(seg * 0.16, 2)}%,${n(seg * 0.84, 2)}%{opacity:1;transform:translateY(0)}${n(seg, 2)}%,100%{opacity:0;transform:translateY(-8px)}}
</style>`;

  const defs = `<defs>
${baseDefs(p)}
${bokehDefs(p)}
<clipPath id="${p}clip"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}">
  <stop offset="0" stop-color="${C.night0}"/><stop offset=".5" stop-color="#0c1540"/><stop offset=".82" stop-color="#1b2a6e"/><stop offset=".96" stop-color="#3550b8"/><stop offset="1" stop-color="#5d86e6"/>
</linearGradient>
<linearGradient id="${p}sea" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}">
  <stop offset="0" stop-color="#9fd2ff"/><stop offset=".05" stop-color="#4d95f5"/><stop offset=".32" stop-color="${C.sea2}"/><stop offset=".68" stop-color="#153a8e"/><stop offset="1" stop-color="${C.sea4}"/>
</linearGradient>
<radialGradient id="${p}vig" cx=".5" cy=".42" r=".78">
  <stop offset=".55" stop-color="${C.night0}" stop-opacity="0"/><stop offset="1" stop-color="#02040f" stop-opacity=".78"/>
</radialGradient>
<linearGradient id="${p}title" gradientUnits="userSpaceOnUse" x1="${CX - 340}" y1="0" x2="${CX + 340}" y2="0">
  <stop offset="0" stop-color="#c3d9ff"/><stop offset=".5" stop-color="#ffffff"/><stop offset="1" stop-color="#d8caff"/>
</linearGradient>
<linearGradient id="${p}shine" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="0">
  <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
  <animateTransform attributeName="gradientTransform" type="translate" values="-300 0;1500 0;1500 0" keyTimes="0;.42;1" dur="7s" repeatCount="indefinite"/>
</linearGradient>
<linearGradient id="${p}rule" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${C.glow}" stop-opacity="0"/><stop offset=".5" stop-color="${C.ice}" stop-opacity=".9"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="${p}edge" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${C.glow}" stop-opacity=".6"/><stop offset=".5" stop-color="${C.lavender}" stop-opacity=".12"/><stop offset="1" stop-color="${C.blush}" stop-opacity=".5"/>
</linearGradient>
${heroine ? heroineDefs(p) : ''}
</defs>`;

  const { lights, refl } = harbourLights(p, r, W, HZ, 150);

  // Out-of-focus foreground bokeh, kept off the title.
  let discs = '';
  for (let i = 0; i < 12; i++) {
    const left = i % 2 === 0;
    const x = left ? r() * 190 : W - r() * 190;
    const y = heroine && !left ? HZ + r() * (H - HZ) : r() * H;
    discs += bokehDisc(p, r, x, y, 16 + r() * 36, 0.55 + r() * 0.45);
  }
  for (let i = 0; i < 4; i++) discs += bokehDisc(p, r, 340 + r() * 520, HZ + 50 + r() * 90, 14 + r() * 22, 0.45);

  let glints = '';
  for (let i = 0; i < 14; i++) {
    const t = Math.pow(r(), 1.4);
    glints += sparkle(r() * W, HZ + 8 + t * (H - HZ - 20), 2.5 + t * 6, '#ffffff', ` class="tw t${1 + Math.floor(r() * 4)}"${delay(r, 6)}`);
  }

  const kw = textWidth(P.kicker, 13, 6);
  const tw = textWidth(title, 68, ls) * 0.86;
  const lines = P.taglines
    .map(
      (t, i) =>
        `<g class="sub s${i}" style="animation-delay:${i * 5}s"><text x="${CX}" y="232" text-anchor="middle" font-size="19" font-weight="300" letter-spacing="1" fill="#d8e6ff" filter="url(#${p}soft)">${esc(t)}</text></g>`,
    )
    .join('');

  const body = `${css}${defs}
<g clip-path="url(#${p}clip)">
  <rect width="${W}" height="${HZ}" fill="url(#${p}sky)"/>
  <circle cx="1090" cy="10" r="250" fill="${C.lavender}" opacity=".3" filter="url(#${p}b4)"/>
  <circle cx="110" cy="40" r="200" fill="${C.sea1}" opacity=".22" filter="url(#${p}b4)"/>
  <ellipse cx="${CX}" cy="160" rx="430" ry="95" fill="#3a56c8" opacity=".28" filter="url(#${p}b4)"/>
  ${stars(r, 90, 0, 0, W, HZ - 30)}
  <rect y="${HZ - 7}" width="${W}" height="7" fill="#0a1238" opacity=".55"/>
  <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${p}sea)"/>
  <ellipse cx="600" cy="${HZ}" rx="680" ry="40" fill="#8fc4ff" opacity=".4" filter="url(#${p}b4)"/>
  <rect y="${HZ - 1}" width="${W}" height="2.5" fill="#d6ecff" opacity=".7" filter="url(#${p}b1)"/>
  ${lights}
  ${refl}
  <g opacity=".5">
    <path class="drift" d="${wave(HZ + 30, 2, 300, W)}" fill="none" stroke="#bfe0ff" stroke-opacity=".25" stroke-width="1"/>
    <path class="drift2" d="${wave(HZ + 70, 3.5, 300, W)}" fill="none" stroke="#bfe0ff" stroke-opacity=".2" stroke-width="1.2"/>
    <path class="drift3" d="${wave(HZ + 120, 5, 300, W)}" fill="none" stroke="#bfe0ff" stroke-opacity=".16" stroke-width="1.5"/>
  </g>
  ${glitter(r, W, HZ, H, 230)}
  ${glints}
  ${heroine ? heroineLayer(p, heroine, W) : ''}
  ${discs}
  ${motes(r, W, HZ - 40, H, 18)}
  <rect width="${W}" height="${H}" fill="url(#${p}vig)"/>

  ${sparkle(CX - kw / 2 - 20, 92, 6, C.glow, ` class="tw t2"`)}
  ${sparkle(CX + kw / 2 + 14, 92, 6, C.blush, ` class="tw t3"`)}
  <text x="${n(CX + 3)}" y="97" text-anchor="middle" font-size="13" font-weight="600" letter-spacing="6" fill="${C.muted}">${esc(P.kicker)}</text>
  <text x="${CX + ls / 2}" y="170" text-anchor="middle" font-size="68" font-weight="200" letter-spacing="${ls}" fill="url(#${p}title)" filter="url(#${p}glow)">${esc(title)}</text>
  <text x="${CX + ls / 2}" y="170" text-anchor="middle" font-size="68" font-weight="200" letter-spacing="${ls}" fill="url(#${p}shine)">${esc(title)}</text>
  <rect x="${n(CX - tw / 2)}" y="194" width="${n(tw)}" height="1.2" fill="url(#${p}rule)"/>
  ${sparkle(CX, 194.6, 5.5, C.ribbon, ` filter="url(#${p}soft)"`)}
  ${lines}
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" fill="none" stroke="url(#${p}edge)" stroke-width="2"/>`;

  return svg(W, H, `${P.name} · ${P.user}`, body);
}

// ───────────────────────────── buttons ─────────────────────────────

export function button(kind, label, sub, seed) {
  const W = 300, H = 76, p = `b${kind[0]}`;
  const r = rng(seed);
  const accent = { linkedin: C.linkedin, globe: C.glow, mail: C.lavender }[kind];
  const icon =
    kind === 'linkedin'
      ? `<rect x="17" y="17" width="42" height="42" rx="10" fill="${C.linkedin}"/>${ICON.linkedin(21.8, 21.6, 1.36)}`
      : `<circle cx="38" cy="38" r="22" fill="${accent}" fill-opacity=".14" stroke="${accent}" stroke-opacity=".7"/>${ICON[kind](24.8, 24.8, 1.1, '#ffffff')}`;

  const body = `<style>${baseCss}
.sweep{animation:sweep 6s ease-in-out infinite;animation-delay:${n(r() * 3, 2)}s}
@keyframes sweep{0%{transform:translateX(-140px)}35%,100%{transform:translateX(${W + 140}px)}}
</style>
<defs>
${baseDefs(p)}
<clipPath id="${p}clip"><rect width="${W}" height="${H}" rx="${H / 2}"/></clipPath>
<linearGradient id="${p}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.night1}"/><stop offset="1" stop-color="#1a2b78"/></linearGradient>
<linearGradient id="${p}edge" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${accent}" stop-opacity=".95"/><stop offset=".6" stop-color="${C.lavender}" stop-opacity=".25"/><stop offset="1" stop-color="${C.blush}" stop-opacity=".6"/></linearGradient>
<linearGradient id="${p}sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<g clip-path="url(#${p}clip)">
  <rect width="${W}" height="${H}" fill="url(#${p}bg)"/>
  <circle cx="40" cy="38" r="60" fill="${accent}" opacity=".35" filter="url(#${p}b4)"/>
  <circle cx="${W - 30}" cy="${H}" r="50" fill="${C.lavender}" opacity=".22" filter="url(#${p}b4)"/>
  ${stars(r, 14, 80, 0, W, H, 0.8)}
  <g class="sweep"><rect x="-60" y="-20" width="70" height="${H + 40}" fill="url(#${p}sw)" transform="skewX(-20)"/></g>
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${H / 2 - 1}" fill="none" stroke="url(#${p}edge)" stroke-width="1.6"/>
${icon}
<text x="76" y="35" font-size="20" font-weight="600" fill="${C.text}">${esc(label)}</text>
<text class="mono" x="76" y="57" font-size="13" fill="${C.muted}">${esc(sub)}</text>
<path d="M${W - 42} 44l9-9m-6.5 0h6.5v6.5" fill="none" stroke="${C.muted}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`;
  return svg(W, H, `${label}: ${sub}`, body);
}

// ─────────────────────────── LinkedIn card ───────────────────────────

export function linkedinCard(P) {
  const W = 1200, H = 610, p = 'l';
  const r = rng(808);
  const pan = panel(p, W, H, r, { discs: 7, starCount: 46 });
  const LY = 374;
  const x0 = 130, x1 = 1070;
  const step = (x1 - x0) / (P.journey.length - 1);

  let nodes = '';
  P.journey.forEach((j, i) => {
    const x = x0 + i * step;
    const up = i % 2 === 0;
    const col = j.kind === 'edu' ? C.lavender : C.glow;
    const when = j.now ? `${j.when}  ·  NOW` : j.when;
    const hw = Math.max(textWidth(j.org, 17), textWidth(j.role, 14), textWidth(when, 12) * 1.12) / 2;
    const cx = Math.min(Math.max(x, 40 + hw), W - 40 - hw);
    const [yd, yo, yr, c0, c1] = up ? [262, 290, 314, LY - 46, LY - 14] : [436, 464, 488, LY + 14, LY + 40];
    nodes += `<line x1="${n(x)}" y1="${c0}" x2="${n(x)}" y2="${c1}" stroke="${col}" stroke-opacity=".45" stroke-dasharray="2 4"/>
<circle cx="${n(x)}" cy="${LY}" r="15" fill="${col}" opacity=".3" filter="url(#${p}b2)"/>
${j.now ? `<circle class="pulse" cx="${n(x)}" cy="${LY}" r="8" fill="none" stroke="${C.amber}" stroke-width="1.5"/>` : ''}
<circle cx="${n(x)}" cy="${LY}" r="${j.now ? 7 : 5.5}" fill="${j.now ? C.amber : col}"/>
<circle cx="${n(x)}" cy="${LY}" r="2.2" fill="#ffffff"/>
<text class="mono" x="${n(cx)}" y="${yd}" text-anchor="middle" font-size="12" fill="${col}" letter-spacing=".5">${esc(when)}</text>
<text x="${n(cx)}" y="${yo}" text-anchor="middle" font-size="17" font-weight="600" fill="${C.text}">${esc(j.org)}</text>
<text x="${n(cx)}" y="${yr}" text-anchor="middle" font-size="14" fill="${C.muted}">${esc(j.role)}</text>`;
  });

  let chips = `<text x="48" y="552" font-size="12" font-weight="700" letter-spacing="4" fill="${C.dim}">FOCUS</text>`;
  let cx = 124;
  P.focus.forEach((f, i) => {
    const w = textWidth(f, 14) + 30;
    const col = ACCENTS[i % ACCENTS.length];
    chips += `<rect x="${n(cx)}" y="530" width="${n(w)}" height="32" rx="16" fill="${col}" fill-opacity=".1" stroke="${col}" stroke-opacity=".45"/>
<text x="${n(cx + w / 2)}" y="551" text-anchor="middle" font-size="14" fill="${C.frost}">${esc(f)}</text>`;
    cx += w + 10;
  });

  const body = `<style>${baseCss}
.ring{animation:ring 3s ease-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes ring{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.18,1.5)}}
</style>
<defs>
${baseDefs(p)}
${pan.defs}
<linearGradient id="${p}btn" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.linkedin}"/><stop offset="1" stop-color="#4a8dff"/></linearGradient>
<linearGradient id="${p}rule" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.glow}" stop-opacity="0"/><stop offset=".2" stop-color="${C.glow}" stop-opacity=".5"/><stop offset=".8" stop-color="${C.lavender}" stop-opacity=".5"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}line" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.lavender}" stop-opacity="0"/><stop offset=".1" stop-color="${C.lavender}"/><stop offset=".5" stop-color="${C.glow}"/><stop offset=".9" stop-color="${C.amber}"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
</defs>
${pan.body}
<circle cx="86" cy="84" r="60" fill="${C.linkedin}" opacity=".45" filter="url(#${p}b4)"/>
<rect x="48" y="46" width="76" height="76" rx="17" fill="${C.linkedin}"/>
<rect x="48.5" y="46.5" width="75" height="75" rx="16.5" fill="none" stroke="#ffffff" stroke-opacity=".25"/>
${ICON.linkedin(54.5, 52.5, 2.6)}
<text x="150" y="86" font-size="36" font-weight="300" letter-spacing="2" fill="${C.text}" filter="url(#${p}soft)">${esc(P.name)}</text>
<text x="150" y="117" font-size="16" fill="${C.muted}">${esc(P.headline)}</text>
<text class="mono" x="150" y="143" font-size="13" fill="${C.dim}">${esc(P.linkedin.replace(/^https?:\/\/(www\.)?/, ''))}</text>

<rect class="ring" x="902" y="60" width="250" height="52" rx="26" fill="none" stroke="#6fa8ff" stroke-width="1.5"/>
<rect x="902" y="60" width="250" height="52" rx="26" fill="url(#${p}btn)"/>
<rect x="902.5" y="60.5" width="249" height="51" rx="25.5" fill="none" stroke="#ffffff" stroke-opacity=".3"/>
<text x="1012" y="92" text-anchor="middle" font-size="16" font-weight="600" fill="#ffffff">Connect on LinkedIn</text>
<path d="M1118 93l9-9m-6.5 0h6.5v6.5" fill="none" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>

<rect x="48" y="180" width="${W - 96}" height="1" fill="url(#${p}rule)"/>
${sparkle(56, 218, 6, C.glow)}
<text x="72" y="223" font-size="12" font-weight="700" letter-spacing="4" fill="${C.muted}">EXPERIENCE  &amp;  EDUCATION</text>
<circle cx="${W - 236}" cy="218" r="5" fill="${C.lavender}"/><text x="${W - 226}" y="223" font-size="13" fill="${C.muted}">Education</text>
<circle cx="${W - 136}" cy="218" r="5" fill="${C.glow}"/><text x="${W - 126}" y="223" font-size="13" fill="${C.muted}">Experience</text>

<rect x="60" y="${LY - 1.5}" width="${W - 120}" height="3" rx="1.5" fill="url(#${p}line)" opacity=".9"/>
<rect x="60" y="${LY - 5}" width="${W - 120}" height="10" rx="5" fill="url(#${p}line)" opacity=".35" filter="url(#${p}b2)"/>
<circle cx="${x0}" cy="${LY}" r="6" fill="#ffffff" filter="url(#${p}b2)">
  <animate attributeName="cx" values="${x0};${x1}" dur="7s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="7s" repeatCount="indefinite"/>
</circle>
${nodes}
${chips}
<text class="mono" x="${W - 48}" y="592" text-anchor="end" font-size="11" fill="${C.dim}">click to open the full profile on LinkedIn ↗</text>
${pan.border}`;

  return svg(W, H, `${P.name} on LinkedIn — experience & education`, body);
}

// ───────────────────────────── name card ─────────────────────────────

// Lit windows on a building face; a few twinkle.
function windows(r, x, top, w, bottom, lit, dim = 1) {
  let out = '';
  for (let y = top + 8; y < bottom - 6; y += 9) {
    for (let wx = x + 4; wx < x + w - 4; wx += 7) {
      if (r() > lit) continue;
      const tw = r() < 0.12 ? ` class="tw t${1 + Math.floor(r() * 4)}"${delay(r, 6)}` : '';
      out += `<rect${tw} x="${n(wx)}" y="${n(y)}" width="2.4" height="3.6" fill="${pick(r, [C.amber, C.amber, '#fff3e0', C.ice, C.glow])}" opacity="${n(dim * (0.45 + r() * 0.55), 2)}"/>`;
    }
  }
  return out;
}

// Stylised Chicago lakefront: haze layer, Willis & Hancock towers, foreground blocks.
function skyline(p, r, x0, x1, HZ) {
  let back = '';
  let front = '';
  let refl = '';
  for (let x = x0; x < x1; ) {
    const w = 26 + r() * 30;
    const h = 90 + r() * 110;
    back += `<rect x="${n(x)}" y="${n(HZ - h)}" width="${n(w)}" height="${n(h)}" fill="#18245f" opacity=".75"/>${windows(r, x, HZ - h, w, HZ, 0.18, 0.5)}`;
    x += w + 4 + r() * 10;
  }

  const willis = [[770, 70, 166], [777, 56, 202], [784, 42, 232]];
  let towers = '';
  for (const [x, w, h] of willis) towers += `<rect x="${x}" y="${HZ - h}" width="${w}" height="${h}" fill="url(#${p}bld)"/>`;
  towers += windows(r, 770, HZ - 166, 70, HZ, 0.32) + windows(r, 784, HZ - 232, 42, HZ - 166, 0.32);
  towers += `<path d="M791 ${HZ - 232}v-44M819 ${HZ - 232}v-44" stroke="#2c3b86" stroke-width="2"/>`;
  towers += `<path d="M900 ${HZ}L952 ${HZ}L944 ${HZ - 222}L908 ${HZ - 222}Z" fill="url(#${p}bld)"/>`;
  for (let k = 0; k < 4; k++) {
    const yA = HZ - k * 55, yB = HZ - (k + 1) * 55;
    towers += `<path d="M${n(900 + k * 2)} ${yA}L${n(944 - k * 2)} ${yB}M${n(952 - k * 2)} ${yA}L${n(908 + k * 2)} ${yB}" stroke="#2c3b86" stroke-width="1" opacity=".7"/>`;
  }
  towers += windows(r, 902, HZ - 220, 48, HZ, 0.26);
  towers += `<path d="M916 ${HZ - 222}v-40M936 ${HZ - 222}v-40" stroke="#2c3b86" stroke-width="2"/>`;
  // Aircraft-warning beacons, the one warm red in the scene (like the ribbon in the reference).
  for (const [bx, by] of [[791, HZ - 276], [819, HZ - 276], [916, HZ - 262], [936, HZ - 262]]) {
    towers += `<circle class="blink"${delay(r, 2)} cx="${bx}" cy="${by}" r="2.6" fill="#ff4d5e"/><circle class="blink"${delay(r, 2)} cx="${bx}" cy="${by}" r="8" fill="#ff4d5e" opacity=".5" filter="url(#${p}b2)"/>`;
    refl += `<ellipse class="flick" cx="${bx}" cy="${HZ + 40}" rx="2.5" ry="22" fill="#ff4d5e" opacity=".25" filter="url(#${p}b2)"/>`;
  }

  for (let x = x0 - 10; x < x1; ) {
    const w = 22 + r() * 34;
    const h = 40 + r() * 100;
    if (!(x > 760 && x < 850) && !(x > 890 && x < 960)) {
      front += `<rect x="${n(x)}" y="${n(HZ - h)}" width="${n(w)}" height="${n(h)}" fill="url(#${p}bld)"/><rect x="${n(x)}" y="${n(HZ - h)}" width="${n(w)}" height="1" fill="#6f9bff" opacity=".35"/>${windows(r, x, HZ - h, w, HZ, 0.3)}`;
      refl += `<rect class="flick"${delay(r, 5)} x="${n(x + 3)}" y="${HZ + 2}" width="${n(w - 6)}" height="${n(h * 0.5)}" fill="url(#${p}refl)" filter="url(#${p}b2)"/>`;
    }
    x += w + 2 + r() * 8;
  }
  return { skyline: back + towers + front, refl };
}

export function nameCard(P) {
  const W = 1050, H = 600, HZ = 424, p = 'c';
  const r = rng(1890);
  const { skyline: city, refl } = skyline(p, r, 560, W + 10, HZ);
  const contacts = [
    ['mail', P.email],
    ['linkedin', P.linkedin.replace(/^https?:\/\/(www\.)?/, '')],
    ['globe', P.homepage.replace(/^https?:\/\//, '')],
    ['code', `github.com/${P.user}`],
  ];
  const contactSvg = contacts
    .map(([icon, label], i) => {
      const x = 64 + (i % 2) * 330;
      const y = 478 + Math.floor(i / 2) * 50;
      const glyph =
        icon === 'linkedin'
          ? `<rect x="${x}" y="${y - 19}" width="24" height="24" rx="5" fill="${C.linkedin}"/>${ICON.linkedin(x + 2.6, y - 16.6, 0.8)}`
          : ICON[icon](x, y - 19, 1, C.glow);
      return `${glyph}<text x="${x + 36}" y="${y}" font-size="19" fill="${C.frost}">${esc(label)}</text>`;
    })
    .join('\n');
  const statusW = textWidth(P.status, 12, 3) + 46;

  const body = `<style>${baseCss}${animCss}
.blink{animation:blink 2s steps(1) infinite}
@keyframes blink{0%,55%{opacity:1}56%,100%{opacity:.15}}
.holo{animation:holo 7s ease-in-out infinite}
@keyframes holo{0%{transform:translateX(-500px)}40%,100%{transform:translateX(${W + 500}px)}}
</style>
<defs>
${baseDefs(p)}
${bokehDefs(p)}
<clipPath id="${p}clip"><rect width="${W}" height="${H}" rx="28"/></clipPath>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"><stop offset="0" stop-color="${C.night0}"/><stop offset=".55" stop-color="#0d1744"/><stop offset=".9" stop-color="#22357e"/><stop offset="1" stop-color="#4f78d8"/></linearGradient>
<linearGradient id="${p}sea" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"><stop offset="0" stop-color="#7fbcff"/><stop offset=".08" stop-color="#2f6ad0"/><stop offset=".5" stop-color="#143789"/><stop offset="1" stop-color="${C.sea4}"/></linearGradient>
<linearGradient id="${p}bld" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121c52"/><stop offset="1" stop-color="#070c2a"/></linearGradient>
<linearGradient id="${p}refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.amber}" stop-opacity=".22"/><stop offset="1" stop-color="${C.amber}" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}stripe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.maroon}"/><stop offset=".6" stop-color="#b3263a"/><stop offset="1" stop-color="${C.ribbon}"/></linearGradient>
<linearGradient id="${p}uline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.ribbon}"/><stop offset="1" stop-color="${C.ribbon}" stop-opacity="0"/></linearGradient>
<radialGradient id="${p}seal" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#c2384d"/><stop offset="1" stop-color="${C.maroon}"/></radialGradient>
<linearGradient id="${p}holo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="${C.glow}" stop-opacity=".08"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset=".55" stop-color="${C.blush}" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="${p}edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.rose}" stop-opacity=".6"/><stop offset=".5" stop-color="${C.lavender}" stop-opacity=".12"/><stop offset="1" stop-color="${C.glow}" stop-opacity=".55"/></linearGradient>
</defs>
<g clip-path="url(#${p}clip)">
  <rect width="${W}" height="${HZ}" fill="url(#${p}sky)"/>
  <circle cx="${W - 60}" cy="40" r="240" fill="${C.lavender}" opacity=".25" filter="url(#${p}b4)"/>
  <circle cx="160" cy="180" r="220" fill="#3a56c8" opacity=".22" filter="url(#${p}b4)"/>
  ${stars(r, 70, 0, 0, W, HZ - 60)}
  <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${p}sea)"/>
  <ellipse cx="${W / 2}" cy="${HZ}" rx="${W * 0.6}" ry="26" fill="#8fc4ff" opacity=".35" filter="url(#${p}b4)"/>
  ${city}
  <rect y="${HZ - 1}" width="${W}" height="2" fill="#cfe6ff" opacity=".55" filter="url(#${p}b1)"/>
  ${refl}
  <path class="drift2" d="${wave(HZ + 44, 2.5, 300, W)}" fill="none" stroke="#bfe0ff" stroke-opacity=".18"/>
  <path class="drift3" d="${wave(HZ + 96, 4, 300, W)}" fill="none" stroke="#bfe0ff" stroke-opacity=".14"/>
  ${glitter(r, W, HZ, H, 120, 0.9)}
  ${bokehDisc(p, r, 70, 60, 46, 0.8)}${bokehDisc(p, r, 520, 30, 30, 0.7)}${bokehDisc(p, r, 1000, 488, 40, 0.7)}
  <rect width="12" height="${H}" fill="url(#${p}stripe)"/>
  <rect x="10" width="18" height="${H}" fill="${C.ribbon}" opacity=".35" filter="url(#${p}b3)"/>
  <g class="holo"><rect x="-300" y="-100" width="300" height="${H + 200}" fill="url(#${p}holo)" transform="skewX(-24)"/></g>
</g>

<text x="64" y="84" font-size="15" font-weight="700" letter-spacing="5" fill="${C.rose}">${esc(P.school)}</text>
<rect x="64" y="98" width="230" height="2" fill="url(#${p}uline)"/>

<circle cx="${W - 82}" cy="82" r="40" fill="${C.maroon}" opacity=".6" filter="url(#${p}b3)"/>
<circle cx="${W - 82}" cy="82" r="36" fill="url(#${p}seal)"/>
<circle cx="${W - 82}" cy="82" r="30" fill="none" stroke="#ffffff" stroke-opacity=".45" stroke-dasharray="1.5 3"/>
<text x="${W - 80}" y="88" text-anchor="middle" font-size="17" font-weight="700" letter-spacing="2" fill="#ffffff">ADS</text>

<text x="62" y="194" font-size="64" font-weight="300" letter-spacing="2" fill="${C.text}" filter="url(#${p}glow)">${esc(P.name)}</text>
<text x="64" y="244" font-size="26" font-weight="400" fill="${C.frost}">${esc(P.program)}</text>
<text class="mono" x="64" y="280" font-size="15" fill="${C.muted}">${esc(P.cohort)}</text>

<rect x="64" y="306" width="${n(statusW)}" height="32" rx="16" fill="${C.amber}" fill-opacity=".1" stroke="${C.amber}" stroke-opacity=".5"/>
<circle class="pulse" cx="84" cy="322" r="4.5" fill="${C.amber}"/>
<circle cx="84" cy="322" r="4.5" fill="${C.amber}"/>
<text x="100" y="327" font-size="12" font-weight="700" letter-spacing="3" fill="${C.amber}">${esc(P.status)}</text>

${contactSvg}
<text class="mono" x="${W - 40}" y="${H - 28}" text-anchor="end" font-size="13" fill="${C.muted}" opacity=".85">${esc(P.campus)}</text>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="27" fill="none" stroke="url(#${p}edge)" stroke-width="2"/>`;

  return svg(W, H, `${P.name} — ${P.program}, ${P.school}`, body);
}

// ───────────────────────────── divider ─────────────────────────────

export function divider() {
  const W = 1200, H = 40, p = 'd';
  const body = `<style>${baseCss}
.beat{animation:beat 3.2s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
@keyframes beat{0%,100%{transform:scale(.8);opacity:.7}50%{transform:scale(1.15);opacity:1}}
</style>
<defs>${baseDefs(p)}
<linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6f9bff" stop-opacity="0"/><stop offset=".3" stop-color="#6f9bff"/><stop offset=".5" stop-color="${C.glow}"/><stop offset=".7" stop-color="${C.lavender}"/><stop offset="1" stop-color="${C.lavender}" stop-opacity="0"/></linearGradient>
</defs>
<rect x="60" y="18" width="${W - 120}" height="4" rx="2" fill="url(#${p}g)" opacity=".5" filter="url(#${p}b2)"/>
<rect x="60" y="19.4" width="${W - 120}" height="1.2" fill="url(#${p}g)"/>
<circle cx="60" cy="20" r="3" fill="${C.glow}" filter="url(#${p}b1)">
  <animate attributeName="cx" values="300;900" dur="5s" repeatCount="indefinite"/>
  <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite"/>
</circle>
${sparkle(540, 20, 4, C.lavender, ' class="tw t2"')}
${sparkle(660, 20, 4, '#6f9bff', ' class="tw t3"')}
<g class="beat">${sparkle(600, 20, 9, '#6f9bff', ` filter="url(#${p}soft)"`)}${sparkle(600, 20, 4, C.ribbon)}</g>`;
  return svg(W, H, 'divider', body);
}

// ───────────────────────────── footer ─────────────────────────────

export function footer(P) {
  const W = 1200, H = 230, HZ = 150, p = 'f';
  const r = rng(4242);
  const { lights, refl } = harbourLights(p, r, W, HZ, 90, { centreDim: 0.6, spread: 14 });
  const body = `<style>${baseCss}${animCss}</style>
<defs>
${baseDefs(p)}
<clipPath id="${p}clip"><rect width="${W}" height="${H}" rx="22"/></clipPath>
<linearGradient id="${p}sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="${HZ}"><stop offset="0" stop-color="${C.night0}"/><stop offset=".7" stop-color="#132060"/><stop offset="1" stop-color="#4a72d8"/></linearGradient>
<linearGradient id="${p}sea" gradientUnits="userSpaceOnUse" x1="0" y1="${HZ}" x2="0" y2="${H}"><stop offset="0" stop-color="#7fbcff"/><stop offset=".15" stop-color="${C.sea2}"/><stop offset="1" stop-color="${C.sea4}"/></linearGradient>
<linearGradient id="${p}edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.glow}" stop-opacity=".5"/><stop offset=".5" stop-color="${C.lavender}" stop-opacity=".12"/><stop offset="1" stop-color="${C.blush}" stop-opacity=".45"/></linearGradient>
</defs>
<g clip-path="url(#${p}clip)">
  <rect width="${W}" height="${HZ}" fill="url(#${p}sky)"/>
  <circle cx="600" cy="70" r="200" fill="#3a56c8" opacity=".3" filter="url(#${p}b4)"/>
  ${stars(r, 60, 0, 0, W, HZ - 20)}
  <rect y="${HZ}" width="${W}" height="${H - HZ}" fill="url(#${p}sea)"/>
  <ellipse cx="600" cy="${HZ}" rx="640" ry="22" fill="#8fc4ff" opacity=".4" filter="url(#${p}b3)"/>
  ${lights}
  ${refl}
  ${glitter(r, W, HZ, H, 110, 0.8)}
  <path class="drift3" d="${wave(HZ + 30, 3, 300, W, H)}" fill="#1d4fb0" fill-opacity=".35" stroke="#bfe0ff" stroke-opacity=".25"/>
  <path class="drift2" d="${wave(HZ + 50, 4, 300, W, H)}" fill="#163f98" fill-opacity=".55" stroke="#bfe0ff" stroke-opacity=".18"/>
  <path class="drift" d="${wave(HZ + 66, 5, 300, W, H)}" fill="#0b2463" fill-opacity=".85" stroke="#bfe0ff" stroke-opacity=".14"/>
  ${motes(r, W, HZ - 20, H, 10)}
  <text x="600" y="76" text-anchor="middle" font-size="26" font-weight="300" font-style="italic" letter-spacing="1.5" fill="${C.text}" filter="url(#${p}glow)">${esc(P.motto)}</text>
  ${sparkle(470, 108, 4, C.glow, ' class="tw t2"')}
  <text x="603" y="113" text-anchor="middle" font-size="12" font-weight="600" letter-spacing="6" fill="${C.muted}">THANKS FOR STOPPING BY</text>
  ${sparkle(730, 108, 4, C.blush, ' class="tw t3"')}
</g>
<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="21" fill="none" stroke="url(#${p}edge)" stroke-width="2"/>`;
  return svg(W, H, P.motto, body);
}
