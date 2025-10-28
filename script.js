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

    // Special handling for home/hero - scroll to absolute top (0)
    if (el.id === 'home' || el.id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // No offset for specific sections to show them from the top
    const sectionsWithoutOffset = ['about', 'contact', 'process-v1', 'key-benefits', 'services', 'bonus-services'];
    const shouldShowFromTop = sectionsWithoutOffset.includes(el.id);
    const scrollOffset = shouldShowFromTop ? 0 : offset();
    const top = el.getBoundingClientRect().top + window.scrollY - scrollOffset;
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
  // Always start closed to avoid stuck scroll-lock on reload
  document.documentElement.classList.remove('nav-open');
  toggle.addEventListener('click', () => {
    const open = document.documentElement.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  // Close when tapping outside the drawer
  const menu = document.querySelector('.mobile-menu');
  const panel = menu?.querySelector('.mobile-menu-panel');
  if (menu && panel) {
    menu.addEventListener('click', (e) => {
      if (!panel.contains(e.target)) {
        document.documentElement.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Safety: on resize, if not in mobile/tablet layout, ensure menu is closed
  const mq = window.matchMedia('(max-width: 980px)');
  const ensureClosed = () => {
    if (!mq.matches && document.documentElement.classList.contains('nav-open')) {
      document.documentElement.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  };
  if (typeof mq.addEventListener === 'function') mq.addEventListener('change', ensureClosed);
  else if (typeof mq.addListener === 'function') mq.addListener(ensureClosed);
  window.addEventListener('orientationchange', ensureClosed);
  window.addEventListener('resize', ensureClosed);
})();

// Scroll spy to highlight current section
(function () {
  const sections = Array.from(document.querySelectorAll('main section[id]'))
    .filter(sec => sec.id && !sec.hasAttribute('hidden')); // Exclude hidden sections

  // Only desktop header links (exclude mobile overlay)
  const links = new Map(
    Array.from(document.querySelectorAll('.nav .nav-links a[href^="#"]')).map((a) => [a.getAttribute('href'), a])
  );

  const onScroll = () => {
    const header = document.querySelector('.site-header');
    const isSidebarMode = header?.classList.contains('sidebar-mode');

    // Different detection logic for sidebar mode (more sensitive)
    const viewportMiddle = window.innerHeight / 2;
    const scrollY = window.scrollY;

    let activeId = '#home';
    let closestSection = null;
    let closestDistance = Infinity;

    // Find which section is closest to the viewport middle (for sidebar)
    // or traditional top-based detection (for normal header)
    for (const sec of sections) {
      if (isSidebarMode) {
        // Sidebar mode: detect section closest to viewport center
        const rect = sec.getBoundingClientRect();
        const sectionMiddle = rect.top + rect.height / 2;
        const distance = Math.abs(sectionMiddle - viewportMiddle);

        if (distance < closestDistance && rect.top < viewportMiddle && rect.bottom > 0) {
          closestDistance = distance;
          closestSection = sec;
        }
      } else {
        // Normal mode: traditional scroll-based detection
        const offset = header?.offsetHeight || 0;
        if (sec.offsetTop <= scrollY + offset + 100) {
          activeId = `#${sec.id}`;
        }
      }
    }

    // Use closest section for sidebar mode
    if (isSidebarMode && closestSection) {
      activeId = `#${closestSection.id}`;
    }

    // Update all nav links
    links.forEach((a) => a.classList.remove('active'));
    const el = links.get(activeId);
    if (el) el.classList.add('active');
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Contact form handler (removed - form is a static business card, not a functional form)

// Page-load animation and header visibility on scroll with sidebar transformation
(function () {
  const header = document.querySelector('.site-header');
  const root = document.documentElement;
  const onReady = () => document.body.classList.add('is-ready');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady);
  else onReady();

  const heroSection = document.getElementById('hero');
  const heroSectionHeight = heroSection?.offsetHeight || window.innerHeight;
  let headerHeight = header?.getBoundingClientRect().height || 76;
  if (header) root.style.setProperty('--header-height', `${Math.round(headerHeight)}px`);

  // Track sidebar state
  let isSidebarMode = false;
  let sidebarExpandTimeout = null;

  const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;

  const onScroll = () => {
    if (!header || !heroSection) return;
    const y = window.scrollY;
    const navOpen = document.documentElement.classList.contains('nav-open');

    // Keep CSS custom property for header height in sync with layout changes
    const measuredHeight = header.getBoundingClientRect().height || headerHeight;
    if (Math.abs(measuredHeight - headerHeight) > 0.5) {
      headerHeight = measuredHeight;
      root.style.setProperty('--header-height', `${Math.round(headerHeight)}px`);
    }

    // Remove the old blue background styling
    header.classList.remove('is-solid');

    // Desktop sidebar transformation logic
    if (isDesktop() && !navOpen) {
      if (y >= 50) {
        // Scrolled 50px - transform to sidebar
        if (!isSidebarMode) {
          isSidebarMode = true;
          header.classList.remove('hide', 'sidebar-collapsing');
          header.classList.add('sidebar-mode');

          // Clear any pending timeout
          if (sidebarExpandTimeout) clearTimeout(sidebarExpandTimeout);

          // Add expanded class after logo slides (800ms for logo animation)
          sidebarExpandTimeout = setTimeout(() => {
            header.classList.add('sidebar-expanded');
          }, 800);
        }
      } else {
        // Scrolled back to hero - revert to normal header
        if (isSidebarMode) {
          isSidebarMode = false;

          // Clear any pending timeout
          if (sidebarExpandTimeout) clearTimeout(sidebarExpandTimeout);

          // Start collapse animation
          header.classList.add('sidebar-collapsing');
          header.classList.remove('sidebar-expanded');

          // After collapse animation, remove sidebar mode
          setTimeout(() => {
            header.classList.remove('sidebar-mode', 'sidebar-collapsing');
          }, 400);
        }
      }
    } else if (!isDesktop()) {
      // Mobile/tablet: use original hide/show logic
      if (!navOpen && y >= heroSectionHeight) {
        header.classList.add('hide');
        header.classList.remove('is-pinned');
      } else {
        header.classList.remove('hide');
      }

      // Clean up sidebar classes on mobile
      header.classList.remove('sidebar-mode', 'sidebar-expanded', 'sidebar-collapsing');
      isSidebarMode = false;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// About section parallax wallpaper
(function () {
  const bgs = Array.from(document.querySelectorAll('.about .about-bg'));
  if (!bgs.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    bgs.forEach((bg) => {
      const host = bg.closest('.about') || bg.parentElement;
      const rect = host.getBoundingClientRect();
      const centerDelta = rect.top + rect.height / 2 - vh / 2;
      const offset = clamp(-centerDelta * 0.06, -40, 40);
      bg.style.transform = `translateY(${offset}px) scale(1.05)`;
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();

// Bonus section wallpaper parallax
(function () {
  const images = Array.from(document.querySelectorAll('.bonus .bonus-bg-image'));
  if (!images.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  let ticking = false;

  const update = () => {
    ticking = false;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    images.forEach((img) => {
      const host = img.closest('.bonus') || img.parentElement;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      const centerDelta = rect.top + rect.height / 2 - vh / 2;
      const offsetY = clamp(-centerDelta * 0.045, -60, 60);
      const offsetX = clamp(centerDelta * 0.02, -30, 30);
      img.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(1.05)`;
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
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
  const scrollIndicator = document.querySelector('#hero .scroll-indicator');
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
  if (scrollIndicator) scrollIndicator.classList.remove('show');

  const typeText = (el, text, delay) => new Promise((resolve) => {
    // Handle Unicode properly by converting to array of grapheme clusters
    const chars = Array.from(text);
    let i = 0;
    const tick = () => {
      el.textContent = chars.slice(0, i++).join('');
      if (i <= chars.length) setTimeout(tick, delay);
      else resolve();
    };
    tick();
  });

  let startedTyping = false;
  const start = async () => {
    if (startedTyping) return;
    startedTyping = true;
    await typeText(titleEl, titleText, 60);
    // Speed up the hero paragraph typing for both languages
    await typeText(subEl, subText, 30);
    // Reveal CTA immediately after the paragraph finishes
    ctaEl.classList.add('show');
    // Show scroll indicator only when typing is done
    if (scrollIndicator) scrollIndicator.classList.add('show');
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
    // Fallback: ensure typing begins even if IO doesn't fire
    setTimeout(start, 1200);
  } else {
    start();
  }
})();

// Floating glowing cursor effect (desktop only)
(function () {
  if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let tx = x, ty = y;
  let isAnimating = false;
  let lastMovement = Date.now();
  const inactivityTimeout = 5000; // Stop animation after 5s of no movement

  const lerp = (a, b, t) => a + (b - a) * t;
  const loop = () => {
    if (!isAnimating) return;
    x = lerp(x, tx, 0.18);
    y = lerp(y, ty, 0.18);
    glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    requestAnimationFrame(loop);
  };

  const handleMouseMove = (e) => {
    tx = e.clientX;
    ty = e.clientY;
    lastMovement = Date.now();
    if (!isAnimating) {
      isAnimating = true;
      loop();
    }
  };

  // Stop animation after inactivity to save battery
  setInterval(() => {
    if (Date.now() - lastMovement > inactivityTimeout && isAnimating) {
      isAnimating = false;
    }
  }, inactivityTimeout);

  window.addEventListener('mousemove', handleMouseMove, { passive: true });

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

  const registerQueryListener = (mq, handler) => {
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', handler);
    else if (typeof mq.addListener === 'function') mq.addListener(handler);
  };

  lists.forEach((list) => {
    const steps = Array.from(list.querySelectorAll('.process-step'));
    if (!steps.length) return;

    const section = list.closest('.process');
    const targetSelector = steps[0].dataset.target;
    const panel = targetSelector && section ? section.querySelector(targetSelector) : null;
    const numberEl = panel?.querySelector('.detail-number');
    const titleEl = panel?.querySelector('.detail-title');
    const textEl = panel?.querySelector('.detail-text');
    const wallpaperEl = section?.querySelector('.process-bg');
    const defaultWallpaper = section?.dataset.defaultWallpaper || '';
    if (panel) panel.setAttribute('tabindex', '0');

    // Mobile phones only (max-width: 720px) use carousel, tablets+ use desktop layout
    const mobileQuery = window.matchMedia('(max-width: 720px)');
    const isMobile = () => mobileQuery.matches;

    let current = steps[0] || null;
    let currentIndex = 0;
    let hasUnlockedLoop = false;

    const applyWallpaper = (src) => {
      if (!wallpaperEl) return;
      const image = src || defaultWallpaper;
      wallpaperEl.style.backgroundImage = image ? `url('${image}')` : '';
    };

    const applyCardClasses = () => {
      const len = steps.length;
      steps.forEach((step) => step.classList.remove('card-current', 'card-prev', 'card-next', 'card-hidden'));
      if (!isMobile()) return;

      const nextIdx = currentIndex === len - 1 ? (hasUnlockedLoop ? 0 : null) : currentIndex + 1;
      const prevIdx = hasUnlockedLoop ? (currentIndex - 1 + len) % len : currentIndex > 0 ? currentIndex - 1 : null;

      steps.forEach((step, idx) => {
        if (idx === currentIndex) step.classList.add('card-current');
        else if (nextIdx !== null && idx === nextIdx) step.classList.add('card-next');
        else if (prevIdx !== null && idx === prevIdx) step.classList.add('card-prev');
        else step.classList.add('card-hidden');
      });
    };

    const goRelative = (dir) => {
      const len = steps.length;
      if (dir === 1) {
        if (currentIndex < len - 1) activate(steps[currentIndex + 1]);
        else if (hasUnlockedLoop) activate(steps[0]);
      } else if (dir === -1) {
        if (!hasUnlockedLoop) return;
        const prevIdx = currentIndex === 0 ? len - 1 : currentIndex - 1;
        activate(steps[prevIdx]);
      }
    };

    const activate = (btn, force = false) => {
      if (!btn) return;
      const detailTitle = btn.dataset.title || btn.textContent.trim();
      const detailText = btn.dataset.detail || '';
      const idx = steps.indexOf(btn);
      const stepIndex = Number(btn.dataset.step) || idx + 1;
      if (idx !== -1) {
        currentIndex = idx;
        if (idx === steps.length - 1) hasUnlockedLoop = true;
      }
      if (!isMobile()) applyWallpaper(btn.dataset.wallpaper);

      if (isMobile()) {
        current = btn;
        steps.forEach((step) => {
          const isActive = step === btn;
          step.classList.toggle('active', isActive);
          step.setAttribute('aria-selected', String(isActive));
          step.setAttribute('aria-expanded', 'true');
        });
        if (numberEl) numberEl.textContent = formatStepNumber(stepIndex);
        applyCardClasses();
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
        panel.dataset.activeStep = String(stepIndex);
        if (titleEl) titleEl.textContent = detailTitle;
        if (textEl) textEl.textContent = detailText;
        if (numberEl) animateStepValue(numberEl, stepIndex, { duration: 500 });
        setTimeout(() => panel.classList.remove('updating'), 320);
      }

      applyCardClasses();
    };

    const initialize = () => {
      if (isMobile()) {
        const first = steps[0];
        current = first;
        currentIndex = 0;
        hasUnlockedLoop = false;
        steps.forEach((step) => {
          const isActive = step === first;
          step.classList.toggle('active', isActive);
          step.setAttribute('aria-selected', String(isActive));
          step.setAttribute('aria-expanded', 'true');
        });
        if (numberEl) numberEl.textContent = formatStepNumber(Number(first.dataset.step) || 1);
        applyWallpaper(first?.dataset.wallpaper);
      } else {
        const initial = steps.find((step) => step.classList.contains('active')) || steps[0];
        activate(initial, true);
      }
      applyCardClasses();
    };

    steps.forEach((step, index) => {
      const handleHover = () => { if (!isMobile()) activate(step); };
      step.addEventListener('mouseenter', handleHover);
      step.addEventListener('mouseover', handleHover);
      step.addEventListener('pointerenter', handleHover);
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
      step.addEventListener('mouseleave', () => {
        if (isMobile()) return;
        const active = steps.find((s) => s.classList.contains('active')) || current;
        applyWallpaper(active?.dataset.wallpaper);
      });
    });

    let pointerActive = false;
    let startX = 0;
    let startY = 0;
    const SWIPE_THRESHOLD = 40;

    const getPoint = (event) => {
      if ('touches' in event && event.touches.length) return event.touches[0];
      if ('changedTouches' in event && event.changedTouches.length) return event.changedTouches[0];
      return event;
    };

    const handlePointerDown = (event) => {
      if (!isMobile()) return;
      pointerActive = true;
      const point = getPoint(event);
      startX = point.clientX;
      startY = point.clientY;
    };

    const handlePointerMove = (event) => {
      if (!pointerActive) return;
      const point = getPoint(event);
      const dx = point.clientX - startX;
      const dy = point.clientY - startY;
      if (Math.abs(dy) > Math.abs(dx)) {
        pointerActive = false;
        return;
      }
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        pointerActive = false;
        // Reverse swipe direction for RTL languages
        const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
        const direction = dx < 0 ? 1 : -1;
        goRelative(isRTL ? -direction : direction);
      }
    };

    const handlePointerUp = () => {
      pointerActive = false;
    };

    // Use pointer events only (covers mouse, touch, pen) - avoid duplicate touch listeners
    list.addEventListener('pointerdown', handlePointerDown);
    list.addEventListener('pointermove', handlePointerMove, { passive: true });
    list.addEventListener('pointerup', handlePointerUp);
    list.addEventListener('pointercancel', handlePointerUp);
    list.addEventListener('pointerleave', handlePointerUp);

    initialize();
    registerQueryListener(mobileQuery, () => {
      initialize();
    });

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

// Bonus Services 3D Carousel
(function () {
  const carousels = document.querySelectorAll('[data-bonus-carousel]');
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll('.carousel-card'));
    if (!cards.length) return;

    const wrapper = carousel.closest('.bonus-carousel-wrapper');
    const prevBtn = wrapper ? wrapper.querySelector('.carousel-nav-prev') : null;
    const nextBtn = wrapper ? wrapper.querySelector('.carousel-nav-next') : null;
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

    let currentIndex = 0;

    const updateCarousel = () => {
      cards.forEach((card, index) => {
        // Remove all state classes
        card.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');

        // Calculate position relative to current
        const diff = index - currentIndex;
        const total = cards.length;

        // Normalize diff to handle circular navigation
        let normalizedDiff = diff;
        if (Math.abs(diff) > total / 2) {
          normalizedDiff = diff > 0 ? diff - total : diff + total;
        }

        // Apply appropriate class based on position
        if (normalizedDiff === 0) {
          card.classList.add('active');
        } else if (normalizedDiff === 1 || normalizedDiff === -total + 1) {
          card.classList.add(isRTL ? 'prev' : 'next');
        } else if (normalizedDiff === -1 || normalizedDiff === total - 1) {
          card.classList.add(isRTL ? 'next' : 'prev');
        } else if (normalizedDiff > 1 || normalizedDiff < -1) {
          if (normalizedDiff > 0) {
            card.classList.add(isRTL ? 'far-prev' : 'far-next');
          } else {
            card.classList.add(isRTL ? 'far-next' : 'far-prev');
          }
        }
      });
    };

    const navigate = (direction) => {
      currentIndex = (currentIndex + direction + cards.length) % cards.length;
      updateCarousel();
    };

    // Event listeners for navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => navigate(isRTL ? 1 : -1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => navigate(isRTL ? -1 : 1));
    }

    // Keyboard navigation
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigate(isRTL ? -1 : 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigate(isRTL ? 1 : -1);
      }
    });

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left
          navigate(isRTL ? -1 : 1);
        } else {
          // Swipe right
          navigate(isRTL ? 1 : -1);
        }
      }
    };

    // Initialize
    updateCarousel();
  });
})();

// ────────────────────────────────────────────────────────────────
// Desktop Poker Card Spread Animation for Bonus Services
// ────────────────────────────────────────────────────────────────
(function () {
  // Only run on desktop (981px and above)
  const isDesktop = () => window.matchMedia('(min-width: 981px)').matches;
  if (!isDesktop()) return;

  const bonusSection = document.querySelector('.bonus#bonus-services');
  if (!bonusSection) return;

  const cardsContainer = bonusSection.querySelector('.bonus-cards-mobile');
  if (!cardsContainer) return;

  const cards = Array.from(cardsContainer.querySelectorAll('.bonus-card'));
  if (cards.length < 4) return;

  let ticking = false;

  const updateCards = () => {
    ticking = false;
    const scrollY = window.scrollY;
    const bonusRect = bonusSection.getBoundingClientRect();
    const bonusTop = bonusRect.top + scrollY;
    const viewportHeight = window.innerHeight;

    // Calculate trigger points for each card - slow, smooth spread
    cards.forEach((card, index) => {
      // Each card triggers ~120px apart for smooth poker card effect
      const triggerY = bonusTop + (index * 120) - viewportHeight * 0.5;

      if (scrollY >= triggerY) {
        card.classList.add('is-visible');
      } else {
        card.classList.remove('is-visible');
      }
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateCards);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateCards);

  // Initial update
  updateCards();
})();

// ────────────────────────────────────────────────────────────────
// Mobile/Tablet Stacking Animation for Bonus Services
// ────────────────────────────────────────────────────────────────
(function () {
  // Only run on mobile and tablet (below 981px)
  const isMobileOrTablet = () => window.matchMedia('(max-width: 980px)').matches;
  if (!isMobileOrTablet()) return;

  const bonusSection = document.querySelector('.bonus#bonus-services');
  if (!bonusSection) return;

  const cardsContainer = bonusSection.querySelector('.bonus-cards-mobile');
  if (!cardsContainer) return;

  const cards = Array.from(cardsContainer.querySelectorAll('.bonus-card'));
  if (!cards.length) return;

  let ticking = false;

  const updateCards = () => {
    ticking = false;
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('.site-header')?.offsetHeight || 76;
    const scrollY = window.scrollY;

    // Slide in cards one by one as user scrolls
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardTop = cardRect.top;

      // Cards slide in when they reach 80% down the viewport
      const triggerPoint = viewportHeight * 0.8;

      // Check if card should slide in (visible)
      if (cardTop < triggerPoint && !card.classList.contains('is-visible')) {
        card.classList.add('is-visible');
      }

      // Check which card is in the active sticky position
      const stickyTop = headerHeight + 20;
      const stickyBottom = headerHeight + 120;

      // Check if this card is in the sticky position (active state with colors)
      if (cardTop >= stickyTop && cardTop <= stickyBottom) {
        // Remove active from all cards
        cards.forEach(c => c.classList.remove('is-active'));
        // Add active to this card
        card.classList.add('is-active');
      } else if (cardTop > stickyBottom) {
        // Card hasn't reached sticky position yet, remove active
        card.classList.remove('is-active');
      }
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateCards);
  };

  // Use IntersectionObserver for better performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        window.addEventListener('scroll', onScroll, { passive: true });
        updateCards();
      } else {
        window.removeEventListener('scroll', onScroll);
      }
    });
  }, { rootMargin: '100px' });

  observer.observe(bonusSection);

  // Initial update
  updateCards();

  // Re-check on resize
  const handleResize = () => {
    if (!isMobileOrTablet()) {
      window.removeEventListener('scroll', onScroll);
    } else {
      updateCards();
    }
  };
  window.addEventListener('resize', handleResize);

  // Cleanup: disconnect observer when leaving page
  const cleanup = () => {
    observer.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', handleResize);
  };
  window.addEventListener('beforeunload', cleanup);
})();

/* Benefit Cards - Cursor-Following Light Effect */
(function () {
  const benefitCards = document.querySelectorAll('.benefit-card');

  benefitCards.forEach((card) => {
    const glowLight = card.querySelector('::before');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update the radial gradient position using CSS custom properties
      card.style.setProperty('--light-x', `${x}px`);
      card.style.setProperty('--light-y', `${y}px`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--light-x', '-150px');
      card.style.setProperty('--light-y', '-150px');
    });
  });
})();

/* Card Video Playback on Hover (Desktop) and Auto-play (Mobile/Tablet) */
(function () {
  const cardsWithImages = document.querySelectorAll('.card-with-image');
  if (!cardsWithImages.length) return;

  const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
  const isTabletOrMobile = () => window.innerWidth <= 980;

  const autoplayVideo = (video) => {
    if (!video) return;
    video.currentTime = 0;
    const playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {});
    }
  };

  const stopVideo = (video) => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  };

  cardsWithImages.forEach((card) => {
    const video = card.querySelector('.card-video-full');
    if (!video) return;

    // Desktop hover behaviour
    card.addEventListener('mouseenter', () => {
      if (!isTouchDevice()) autoplayVideo(video);
    });
    card.addEventListener('mouseleave', () => {
      if (!isTouchDevice()) stopVideo(video);
    });

    // Mobile/Tablet: autoplay when card enters viewport and loop every time it re-enters
    if (isTabletOrMobile() || isTouchDevice()) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            autoplayVideo(video);
          } else {
            stopVideo(video);
          }
        });
      }, { threshold: 0.25 });

      observer.observe(card);
    }
  });
})();

// Typewriter effect for Key Benefits card descriptions
(function () {
  const benefitCards = document.querySelectorAll('.benefit-card');
  if (!benefitCards.length) return;

  const typeText = (el, text, delay) => new Promise((resolve) => {
    el.textContent = '';
    // Handle Unicode properly by converting to array of grapheme clusters
    const chars = Array.from(text);
    let i = 0;
    const tick = () => {
      el.textContent = chars.slice(0, i++).join('');
      if (i <= chars.length) setTimeout(tick, delay);
      else resolve();
    };
    tick();
  });

  const startTypewriting = async (card) => {
    const description = card.querySelector('.card-description');
    if (!description) return;

    const text = description.textContent.trim();
    description.textContent = '';
    await typeText(description, text, 30); // 30ms per character - same speed as hero subtitle
  };

  const isMobile = () => window.matchMedia('(max-width: 980px)').matches;

  // Desktop: trigger on hover
  benefitCards.forEach((card) => {
    if (!isMobile()) {
      let hasTyped = false;
      card.addEventListener('mouseenter', async () => {
        if (!hasTyped) {
          hasTyped = true;
          await startTypewriting(card);
        }
      });
      card.addEventListener('mouseleave', () => {
        hasTyped = false;
      });
    }
  });

  // Mobile/Tablet: trigger on scroll into view
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target;
          const description = card.querySelector('.card-description');

          // Check if already typed
          if (description && !description.dataset.typed) {
            description.dataset.typed = 'true';
            startTypewriting(card);
            observer.unobserve(card);
          }
        }
      });
    }, observerOptions);

    benefitCards.forEach((card) => {
      if (isMobile()) {
        observer.observe(card);
      }
    });
  }
})();

// ============================================
// ADVANCED LAZY LOADING FOR BELOW-FOLD CONTENT
// ============================================
(function () {
  // Lazy load videos when they come into view
  (function lazyLoadVideos() {
    const videos = document.querySelectorAll('video[data-src], video.lazy-video');
    if (!('IntersectionObserver' in window) || videos.length === 0) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target;
            const sources = video.querySelectorAll('source[data-src]');

            // Load all source elements dynamically
            sources.forEach((source) => {
              if (source.dataset.src) {
                source.src = source.dataset.src;
                delete source.dataset.src;
              }
            });

            // If no sources yet but video has data-src, create them
            if (sources.length === 0 && video.dataset.src) {
              const source = document.createElement('source');
              source.src = video.dataset.src;
              source.type = 'video/mp4';
              video.appendChild(source);
              delete video.dataset.src;
            }

            video.load();
            videoObserver.unobserve(video);
          }
        });
      },
      { rootMargin: '50px' } // Start loading 50px before video enters viewport
    );

    videos.forEach((video) => videoObserver.observe(video));
  })();

  // Lazy load background images for sections (for parallax and wallpapers)
  (function lazyLoadBackgrounds() {
    const elements = document.querySelectorAll('[data-bg-src]');
    if (!('IntersectionObserver' in window) || elements.length === 0) return;

    const bgObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const bgSrc = el.dataset.bgSrc;
            if (bgSrc) {
              el.style.backgroundImage = `url('${bgSrc}')`;
              el.classList.add('bg-loaded');
              delete el.dataset.bgSrc;
              bgObserver.unobserve(el);
            }
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before element enters viewport
    );

    elements.forEach((el) => bgObserver.observe(el));
  })();

  // Lazy load multiple background images (for process wallpaper switcher)
  (function lazyLoadProcessWallpapers() {
    const processDetail = document.querySelector('.process-detail-panel');
    if (!processDetail) return;

    const wallpaperMap = {
      'images/myprocess.webp': true,
      'images/brainstorm.webp': true,
      'images/design.webp': true,
      'images/website.webp': true,
      'images/salescopy.webp': true,
      'images/integrating.webp': true,
    };

    // Check if process section is visible, then preload wallpapers
    const processSection = document.querySelector('.process');
    if (!processSection) return;

    if ('IntersectionObserver' in window) {
      const processObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Process section is visible, preload wallpaper images
              Object.keys(wallpaperMap).forEach((url) => {
                const img = new Image();
                img.src = url;
              });
              processObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '200px' }
      );
      processObserver.observe(processSection);
    }
  })();

  // Lazy load benefit card videos (more aggressive than default HTML loading)
  (function lazyLoadBenefitCardVideos() {
    const benefitVideos = document.querySelectorAll('.card-video-full');
    if (!('IntersectionObserver' in window) || benefitVideos.length === 0) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const video = entry.target;
            const source = video.querySelector('source');

            // Only load if not already loaded
            if (source && source.src && !source.dataset.loaded) {
              video.preload = 'auto'; // Change to auto load on visibility
              source.dataset.loaded = 'true';
              video.load();
            }

            videoObserver.unobserve(video);
          }
        });
      },
      { rootMargin: '150px' } // Start loading 150px before visibility
    );

    benefitVideos.forEach((video) => {
      if (video.preload !== 'auto') {
        video.preload = 'none'; // Don't preload by default
        videoObserver.observe(video);
      }
    });
  })();

  // Preload images on viewport visibility for better perceived performance
  (function optimizeImageLoading() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if (!('IntersectionObserver' in window) || lazyImages.length === 0) return;

    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            // Native lazy loading handles this, but we can add a loaded class
            if (img.complete) {
              img.classList.add('img-loaded');
            } else {
              img.addEventListener('load', () => {
                img.classList.add('img-loaded');
              }, { once: true });
            }
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '50px' }
    );

    lazyImages.forEach((img) => imageObserver.observe(img));
  })();

  // Bonus: Defer non-critical CSS and scripts
  (function deferNonCriticalAssets() {
    // This would typically be done server-side, but can help with in-page optimization
    // Mark when document is fully interactive
    document.addEventListener('DOMContentLoaded', () => {
      document.body.classList.add('dom-ready');
    });

    window.addEventListener('load', () => {
      document.body.classList.add('fully-loaded');
    });
  })();
})();
