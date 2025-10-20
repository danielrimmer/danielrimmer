const formatStepNumber = (value) => {
  const safe = Math.max(0, Math.round(Number(value) || 0));
  return safe < 10 ? `0${safe}` : String(safe);
};

const animateStepValue = (el, target, options = {}) => {
  if (!el) return;
  const { duration = 600, from } = options;
  const startValue = typeof from === 'number' ? from : Number(el.textContent.replace(/[^0-9]/g, '')) || 0;
  const to = Math.max(0, Math.round(Number(target) || 0));
  if (duration <= 0) {
    el.textContent = formatStepNumber(to);
    return;
  }
  const startTime = performance.now();
  const step = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = progress < 1 ? 1 - Math.pow(1 - progress, 3) : 1;
    const current = startValue + (to - startValue) * eased;
    el.textContent = formatStepNumber(current);
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

// Smooth scroll with sticky header offset
(function () {
  const header = document.querySelector('.site-header');
  const offset = () => (header ? header.offsetHeight + 8 : 0);

  const scrollToEl = (el) => {
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - offset();
    window.scrollTo({ top, behavior: 'smooth' });
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        scrollToEl(target);
        // Close mobile nav after click
        document.documentElement.classList.remove('nav-open');
        header?.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
      }
    });
  });
})();

// Reveal on scroll
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
  );
  els.forEach((el) => io.observe(el));
})();

// Theme locked to dark — toggle removed

// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const open = document.documentElement.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
})();

// Scroll spy to highlight current section
(function () {
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  // Only desktop header links (exclude mobile overlay)
  const links = new Map(
    Array.from(document.querySelectorAll('.nav .nav-links a[href^="#"]')).map((a) => [a.getAttribute('href'), a])
  );

  const onScroll = () => {
    const y = window.scrollY + (document.querySelector('.site-header')?.offsetHeight || 0) + 24;
    let activeId = '#home';
    for (const sec of sections) {
      if (sec.offsetTop <= y) activeId = `#${sec.id}`;
    }
    links.forEach((a) => a.classList.remove('active'));
    const el = links.get(activeId);
    if (el) el.classList.add('active');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Fake contact form handler
(function () {
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  const sendBtn = document.getElementById('send-btn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending…';
    try {
      // Simulate async send
      await new Promise((r) => setTimeout(r, 900));
      status.textContent = 'Thanks — your message has been sent.';
      form.reset();
    } catch (err) {
      status.textContent = 'Something went wrong. Please try again.';
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = 'Send Message';
    }
  });
})();

// Page-load animation and header glow on scroll
(function () {
  const header = document.querySelector('.site-header');
  const onReady = () => document.body.classList.add('is-ready');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  let lastY = window.scrollY;
  const onScroll = () => {
    if (!header) return;
    const y = window.scrollY;
    const navOpen = document.documentElement.classList.contains('nav-open');

    // Keep transparent style
    if (y > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    // Hide on scroll down, show on scroll up or near top
    if (!navOpen) {
      const goingDown = y > lastY;
      if (goingDown && y > 50) header.classList.add('hide');
      else header.classList.remove('hide');
    } else {
      // Ensure visible when mobile menu open
      header.classList.remove('hide');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Hero background video: alternate two sources seamlessly (two stacked videos)
(function () {
  const containers = document.querySelectorAll('#hero .hero-media');
  if (!containers.length) return;

  containers.forEach((media) => {
    const vids = Array.from(media.querySelectorAll('video'));
    if (vids.length >= 2) {
      const [a, b] = vids;
      [a, b].forEach((v) => { v.loop = false; v.muted = true; v.playsInline = true; });
      let current = a;

      const show = (v) => {
        vids.forEach((x) => x.classList.remove('active'));
        v.classList.add('active');
        const p = v.play();
        if (p && typeof p.catch === 'function') p.catch(() => {});
      };

      const next = () => {
        current = current === a ? b : a;
        // Ensure next is loaded enough before showing
        if (current.readyState >= 2) show(current);
        else current.addEventListener('loadeddata', () => show(current), { once: true });
      };

      [a, b].forEach((v) => {
        v.addEventListener('ended', next);
        v.addEventListener('error', next);
      });

      // Kick off playback on the first video
      if (a.readyState >= 2) show(a);
      else a.addEventListener('loadeddata', () => show(a), { once: true });
    } else if (vids.length === 1) {
      // Fallback to data-alt approach if only one video present
      const video = vids[0];
      const alt = media.getAttribute('data-alt') || '';
      if (!alt) return;
      const firstSrc = video.currentSrc || video.getAttribute('src') || '';
      const list = [firstSrc, alt].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
      if (list.length < 2) return;
      let idx = 0;
      video.loop = false; video.muted = true;
      const applyZoom = () => { if (idx === 1) video.classList.add('zoomed'); else video.classList.remove('zoomed'); };
      const playIndex = (i) => { idx = i % list.length; video.src = list[idx]; applyZoom(); const p = video.play(); if (p && p.catch) p.catch(() => {}); };
      const nextSingle = () => playIndex((idx + 1) % list.length);
      video.addEventListener('ended', nextSingle);
      video.addEventListener('error', nextSingle);
      applyZoom();
    }
  });
})();

// Typewriter for hero title and subtitle, keep words intact and reveal CTA
(function () {
  const titleEl = document.querySelector('.animate-title');
  const subEl = document.querySelector('.hero .hero-copy .sub');
  const ctaEl = document.querySelector('.hero .hero-cta');
  const heroSection = document.getElementById('hero');
  if (!titleEl || !subEl || !ctaEl) return;

  const titleText = titleEl.textContent.trim();
  const subText = subEl.textContent.trim();
  // On mobile, lock the hero height to the final layout
  let lockedHeight = 0;
  const isMobile = () => window.matchMedia('(max-width: 980px)').matches;
  if (heroSection && isMobile()) {
    const rect = heroSection.getBoundingClientRect();
    lockedHeight = Math.ceil(rect.height);
    heroSection.style.height = `${lockedHeight}px`;
  }

  titleEl.textContent = '';
  subEl.textContent = '';
  ctaEl.classList.remove('show');

  const typeText = (el, text, delay) => new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      el.textContent = text.slice(0, i++);
      if (i <= text.length) setTimeout(tick, delay);
      else resolve();
    };
    tick();
  });

  const start = async () => {
    await typeText(titleEl, titleText, 60);
    // Speed up the hero paragraph typing for both languages
    await typeText(subEl, subText, 30);
    // Reveal CTA immediately after the paragraph finishes
    ctaEl.classList.add('show');
  };

  if ('IntersectionObserver' in window) {
    const hero = document.getElementById('hero');
    if (!hero) { start(); return; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          start();
          io.disconnect();
          break;
        }
      }
    }, { threshold: 0.6 });
    io.observe(hero);
  } else start();
})();

// Floating glowing cursor effect (desktop only)
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  const lerp = (a, b, t) => a + (b - a) * t;
  const loop = () => {
    x = lerp(x, tx, 0.18);
    y = lerp(y, ty, 0.18);
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });

  const hoverables = 'a, button, .btn, .project';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverables)) { glow.style.width = '28px'; glow.style.height = '28px'; }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverables)) { glow.style.width = '18px'; glow.style.height = '18px'; }
  });
})();

