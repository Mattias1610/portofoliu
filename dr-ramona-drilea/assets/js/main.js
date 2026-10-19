/* =========================================================================
   Dr. Ramona Drilea · scroll scenes, frame sequences, small interactions.
   Plain script, no build step. Lenis is loaded before this file.
   ========================================================================= */
(() => {
  'use strict';

  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const portraitMQ = matchMedia('(max-aspect-ratio: 1/1)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced) root.classList.add('is-reduced');

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const smooth = (a, b, v) => {
    const t = clamp((v - a) / (b - a));
    return t * t * (3 - 2 * t);
  };
  // piecewise-linear map through [[input, output], ...] stops
  const remap = (v, stops) => {
    for (let i = 1; i < stops.length; i++) {
      const [x0, y0] = stops[i - 1];
      const [x1, y1] = stops[i];
      if (v <= x1) return y0 + (y1 - y0) * clamp((v - x0) / (x1 - x0));
    }
    return stops[stops.length - 1][1];
  };
  const variant = () => (portraitMQ.matches ? 'm' : 'd');
  const pick = (el, key) => el.dataset[key + (variant() === 'm' ? 'M' : 'D')];

  let vh = window.innerHeight;
  let needsUpdate = true;
  const requestUpdate = () => { needsUpdate = true; };

  /* ---------------------------------------------------------------------
     Text splitting
     --------------------------------------------------------------------- */
  function splitChars(el) {
    const text = el.textContent.trim();
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    const chars = [];
    text.split(' ').forEach((word, i, words) => {
      const w = document.createElement('span');
      w.style.display = 'inline-block';
      w.style.whiteSpace = 'nowrap';
      for (const c of word) {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.textContent = c;
        w.appendChild(ch);
        chars.push(ch);
      }
      visual.appendChild(w);
      if (i < words.length - 1) visual.appendChild(document.createTextNode(' '));
    });
    el.textContent = '';
    el.append(label, visual);
    return chars;
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    return words.map((word, i) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      const inner = document.createElement('span');
      inner.textContent = word;
      outer.appendChild(inner);
      el.appendChild(outer);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
      return outer;
    });
  }

  /* ---------------------------------------------------------------------
     Frame sequence on a canvas.
     Frames load coarse-to-fine (every 16th, then 8th, 4th...), so the scrub
     works almost immediately and sharpens as the rest arrives. Drawing
     always uses the nearest frame that is already decoded.
     --------------------------------------------------------------------- */
  class FrameSequence {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.generation = 0;
      this.onComplete = null;
      this.setVariant(variant());
    }

    setVariant(v) {
      if (v === this.variant) return;
      const wasStarted = this.started;
      this.variant = v;
      this.base = pick(this.canvas, 'src');
      this.count = Number(pick(this.canvas, 'count'));
      this.frames = new Array(this.count);
      this.loaded = new Uint8Array(this.count);
      this.loadedCount = 0;
      this.current = -1;
      this.started = false;
      this.generation++;
      if (wasStarted) this.start();
    }

    url(i) {
      return this.base + String(i + 1).padStart(3, '0') + '.webp';
    }

    loadOrder() {
      const order = [];
      const seen = new Uint8Array(this.count);
      const push = (i) => { if (!seen[i]) { seen[i] = 1; order.push(i); } };
      push(0);
      push(this.count - 1);
      for (let stride = 16; stride >= 1; stride >>= 1) {
        for (let i = 0; i < this.count; i += stride) push(i);
      }
      return order;
    }

    start() {
      if (this.started) return;
      this.started = true;
      const gen = this.generation;
      const queue = this.loadOrder();
      let active = 0;
      const next = () => {
        while (active < 6 && queue.length) {
          const i = queue.shift();
          const img = new Image();
          img.decoding = 'async';
          img.src = this.url(i);
          active++;
          img.decode()
            .then(() => {
              if (gen !== this.generation) return;
              this.frames[i] = img;
              this.loaded[i] = 1;
              this.loadedCount++;
              requestUpdate();
              if (this.loadedCount === this.count && this.onComplete) this.onComplete();
            })
            .catch(() => {})
            .finally(() => {
              active--;
              if (gen === this.generation) next();
            });
        }
      };
      next();
    }

    nearest(i) {
      if (this.loaded[i]) return i;
      for (let d = 1; d < this.count; d++) {
        if (i - d >= 0 && this.loaded[i - d]) return i - d;
        if (i + d < this.count && this.loaded[i + d]) return i + d;
      }
      return -1;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, finePointer ? 2 : 1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w !== this.canvas.width || h !== this.canvas.height) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.current = -1;
      }
    }

    render(progress) {
      const target = Math.round(clamp(progress) * (this.count - 1));
      const i = this.nearest(target);
      if (i < 0 || i === this.current) return;
      const img = this.frames[i];
      const { width: cw, height: ch } = this.canvas;
      const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * scale;
      const h = img.naturalHeight * scale;
      this.ctx.imageSmoothingQuality = 'high';
      this.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      this.current = i;
      if (!this.shown) {
        this.shown = true;
        this.canvas.classList.add('is-on');
      }
    }
  }

  /* ---------------------------------------------------------------------
     Scenes: a tall track with a sticky stage; progress 0 → 1 while pinned
     --------------------------------------------------------------------- */
  const scenes = [];
  const sequences = [];

  function addScene(name, update) {
    const el = document.querySelector(`[data-scene="${name}"]`);
    if (!el) return null;
    const scene = { el, stage: el.querySelector('.scene__stage'), update, top: 0, dist: 1, p: -1 };
    scenes.push(scene);
    return scene;
  }

  const mixInk = (t) => {
    // cream (#f4efe8) → charcoal (#2f2c29)
    const a = [244, 239, 232];
    const b = [47, 44, 41];
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
  };

  /* ---- Hero ---- */
  const heroCanvas = document.querySelector('[data-seq="hero"]');
  const heroName = document.querySelector('.hero__name');
  const heroTagline = document.querySelector('.hero__tagline');
  const heroBadge = document.querySelector('.hero__badge');
  const heroStage = document.querySelector('.hero__stage');
  const topbar = document.querySelector('[data-topbar]');
  const intro = { value: 0, start: 0, running: false };
  let heroSeq = null;
  let heroChars = [];
  let heroScene = null;

  if (!reduced && heroCanvas) {
    heroSeq = new FrameSequence(heroCanvas);
    sequences.push(heroSeq);
    heroChars = splitChars(heroName);

    heroScene = addScene('hero', (p) => {
      const P = Math.max(p, intro.value);
      heroSeq.render(P);

      const ink = smooth(0.2, 0.48, P);
      root.style.setProperty('--hero-ink', mixInk(ink));
      root.style.setProperty('--topbar-ink', mixInk(smooth(0.16, 0.42, P)));
      heroStage.style.setProperty('--hero-glow', (ink * 0.45).toFixed(3));

      const n = heroChars.length;
      heroChars.forEach((ch, i) => {
        const a = 0.12 + (i / n) * 0.27;
        const lp = smooth(a, a + 0.2, P);
        ch.style.opacity = lp.toFixed(3);
        ch.style.transform = `translate3d(0, ${((1 - lp) * 0.3).toFixed(3)}em, 0) scale(${(1 + (1 - lp) * 0.38).toFixed(3)})`;
        if (finePointer) ch.style.filter = lp < 0.999 ? `blur(${((1 - lp) * 9).toFixed(2)}px)` : 'none';
      });
      heroName.style.setProperty('--name-scale', (1.05 - 0.05 * smooth(0.12, 0.62, P)).toFixed(4));

      const tag = smooth(0.5, 0.66, P);
      const badge = smooth(0.6, 0.74, P);
      heroTagline.style.setProperty('--o', tag.toFixed(3));
      heroBadge.style.setProperty('--o', badge.toFixed(3));
      heroBadge.style.setProperty('--vis', badge > 0.02 ? 'visible' : 'hidden');
      heroStage.style.setProperty('--cue', (1 - smooth(0.02, 0.1, p)).toFixed(3));
      heroStage.style.setProperty('--hero-fade', smooth(0.88, 1, p).toFixed(3));
    });
  }

  /* ---- Philosophy ---- */
  const philoLines = [...document.querySelectorAll('.philo__line')];
  const philoRail = document.querySelector('.philo__rail');
  if (!reduced && philoLines.length) {
    const lines = philoLines.map((line) => ({ line, words: splitWords(line) }));
    addScene('philo', (p) => {
      lines.forEach(({ line, words }, i) => {
        const a = 0.05 + i * 0.29;
        words.forEach((w, j) => {
          const s = a + j * 0.02;
          w.style.setProperty('--wp', smooth(s, s + 0.15, p).toFixed(3));
        });
        const next = 0.05 + (i + 1) * 0.29;
        line.classList.toggle('is-past', i < lines.length - 1 && p > next && p < 0.93);
      });
      philoRail.style.setProperty('--rail', p.toFixed(4));
    });
  }

  /* ---- Implant assembly ---- */
  const implantCanvas = document.querySelector('[data-seq="implant"]');
  const implantSteps = [...document.querySelectorAll('.implant .step')];
  const implantRail = document.querySelector('.implant__rail');
  let implantSeq = null;
  if (!reduced && implantCanvas) {
    implantSeq = new FrameSequence(implantCanvas);
    sequences.push(implantSeq);
    // The clip assembles in its first ~3 s, then turns slowly; spread the
    // assembly over most of the scroll and give each step its own stretch.
    const CLIP = 8.04;
    const timeline = [[0, 0], [0.28, 1.5], [0.56, 2.45], [0.74, 3.1], [1, CLIP]];
    addScene('implant', (p) => {
      implantSeq.render(remap(p, timeline) / CLIP);
      const step = p < 0.28 ? 0 : p < 0.56 ? 1 : 2;
      implantSteps.forEach((s, i) => {
        s.classList.toggle('is-active', i === step);
        s.classList.toggle('is-done', i < step);
      });
      implantRail.style.setProperty('--rail', p.toFixed(4));
    });
  }

  /* ---------------------------------------------------------------------
     Scroll-linked reveals (pinned to scroll position, not to time)
     --------------------------------------------------------------------- */
  const REVEAL_SHIFT = 34; // must match the translate in CSS
  const reveals = [...document.querySelectorAll('[data-reveal]')].map((el) => ({ el, top: 0, p: 0 }));
  const visitList = document.querySelector('[data-visit]');
  const visitSteps = visitList ? [...visitList.children] : [];
  const visit = { top: 0, height: 1 };

  if (reduced) {
    reveals.forEach((r) => r.el.style.setProperty('--p', '1'));
    visitSteps.forEach((s) => { s.style.setProperty('--sp', '1'); s.classList.add('is-in'); });
    if (visitList) visitList.style.setProperty('--vp', '1');
  }

  /* ---------------------------------------------------------------------
     Geometry & the frame loop
     --------------------------------------------------------------------- */
  function measure() {
    vh = window.innerHeight;
    const y = window.scrollY;
    scenes.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      s.top = r.top + y;
      s.dist = Math.max(1, s.el.offsetHeight - s.stage.offsetHeight);
      s.p = -1;
    });
    reveals.forEach((r) => {
      r.top = r.el.getBoundingClientRect().top + y - (reduced ? 0 : (1 - r.p) * REVEAL_SHIFT);
    });
    if (visitList) {
      const r = visitList.getBoundingClientRect();
      visit.top = r.top + y;
      visit.height = Math.max(r.height, vh * 0.45);
    }
    sequences.forEach((s) => s.resize());
    requestUpdate();
  }

  function update(force) {
    const y = window.scrollY;

    scenes.forEach((s) => {
      const p = clamp((y - s.top) / s.dist);
      if (force || p !== s.p) {
        s.p = p;
        s.update(p);
      }
    });

    if (topbar) {
      const solidAt = heroScene ? heroScene.top + heroScene.dist - 2 : vh * 0.6;
      topbar.classList.toggle('is-solid', y >= solidAt);
    }

    if (!reduced) {
      reveals.forEach((r) => {
        const p = clamp((y + vh - r.top - vh * 0.04) / (vh * 0.3));
        if (Math.abs(p - r.p) > 0.001 || (p === 1 && r.p !== 1) || (p === 0 && r.p !== 0)) {
          r.p = p;
          r.el.style.setProperty('--p', p.toFixed(3));
        }
      });

      if (visitList) {
        const vp = clamp((y + vh * 0.8 - visit.top) / visit.height);
        visitList.style.setProperty('--vp', vp.toFixed(3));
        const n = visitSteps.length;
        visitSteps.forEach((s, i) => {
          const a = (i / n) * 0.8;
          const sp = smooth(a, a + 0.24, vp);
          s.style.setProperty('--sp', sp.toFixed(3));
          s.classList.toggle('is-in', sp > 0.6);
        });
      }
    }
  }

  let lenis = null;
  if (!reduced && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true, syncTouch: false });
    window.__lenis = lenis;
  }

  let lastY = -1;
  function frame(now) {
    if (lenis) lenis.raf(now);

    if (intro.running) {
      const t = clamp((now - intro.start) / 2400);
      intro.value = 0.1 * (1 - Math.pow(1 - t, 3));
      if (t >= 1) intro.running = false;
      needsUpdate = true;
    }

    const y = window.scrollY;
    if (y !== lastY || needsUpdate) {
      const force = needsUpdate;
      lastY = y;
      needsUpdate = false;
      update(force);
    }
    requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------------
     Media start-up
     --------------------------------------------------------------------- */
  if (reduced) {
    // Static fallback: show the finished frames, no scrubbing, no autoplay.
    document.querySelectorAll('[data-poster]').forEach((pic) => {
      const source = pic.querySelector('source');
      const img = pic.querySelector('img');
      if (source) source.srcset = pic.dataset.stillM;
      img.src = pic.dataset.stillD;
      img.loading = 'eager';
    });
  } else {
    if (heroSeq) {
      heroSeq.start();
      heroSeq.onComplete = () => implantSeq && implantSeq.start();
      // a gentle "the room wakes up" on load, if the visitor is at the top
      setTimeout(() => {
        if (window.scrollY < 40) {
          intro.start = performance.now();
          intro.running = true;
        }
      }, 450);
    }
    if (implantSeq) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          implantSeq.start();
          io.disconnect();
        }
      }, { rootMargin: '150% 0px' });
      io.observe(implantCanvas.closest('.implant'));
    }
  }

  portraitMQ.addEventListener('change', () => {
    sequences.forEach((s) => s.setVariant(variant()));
    setupSmile();
    measure();
  });

  /* ---- Smile clip: plays once when in view and holds on the smile ---- */
  const smileVideo = document.querySelector('.smile__video');
  let smileLoaded = false;
  let smileRestart = false;

  function setupSmile() {
    if (!smileVideo) return;
    if (reduced) {
      smileVideo.poster = pick(smileVideo, 'still');
      return;
    }
    const base = pick(smileVideo, 'src');
    if (smileVideo.dataset.current === base) return;
    smileVideo.dataset.current = base;
    smileVideo.poster = pick(smileVideo, 'poster');
    smileVideo.textContent = '';
    [['webm', 'video/webm'], ['mp4', 'video/mp4']].forEach(([ext, type]) => {
      const s = document.createElement('source');
      s.src = `${base}.${ext}`;
      s.type = type;
      smileVideo.appendChild(s);
    });
    if (smileLoaded) smileVideo.load();
  }
  setupSmile();

  if (smileVideo && !reduced) {
    const section = smileVideo.closest('.smile');
    new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !smileLoaded) {
        smileLoaded = true;
        smileVideo.preload = 'auto';
        smileVideo.load();
      }
    }, { rootMargin: '100% 0px' }).observe(section);

    new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio >= 0.5) {
          if (smileRestart || smileVideo.ended) smileVideo.currentTime = 0;
          smileRestart = false;
          const play = smileVideo.play();
          if (play) play.catch(() => {});
        } else if (e.intersectionRatio === 0) {
          smileVideo.pause();
          smileRestart = true;
        }
      });
    }, { threshold: [0, 0.5] }).observe(section);
  }

  /* ---------------------------------------------------------------------
     Counters (count up once when the strip scrolls into view)
     --------------------------------------------------------------------- */
  const counterWrap = document.querySelector('[data-counters]');
  const counters = [...document.querySelectorAll('[data-count-to]')];
  const fmt = (v, d) => v.toLocaleString('ro-RO', { minimumFractionDigits: d, maximumFractionDigits: d });

  counters.forEach((c) => {
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = c.textContent;
    c.setAttribute('aria-hidden', 'true');
    c.after(label);
  });

  if (counterWrap && !reduced) {
    counters.forEach((c) => { c.textContent = fmt(0, Number(c.dataset.decimals)); });
    const run = () => {
      const start = performance.now();
      const dur = 1900;
      const step = (now) => {
        const t = clamp((now - start) / dur);
        const e = 1 - Math.pow(1 - t, 4);
        counters.forEach((c) => {
          const to = Number(c.dataset.countTo);
          c.textContent = fmt(t < 1 ? to * e : to, Number(c.dataset.decimals));
        });
        if (t < 1) requestAnimationFrame(step);
        else counterWrap.classList.add('is-done');
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        run();
      }
    }, { threshold: 0.45 });
    io.observe(counterWrap);
  }

  /* ---------------------------------------------------------------------
     Anchors (smooth, offset for the top bar) and service pre-selection
     --------------------------------------------------------------------- */
  const serviceSelect = document.getElementById('f-serviciu');
  const topbarHeight = () => (topbar ? topbar.offsetHeight : 0);

  function scrollToTarget(target) {
    const done = () => {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };
    if (target.id === 'acasa') {
      if (lenis) lenis.scrollTo(0, { duration: 1.6, onComplete: done });
      else { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); done(); }
      return;
    }
    if (lenis) {
      lenis.scrollTo(target, { offset: -topbarHeight(), duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), onComplete: done });
    } else {
      const top = target.getBoundingClientRect().top + window.scrollY - topbarHeight();
      window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
      done();
    }
  }

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash === '#') {
      if (link.dataset.placeholder) e.preventDefault();
      return;
    }
    const target = document.querySelector(hash);
    if (!target) return;
    e.preventDefault();
    if (link.dataset.service && serviceSelect) {
      serviceSelect.value = link.dataset.service;
      serviceSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
    scrollToTarget(target);
    history.replaceState(null, '', hash);
  });

  /* ---------------------------------------------------------------------
     Services rail dots (mobile swipe)
     --------------------------------------------------------------------- */
  const rail = document.querySelector('[data-rail]');
  const dots = [...document.querySelectorAll('[data-rail-dots] i')];
  if (rail && dots.length) {
    const sync = () => {
      const card = rail.children[0];
      const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
      const i = Math.round(rail.scrollLeft / (card.offsetWidth + gap));
      dots.forEach((d, k) => d.classList.toggle('is-active', k === clamp(i, 0, dots.length - 1)));
    };
    rail.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  /* ---------------------------------------------------------------------
     FAQ: animated <details>
     --------------------------------------------------------------------- */
  document.querySelectorAll('.faq__item').forEach((item) => {
    const summary = item.querySelector('summary');
    const body = item.querySelector('.faq__body');
    let anim = null;
    summary.addEventListener('click', (e) => {
      if (reduced || !body.animate) return;
      e.preventDefault();
      if (anim) anim.cancel();
      const easing = 'cubic-bezier(0.16, 1, 0.3, 1)';
      if (item.open && !item.classList.contains('is-closing')) {
        item.classList.add('is-closing');
        anim = body.animate([{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }], { duration: 420, easing });
        anim.onfinish = () => { item.open = false; item.classList.remove('is-closing', 'is-open'); anim = null; };
      } else {
        item.classList.remove('is-closing');
        item.open = true;
        item.classList.add('is-open');
        anim = body.animate([{ height: '0px', opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], { duration: 520, easing });
        anim.onfinish = () => { anim = null; };
      }
    });
  });

  /* ---------------------------------------------------------------------
     Booking form → WhatsApp (or a POST endpoint if data-endpoint is set)
     --------------------------------------------------------------------- */
  const form = document.querySelector('[data-booking-form]');
  const PHONE = '0784 775 826';
  const WA = 'https://wa.me/40784775826';

  if (form) {
    const f = {
      nume: form.elements.nume,
      telefon: form.elements.telefon,
      serviciu: form.elements.serviciu,
      zi: form.elements.zi,
      mesaj: form.elements.mesaj,
    };
    const status = form.querySelector('[data-form-status]');
    const pad = (n) => String(n).padStart(2, '0');
    const today = new Date();
    f.zi.min = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    const setError = (name, msg) => {
      const input = f[name];
      const err = document.getElementById(`${input.id}-err`);
      if (msg) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', err.id);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
      if (err) err.textContent = msg || '';
    };

    const validate = () => {
      const errors = {};
      if (f.nume.value.trim().length < 2) errors.nume = 'Scrie-ne numele tău, te rugăm.';
      const digits = f.telefon.value.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 15) errors.telefon = 'Verifică numărul, ca să te putem suna înapoi.';
      if (!f.serviciu.value) errors.serviciu = 'Alege un serviciu sau „Nu știu încă”.';
      if (f.zi.value && f.zi.value < f.zi.min) errors.zi = 'Alege o zi de azi încolo.';
      ['nume', 'telefon', 'serviciu', 'zi'].forEach((k) => setError(k, errors[k]));
      return errors;
    };

    ['nume', 'telefon', 'serviciu', 'zi'].forEach((k) => {
      f[k].addEventListener(k === 'serviciu' || k === 'zi' ? 'change' : 'input', () => {
        if (f[k].getAttribute('aria-invalid') === 'true') validate();
      });
    });

    const showStatus = (parts) => {
      status.textContent = '';
      parts.forEach((p) => status.appendChild(p));
      status.hidden = false;
      status.setAttribute('tabindex', '-1');
      status.focus({ preventScroll: true });
    };
    const el = (tag, text, attrs = {}) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
      return node;
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const errors = validate();
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) {
        f[firstInvalid].focus();
        return;
      }

      const name = f.nume.value.trim();
      const data = {
        nume: name,
        telefon: f.telefon.value.trim(),
        serviciu: f.serviciu.value,
        zi: f.zi.value,
        mesaj: f.mesaj.value.trim(),
      };
      const day = data.zi
        ? new Date(`${data.zi}T12:00:00`).toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })
        : '';
      const text = [
        'Bună ziua, aș dori o programare.',
        `Nume: ${data.nume}`,
        `Telefon: ${data.telefon}`,
        `Serviciu: ${data.serviciu}`,
        day && `Zi preferată: ${day}`,
        data.mesaj && `Mesaj: ${data.mesaj}`,
      ].filter(Boolean).join('\n');
      const waUrl = `${WA}?text=${encodeURIComponent(text)}`;
      const first = name.split(/\s+/)[0];

      const viaWhatsApp = () => {
        window.open(waUrl, '_blank', 'noopener');
        const p1 = el('p');
        p1.append(el('strong', `Mulțumim, ${first}.`), ' Mesajul tău e pregătit în WhatsApp. Apasă „Trimite” acolo și ajunge direct la cabinet.');
        const p2 = el('p');
        p2.append('Nu s-a deschis WhatsApp? ', el('a', 'Deschide-l de aici', { href: waUrl, target: '_blank', rel: 'noopener', 'data-wa-fallback': '' }), ' sau sună la ', el('a', PHONE, { href: 'tel:+40784775826' }), '.');
        showStatus([p1, p2]);
      };

      const endpoint = form.dataset.endpoint;
      if (endpoint) {
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        })
          .then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            const p = el('p');
            p.append(el('strong', `Mulțumim, ${first}.`), ` Am primit cererea și te sunăm la ${data.telefon} pentru confirmare.`);
            showStatus([p]);
            form.reset();
          })
          .catch(viaWhatsApp);
      } else {
        viaWhatsApp();
      }
    });

    // keep the mobile bar out of the way while typing
    const bar = document.querySelector('.mobilebar');
    if (bar) {
      form.addEventListener('focusin', () => bar.classList.add('is-hidden'));
      form.addEventListener('focusout', () => {
        setTimeout(() => {
          if (!form.contains(document.activeElement)) bar.classList.remove('is-hidden');
        }, 120);
      });
    }
  }

  /* ---------------------------------------------------------------------
     Small details
     --------------------------------------------------------------------- */
  const hours = document.querySelectorAll('[data-hours] li');
  if (hours.length === 7) hours[(new Date().getDay() + 6) % 7].classList.add('is-today');
  document.querySelectorAll('[data-year]').forEach((n) => { n.textContent = String(new Date().getFullYear()); });

  /* ---------------------------------------------------------------------
     Go
     --------------------------------------------------------------------- */
  measure();
  update(true);
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  requestAnimationFrame(frame);
})();
