/* shared site script - every block guards on element existence
   so the same file works across all pages */

/* ---------- cursor trails: elastic tendrils following the mouse ---------- */
if (
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches
) {
  const CFG = { trails: 10, size: 30, friction: 0.5, dampening: 0.3, tension: 0.98 };
  const mouse = { x: -100, y: -100 };
  let ctx, trails = [], raf = null, started = false;

  // slow hue oscillation around the site's amber (≈35), drifting toward gold
  const hue = { phase: Math.random() * Math.PI * 2 };
  const hueNow = () => 35 + Math.sin((hue.phase += 0.0015)) * 18;

  class Node { constructor() { this.x = mouse.x; this.y = mouse.y; this.vx = 0; this.vy = 0; } }

  class Trail {
    constructor(spring) {
      this.spring = spring + Math.random() * 0.1 - 0.02;
      this.friction = CFG.friction + Math.random() * 0.01 - 0.002;
      this.nodes = Array.from({ length: CFG.size }, () => new Node());
    }
    update() {
      let spring = this.spring;
      const first = this.nodes[0];
      first.vx += (mouse.x - first.x) * spring;
      first.vy += (mouse.y - first.y) * spring;
      for (let i = 0; i < this.nodes.length; i++) {
        const n = this.nodes[i];
        if (i > 0) {
          const p = this.nodes[i - 1];
          n.vx += (p.x - n.x) * spring;
          n.vy += (p.y - n.y) * spring;
          n.vx += p.vx * CFG.dampening;
          n.vy += p.vy * CFG.dampening;
        }
        n.vx *= this.friction;
        n.vy *= this.friction;
        n.x += n.vx;
        n.y += n.vy;
        spring *= CFG.tension;
      }
    }
    draw() {
      let x = this.nodes[0].x, y = this.nodes[0].y;
      ctx.beginPath();
      ctx.moveTo(x, y);
      let i = 1;
      for (; i < this.nodes.length - 2; i++) {
        const a = this.nodes[i], b = this.nodes[i + 1];
        x = (a.x + b.x) * 0.5;
        y = (a.y + b.y) * 0.5;
        ctx.quadraticCurveTo(a.x, a.y, x, y);
      }
      const a = this.nodes[i], b = this.nodes[i + 1];
      ctx.quadraticCurveTo(a.x, a.y, b.x, b.y);
      ctx.stroke();
      ctx.closePath();
    }
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-trails';
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  };
  resize();
  window.addEventListener('resize', resize);

  const render = () => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `hsla(${Math.round(hueNow())}, 85%, 60%, 0.14)`;
    ctx.lineWidth = 1;
    for (const t of trails) { t.update(); t.draw(); }
    raf = requestAnimationFrame(render);
  };

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!started) {
      started = true;
      trails = Array.from(
        { length: CFG.trails },
        (_, i) => new Trail(0.4 + (i / CFG.trails) * 0.025)
      );
      render();
    }
  });

  // pause when the tab is hidden, resume on return
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    } else if (started && !raf) {
      render();
    }
  });
}

/* ---------- mobile nav ---------- */
const burger = document.getElementById('burger');
const mobileNav = document.getElementById('nav-mobile');

if (burger && mobileNav) {
  burger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
}

/* ---------- gallery: render figures from gallery-data.js ---------- */
const galleryGrid = document.getElementById('gallery-grid');

