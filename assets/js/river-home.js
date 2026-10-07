(() => {
  const button = document.querySelector('.river-motion-toggle');
  if (!button) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let paused = false;
  const sync = () => {
    document.body.dataset.riverMotion = paused || reducedMotion.matches ? 'paused' : 'running';
    button.hidden = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? '播放河流動態' : '暫停河流動態';
  };
  button.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', sync);
  sync();
})();
