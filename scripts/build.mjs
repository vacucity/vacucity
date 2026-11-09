// Regenerates every SVG in assets/. Static art is seeded, so only live numbers ever change.
//   node scripts/build.mjs            all assets
//   node scripts/build.mjs --static   skip the GitHub API
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { profile as P } from './profile.mjs';
import { header, button, nameCard, linkedinCard, divider, footer } from './art.mjs';
import { fetchGitHub, lookupRepo, statsCard, repoCard } from './stats.mjs';
import { updateReadme } from './readme.mjs';

const out = new URL('../assets/', import.meta.url);
await mkdir(out, { recursive: true });

// Width/height from a baseline or progressive JPEG's SOF segment.
function jpegSize(buf) {
  for (let i = 2; i < buf.length; ) {
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('no SOF marker in JPEG');
}

async function embedJpeg(path) {
  const buf = await readFile(new URL(`../${path}`, import.meta.url));
  return { href: `data:image/jpeg;base64,${buf.toString('base64')}`, ...jpegSize(buf) };
}

async function emit(files) {
  for (const [name, content] of Object.entries(files)) {
    await writeFile(new URL(name, out), content);
    console.log(`  ${name.padEnd(30)} ${(content.length / 1024).toFixed(1)} KB`);
  }
}

await emit({
  'header.svg': header(P, P.heroine && (await embedJpeg(P.heroine))),
  'btn-linkedin.svg': button('linkedin', 'LinkedIn', P.linkedin.replace(/^.*linkedin\.com\//, '').replace(/\/$/, ''), 11),
  'btn-homepage.svg': button('globe', 'Homepage', P.homepage.replace(/^https?:\/\//, ''), 12),
  'btn-email.svg': button('mail', 'Email', P.email, 13),
  'card.svg': nameCard(P),
  'linkedin.svg': linkedinCard(P),
  'divider.svg': divider(),
  'footer.svg': footer(P),
});

if (!process.argv.includes('--static')) {
  const G = await fetchGitHub(P.user);
  // Resolve every listed repo (following renames/transfers); drop only the ones that are really gone.
  const resolve = async (list, what) => {
    const found = await Promise.all((list || []).map(async (x) => ({ ...x, info: await lookupRepo(P.user, x.repo) })));
    return found.filter((x) => x.info || (console.warn(`  ⚠ ${what} repo not found on GitHub, skipped: ${x.repo}`), false));
  };
  const featured = await resolve(P.featured, 'featured');
  const series = await resolve(P.series, 'series');

  const files = { 'stats.svg': statsCard(G) };
  featured.forEach((f, i) => (files[`repo-${f.repo}.svg`] = repoCard(G, f, i, f.info)));
  await emit(files);

  // Remove cards for repos that are no longer featured.
  for (const name of await readdir(out)) {
    if (name.startsWith('repo-') && name.endsWith('.svg') && !files[name]) {
      await unlink(new URL(name, out));
      console.log(`  ${name.padEnd(30)} removed`);
    }
  }

  await updateReadme(P, featured, series);
}
