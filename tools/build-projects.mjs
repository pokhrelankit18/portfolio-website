// Builds everything project-related from projects-data.js.
//
//   node tools/build-projects.mjs
//
// Writes:
//   projects/<slug>.html     one case-study page per entry in CASE_STUDIES
//   projects.html            the list (between projects:start / projects:end)
//                            and its JSON-LD (projects-ld:start / projects-ld:end)
//   index.html               the home page's selected work (featured:start / featured:end)
//   sitemap.xml              every page, including the case studies

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { buildTerminal } from './build-terminal.mjs';
import { root, esc, webpSize, loadData, replaceBetween } from './lib.mjs';

const SITE = 'https://www.pokhrelankit.com.np';
const { CASE_STUDIES, MORE_PROJECTS, ARCHIVE, HOME_FEATURED, WRITING } = loadData(
  'projects-data.js', 'CASE_STUDIES', 'MORE_PROJECTS', 'ARCHIVE', 'HOME_FEATURED', 'WRITING',
);

const GROUPS = [
  ['research', 'Research', 'Papers, theses and capstones, with the numbers behind them.'],
  ['builds', 'Builds', 'Things I built because the problem was worth solving.'],
  ['work', 'Work', 'Client work at Layman AI.'],
];

const ICON = { src: 'github', live: 'arrow-up-right-from-square', video: 'youtube', pypi: 'box', medium: 'medium', post: 'medium' };
const icon = (kind, prefix) =>
  `<svg class="ic" aria-hidden="true"><use href="${prefix}assets/icons.svg#${ICON[kind] || ICON.live}"/></svg>`;

const assetDir = slug => join(root, 'assets/projects', slug);
const need = (slug, file) => {
  const p = join(assetDir(slug), file);
  if (!existsSync(p)) throw new Error(`${slug}: missing assets/projects/${slug}/${file}`);
  return p;
};
const sizeAttrs = (slug, file) => {
  const p = need(slug, file);
  if (file.endsWith('.gif')) {
    const b = readFileSync(p);
    return ` width="${b.readUInt16LE(6)}" height="${b.readUInt16LE(8)}"`;
  }
  if (!file.endsWith('.webp')) return '';
  const [w, h] = webpSize(p);
  return ` width="${w}" height="${h}"`;
};

/* ---------------------------------------------------------------- shared page shell */

const nav = (prefix, active) => {
  const pages = [['home', './'], ['projects', 'projects.html'], ['about', 'about.html'], ['gallery', 'gallery.html'], ['contact', 'contact.html']];
  const links = pages
    .map(([name, href]) => `<a href="${prefix}${href === './' && prefix ? '' : href}"${name === active ? ' class="active"' : ''}>${name}</a>`)
    .join('\n        ');
  return `  <nav>
    <div class="nav-inner">
      <a href="${prefix || './'}" class="nav-logo"><span class="tilde">~</span><span class="slash">/</span>ankit</a>
      <div class="nav-links">
        ${links}
      </div>
      <button class="nav-burger" id="burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div class="nav-mobile" id="nav-mobile">
    ${links.replace(/\n {8}/g, '\n    ')}
  </div>`;
};

const footer = `  <footer>
    <div class="foot-inner">
      <span>lalitpur, np</span>
      <span id="foot-clock"></span>
      <div class="foot-right">
        <span>© <span class="foot-year">2026</span> ankit pokhrel</span>
      </div>
    </div>
  </footer>`;

const shell = ({ title, desc, url, ogImage, ogAlt, prefix, active, jsonld, main }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script>document.documentElement.classList.add('js')</script>
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${url}" />
  <meta name="author" content="Ankit Pokhrel" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="theme-color" content="#f3efe6" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${url}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(desc)}" />
  <meta property="og:image" content="${ogImage}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(ogAlt)}" />
  <meta property="og:site_name" content="Ankit Pokhrel" />
  <meta property="og:locale" content="en_US" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(desc)}" />
  <meta name="twitter:image" content="${ogImage}" />
  <meta name="twitter:site" content="@_pokhrelankit" />
  <meta name="twitter:creator" content="@_pokhrelankit" />

  <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2).replace(/^/gm, '  ')}
  </script>
  <link rel="icon" type="image/png" href="${prefix}assets/favicon.png" />
  <link rel="apple-touch-icon" href="${prefix}assets/apple-touch-icon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Noto+Serif+Devanagari:wght@500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="${prefix}style.css" />
</head>
<body>
  <a class="skip-link" href="#main">skip to content</a>

${nav(prefix, active)}

${main}

${footer}

  <script src="${prefix}script.js"></script>
