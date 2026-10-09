(() => {
  if (!document.querySelector('.river-editorial-opening')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => { document.body.dataset.riverMotion = reducedMotion.matches ? 'paused' : 'running'; };
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
  let current = 0, timer = null, visible = false, hovered = false, focused = false, stopped = false;
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
    if (animate && next !== current && !reducedMotion.matches) {
      ghost = outgoing.cloneNode(true);
      ghost.className = 'river-feature-ghost';
      ghost.hidden = false;
      ghost.inert = true;
      ghost.setAttribute('aria-hidden', 'true');
      ghost.querySelector('a').classList.replace('river-lead-link', 'river-feature-ghost-link');
      frame.append(ghost);
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
    carousel.dataset.featureStopped = String(stopped || reducedMotion.matches);
    const playing = visible && !hovered && !focused && !stopped && !reducedMotion.matches && !document.hidden;
    toggle.setAttribute('aria-label', stopped || reducedMotion.matches ? '播放精選輪播' : '暫停精選輪播');
    counter.setAttribute('aria-live', playing ? 'off' : 'polite');
    if (!playing) return;
    // Restart both the progress line and the five-second timer together.
    void carousel.offsetWidth;
    carousel.dataset.featurePlaying = 'true';
    timer = window.setTimeout(() => { show(current + 1); schedule(); }, 5000);
  };
  const manual = direction => { stopped = true; show(current + direction, true, direction); schedule(); };
  let previous = '';
  try { previous = sessionStorage.getItem('river-last-feature') || ''; } catch {}
  const choices = slides.map((slide, i) => i).filter(i => slides[i].querySelector('a').getAttribute('href') !== previous);
  show(choices[Math.floor(Math.random() * choices.length)], false);
  controls.hidden = false;
  carousel.querySelector('[data-feature-prev]').addEventListener('click', () => manual(-1));
  carousel.querySelector('[data-feature-next]').addEventListener('click', () => manual(1));
  toggle.addEventListener('click', () => { stopped = !stopped; schedule(); });
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
