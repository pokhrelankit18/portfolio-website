/* =====================================================
   Full-screen terminal: the whole portfolio as a file system.
   Loaded on demand from script.js; content comes from
   assets/fs.json (built by tools/build-terminal.mjs).
   Only real shell commands, zsh-style output.
===================================================== */
(() => {
  const HOME = '/home/ankit';
  const USER = 'ankit';
  const HOST = 'ankit';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const text = html => String(html).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  let ROOT = null;       // { home: { ankit: fs } }
  let BUILT = new Date();
  let cwd = HOME;
  const history = [];
  let hIdx = -1;
  let el = {};
  let lastFocus = null;

  /* ---------------------------------------------------------------- file system */

  const load = () => fetch('/assets/fs.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(j => {
      BUILT = new Date(j.built);
      ROOT = { type: 'dir', children: { home: { type: 'dir', children: { ankit: j.fs } } } };
    });

  const normalize = path => {
    if (!path || path === '~') return HOME;
    if (path.startsWith('~/')) path = HOME + path.slice(1);
    else if (!path.startsWith('/')) path = `${cwd}/${path}`;
    const out = [];
    path.split('/').forEach(part => {
      if (!part || part === '.') return;
      if (part === '..') out.pop();
      else out.push(part);
    });
    return '/' + out.join('/');
  };

  const nodeAt = abs => {
    let n = ROOT;
    for (const part of abs.split('/').filter(Boolean)) {
      if (!n || n.type !== 'dir' || !Object.hasOwn(n.children, part)) return null;
      n = n.children[part];
    }
    return n;
  };

  const pretty = abs => (abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs);
  const base = abs => abs.split('/').filter(Boolean).pop() || '/';
  const sizeOf = n => (n.type === 'dir' ? 4096 : n.download ? 139260 : JSON.stringify(n.blocks).length);

  const kindClass = (name, n) => {
    if (n.type === 'dir') return 'd';
    if (n.image) return 'img';
    if (n.download) return 'bin';
    return 'f';
  };

  /* ---------------------------------------------------------------- output */

  const print = (html, cls = '') => {
    const d = document.createElement('div');
    d.className = 'tty-o' + (cls ? ' ' + cls : '');
    d.innerHTML = html;
    el.out.appendChild(d);
    return d;
  };
  let ok = true;          // status of the last command, shown as ✔ / ✘ in the prompt
  const err = msg => { ok = false; return print(esc(msg), 'err'); };
  const scrollDown = () => { el.screen.scrollTop = el.screen.scrollHeight; };

  /* powerline prompt, two lines: ╭─ os │ ~/path ─────── ✔ time ─╮  /  ╰─ command */
  const ICON = {
    os: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M11.2 8.5c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.4-1.3-1-.1-2 .6-2.5.6s-1.3-.6-2.1-.6C4.5 4.8 3.4 5.4 2.8 6.5c-1.2 2.1-.3 5.2.9 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.5 2.2-.5s1.3.5 2.2.5 1.4-.8 2-1.7c.6-.9.9-1.8.9-1.9 0 0-1.9-.7-1.9-3zM9.6 3.6c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.3-.7 2.1.8.1 1.5-.4 2-1z"/></svg>',
    home: '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5 1 7.6l1 1.1 1-.9V14h4V10h2v4h4V7.8l1 .9 1-1.1z"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 4.6V8l2.4 1.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  };
  const clock = () => new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const promptHTML = () =>
    `<div class="pl"><span class="pl-tl"></span><span class="seg seg-os">${ICON.os}</span><span class="seg seg-dir">${ICON.home}<span>${esc(pretty(cwd))}</span></span>` +
    `<span class="pl-rule"></span><span class="pl-ok${ok ? '' : ' bad'}">${ok ? '✔' : '✘'}</span><span class="seg seg-time">${clock()} ${ICON.clock}</span><span class="pl-tr"></span></div>`;
  // zsh-syntax-highlighting: only the command word is coloured (green known, red unknown)
  const hl = raw => {
    const m = String(raw).match(/^(\s*)(\S+)([\s\S]*)$/);
    if (!m) return esc(raw);
    const cls = Object.hasOwn(COMMANDS, m[2]) ? 'good' : 'bad';
    return `${esc(m[1])}<span class="${cls}">${esc(m[2])}</span>${esc(m[3])}`;
  };
  const echoLine = (raw, suffix = '') => {
    const d = print(`${promptHTML()}<div class="pl2"><span class="pl-bl"></span><span class="p-cmd">${hl(raw)}${esc(suffix)}</span><span class="pl-br"></span></div>`, 'cmdline');
    return d;
  };

  // render a file's blocks as a "rendered markdown" view, inside the terminal
  const renderBlocks = blocks => {
    const html = blocks.map(b => {
      if (b.h) return `<div class="r-h1"><span class="r-mark">#</span> ${esc(b.h)}</div>`;
      if (b.h2) return `<div class="r-h2"><span class="r-mark">##</span> ${esc(b.h2)}</div>`;
      if (b.meta) return `<div class="r-meta">${esc(b.meta)}</div>`;
      if (b.p) return `<p class="r-p">${b.p}</p>`;
      if (b.list) return `<ul class="r-list">${b.list.map(i => `<li>${i}</li>`).join('')}</ul>`;
      if (b.code) return `<pre class="r-code">${esc(b.code)}</pre>`;
      if (b.table) return `<div class="r-table">${b.table.map(([k, v]) => `<div class="r-k">${esc(k)}</div><div class="r-v">${v}</div>`).join('')}</div>`;
      if (b.links) return `<div class="r-links">${b.links.map(([l, h]) => `<a href="${esc(h)}" target="_blank" rel="noopener">→ ${esc(l)}</a>`).join('')}</div>`;
      if (b.img) return `<figure class="r-fig${b.light ? ' light' : ''}"><img src="${esc(b.img)}" alt="${esc(b.alt || '')}" loading="lazy" />${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      if (b.video) return `<figure class="r-fig"><video src="${esc(b.video)}"${b.poster ? ` poster="${esc(b.poster)}"` : ''} muted loop playsinline ${REDUCED ? 'controls' : 'autoplay'}></video>${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
      return '';
    }).join('');
    print(html, 'render');
  };

  // plain-text lines of a file, for head / tail / grep
  const lines = n => n.blocks.flatMap(b => {
    if (b.h) return ['# ' + b.h];
    if (b.h2) return ['## ' + b.h2];
    if (b.meta) return [b.meta];
    if (b.p) return [text(b.p)];
    if (b.list) return b.list.map(i => '- ' + text(i));
    if (b.code) return b.code.split('\n');
    if (b.table) return b.table.map(([k, v]) => `${k}: ${text(v)}`);
    if (b.links) return b.links.map(([l, h]) => `${l}: ${h}`);
    if (b.img) return [`![${b.alt || ''}](${b.img})`];
    return [];
  });

  /* ---------------------------------------------------------------- commands */

  const parseFlags = args => {
    const flags = new Set();
    const rest = [];
    args.forEach(a => {
      if (/^-[a-zA-Z]+$/.test(a)) a.slice(1).split('').forEach(f => flags.add(f));
      else rest.push(a);
    });
    return { flags, rest };
  };

  const stamp = BUILT => BUILT.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');

  const lsDir = (n, flags) => {
    let names = Object.keys(n.children).sort((a, b) => a.localeCompare(b));
    if (flags.has('a')) names = ['.', '..', ...names];
    if (flags.has('l')) {
      const rows = names.map(name => {
        const c = name === '.' || name === '..' ? { type: 'dir' } : n.children[name];
        const perm = c.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
        const size = String(sizeOf(c)).padStart(7);
        return `<span class="l-meta">${perm}  ${USER}  staff ${size} ${esc(stamp(BUILT))}</span>  <span class="k-${kindClass(name, c)}">${esc(name)}${c.type === 'dir' ? '/' : ''}</span>`;
      });
      print(`<span class="l-meta">total ${names.length}</span>\n${rows.join('\n')}`, 'pre');
      return;
    }
    print(`<div class="ls-grid">${names.map(name => {
      const c = name === '.' || name === '..' ? { type: 'dir' } : n.children[name];
      return `<span class="k-${kindClass(name, c)}">${esc(name)}${c.type === 'dir' ? '/' : ''}</span>`;
    }).join('')}</div>`);
  };

  const COMMANDS = {
    help() {
      print(
        [
          ['ls [-la] [path]', 'list a directory'],
          ['cd [path]', 'change directory (~, .., /home/ankit/...)'],
          ['pwd', 'print the working directory'],
          ['cat / less <file>', 'show a file, rendered'],
          ['head / tail [-n N] <file>', 'first or last lines, as plain text'],
          ['open <file>', 'show a file or image; open resume.pdf downloads it'],
          ['tree [path]', 'directory tree'],
          ['find [path] -name <pattern>', 'find files by name (* works)'],
          ['grep [-i] <pattern> [path]', 'search inside files'],
          ['echo, history, clear, whoami, date, uname, man, exit', ''],
        ].map(([c, d]) => `<span class="h-cmd">${esc(c).padEnd(30)}</span>${esc(d)}`).join('\n') +
        '\n\n<span class="l-meta">tab completes · ↑ ↓ history · ctrl+l clears · esc or exit closes</span>',
        'pre',
      );
    },

    ls(args) {
      const { flags, rest } = parseFlags(args);
      const targets = rest.length ? rest : ['.'];
      targets.forEach((t, i) => {
        const abs = normalize(t);
        const n = nodeAt(abs);
        if (!n) return err(`ls: ${t}: No such file or directory`);
        if (targets.length > 1) print(`${esc(t)}:`, i ? 'gap' : '');
        if (n.type === 'dir') lsDir(n, flags);
        else print(`<span class="k-${kindClass(t, n)}">${esc(t)}</span>`);
      });
    },

    cd(args) {
      const t = args[0];
      if (t === '-') return err('cd: OLDPWD not set');
      const abs = normalize(t);
      const n = nodeAt(abs);
      if (!n) return err(`cd: no such file or directory: ${t}`);
      if (n.type !== 'dir') return err(`cd: not a directory: ${t}`);
      cwd = abs;
    },

    pwd() { print(esc(cwd)); },

    cat(args, name = 'cat') {
      if (!args.length) return err(`${name}: missing file operand`);
      args.forEach(t => {
        const n = nodeAt(normalize(t));
        if (!n) return err(`${name}: ${t}: No such file or directory`);
        if (n.type === 'dir') return err(`${name}: ${t}: Is a directory`);
        if (n.download) return err(`${name}: ${t}: binary file (try: open ${t})`);
        renderBlocks(n.blocks);
      });
    },
    less(args) { COMMANDS.cat(args, 'less'); },
    more(args) { COMMANDS.cat(args, 'more'); },

    head(args, tail = false) {
      const name = tail ? 'tail' : 'head';
      let count = 10;
      const rest = [];
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-n') { count = parseInt(args[++i], 10) || 10; continue; }
        if (/^-\d+$/.test(args[i])) { count = parseInt(args[i].slice(1), 10); continue; }
        rest.push(args[i]);
      }
      if (!rest.length) return err(`${name}: missing file operand`);
      rest.forEach(t => {
        const n = nodeAt(normalize(t));
        if (!n) return err(`${name}: ${t}: No such file or directory`);
        if (n.type === 'dir') return err(`${name}: error reading '${t}': Is a directory`);
        if (n.download) return err(`${name}: ${t}: binary file`);
        const all = lines(n);
        print(esc((tail ? all.slice(-count) : all.slice(0, count)).join('\n')), 'pre');
      });
    },
    tail(args) { COMMANDS.head(args, true); },

    open(args) {
      if (!args.length) return err('Usage: open <file>');
      args.forEach(t => {
        const n = nodeAt(normalize(t));
        if (!n) return err(`The file ${normalize(t)} does not exist.`);
        if (n.type === 'dir') return lsDir(n, new Set());
        if (n.download) {
          const a = document.createElement('a');
          a.href = n.download;
          a.download = 'Ankit_Pokhrel_Resume.pdf';
          a.click();
          return print(`downloading <span class="k-bin">${esc(base(normalize(t)))}</span> …`);
        }
        renderBlocks(n.blocks);
      });
    },

    tree(args) {
      const { rest } = parseFlags(args.filter(a => a !== '-L' && !/^\d+$/.test(a)));
      const abs = normalize(rest[0] || '.');
      const n = nodeAt(abs);
      if (!n) return err(`${rest[0]} [error opening dir]`);
      let dirs = 0;
      let files = 0;
      const walk = (node, prefix) => Object.keys(node.children).sort().map((name, i, arr) => {
        const c = node.children[name];
        const last = i === arr.length - 1;
        const line = `${prefix}${last ? '└── ' : '├── '}<span class="k-${kindClass(name, c)}">${esc(name)}</span>`;
        if (c.type === 'dir') { dirs++; return [line, ...walk(c, prefix + (last ? '    ' : '│   '))]; }
        files++;
        return [line];
      }).flat();
      const out = walk(n, '');
      print(`<span class="k-d">${esc(rest[0] || '.')}</span>\n${out.join('\n')}\n\n${dirs} directories, ${files} files`, 'pre');
    },

    find(args) {
      let start = '.';
      let pattern = null;
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-name' || args[i] === '-iname') pattern = (args[++i] || '').replace(/^["']|["']$/g, '');
        else if (!args[i].startsWith('-')) start = args[i];
      }
      const abs = normalize(start);
      const n = nodeAt(abs);
      if (!n) return err(`find: ${start}: No such file or directory`);
      const re = pattern ? new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i') : null;
      const out = [];
      const walk = (node, path) => {
        if (!re || re.test(base(path))) out.push(path);
        if (node.type === 'dir') Object.keys(node.children).sort().forEach(k => walk(node.children[k], `${path}/${k}`));
      };
      walk(n, start.replace(/\/$/, ''));
      print(out.length ? esc(out.join('\n')) : '', 'pre');
    },

    grep(args) {
      const { flags, rest } = parseFlags(args);
      const [pattern, start = '.'] = rest;
      if (!pattern) return err('usage: grep [-i] pattern [path]');
      const abs = normalize(start);
      const n = nodeAt(abs);
      if (!n) return err(`grep: ${start}: No such file or directory`);
      const needle = flags.has('i') ? pattern.toLowerCase() : pattern;
      const out = [];
      const walk = (node, path) => {
        if (node.type === 'dir') return Object.keys(node.children).sort().forEach(k => walk(node.children[k], `${path}/${k}`));
        if (node.download) return;
        lines(node).forEach(l => {
          const hay = flags.has('i') ? l.toLowerCase() : l;
          const at = hay.indexOf(needle);
          if (at < 0) return;
          const hit = esc(l.slice(0, at)) + `<mark>${esc(l.slice(at, at + pattern.length))}</mark>` + esc(l.slice(at + pattern.length));
          out.push(`<span class="g-path">${esc(path.replace(/^\.\//, ''))}</span>:${hit}`);
        });
      };
      // always recursive into directories, like grep -r
      walk(n, start === '.' ? '.' : start.replace(/\/$/, ''));
      print(out.join('\n'), 'pre');
    },

    echo(args) { print(esc(args.join(' '))); },
    whoami() { print(USER); },
    hostname() { print(HOST); },
    date() {
      print(esc(new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Kathmandu', weekday: 'short', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, year: 'numeric',
      }).replace(/,/g, '') + ' +0545'));
    },
    uname(args) { print(args.includes('-a') ? `Darwin ${HOST} 25.0.0 arm64` : 'Darwin'); },
    history() { print(esc(history.slice().reverse().map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n')), 'pre'); },
    clear() { el.out.innerHTML = ''; },
    man(args) {
      const page = {
        ls: 'ls [-l] [-a] [path]: list directory contents. -l long format, -a include . and ..',
        cd: 'cd [path]: change the working directory. No argument goes to ~.',
        cat: 'cat file...: print files. Markdown is rendered, images are shown inline.',
        less: 'less file: same as cat here; the whole file is shown.',
        head: 'head [-n N] file: first N lines (default 10) as plain text.',
        tail: 'tail [-n N] file: last N lines (default 10) as plain text.',
        open: 'open file: show a file or image; open resume.pdf downloads it.',
        tree: 'tree [path]: print the directory tree.',
        find: 'find [path] -name pattern: list paths whose name matches (* and ? work).',
        grep: 'grep [-i] pattern [path]: print matching lines with their file.',
      }[args[0]];
      if (!args[0]) return err('What manual page do you want?');
      page ? print(esc(page)) : err(`No manual entry for ${args[0]}`);
    },
    exit() { close(); },
    logout() { close(); },
  };

  const NAMES = Object.keys(COMMANDS).sort();

  /* ---------------------------------------------------------------- run */

  const run = raw => {
    const input = raw.trim();
    echoLine(raw);
    if (!input) return;
    ok = true;
    history.unshift(input);
    // tokens, honouring "quoted strings"
    const tokens = (input.match(/"[^"]*"|'[^']*'|\S+/g) || []).map(t => t.replace(/^["']|["']$/g, ''));
    const [cmd, ...args] = tokens;
    if (!Object.hasOwn(COMMANDS, cmd)) return err(`zsh: command not found: ${cmd}`);
    COMMANDS[cmd](args);
  };

  /* ---------------------------------------------------------------- completion */

  const complete = value => {
    const parts = value.split(/\s+/);
    if (parts.length === 1) {
      const hits = NAMES.filter(n => n.startsWith(parts[0]));
      return { hits, apply: h => h + ' ' };
    }
    const word = parts[parts.length - 1];
    const slash = word.lastIndexOf('/');
    const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '';
    const stem = word.slice(slash + 1);
    const dirNode = nodeAt(normalize(dirPart || '.'));
    if (!dirNode || dirNode.type !== 'dir') return { hits: [] };
    const hits = Object.keys(dirNode.children).filter(k => k.startsWith(stem)).sort()
      .map(k => k + (dirNode.children[k].type === 'dir' ? '/' : ''));
    return {
      hits,
      apply: h => [...parts.slice(0, -1), dirPart + h].join(' ') + (h.endsWith('/') ? '' : ' '),
    };
  };

  const commonPrefix = arr => arr.reduce((p, s) => { while (!s.startsWith(p)) p = p.slice(0, -1); return p; });

  /* ---------------------------------------------------------------- window */

  const updatePrompt = () => {
    el.prompt.innerHTML = promptHTML();
    el.title.textContent = `${USER}:${pretty(cwd)}`;
  };
  // zsh-syntax-highlighting: known command green, unknown red
  // the real <input> is invisible; a mirror draws the highlighted text and a block cursor
  const paint = () => {
    const v = el.input.value;
    el.mirror.innerHTML = hlSplit(v, el.input.selectionStart ?? v.length);
    el.mirror.classList.toggle('blur', document.activeElement !== el.input);
    el.mirror.style.transform = `translateX(${-el.input.scrollLeft}px)`;
  };
  // highlighted text with the cursor block inserted at position `at`
  const hlSplit = (v, at) => {
    const html = hl(v);
    // walk the html, counting visible characters, and drop the cursor in at `at`
    let out = '', seen = 0, i = 0, placed = false;
    while (i < html.length) {
      if (html[i] === '<') { const j = html.indexOf('>', i); out += html.slice(i, j + 1); i = j + 1; continue; }
      let c = html[i], len = 1;
      if (c === '&') { const j = html.indexOf(';', i); len = j - i + 1; c = html.slice(i, j + 1); }
      if (!placed && seen === at) { out += `<span class="cur">${c}</span>`; placed = true; }
      else out += c;
      seen++; i += len;
    }
    if (!placed) out += '<span class="cur"> </span>';
    return out;
  };

  const build = () => {
    const wrap = document.createElement('div');
    wrap.className = 'tty';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'Terminal');
    wrap.innerHTML = `
      <div class="tty-bar">
        <button class="tty-dot tty-close" type="button" aria-label="Close terminal"></button>
        <i class="tty-dot"></i><i class="tty-dot"></i>
        <span class="tty-title"></span>
        <span class="tty-keys" aria-hidden="true">⌥⌘1</span>
      </div>
      <div class="tty-screen">
        <div class="tty-out" aria-live="polite"></div>
        <div class="tty-prompt"></div>
        <label class="tty-line"><span class="pl-bl"></span><span class="tty-field"><span class="tty-mirror" aria-hidden="true"></span><input class="tty-input" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="terminal input" /></span><span class="pl-br"></span></label>
      </div>`;
    document.body.appendChild(wrap);
    el = {
      wrap,
      out: wrap.querySelector('.tty-out'),
      screen: wrap.querySelector('.tty-screen'),
      input: wrap.querySelector('.tty-input'),
      prompt: wrap.querySelector('.tty-prompt'),
      line: wrap.querySelector('.tty-line'),
      mirror: wrap.querySelector('.tty-mirror'),
      title: wrap.querySelector('.tty-title'),
    };

    wrap.querySelector('.tty-close').addEventListener('click', close);
    // click anywhere on the screen (but not on a link or selection) to type
    el.screen.addEventListener('mouseup', e => {
      if (e.target.closest('a, video') || String(window.getSelection())) return;
      el.input.focus({ preventScroll: true });
    });
    // images: click to toggle full width, still inside the terminal
    el.out.addEventListener('click', e => {
      const img = e.target.closest('.r-fig img');
      if (img) img.closest('.r-fig').classList.toggle('big');
    });

    el.input.addEventListener('input', paint);
    ['keyup', 'click', 'select', 'focus', 'blur'].forEach(t => el.input.addEventListener(t, paint));
    document.addEventListener('selectionchange', () => { if (document.activeElement === el.input) paint(); });
    el.input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        run(el.input.value);
        el.input.value = '';
        hIdx = -1;
        paint();
        updatePrompt();
        scrollDown();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx < history.length - 1) el.input.value = history[++hIdx];
        paint();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        hIdx > 0 ? (el.input.value = history[--hIdx]) : ((hIdx = -1), (el.input.value = ''));
        paint();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const { hits, apply } = complete(el.input.value);
        if (hits.length === 1) el.input.value = apply(hits[0]);
        else if (hits.length > 1) {
          const pre = commonPrefix(hits);
          const word = el.input.value.split(/\s+/).pop().split('/').pop();
          if (pre.length > word.length) el.input.value = apply(pre).replace(/ $/, '');
          else { echoLine(el.input.value); print(`<div class="ls-grid">${hits.map(h => `<span class="${h.endsWith('/') ? 'k-d' : 'k-f'}">${esc(h)}</span>`).join('')}</div>`); scrollDown(); }
        }
        paint();
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        COMMANDS.clear();
      } else if (e.key === 'c' && e.ctrlKey && !String(window.getSelection())) {
        e.preventDefault();
        echoLine(el.input.value, '^C');
        el.input.value = '';
        paint();
        scrollDown();
      } else if (e.key === 'Escape') {
        close();
      }
    });
  };

  // boot screen: a few systemd-style lines, then a clean prompt
  const count = n => (n.type === 'dir' ? Object.values(n.children).reduce((a, c) => a + count(c), 0) : 1);
  const boot = () => {
    const home = nodeAt(HOME).children;
    const ok = '<span class="b-ok">[  OK  ]</span>';
    const steps = [
      `<span class="l-meta">ankit-os 26.11 · ${esc(BUILT.toISOString().slice(0, 10))}</span>`,
      `${ok} Mounted /home/ankit`,
      `${ok} Loaded projects <span class="l-meta">(${count(home.projects)})</span>`,
      `${ok} Loaded experience <span class="l-meta">(${count(home.experience)})</span>`,
      `${ok} Loaded writing <span class="l-meta">(${count(home.writing)})</span>`,
      `${ok} Loaded gallery <span class="l-meta">(${count(home.gallery)})</span>`,
      `${ok} Started zsh`,
    ];
    el.line.hidden = true;
    el.prompt.hidden = true;
    const done = () => {
      print('', 'boot-end');
      el.line.hidden = false;
      el.prompt.hidden = false;
      updatePrompt();
      el.input.focus({ preventScroll: true });
      scrollDown();
    };
    if (REDUCED) { steps.forEach(l => print(l, 'boot')); return done(); }
    steps.forEach((l, i) => setTimeout(() => { print(l, 'boot'); scrollDown(); if (i === steps.length - 1) setTimeout(done, 180); }, 90 + i * 110));
  };

  let ready = null;
  const open = () => {
    if (!el.wrap) build();
    lastFocus = document.activeElement;
    document.documentElement.classList.add('tty-open');
    el.wrap.classList.add('on');
    updatePrompt();
    el.input.focus({ preventScroll: true });
    if (!ready) {
      el.prompt.innerHTML = '<span class="l-meta">loading…</span>';
      ready = load().then(boot)
        .catch(() => { err('could not mount the file system (assets/fs.json)'); });
    }
  };

  const close = () => {
    if (!el.wrap) return;
    el.wrap.classList.remove('on');
    document.documentElement.classList.remove('tty-open');
    el.out.querySelectorAll('video').forEach(v => v.pause());
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  };

  window.SiteTerminal = { open, close };
})();
