// Rewrites the generated parts of README.md (between <!-- name:start --> and <!-- name:end --> markers)
// from profile.mjs, so the README never has to be edited by hand when the featured list changes.
import { readFile, writeFile } from 'node:fs/promises';

const file = new URL('../README.md', import.meta.url);

function featuredBlock(P, featured, series) {
  const cards = featured
    .map((f) => `<a href="${f.info.html_url}"><img src="./assets/repo-${f.repo}.svg" width="49%" alt="${f.repo}"/></a>`)
    .join('\n');
  let out = `<p align="center">\n${cards}\n</p>`;
  if (series.length) {
    const head = series.map((s) => `[${s.label}](${s.info.html_url})`);
    const rule = series.map(() => ':-:');
    const stars = series.map(
      (s) => `![](https://img.shields.io/github/stars/${s.info.full_name}?style=flat-square&color=${s.color}&labelColor=0b1236&label=★)`,
    );
    const row = (cells) => `| ${cells.join(' | ')} |`;
    out += `\n\n**${P.seriesTitle}**\n\n${row(head)}\n|${rule.join('|')}|\n${row(stars)}`;
  }
  return out;
}

function replaceBlock(text, name, content) {
  const re = new RegExp(`(<!-- ${name}:start -->)[\\s\\S]*?(<!-- ${name}:end -->)`);
  if (!re.test(text)) throw new Error(`README is missing the <!-- ${name}:start --> / <!-- ${name}:end --> markers`);
  return text.replace(re, `$1\n${content}\n$2`);
}

export async function updateReadme(P, featured, series) {
  const before = await readFile(file, 'utf8');
  const after = replaceBlock(before, 'featured', featuredBlock(P, featured, series));
  if (after !== before) {
    await writeFile(file, after);
    console.log('  README.md                      updated');
  }
}
