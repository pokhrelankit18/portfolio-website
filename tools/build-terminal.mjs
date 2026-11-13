// Builds assets/fs.json: the virtual file system the site terminal browses.
// Everything comes from the same sources as the pages (projects-data.js,
// gallery-data.js, about.html, contact.html), so the terminal never drifts.
//
// Run directly (node tools/build-terminal.mjs) or via build-projects / build-gallery.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { root, loadData } from './lib.mjs';

const strip = html => html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
// keep only the inline tags the terminal renders: b, i, a
const inline = html => html
  .replace(/<(?!\/?(b|i|a)\b)[^>]+>/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const all = (re, s) => [...s.matchAll(re)];

const file = (blocks, extra = {}) => ({ type: 'file', blocks, ...extra });
const dir = children => ({ type: 'dir', children });

export function buildTerminal() {
  const { CASE_STUDIES, MORE_PROJECTS, ARCHIVE, WRITING } = loadData(
    'projects-data.js', 'CASE_STUDIES', 'MORE_PROJECTS', 'ARCHIVE', 'WRITING',
  );
  const { GALLERY } = loadData('gallery-data.js', 'GALLERY');
  const about = readFileSync(join(root, 'about.html'), 'utf8');
  const contact = readFileSync(join(root, 'contact.html'), 'utf8');

  /* ---------- about.md: the bio paragraphs */
  const prose = about.match(/<div class="about-prose[^"]*">([\s\S]*?)<\/div>/)[1];
  const aboutMd = file([
    { h: 'About me' },
    ...all(/<p>([\s\S]*?)<\/p>/g, prose).map(m => ({ p: inline(m[1]) })),
    { img: '/assets/profile.webp', alt: 'Ankit Pokhrel' },
  ]);

  /* ---------- skills.txt */
  const skillRows = all(/<div><dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd><\/div>/g,
    about.match(/<dl class="skills[^"]*">([\s\S]*?)<\/dl>/)[1]);
  const also = about.match(/<p class="skills-also[^"]*"><span>[^<]*<\/span>([\s\S]*?)<\/p>/);
  const skills = file([
    { table: skillRows.map(m => [strip(m[1]), strip(m[2])]) },
    ...(also ? [{ p: `<b>also worked with:</b> ${strip(also[1])}` }] : []),
  ]);

  /* ---------- experience/ and education.md, from the two timeline columns */
  const cols = all(/<div class="tl-col[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*(?=<div class="tl-col|<\/div>\s*<\/section>)/g, about);
  const items = col => all(/<div class="tline-item">([\s\S]*?)<\/div>\s*(?=<div class="tline-item">|$)/g, col + '').map(m => {
    const x = m[1];
    const get = re => (x.match(re) || [, ''])[1];
    return {
      when: strip(get(/<div class="when">([\s\S]*?)<\/div>/)),
      title: strip(get(/<h3>([\s\S]*?)(<span|<\/h3>)/)),
      org: strip(get(/<div class="org">([\s\S]*?)<\/div>/)),
      roles: all(/<li><b>([\s\S]*?)<\/b>([\s\S]*?)<span>([\s\S]*?)<\/span><\/li>/g, get(/<ol class="tl-roles">([\s\S]*?)<\/ol>/))
        .map(r => `<b>${strip(r[1])}</b> ${strip(r[2])} (${strip(r[3])})`),
      bullets: all(/<li>([\s\S]*?)<\/li>/g, get(/<ul>([\s\S]*?)<\/ul>/)).map(l => strip(l[1])),
    };
  });
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const [workCol = '', studyCol = ''] = cols.map(c => c[1]);
  const experience = {};
  items(workCol).forEach((it, i) => {
    // "Secretary, IT Club Pulchowk" -> it-club-pulchowk; ordered like the timeline
    const name = it.title.includes(',') ? it.title.split(',').slice(1).join(',') : it.title.replace(/\s+Fellow$/, '');
    experience[`${i + 1}-${slug(name)}.md`] = file([
      { h: it.title },
      { meta: [it.when, it.org].filter(Boolean).join(' · ') },
      ...(it.roles.length ? [{ list: it.roles }] : []),
      ...(it.bullets.length ? [{ list: it.bullets }] : []),
    ]);
  });
  const education = file(items(studyCol).flatMap(it => [
    { h: it.title }, { meta: [it.when, it.org].filter(Boolean).join(' · ') },
  ]));

  /* ---------- achievements.md + certifications.txt */
  const achievements = file([
    { h: 'Achievements' },
    { list: all(/<span class="mark">([\s\S]*?)<\/span>\s*<div>\s*<h3>([\s\S]*?)<\/h3>\s*<p>([\s\S]*?)<\/p>/g, about)
      .map(m => `<b>${strip(m[2])}</b> (${strip(m[1])}): ${strip(m[3])}`) },
  ]);
  const certs = file([
    { table: all(/<span class="cert-name">([\s\S]*?)<\/span><span class="cert-org">([\s\S]*?)<\/span>/g, about)
      .map(m => [strip(m[1]), strip(m[2])]) },
  ]);

  /* ---------- contact.txt */
  const mail = (contact.match(/mailto:([^"?]+)/) || [, 'pokhrelankit2004@gmail.com'])[1];
  const contactTxt = file([
    { table: [
      ['email', `<a href="mailto:${mail}">${mail}</a>`],
      ...all(/<a href="([^"]+)"[^>]*>(?:<svg[\s\S]*?<\/svg>|<span class="ic[^"]*"[^>]*>[\s\S]*?<\/span>)<span class="cl-name">([\s\S]*?)<\/span><span class="cl-handle">([\s\S]*?)<\/span>/g, contact)
        .filter(m => !m[1].endsWith('.pdf'))
        .map(m => [strip(m[2]).toLowerCase(), `<a href="${m[1]}" target="_blank" rel="noopener">${strip(m[3])}</a>`]),
    ] },
    { p: 'Based in Lalitpur, Nepal (UTC+5:45).' },
  ]);

  /* ---------- projects/ */
  const caseFile = c => {
    const base = `/assets/projects/${c.slug}/`;
    const blocks = [
      { h: c.title },
      { meta: `${c.kicker} · ${c.year}` },
      { p: c.summary },
    ];
    const h = c.hero;
    if (h.img) blocks.push({ img: base + h.img, alt: h.alt, caption: h.caption });
    if (h.video) blocks.push({ video: base + h.video, poster: h.poster && base + h.poster, caption: h.caption });
    if (h.videos) h.videos.forEach((v, i) => blocks.push({ video: base + v.src, poster: v.poster && base + v.poster, caption: i === h.videos.length - 1 ? h.caption : '' }));
    c.body.forEach(b => {
      if (b.h) blocks.push({ h2: b.h });
      else if (b.p) blocks.push({ p: inline(b.p) });
      else if (b.list) blocks.push({ list: b.list.map(inline) });
      else if (b.code) blocks.push({ code: b.code });
      else if (b.fig) blocks.push({ img: base + b.fig, alt: b.alt, caption: b.caption, light: b.light });
      else if (b.video) blocks.push({ video: base + b.video, poster: b.poster && base + b.poster, caption: b.caption });
    });
    blocks.push({ table: c.facts.map(([k, v]) => [k, v]) });
    if (c.links.length) blocks.push({ links: c.links.map(l => [l.label, l.href]) });
    return file(blocks, { web: `/projects/${c.slug}.html` });
  };
  const groups = { research: {}, builds: {}, work: {} };
  CASE_STUDIES.forEach(c => { groups[c.group][`${c.slug}.md`] = caseFile(c); });

  const more = {};
  MORE_PROJECTS.forEach(m => {
    more[`${slug(m.name)}.md`] = file([
      { h: m.name },
      ...(m.img ? [{ img: `/assets/projects/more/${m.img}`, alt: m.name }] : []),
      { p: m.desc },
      { links: m.links.map(l => [l.label, l.href]) },
    ]);
  });
  const archive = file([
    { table: ARCHIVE.map(([name, desc, stack, links]) => [
      name,
      `${desc} <i>(${stack})</i> ${links.map(([k, href]) => `<a href="${href}" target="_blank" rel="noopener">${k === 'src' ? 'source' : k}</a>`).join(' ')}`,
    ]) },
  ]);

  /* ---------- writing/ */
  const writing = {};
  WRITING.forEach(w => {
    writing[`${w.file || slug(w.title)}.md`] = file([
      { h: w.title },
      { meta: `${w.date} · medium` },
      { img: `/assets/writing/${w.img}`, alt: '' },
      { p: w.desc },
      { links: [['read on medium', w.href]] },
    ]);
  });

  /* ---------- gallery/: images open inline */
  const gallery = {};
  GALLERY.forEach(g => {
    g.imgs.forEach((name, i) => {
      const base = name.replace(/\.(jpe?g|png|webp)$/i, '');
      if (!existsSync(join(root, `assets/gallery/web/${base}.webp`))) return;
      gallery[`${base}.webp`] = file([
        { img: `/assets/gallery/web/${base}.webp`, alt: g.title },
        ...(i === 0 ? [{ h2: g.title }, { meta: g.tag }, { p: g.story }] : [{ meta: `${g.title} · ${g.tag}` }]),
      ], { image: true });
    });
  });

  const fs = dir({
    'about.md': aboutMd,
    'skills.txt': skills,
    'education.md': education,
    'achievements.md': achievements,
    'certifications.txt': certs,
    'contact.txt': contactTxt,
    'resume.pdf': { type: 'file', download: '/assets/Resume.pdf', blocks: [] },
    experience: dir(experience),
    projects: dir({
      research: dir(groups.research),
      builds: dir(groups.builds),
      work: dir(groups.work),
      more: dir(more),
      'archive.txt': archive,
    }),
    writing: dir(writing),
    gallery: dir(gallery),
  });

  const out = { built: new Date().toISOString(), home: '/home/ankit', fs };
  writeFileSync(join(root, 'assets/fs.json'), JSON.stringify(out));
  const count = n => n.type === 'dir' ? Object.values(n.children).reduce((a, c) => a + count(c), 0) : 1;
  return count(fs);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log(`assets/fs.json: ${buildTerminal()} files`);
}
