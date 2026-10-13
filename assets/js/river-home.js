(() => {
  if (!document.querySelector('.river-editorial-opening')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let userPaused = false;
  try { userPaused = sessionStorage.getItem('river-motion-paused') === 'true'; } catch {}
  const sync = () => { document.body.dataset.riverMotion = userPaused || reducedMotion.matches ? 'paused' : 'running'; document.dispatchEvent(new Event('river:motion-change')); };
  reducedMotion.addEventListener('change', sync);
  sync();
  const carousel = document.querySelector('.river-lead');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.river-feature-slide')];
  const frame = carousel.querySelector('.river-feature-slides');
  const controls = carousel.querySelector('.river-feature-controls');
  const counter = carousel.querySelector('.river-feature-counter');
  const toggle = carousel.querySelector('[data-feature-toggle]');
  if (slides.length < 2) return;
  let current = 0, timer = null, visible = false, hovered = false, focused = false, engaged = false;
  let animations = [], ghost = null;
  const stopTransition = () => {
    animations.forEach(animation => animation.cancel());
    animations = [];
    ghost?.remove();
    ghost = null;
  };
  const remember = () => {
    try { sessionStorage.setItem('river-last-feature', slides[current].querySelector('a').getAttribute('href')); } catch {}
  };
  const show = (index, animate = true, direction = 1) => {
    stopTransition();
    const outgoing = slides[current];
    const next = (index + slides.length) % slides.length;
    if (animate && next !== current && !reducedMotion.matches && !userPaused) {
      ghost = outgoing.cloneNode(true);
      ghost.className = 'river-feature-ghost';
      ghost.hidden = false;
      ghost.inert = true;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.querySelector('a').classList.replace('river-lead-link', 'river-feature-ghost-link');
      frame.append(ghost);
    }
    // A slide becoming visible must not wait for the lazy-load threshold.
    const image = slides[next].querySelector("img");
    if (image) {
      image.loading = 'eager';
      image.fetchPriority = 'high';
      slides[next].querySelectorAll('[data-srcset], [data-src]').forEach(element => {
        for (const attribute of ['srcset', 'src']) {
          if (element.hasAttribute(`data-${attribute}`)) {
            element.setAttribute(attribute, element.getAttribute(`data-${attribute}`));
            element.removeAttribute(`data-${attribute}`);
          }
        }
      });
    }
    current = next;
    slides.forEach((slide, i) => { slide.hidden = i !== current; slide.inert = i !== current; });
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (ghost) {
      const options = { duration: 600, easing: 'cubic-bezier(.22,1,.36,1)' };
      animations = [ghost.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-100 * direction}%)` }], options), slides[current].animate([{ transform: `translateX(${100 * direction}%)` }, { transform: 'translateX(0)' }], options)];
      const departing = ghost;
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).finally(() => departing.remove());
    }
    remember();
  };
  const schedule = () => {
    window.clearTimeout(timer);
    carousel.dataset.featurePlaying = 'false';
    carousel.dataset.featureStopped = String(!engaged || userPaused || reducedMotion.matches);
    carousel.dataset.featurePaused = String(userPaused);
    toggle.disabled = reducedMotion.matches;
    toggle.querySelector('[data-feature-toggle-label]').textContent = reducedMotion.matches ? '已減少動態' : userPaused ? '繼續動態' : '暫停動態';
    const playing = !userPaused && engaged && visible && !hovered && !focused && !reducedMotion.matches && !document.hidden;
    counter.setAttribute('aria-live', playing ? 'off' : 'polite');
    if (!playing) return;
    // Restart both the progress line and the five-second timer together.
    void carousel.offsetWidth;
    carousel.dataset.featurePlaying = 'true';
    timer = window.setTimeout(() => { show(current + 1); schedule(); }, 5000);
  };
  // Leave the opening still until the reader interacts. Automatic changes during
  // loading interrupt reading and replace the browser's initial LCP candidate.
  const engage = event => {
    if (engaged) return;
    engaged = true;
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => document.removeEventListener(type, engage));
    schedule();
  };
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => document.addEventListener(type, engage, { passive: true }));
  const manual = direction => { show(current + direction, true, direction); schedule(); };
  let previous = '';
  try { previous = sessionStorage.getItem('river-last-feature') || ''; } catch {}
  const choices = slides.map((slide, i) => i).filter(i => slides[i].querySelector('a').getAttribute('href') !== previous);
  // Keep the server-rendered, eagerly loaded cover on a first visit.
  // Repeat visits still choose a different opening from the previous article.
  show(previous ? choices[Math.floor(Math.random() * choices.length)] : 0, false);
  controls.hidden = false;
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    try { sessionStorage.setItem('river-motion-paused', String(userPaused)); } catch {}
    stopTransition(); sync(); schedule();
  });
  carousel.querySelector('[data-feature-prev]').addEventListener('click', () => manual(-1));
  carousel.querySelector('[data-feature-next]').addEventListener('click', () => manual(1));
  carousel.addEventListener('mouseenter', () => { hovered = true; schedule(); });
  carousel.addEventListener('mouseleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', () => { focused = true; schedule(); });
  carousel.addEventListener('focusout', () => { queueMicrotask(() => { focused = carousel.contains(document.activeElement); schedule(); }); });
  document.addEventListener('visibilitychange', schedule);
  reducedMotion.addEventListener('change', () => { stopTransition(); schedule(); });
  new IntersectionObserver(entries => { visible = entries[0].intersectionRatio >= .35; schedule(); }, { threshold: .35 }).observe(carousel);
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (slides[current].contains(document.activeElement)) carousel.querySelector(event.key === 'ArrowRight' ? '[data-feature-next]' : '[data-feature-prev]').focus();
    manual(event.key === 'ArrowRight' ? 1 : -1);
  });
  let start = null, suppressClick = false;
  carousel.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') start = { x: event.clientX, y: event.clientY }; }, { passive: true });
  carousel.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClick = true;
    manual(dx < 0 ? 1 : -1);
    window.setTimeout(() => { suppressClick = false; }, 400);
  }, { passive: true });
  carousel.addEventListener('pointercancel', () => { start = null; });
  carousel.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); suppressClick = false; } }, true);
})();
