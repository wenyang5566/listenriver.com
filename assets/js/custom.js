(function() {
  const header = document.getElementById('site-header');
  if (!header) return;

  let lastY = window.scrollY;
  let ticking = false;
  const topRevealOffset = 24;
  const hideAfterOffset = 120;
  const scrollDelta = 10;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const diff = y - lastY;

      if (y <= topRevealOffset) {
        header.classList.remove('nav--hidden');
      } else if (diff > scrollDelta && y > hideAfterOffset) {
        header.classList.add('nav--hidden');
      } else if (diff < -scrollDelta) {
        header.classList.remove('nav--hidden');
      }

      lastY = Math.max(y, 0);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  const groups = document.querySelectorAll('.nav-group');

  function closeGroups() {
    groups.forEach(group => {
      group.classList.remove('is-open');
      const button = group.querySelector('.nav-group-trigger');
      if (button) {
        button.setAttribute('aria-expanded', 'false');
      }
    });
  }

  groups.forEach(group => {
    const button = group.querySelector('.nav-group-trigger');
    if (!button) return;

    button.addEventListener('click', event => {
      event.preventDefault();
      const willOpen = !group.classList.contains('is-open');
      closeGroups();
      if (willOpen) {
        group.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-group')) {
      closeGroups();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeGroups();
    }
  });
})();
