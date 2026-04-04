(function() {
  const header = document.getElementById('site-header');
  let lastY = window.scrollY;
  let ticking = false;
  const topRevealOffset = 24;
  const hideAfterOffset = 120;
  const scrollDelta = 10;

  if (header) {
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
  }

  const groups = document.querySelectorAll('.nav-group');

  function closeGroups() {
    groups.forEach(group => {
      group.classList.remove('is-open');
      const button = group.querySelector('.nav-group-trigger');
      if (button) button.setAttribute('aria-expanded', 'false');
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

  const floatingToc = document.querySelector('[data-floating-toc]');
  if (floatingToc) {
    const tocButton = floatingToc.querySelector('.floating-toc-toggle');
    const tocLinks = floatingToc.querySelectorAll('.floating-toc-body a');

    function closeToc() {
      floatingToc.classList.remove('is-open');
      if (tocButton) tocButton.setAttribute('aria-expanded', 'false');
    }

    if (tocButton) {
      tocButton.addEventListener('click', event => {
        event.preventDefault();
        const willOpen = !floatingToc.classList.contains('is-open');
        closeToc();
        if (willOpen) {
          floatingToc.classList.add('is-open');
          tocButton.setAttribute('aria-expanded', 'true');
        }
      });
    }

    tocLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeToc();
      });
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group')) closeGroups();
      if (!event.target.closest('[data-floating-toc]')) closeToc();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeGroups();
        closeToc();
      }
    });
  } else {
    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group')) closeGroups();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeGroups();
    });
  }

  const currentPath = window.location.pathname;
  const pathSegments = currentPath.split('/').filter(Boolean);
  if (pathSegments.length >= 2) {
    const sectionBase = '/' + pathSegments.slice(0, -1).join('/') + '/';
    document.querySelectorAll('.post-content a[href$=".md"]').forEach(link => {
      const rawHref = link.getAttribute('href');
      if (!rawHref || rawHref.startsWith('http') || rawHref.startsWith('#')) return;
      try {
        const resolved = new URL(rawHref, window.location.origin + sectionBase);
        let fixedPath = resolved.pathname.replace(/\.md$/i, '/');
        fixedPath = fixedPath.replace(/\/index\/$/i, '/');
        link.setAttribute('href', fixedPath + resolved.search + resolved.hash);
      } catch (error) {
      }
    });
  }
})();