if (galleryGrid && typeof GALLERY !== 'undefined') {
  GALLERY.forEach(item => {
    const fig = document.createElement('figure');
    fig.className = 'g-item reveal' + (item.imgs.length > 1 ? ' g-slider' : '');

    const makeImg = (src, active) => {
      const img = document.createElement('img');
      img.src = './assets/gallery/web/' + src;
      img.alt = item.title;
      img.loading = 'lazy';
      if (active) img.classList.add('active');
      return img;
    };

    if (item.imgs.length > 1) {
      const slides = document.createElement('div');
      slides.className = 'g-slides';
      item.imgs.forEach((src, i) => slides.appendChild(makeImg(src, i === 0)));
      fig.appendChild(slides);
      const dots = document.createElement('div');
      dots.className = 'g-dots';
      fig.appendChild(dots);
    } else {
      fig.appendChild(makeImg(item.imgs[0], false));
    }

    const cap = document.createElement('figcaption');
    const tag = document.createElement('span');
    tag.className = 'g-tag';
    tag.textContent = item.tag;
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    const p = document.createElement('p');
    p.textContent = item.story;
    cap.append(tag, h3, p);
    fig.appendChild(cap);

    galleryGrid.appendChild(fig);
  });
}

/* ---------- scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');

if (revealEls.length) {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );
  revealEls.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });
}

/* ---------- footer clock (NPT, UTC+5:45) ---------- */
const clockEl = document.getElementById('foot-clock');

if (clockEl) {
  const tickClock = () => {
    const npt = new Date().toLocaleTimeString('en-GB', {
      timeZone: 'Asia/Kathmandu',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    clockEl.textContent = `${npt} npt`;
  };
  tickClock();
  setInterval(tickClock, 1000);
}

/* ---------- marquee: duplicate track for seamless loop ---------- */
const track = document.getElementById('marquee-track');

if (track) {
  track.innerHTML += track.innerHTML;
}

/* ---------- gallery sliders: auto-scroll groups from the same event ---------- */
document.querySelectorAll('.g-slider').forEach(slider => {
  const imgs = slider.querySelectorAll('.g-slides img');
  const dotsBox = slider.querySelector('.g-dots');
  if (imgs.length < 2 || !dotsBox) return;

  let idx = 0;
  let paused = false;

  imgs.forEach((_, i) => {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      show(i);
    });
    dotsBox.appendChild(dot);
  });

  const dots = dotsBox.querySelectorAll('span');

  function show(i) {
    imgs[idx].classList.remove('active');
    dots[idx].classList.remove('active');
    idx = i % imgs.length;
    imgs[idx].classList.add('active');
    dots[idx].classList.add('active');
  }

  slider.addEventListener('mouseenter', () => { paused = true; });
  slider.addEventListener('mouseleave', () => { paused = false; });

  setInterval(() => { if (!paused) show(idx + 1); }, 3500);
});

/* ---------- gallery: tap toggles story on touch devices ---------- */
const galleryItems = document.querySelectorAll('.g-item');

if (galleryItems.length && window.matchMedia('(hover: none)').matches) {
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      galleryItems.forEach(o => { if (o !== item) o.classList.remove('show'); });
      item.classList.toggle('show');
    });
  });
}

/* ---------- hero terminal: scripted intro, then interactive (home only) ---------- */
const termBody = document.getElementById('term-body');