</body>
</html>
`;

/* ---------------------------------------------------------------- case-study pages */

const linkButtons = (links, prefix) =>
  links.length
    ? `<div class="cs-links">${links
        .map(l => `<a class="btn btn-line" href="${l.href}" target="_blank" rel="noopener">${icon(l.kind, prefix)} ${esc(l.label)}</a>`)
        .join('')}</div>`
    : '';

const video = (slug, v, prefix, extraClass = '') => {
  need(slug, v.src);
  return `<video class="cs-video${extraClass}" src="${prefix}assets/projects/${slug}/${v.src}"` +
    (v.poster ? ` poster="${prefix}assets/projects/${slug}/${v.poster}"` : '') +
    ' muted loop playsinline preload="none" controls data-autoplay></video>';
};

const figure = (slug, b, prefix, cls = 'cs-fig') => {
  const src = `${prefix}assets/projects/${slug}/${b.fig || b.img}`;
  return `<figure class="${cls}${b.light ? ' is-light' : ''}">
          <button class="zoom" type="button" data-full="${src}" aria-label="Enlarge image: ${esc(b.alt)}">
            <img src="${src}"${sizeAttrs(slug, b.fig || b.img)} alt="${esc(b.alt)}" loading="lazy" decoding="async" />
          </button>
          ${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}
        </figure>`;
};

const block = (slug, b, prefix) => {
  if (b.h) return `<h2>${b.h}</h2>`;
  if (b.p) return `<p>${b.p}</p>`;
  if (b.list) return `<ul>\n${b.list.map(i => `          <li>${i}</li>`).join('\n')}\n        </ul>`;
  if (b.code) return `<pre class="cs-code">${esc(b.code)}</pre>`;
  if (b.fig) return figure(slug, b, prefix);
  if (b.video) return `<figure class="cs-fig">${video(slug, { src: b.video, poster: b.poster }, prefix)}${b.caption ? `<figcaption>${b.caption}</figcaption>` : ''}</figure>`;
  throw new Error(`${slug}: unknown block ${JSON.stringify(b).slice(0, 80)}`);
};

const hero = (c, prefix) => {
  const h = c.hero;
  const cap = h.caption ? `\n      <figcaption>${h.caption}</figcaption>` : '';
  if (h.video) {
    return `<figure class="cs-hero">
      ${video(c.slug, { src: h.video, poster: h.poster }, prefix)}${cap}
    </figure>`;
  }
  if (h.videos) {
    return `<figure class="cs-hero cs-hero-pair">
      <div class="cs-pair">${h.videos.map(v => video(c.slug, v, prefix, ' is-portrait')).join('')}</div>${cap}
    </figure>`;
  }
  return `<figure class="cs-hero${h.light ? ' is-light' : ''}">
      <button class="zoom" type="button" data-full="${prefix}assets/projects/${c.slug}/${h.img}" aria-label="Enlarge image: ${esc(h.alt)}">
        <img src="${prefix}assets/projects/${c.slug}/${h.img}"${sizeAttrs(c.slug, h.img)} alt="${esc(h.alt)}" fetchpriority="high" decoding="async" />
      </button>${cap}
    </figure>`;
};

const caseJsonLd = (c, url) => {
  const src = c.links.find(l => l.kind === 'src');
  const work = {
    '@type': src ? 'SoftwareSourceCode' : 'CreativeWork',
    '@id': `${url}#work`,
    name: c.title,
    description: c.summary,
    url,
    image: `${SITE}/assets/projects/${c.slug}/og.jpg`,
    dateCreated: c.year,
    keywords: (c.facts.find(f => f[0] === 'stack') || [, ''])[1],
    author: { '@id': `${SITE}/#ankit` },
  };
  if (src) work.codeRepository = src.href;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${c.title} | Ankit Pokhrel`,
        isPartOf: { '@id': `${SITE}/#website` },
        mainEntity: { '@id': `${url}#work` },
      },
      work,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}/projects.html` },
          { '@type': 'ListItem', position: 3, name: c.title, item: url },
        ],
      },
    ],
  };
};

const ordered = GROUPS.flatMap(([g]) => CASE_STUDIES.filter(c => c.group === g));

const casePage = (c, i) => {
  const prefix = '../';
  const url = `${SITE}/projects/${c.slug}.html`;
  need(c.slug, 'og.jpg');
  const prev = ordered[(i - 1 + ordered.length) % ordered.length];
  const next = ordered[(i + 1) % ordered.length];

  // reading time like Medium: words in the body at ~238 wpm, at least 1 minute
  const words = c.body.map(b => [b.h, b.p, ...(b.list || []), b.caption].filter(Boolean).join(' '))
    .join(' ').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length + c.summary.split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 238));
  const stack = (c.facts.find(f => f[0] === 'stack') || [, ''])[1]
    .split(/,\s*(?![^()]*\))/).map(t => t.trim()).filter(Boolean);
  const notes = c.facts.filter(f => f[0] !== 'stack')
    .map(([k, v]) => `<li><span>${esc(k)}</span> ${esc(v)}</li>`).join('\n          ');
  const links = c.links.length
    ? `<span class="by-dot">·</span>${c.links.map(l => `<a href="${l.href}" target="_blank" rel="noopener">${icon(l.kind, prefix)}${esc(l.label)}</a>`).join('')}`
    : '';

  const main = `  <main id="main" class="cs article">
    <a class="art-back" href="../projects.html">← all projects</a>
    <header class="art-head">
      <div class="art-kicker">${esc(c.kicker)}</div>
      <h1>${esc(c.title)}</h1>
      <p class="art-sub">${esc(c.summary)}</p>
      <div class="byline">
        <img src="../assets/profile.webp" width="44" height="44" alt="" />
        <div>
          <div class="by-name">Ankit Pokhrel</div>
          <div class="by-meta">${minutes} min read<span class="by-dot">·</span>${esc(c.year)}${links}</div>
        </div>
      </div>
    </header>

    ${hero(c, prefix)}

    <article class="art-body">
        ${c.body.map(b => block(c.slug, b, prefix)).join('\n        ')}
    </article>

    <div class="art-foot">
      ${notes ? `<ul class="art-notes">\n          ${notes}\n        </ul>` : ''}
      ${stack.length ? `<ul class="art-tags">${stack.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
    </div>

    <div class="art-more" role="navigation" aria-label="more case studies">
      <div class="art-more-label">More from Ankit</div>
      <a href="${prev.slug}.html"><span>previous</span>${esc(prev.title)}</a>
      <a href="${next.slug}.html"><span>next</span>${esc(next.title)}</a>
    </div>
  </main>

  <dialog class="lightbox" aria-label="enlarged image">
    <button class="lightbox-close" type="button" aria-label="Close">×</button>
  </dialog>`;

  return shell({
    title: `${c.title} | Ankit Pokhrel`,
    desc: c.summary,
    url,
    ogImage: `${SITE}/assets/projects/${c.slug}/og.jpg`,
    ogAlt: c.title,
    prefix,
    active: 'projects',
    jsonld: caseJsonLd(c, url),
    main,
  });
};

