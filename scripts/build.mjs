// Regenerates every SVG in assets/. Static art is seeded, so only live numbers ever change.
//   node scripts/build.mjs            all assets
//   node scripts/build.mjs --static   skip the GitHub API
import { writeFile, mkdir } from 'node:fs/promises';
import { profile as P } from './profile.mjs';
import { header, button, nameCard, linkedinCard, divider, footer } from './art.mjs';
import { fetchGitHub, statsCard, repoCard } from './stats.mjs';

const out = new URL('../assets/', import.meta.url);
await mkdir(out, { recursive: true });

async function emit(files) {
  for (const [name, content] of Object.entries(files)) {
    await writeFile(new URL(name, out), content);
    console.log(`  ${name.padEnd(30)} ${(content.length / 1024).toFixed(1)} KB`);
  }
}

await emit({
  'header.svg': header(P),
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
  const files = { 'stats.svg': statsCard(G) };
  P.featured.forEach((f, i) => (files[`repo-${f.repo}.svg`] = repoCard(G, f, i)));
  await emit(files);
}