if (termBody) {
  const PROMPT = '<span class="prompt">ankit@pulchowk<span class="path">:~$</span></span> ';

  const PAGES = {
    home: './', projects: './projects.html', about: './about.html',
    gallery: './gallery.html', contact: './contact.html',
  };

  const print = (html, cls = 'out') => {
    const ln = document.createElement('div');
    ln.className = 'ln ' + cls;
    ln.innerHTML = html;
    termBody.appendChild(ln);
    termBody.scrollTop = termBody.scrollHeight;
  };

  const goTo = (page) => {
    print(`opening <span class="key">${page}</span> ...`);
    setTimeout(() => { window.location.href = PAGES[page]; }, 450);
  };

  const COMMANDS = {
    help: () => print(
      [
        '<span class="key">help</span>           list all commands',
        '<span class="key">cd</span> &lt;page&gt;      go to a page (home, projects, about, gallery, contact)',
        '<span class="key">open</span> &lt;page&gt;    same as cd',
        '<span class="key">ls</span>             list pages',
        '<span class="key">whoami</span>         about me, the short version',
        '<span class="key">cat</span> &lt;file&gt;     read focus.txt, about.md, or hobbies.txt',
        '<span class="key">uptime</span>         the numbers so far',
        '<span class="key">socials</span>        where to find me',
        '<span class="key">resume</span>         download resume.pdf',
        '<span class="key">neofetch</span>       system info',
        '<span class="key">date</span>           current time (npt)',
        '<span class="key">echo</span> &lt;text&gt;    say it back',
        '<span class="key">clear</span>          clean the screen',
        '<span class="key">sudo</span> ...        try it',
      ].join('<br/>')
    ),

    whoami: () => print('ankit · <span class="key">ml engineer</span> in training, shipping anyway'),

    ls: () => print('home/&nbsp;&nbsp;projects/&nbsp;&nbsp;about/&nbsp;&nbsp;gallery/&nbsp;&nbsp;contact/&nbsp;&nbsp;<span class="key">resume.pdf</span>'),

    uptime: () => print('coding for 2+ years · 10+ projects shipped · 2 hackathon awards'),

    socials: () => print(
      'github: <a href="https://github.com/ankitpokhrel08" target="_blank" rel="noopener">ankitpokhrel08</a> · ' +
      'linkedin: <a href="https://www.linkedin.com/in/ankitpokhrel/" target="_blank" rel="noopener">ankitpokhrel</a> · ' +
      'x: <a href="https://x.com/_pokhrelankit" target="_blank" rel="noopener">@_pokhrelankit</a> · ' +
      'medium: <a href="https://medium.com/@pokhrelankit" target="_blank" rel="noopener">@pokhrelankit</a>'
    ),

    resume: () => {
      print('downloading <span class="key">resume.pdf</span> ...');
      const a = document.createElement('a');
      a.href = './assets/Resume.pdf';
      a.download = 'Ankit_Pokhrel_Resume.pdf';
      a.click();
    },

    neofetch: () => {
      // two-tone frames: dim structure, lit pulse (<b> = accent color)
      const lit = s => `<b>${s}</b>`;
      const n = on => (on ? lit('●') : '○');
      const e = st => (st === 'f' ? lit('━━━━▸') : st === 'b' ? lit('◂━━━━') : '─────');
      const dg = (on, s) => (on ? lit(s) : s);

      const net = (l0, l1, l2, e01, e12, out, label) => {
        const x1 = e01 !== '-';
        const x2 = e12 !== '-';
        const nodeRow = tail =>
          ` ${n(l0)}${e(e01)}${n(l1)}${e(e12)}${n(l2)}${tail}`;
        return [
          nodeRow(''),
          `   ${dg(x1, '╲ ╱')}   ${dg(x2, '╲ ╱')}`,
          `    ${dg(x1, '╳')}     ${dg(x2, '╳')}`,
          `   ${dg(x1, '╱ ╲')}   ${dg(x2, '╱ ╲')}`,
          nodeRow(out ? lit('──▶ ŷ = 0.97') : '──▶ ŷ = ?   '),
          `   ${dg(x1, '╲ ╱')}   ${dg(x2, '╲ ╱')}`,
          `    ${dg(x1, '╳')}     ${dg(x2, '╳')}`,
          `   ${dg(x1, '╱ ╲')}   ${dg(x2, '╱ ╲')}`,
          nodeRow(''),
          ``,
          ` ${lit(label.padEnd(18))}`,
        ].join('\n');
      };

      const FRAMES = [
        net(true,  false, false, '-', '-', false, 'forward ▸'),
        net(false, false, false, 'f', '-', false, 'forward ▸▸'),
        net(false, true,  false, '-', '-', false, 'forward ▸▸'),
        net(false, false, false, '-', 'f', false, 'forward ▸▸▸'),
        net(false, false, true,  '-', '-', true,  'prediction ✓'),
        net(false, false, false, '-', 'b', true,  '◂ backprop'),
        net(false, true,  false, '-', '-', false, '◂◂ backprop'),
        net(false, false, false, 'b', '-', false, '◂◂◂ backprop'),
        net(true,  false, false, '-', '-', false, 'weights updated ✓'),
      ];

      const wrap = document.createElement('div');
      wrap.className = 'ln neo';
      wrap.innerHTML =
        '<div class="neo-info">' +
          '<div class="neo-title">ankit@pulchowk</div>' +
          '<div class="neo-sep">──────────────</div>' +
          '<div><span class="nk">os</span>      student-os 4.0</div>' +
          '<div><span class="nk">host</span>    ioe pulchowk campus</div>' +
          '<div><span class="nk">kernel</span>  ai/ml 24.7</div>' +
          '<div><span class="nk">shell</span>   python &gt; everything</div>' +
          '<div><span class="nk">uptime</span>  2+ years of code</div>' +
          '<div><span class="nk">memory</span>  80% models, 20% momo</div>' +
          '<div class="neo-pal">' +
            ['#ff5f56','#ffbd2e','#27c93f','#8ab4ff','#ffb454','#b8b8bd','#6e6e78','#f2f2f0']
              .map(c => `<span style="background:${c}"></span>`).join('') +
          '</div>' +
        '</div>' +
        '<pre class="neo-art"></pre>';
      termBody.appendChild(wrap);
      termBody.scrollTop = termBody.scrollHeight;

      const art = wrap.querySelector('.neo-art');
      let fi = 0;
      art.innerHTML = FRAMES[0];
      const iv = setInterval(() => {
        if (!art.isConnected) { clearInterval(iv); return; }
        fi = (fi + 1) % FRAMES.length;
        art.innerHTML = FRAMES[fi];
      }, 460);
    },

    date: () => print(
      new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kathmandu', dateStyle: 'full', timeStyle: 'medium' }) + ' npt'
    ),

    pwd: () => print('/home/ankit'),

    clear: () => { termBody.innerHTML = ''; },

    exit: () => print("nice try. you're staying."),

    hello: () => print('hello! type <span class="key">help</span> to see what I can do.'),
    hi:    () => print('hi there! type <span class="key">help</span> to see what I can do.'),
  };

  const CAT_FILES = {
    'focus.txt': '<span class="key">deep-learning</span> · <span class="key">nlp</span> · <span class="key">end-to-end ml systems</span>',
    'about.md': 'computer engineering undergrad @ ioe pulchowk. builds rag pipelines, transformers, and cv systems. secretary @ it club pulchowk. full story: <a href="./about.html">./about</a>',
    'hobbies.txt': '<span class="key">cricket</span> (watching + shouting) · <span class="key">music</span> · <span class="key">bike rides</span> · <span class="key">travel</span> · building solutions to whatever crosses my mind',
  };

  const run = (raw) => {
    const input = raw.trim();
    if (!input) return;

    const [cmd, ...args] = input.split(/\s+/);
    const arg = (args[0] || '').replace(/^\.\//, '').replace(/\/$/, '').toLowerCase();

    if (cmd === 'cd' || cmd === 'open' || cmd === 'goto') {
      if (!arg) { print('usage: ' + cmd + ' &lt;page&gt; · pages: home, projects, about, gallery, contact'); return; }
      if (arg === '~' || arg === '..') { goTo('home'); return; }
      if (PAGES[arg]) { goTo(arg); return; }
      print(`${cmd}: no such page: <span class="key">${arg}</span> · try <span class="key">ls</span>`, 'out err');
      return;
    }

    if (cmd === 'cat') {
      if (CAT_FILES[args[0]]) { print(CAT_FILES[args[0]]); return; }
      print(`cat: ${args[0] || ''}: no such file · try <span class="key">focus.txt</span>, <span class="key">about.md</span>, or <span class="key">hobbies.txt</span>`, 'out err');
      return;
    }

    if (cmd === 'echo') { print(args.join(' ') || ''); return; }

    if (cmd === 'sudo') {
      print('ankit is not in the sudoers file. this incident will be reported.', 'out err');
      return;
    }

    // direct page name also routes: "projects" -> projects page
    if (PAGES[cmd.toLowerCase()] && args.length === 0) { goTo(cmd.toLowerCase()); return; }

    if (COMMANDS[cmd.toLowerCase()]) { COMMANDS[cmd.toLowerCase()](); return; }

    print(`command not found: <span class="key">${cmd}</span> · type <span class="key">help</span>`, 'out err');
  };

  /* --- interactive prompt --- */
  const history = [];
  let hIdx = -1;
  let inputLine = null;

  const newPrompt = (focus = false) => {
    inputLine = document.createElement('div');
    inputLine.className = 'ln';
    inputLine.innerHTML = PROMPT;
    const input = document.createElement('input');
    input.className = 'term-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'off';
    input.spellcheck = false;
    input.setAttribute('aria-label', 'terminal input');
    inputLine.appendChild(input);
    termBody.appendChild(inputLine);
    termBody.scrollTop = termBody.scrollHeight;

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value;
        inputLine.innerHTML = PROMPT + '<span class="cmd"></span>';
        inputLine.querySelector('.cmd').textContent = val;
        if (val.trim()) { history.unshift(val); }
        hIdx = -1;
        run(val);
        newPrompt(true);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
        else { hIdx = -1; input.value = ''; }
      }
    });

    if (focus) input.focus({ preventScroll: true });
  };

  // clicking anywhere in the terminal focuses the input
  termBody.closest('.term').addEventListener('click', () => {
    inputLine?.querySelector('input')?.focus({ preventScroll: true });
  });

  /* --- scripted intro, then hand over to the user --- */
  const SCRIPT = [
    { type: 'cmd', text: 'whoami' },
    { type: 'out', html: 'ankit · <span class="key">ml engineer</span> in training, shipping anyway' },
    { type: 'out', html: '<span class="dim-hint">type <span class="key">help</span> for commands · <span class="key">cd projects</span> to navigate</span>' },
  ];

  let li = 0;

  const typeCmd = (ln, text, done) => {
    let ci = 0;
    const caret = '<span class="caret"></span>';
    const step = () => {
      ci++;
      ln.innerHTML = PROMPT + '<span class="cmd">' + text.slice(0, ci) + '</span>' + caret;
      if (ci < text.length) {
        setTimeout(step, 38 + Math.random() * 52);
      } else {
        setTimeout(() => {
          ln.innerHTML = PROMPT + '<span class="cmd">' + text + '</span>';
          done();
        }, 220);
      }
    };
    setTimeout(step, 160);
  };

  const next = () => {
    if (li >= SCRIPT.length) {
      sessionStorage.setItem('term-intro-done', '1');
      newPrompt();
      return;
    }
    const item = SCRIPT[li++];

    if (item.type === 'cmd') {
      const ln = document.createElement('div');
      ln.className = 'ln';
      ln.innerHTML = PROMPT + '<span class="caret"></span>';
      termBody.appendChild(ln);
      typeCmd(ln, item.text, () => setTimeout(next, 120));
    } else {
      print(item.html);
      setTimeout(next, 300);
    }
  };

  // replay the typed intro only once per browser session; on return visits
  // render the finished transcript instantly and go straight to the prompt
  if (sessionStorage.getItem('term-intro-done')) {
    SCRIPT.forEach(item => {
      if (item.type === 'cmd') {
        const ln = document.createElement('div');
        ln.className = 'ln';
        ln.innerHTML = PROMPT + '<span class="cmd"></span>';
        ln.querySelector('.cmd').textContent = item.text;
        termBody.appendChild(ln);
      } else {
        print(item.html);
      }
    });
    newPrompt();
  } else {
    const startIO = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        startIO.disconnect();
        setTimeout(next, 500);
      }
    });
    startIO.observe(termBody);
  }
}