// Subtle parallax on hero orbs
(function () {
  const hero = document.querySelector('.hero');
  const a = document.querySelector('.orb-a');
  const b = document.querySelector('.orb-b');
  if (!hero || !a || !b) return;
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const cx = (e.clientX - r.left) / r.width - 0.5;
    const cy = (e.clientY - r.top) / r.height - 0.5;
    a.style.transform = `translate(${cx * 12}px, ${cy * 12}px)`;
    b.style.transform = `translate(${cx * -12}px, ${cy * -12}px)`;
  });
})();

// Parallax wallpaper in About section (subtle, reduced-motion aware)
(function () {
  const section = document.querySelector('section.about');
  const bg = document.querySelector('.about .about-bg');
  if (!section || !bg) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const speed = 0.25; // lower = slower movement vs content
  let ticking = false;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Only compute while section is on screen
    if (rect.bottom < 0 || rect.top > vh) { ticking = false; return; }
    const offset = -rect.top * speed;
    bg.style.transform = `translate3d(0, ${offset}px, 0)`;
    ticking = false;
  };

  const onScroll = () => {
    if (reduce.matches) { bg.style.transform = 'translate3d(0,0,0)'; return; }
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Animate numeric counters when process sections enter viewport
(function () {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    if (!target) return;
    animateStepValue(el, target, { duration: 800, from: 1 });
    el.removeAttribute('data-count');
  };

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.35 });
    counters.forEach((el) => io.observe(el));
  } else {
    counters.forEach((el) => animate(el));
  }
})();

