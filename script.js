/* shared site script - every block guards on element existence
   so the same file works across all pages */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// escape user-typed text before it goes into innerHTML
const escHTML = s =>
  String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- footer year: never goes stale ---------- */
document.querySelectorAll('.foot-year').forEach(el => { el.textContent = new Date().getFullYear(); });

/* ---------- cursor trails: elastic tendrils following the mouse ---------- */
if (
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !REDUCED_MOTION
) {
  const CFG = { trails: 10, size: 30, friction: 0.5, dampening: 0.3, tension: 0.98 };
  const mouse = { x: -100, y: -100 };
  let ctx, trails = [], raf = null, started = false;

  const hue = { phase: Math.random() * Math.PI * 2 };
  const hueNow = () => 218 + Math.sin((hue.phase += 0.0015)) * 10;  // the site's deep blue

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
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = `hsla(${Math.round(hueNow())}, 55%, 38%, 0.16)`;
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
  const scrim = document.createElement('div');
  scrim.className = 'nav-scrim';
  document.body.appendChild(scrim);
  const setMenu = open => {
    mobileNav.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
    document.documentElement.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));
  scrim.addEventListener('click', () => setMenu(false));
  mobileNav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 881px)').addEventListener('change', e => { if (e.matches) setMenu(false); });
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

/* ---------- nav: hairline + shadow only once content scrolls under it ---------- */
const navEl = document.querySelector('nav');

if (navEl) {
  const setScrolled = () => navEl.classList.toggle('scrolled', window.scrollY > 4);
  setScrolled();
  window.addEventListener('scroll', setScrolled, { passive: true });
}

/* ---------- case studies: looping clips play only while on screen ---------- */
const autoVideos = document.querySelectorAll('video[data-autoplay]');

if (autoVideos.length && !REDUCED_MOTION) {
  const vio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      const v = e.target;
      if (e.isIntersecting) {
        v.play().then(() => v.removeAttribute('controls')).catch(() => { /* autoplay blocked: keep controls */ });
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  autoVideos.forEach(v => vio.observe(v));
}

/* ---------- case studies: click a figure to see it full size ---------- */
const lightbox = document.querySelector('dialog.lightbox');

if (lightbox && typeof lightbox.showModal === 'function') {
  // the <img> is created on first open so the page never holds an empty image
  let lbImg = null;
  document.querySelectorAll('.zoom[data-full]').forEach(btn => {
    btn.addEventListener('click', () => {
      const img = btn.querySelector('img');
      if (!lbImg) { lbImg = document.createElement('img'); lightbox.appendChild(lbImg); }
      lbImg.src = btn.dataset.full;
      lbImg.alt = img ? img.alt : '';
      lightbox.showModal();
    });
  });
  // any click (backdrop, image or the close button) closes it; Esc works natively
  lightbox.addEventListener('click', () => lightbox.close());
}

/* ---------- home: signature writes itself, then lands under the photo ---------- */
const sigLoader = document.querySelector('.sig-loader');

if (sigLoader && document.documentElement.classList.contains('sig-intro')) {
  const root = document.documentElement;
  const flying = sigLoader.querySelector('.sig');
  const target = document.querySelector('.sig-home .sig');
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem('sig-done', '1'); } catch (e) {}
    root.classList.remove('sig-intro');
    sigLoader.remove();
  };

  const land = () => {
    if (finished || !target) { finish(); return; }
    window.scrollTo(0, 0);
    const from = flying.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const scale = to.width / from.width;
    sigLoader.classList.add('is-landing');
    flying.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})`;
    flying.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 1400); // safety net if transitionend never fires
  };

  // the SVG knows how long the writing takes; click anywhere to skip to the landing
  const writeMs = parseFloat(flying.dataset.dur || '3') * 1000;
  const timer = setTimeout(land, writeMs + 350);
  sigLoader.addEventListener('click', () => { clearTimeout(timer); land(); }, { once: true });
  setTimeout(finish, writeMs + 3500);
}

/* ---------- contact: copy the address, show the local time ---------- */
const copyBtn = document.getElementById('copy-mail');

if (copyBtn && navigator.clipboard) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(copyBtn.dataset.mail).then(() => {
      copyBtn.textContent = 'copied ✓';
      setTimeout(() => { copyBtn.textContent = 'copy address'; }, 1800);
    });
  });
}

const contactTime = document.getElementById('contact-time');

if (contactTime) {
  contactTime.textContent = new Date().toLocaleTimeString('en-GB', {
    timeZone: 'Asia/Kathmandu', hour: '2-digit', minute: '2-digit',
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

/* ---------- gallery sliders: auto-scroll groups from the same event ---------- */
const sliders = document.querySelectorAll('.g-slider');

if (sliders.length) {
  const state = new Map();

  sliders.forEach(slider => {
    const imgs = slider.querySelectorAll('.g-slides img');
    const dotsBox = slider.querySelector('.g-dots');
    if (imgs.length < 2 || !dotsBox) return;

    const st = { idx: 0, hover: false, visible: false, imgs, dots: [] };

    st.show = i => {
      st.imgs[st.idx].classList.remove('active');
      st.dots[st.idx].classList.remove('active');
      st.idx = i % st.imgs.length;
      st.imgs[st.idx].classList.add('active');
      st.dots[st.idx].classList.add('active');
    };

    imgs.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `photo ${i + 1} of ${imgs.length}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', e => { e.stopPropagation(); st.show(i); });
      dotsBox.appendChild(dot);
      st.dots.push(dot);
    });

    slider.addEventListener('mouseenter', () => { st.hover = true; });
    slider.addEventListener('mouseleave', () => { st.hover = false; });
    slider.addEventListener('focusin', () => { st.hover = true; });
    slider.addEventListener('focusout', () => { st.hover = false; });
    state.set(slider, st);
  });

  // only advance sliders that are on screen, in a visible tab, and only if motion is welcome
  if (!REDUCED_MOTION && state.size) {
    const vis = new IntersectionObserver(entries => {
      entries.forEach(e => { state.get(e.target).visible = e.isIntersecting; });
    });
    state.forEach((_, el) => vis.observe(el));

    setInterval(() => {
      if (document.hidden) return;
      state.forEach(st => { if (st.visible && !st.hover) st.show(st.idx + 1); });
    }, 3500);
  }
}

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

/* ---------- terminal: icon in the nav, full-screen shell loaded on demand ---------- */
const navInner = document.querySelector('.nav-inner');

if (navInner) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-term';
  btn.setAttribute('aria-label', 'Open terminal');
  btn.title = 'terminal (ctrl + `)';
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15h4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  navInner.insertBefore(btn, document.getElementById('burger'));

  let loading = null;
  const openTerminal = () => {
    if (window.SiteTerminal) { window.SiteTerminal.open(); return; }
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = '/terminal.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    loading.then(() => window.SiteTerminal.open());
  };

  btn.addEventListener('click', openTerminal);
  document.addEventListener('keydown', e => {
    if (e.key === '`' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); openTerminal(); }
  });
}