/* ---------------------------------------------------------------- list rows */

const row = (c, prefix, indent = '      ', withStats = true) => {
  need(c.slug, 'cover.webp');
  const stats = (withStats ? c.stats || [] : []).slice(0, 2)
    .map(([v, l]) => `<li><b>${esc(v)}</b> ${esc(l)}</li>`).join('');
  return `${indent}<article class="proj">
${indent}  <div class="proj-media">
${indent}    <img src="${prefix}assets/projects/${c.slug}/cover.webp"${sizeAttrs(c.slug, 'cover.webp')} alt="" loading="lazy" decoding="async" />
${indent}  </div>
${indent}  <div class="proj-body">
${indent}    <div class="proj-kicker">${esc(c.kicker)} · ${esc(c.year)}</div>
${indent}    <h3 class="proj-title"><a href="${prefix}projects/${c.slug}.html">${esc(c.title)}</a></h3>
${indent}    <p class="proj-sum">${esc(c.summary)}</p>
${indent}    ${stats ? `<ul class="proj-stats">${stats}</ul>` : ''}
${indent}    <span class="proj-cta" aria-hidden="true">read the case study <span class="arr">→</span></span>
${indent}  </div>
${indent}</article>`;
};

const moreRow = m => {
  const thumb = m.img
    ? `<img src="./assets/projects/more/${m.img}"${sizeAttrs('more', m.img)} alt="" loading="lazy" decoding="async" />`
    : `<span class="more-tile">${esc(m.tile || m.name)}</span>`;
  const links = m.links
    .map(l => `<a href="${l.href}" target="_blank" rel="noopener">${icon(l.kind, './')}<span>${esc(l.label)}</span></a>`)
    .join('');
  return `        <li class="more-item">
          <div class="more-thumb">${thumb}</div>
          <div class="more-main">
            <h3>${esc(m.name)}</h3>
            <p>${esc(m.desc)}</p>
          </div>
          <div class="more-links">${links}</div>
        </li>`;
};

