(() => {
  if (!document.querySelector('.river-editorial-opening')) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => {
    document.body.dataset.riverMotion = reducedMotion.matches ? 'paused' : 'running';
  };
  reducedMotion.addEventListener('change', sync);
  sync();

  const carousel = document.querySelector('.river-lead');
  if (!carousel) return;
  const slides = [...carousel.querySelectorAll('.river-feature-slide')];
  const controls = carousel.querySelector('.river-feature-controls');
  const counter = carousel.querySelector('.river-feature-counter');
  if (slides.length < 2) return;
  let current = 0;
  const remember = () => {
    try { sessionStorage.setItem('river-last-feature', slides[current].querySelector('a').getAttribute('href')); } catch {}
  };
  const show = (index, animate = true) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== current; slide.inert = i !== current; });
    counter.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    if (animate && !reducedMotion.matches) slides[current].animate([{ opacity: .4 }, { opacity: 1 }], { duration: 180 });
    remember();
  };
  let previous = '';
  try { previous = sessionStorage.getItem('river-last-feature') || ''; } catch {}
  const choices = slides.map((slide, i) => i).filter(i => slides[i].querySelector('a').getAttribute('href') !== previous);
  show(choices[Math.floor(Math.random() * choices.length)], false);
  controls.hidden = false;
  carousel.querySelector('[data-feature-prev]').addEventListener('click', () => show(current - 1));
  carousel.querySelector('[data-feature-next]').addEventListener('click', () => show(current + 1));
  carousel.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (slides[current].contains(document.activeElement)) carousel.querySelector(event.key === 'ArrowRight' ? '[data-feature-next]' : '[data-feature-prev]').focus();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  let start = null;
  let suppressClick = false;
  carousel.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch') start = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  carousel.addEventListener('pointerup', event => {
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    start = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    suppressClick = true;
    show(current + (dx < 0 ? 1 : -1));
    window.setTimeout(() => { suppressClick = false; }, 400);
  }, { passive: true });
  carousel.addEventListener('pointercancel', () => { start = null; });
  carousel.addEventListener('click', event => { if (suppressClick) { event.preventDefault(); suppressClick = false; } }, true);
})();
