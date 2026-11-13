// Small helpers shared by the build scripts in tools/.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const esc = s =>
  String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Load a plain browser-style data file (`const NAME = ...;`) and return the named globals.
export const loadData = (file, ...names) => {
  const src = readFileSync(join(root, file), 'utf8');
  return new Function(`${src}\nreturn { ${names.join(', ')} };`)();
};

// width/height straight from a WebP header (VP8, VP8L, VP8X)
export const webpSize = file => {
  const b = readFileSync(file);
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (kind === 'VP8L') {
    const n = b.readUInt32LE(21);
    return [(n & 0x3fff) + 1, ((n >> 14) & 0x3fff) + 1];
  }
  if (kind === 'VP8X') return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  throw new Error(`unknown webp chunk in ${file}`);
};

// Replace the content between <!-- NAME:start ... --> and <!-- NAME:end --> markers.
export const replaceBetween = (html, name, content) => {
  const re = new RegExp(`(<!-- ${name}:start[^>]*-->)[\\s\\S]*?(\\s*<!-- ${name}:end -->)`);
  if (!re.test(html)) throw new Error(`${name}:start / ${name}:end markers missing`);
  return html.replace(re, (_, a, b) => `${a}\n${content}${b}`);
};