const archiveRow = ([name, desc, stack, links]) => `        <li>
          <span class="also-name">${esc(name)}</span>
          <span class="also-desc">${esc(desc)}</span>
          <span class="also-stack">${esc(stack)}</span>
          <span class="also-links">${links
            .map(([k, href]) => `<a href="${href}" target="_blank" rel="noopener" aria-label="${{ src: 'Source', video: 'Demo video', post: 'Write-up' }[k] || 'Live demo'}: ${esc(name)}">${icon(k, './')}</a>`)
            .join('')}</span>
        </li>`;

const listMain = () => {
  const sections = GROUPS.map(([g, label, note]) => {
    const items = CASE_STUDIES.filter(c => c.group === g);
    if (!items.length) return '';
    return `    <section class="section proj-group" id="${g}">
      <div class="sec-head">
        <h2>${label}</h2>
        <div class="sec-line"></div>
        <span class="sec-note">${esc(note)}</span>
      </div>
      <div class="proj-list">
${items.map(c => row(c, './', '      ', false)).join('\n')}
      </div>
    </section>`;
  }).filter(Boolean).join('\n\n');

  return `${sections}

    <section class="section" id="more">
      <div class="sec-head">
        <h2>More projects</h2>
        <div class="sec-line"></div>
      </div>
      <ul class="more-list">
${MORE_PROJECTS.map(moreRow).join('\n')}
      </ul>
    </section>

    <section class="section" id="archive">
      <div class="sec-head">
        <h2>Archive</h2>
        <div class="sec-line"></div>
        <a href="https://github.com/ankitpokhrel08?tab=repositories" class="sec-more" target="_blank" rel="noopener">all repos →</a>
      </div>
      <ul class="also-list">
${ARCHIVE.map(archiveRow).join('\n')}
      </ul>
    </section>`;
};

const listJsonLd = () => `  <script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${SITE}/projects.html#webpage`,
      url: `${SITE}/projects.html`,
      name: 'Projects | Ankit Pokhrel',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/#ankit` },
    },
    {
      '@type': 'ItemList',
      name: 'Case studies by Ankit Pokhrel',
      itemListElement: ordered.map((c, i) => ({
        '@type': 'ListItem', position: i + 1, name: c.title, url: `${SITE}/projects/${c.slug}.html`,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE}/projects.html` },
      ],
    },
  ],
}, null, 2).replace(/^/gm, '  ')}
  </script>`;

/* ---------------------------------------------------------------- write */

mkdirSync(join(root, 'projects'), { recursive: true });
ordered.forEach((c, i) => writeFileSync(join(root, 'projects', `${c.slug}.html`), casePage(c, i)));

const projectsPath = join(root, 'projects.html');
let list = readFileSync(projectsPath, 'utf8');
list = replaceBetween(list, 'projects', listMain());
list = replaceBetween(list, 'projects-ld', listJsonLd());
writeFileSync(projectsPath, list);

const indexPath = join(root, 'index.html');
const featured = HOME_FEATURED.map(slug => {
  const c = CASE_STUDIES.find(x => x.slug === slug);
  if (!c) throw new Error(`HOME_FEATURED: unknown slug ${slug}`);
  return row(c, './', '          ', false);
}).join('\n');
const writing = WRITING.map(w => {
  const img = join(root, 'assets/writing', w.img);
  if (!existsSync(img)) throw new Error(`WRITING: missing assets/writing/${w.img}`);
  const [iw, ih] = webpSize(img);
  return `          <article class="post">
            <div class="post-media"><img src="./assets/writing/${w.img}" width="${iw}" height="${ih}" alt="" loading="lazy" decoding="async" /></div>
            <div class="post-body">
              <div class="post-date">${esc(w.date)} · medium</div>
              <h3 class="post-title"><a href="${w.href}" target="_blank" rel="noopener">${esc(w.title)}</a></h3>
              <p>${esc(w.desc)}</p>
            </div>
          </article>`;
}).join('\n');
let home = readFileSync(indexPath, 'utf8');
home = replaceBetween(home, 'featured', featured);
home = replaceBetween(home, 'writing', writing);
writeFileSync(indexPath, home);

const today = new Date().toISOString().slice(0, 10);
const pages = [
  ['', '1.0', 'weekly'], ['projects.html', '0.9', 'monthly'],
  ...ordered.map(c => [`projects/${c.slug}.html`, '0.8', 'monthly']),
  ['about.html', '0.8', 'monthly'], ['gallery.html', '0.6', 'monthly'], ['contact.html', '0.6', 'yearly'],
];
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(([p, pr, cf]) => `  <url><loc>${SITE}/${p}</loc><lastmod>${today}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`assets/fs.json: ${buildTerminal()} files (terminal)`);
console.log(`${ordered.length} case studies, ${MORE_PROJECTS.length} more, ${ARCHIVE.length} archive; home features ${HOME_FEATURED.length}; sitemap ${pages.length} urls`);