// Version 1 timeline interaction
(function () {
  const lists = document.querySelectorAll('.process-step-list');
  if (!lists.length) return;

  lists.forEach((list) => {
    const steps = Array.from(list.querySelectorAll('.process-step'));
    if (!steps.length) return;

    const section = list.closest('.process');
    const targetSelector = steps[0].dataset.target;
    const panel = targetSelector && section ? section.querySelector(targetSelector) : null;
    const numberEl = panel?.querySelector('.detail-number');
    const titleEl = panel?.querySelector('.detail-title');
    const textEl = panel?.querySelector('.detail-text');
    if (panel) panel.setAttribute('tabindex', '0');

    const mobileQuery = window.matchMedia('(max-width: 720px)');
    const isMobile = () => mobileQuery.matches;

    let current = null;

    const activate = (btn, force = false) => {
      if (!btn) return;
      const detailTitle = btn.dataset.title || btn.textContent.trim();
      const detailText = btn.dataset.detail || '';
      const stepIndex = Number(btn.dataset.step) || 0;

      if (isMobile()) {
        current = btn;
        steps.forEach((step) => {
          const isActive = step === btn;
          step.classList.toggle('active', isActive);
          step.setAttribute('aria-selected', String(isActive));
          step.setAttribute('aria-expanded', 'true');
        });
        if (numberEl) numberEl.textContent = formatStepNumber(stepIndex);
        return;
      }

      if (!force && current === btn && btn.classList.contains('active')) return;
      current = btn;

      steps.forEach((step) => {
        const isActive = step === btn;
        step.classList.toggle('active', isActive);
        step.setAttribute('aria-selected', String(isActive));
        step.setAttribute('aria-expanded', String(isActive));
      });

      if (panel) {
        panel.classList.add('updating');
        if (titleEl) titleEl.textContent = detailTitle;
        if (textEl) textEl.textContent = detailText;
        if (numberEl) animateStepValue(numberEl, stepIndex, { duration: 500 });
        setTimeout(() => panel.classList.remove('updating'), 320);
      }
    };

    const initialize = () => {
      if (isMobile()) {
        current = null;
        steps.forEach((step) => {
          step.classList.remove('active');
          step.setAttribute('aria-selected', 'false');
          step.setAttribute('aria-expanded', 'true');
        });
      } else {
        const initial = steps.find((step) => step.classList.contains('active')) || steps[0];
        activate(initial, true);
      }
    };

    steps.forEach((step, index) => {
      const handleHover = () => { if (!isMobile()) activate(step); };
      step.addEventListener('mouseenter', handleHover);
      step.addEventListener('focus', () => activate(step));
      step.addEventListener('click', (e) => {
        e.preventDefault();
        activate(step);
      });
      step.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          const next = steps[(index + 1) % steps.length];
          next.focus();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = steps[(index - 1 + steps.length) % steps.length];
          prev.focus();
        }
      });
    });

    initialize();
    const onChange = () => initialize();
    if (typeof mobileQuery.addEventListener === 'function') mobileQuery.addEventListener('change', onChange);
    else if (typeof mobileQuery.addListener === 'function') mobileQuery.addListener(onChange);
  });
})();

// Version 2 carousel interaction
(function () {
  const carousels = document.querySelectorAll('[data-process-carousel]');
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll('.process-card'));
    if (!cards.length) return;

    const section = carousel.closest('.process');
    const controls = section ? Array.from(section.querySelectorAll('.carousel-btn')) : [];
    let activeIndex = Math.max(0, cards.findIndex((card) => card.classList.contains('active')));

    const clampIndex = (index) => {
      if (index < 0) return 0;
      if (index >= cards.length) return cards.length - 1;
      return index;
    };

    const ensureVisible = (card) => {
      if (!card || typeof card.scrollIntoView !== 'function') return;
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    };

    const setActive = (index, focusCard = false, animate = true) => {
      const nextIndex = clampIndex(index);
      const nextCard = cards[nextIndex];
      if (!nextCard) return;
      if (nextIndex === activeIndex && nextCard.classList.contains('active') && animate) return;
      activeIndex = nextIndex;
      cards.forEach((card, i) => {
        const isActive = i === nextIndex;
        card.classList.toggle('active', isActive);
        card.setAttribute('aria-expanded', String(isActive));
      });
      if (animate) {
        animateStepValue(nextCard.querySelector('.step-num'), Number(nextCard.dataset.step) || nextIndex + 1, { duration: 500, from: 0 });
      }
      ensureVisible(nextCard);
      if (focusCard) nextCard.focus();
    };

    cards.forEach((card, index) => {
      card.addEventListener('click', () => setActive(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setActive(index);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          setActive(index + 1, true);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          setActive(index - 1, true);
        }
      });
    });

    controls.forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = btn.dataset.dir === 'prev' ? -1 : 1;
        setActive(activeIndex + dir, true);
      });
    });

    cards.forEach((card) => card.setAttribute('aria-expanded', String(card.classList.contains('active'))));
    setActive(activeIndex, false, false);
  });
})();
