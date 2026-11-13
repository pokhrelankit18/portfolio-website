// Builds the static gallery markup in gallery.html from gallery-data.js.
//
//   node tools/build-gallery.mjs
//
// 1. Any photo in assets/gallery/web/ referenced by gallery-data.js that has a
//    .jpg/.jpeg/.png source but no .webp yet gets converted with cwebp
//    (full size <=1100px plus a 640px grid variant, EXIF rotation applied).
//    Needs cwebp and ImageMagick: brew install webp imagemagick
// 2. The <figure> list between the gallery:start / gallery:end markers in
//    gallery.html is regenerated, with width/height and srcset filled in.

import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { buildTerminal } from './build-terminal.mjs';
import { root, esc, webpSize, loadData, replaceBetween } from './lib.mjs';
const imgDir = join(root, 'assets/gallery/web');
const htmlPath = join(root, 'gallery.html');

const { GALLERY } = loadData('gallery-data.js', 'GALLERY');

const ensureWebp = name => {
  const base = join(imgDir, name.replace(/\.(jpe?g|png|webp)$/i, ''));
  const full = `${base}.webp`;
  const small = `${base}-640.webp`;
  if (existsSync(full) && existsSync(small)) return base;

  const source = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
    .map(ext => base + ext)
    .find(existsSync);
  if (!source) throw new Error(`no image found for "${name}" in assets/gallery/web/`);

  // phone photos store rotation in EXIF, which cwebp ignores: bake it into the pixels first
  // (needs ImageMagick: brew install imagemagick)
  const upright = join(tmpdir(), `gallery-${process.pid}.png`);
  execFileSync('magick', [source, '-auto-orient', upright]);
  const width = Number(execFileSync('magick', ['identify', '-format', '%w', upright]).toString());

  const cwebp = (...args) => execFileSync('cwebp', ['-quiet', '-m', '6', '-metadata', 'none', ...args]);
  // only shrink, never upscale
  cwebp('-q', '76', ...(width > 1100 ? ['-resize', '1100', '0'] : []), upright, '-o', full);
  cwebp('-q', '74', ...(width > 640 ? ['-resize', '640', '0'] : []), upright, '-o', small);
  rmSync(upright);
  console.log(`converted ${source.replace(root + '/', '')} (you can delete the original)`);
  return base;
};

const img = (name, alt, active, eager) => {
  const base = ensureWebp(name);
  const file = base.split('/').pop();
  const [w, h] = webpSize(`${base}.webp`);
  const [sw] = webpSize(`${base}-640.webp`);
  return (
    `<img src="./assets/gallery/web/${file}-640.webp"` +
    ` srcset="./assets/gallery/web/${file}-640.webp ${sw}w, ./assets/gallery/web/${file}.webp ${w}w"` +
    ` sizes="(max-width: 560px) 50vw, (max-width: 880px) 33vw, 340px"` +
    ` width="${w}" height="${h}" alt="${esc(alt)}"` +
    (eager ? '' : ' loading="lazy"') +
    ' decoding="async"' +
    (active ? ' class="active"' : '') +
    ' />'
  );
};

const figures = GALLERY.map((item, i) => {
  const eager = i < 3;
  const multi = item.imgs.length > 1;
  const media = multi
    ? `<div class="g-slides">\n          ${item.imgs.map((n, j) => img(n, item.title, j === 0, eager && j === 0)).join('\n          ')}\n        </div>\n        <div class="g-dots"></div>`
    : img(item.imgs[0], item.title, false, eager);
  return `      <figure class="g-item reveal${multi ? ' g-slider' : ''}" tabindex="0">
        ${media}
        <figcaption>
          <span class="g-tag">${esc(item.tag)}</span>
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.story)}</p>
        </figcaption>
      </figure>`;
}).join('\n');

writeFileSync(htmlPath, replaceBetween(readFileSync(htmlPath, 'utf8'), 'gallery', figures));
console.log(`assets/fs.json: ${buildTerminal()} files (terminal)`);
console.log(`gallery.html: ${GALLERY.length} entries written`);
