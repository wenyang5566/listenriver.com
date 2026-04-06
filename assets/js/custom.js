(function() {
  const header = document.getElementById('site-header');
  const mobileMedia = window.matchMedia('(max-width: 640px)');
  const body = document.body;

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

        if (mobileMedia.matches || y <= topRevealOffset) {
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

  const mobileNavToggle = document.querySelector('.header-mobile-menu-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileNavCloseButtons = document.querySelectorAll('[data-mobile-nav-close]');
  const mobileNavGroups = document.querySelectorAll('.mobile-nav-group');

  function setMobileNavOpen(isOpen) {
    if (!header || !mobileNavDrawer || !mobileNavToggle || !mobileNavBackdrop) return;

    header.classList.toggle('mobile-nav-open', isOpen);
    body.classList.toggle('mobile-nav-locked', isOpen);
    mobileNavDrawer.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    mobileNavBackdrop.hidden = !isOpen;
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  if (mobileNavToggle && mobileNavDrawer && mobileNavBackdrop) {
    mobileNavToggle.addEventListener('click', () => {
      const willOpen = !header.classList.contains('mobile-nav-open');
      setMobileNavOpen(willOpen);
    });

    mobileNavCloseButtons.forEach(button => {
      button.addEventListener('click', closeMobileNav);
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileNav);
    });
  }

  mobileNavGroups.forEach((group, index) => {
    const button = group.querySelector('.mobile-nav-group-trigger');
    if (!button) return;

    if (index === 0) {
      group.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }

    button.addEventListener('click', () => {
      const willOpen = !group.classList.contains('is-open');
      group.classList.toggle('is-open', willOpen);
      button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });

  const floatingToc = document.querySelector('[data-floating-toc]');
  const tocToggle = floatingToc ? floatingToc.querySelector('.floating-toc-toggle') : null;
  const tocLinks = floatingToc ? floatingToc.querySelectorAll('.floating-toc-body a') : [];
  const mobileTocShortcut = document.querySelector('[data-mobile-toc-shortcut]');
  const scrollTopButton = document.querySelector('[data-scroll-top]');

  function setTocOpen(isOpen) {
    if (!floatingToc) return;
    floatingToc.classList.toggle('is-open', isOpen);
    if (tocToggle) {
      tocToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
    if (mobileTocShortcut) {
      mobileTocShortcut.classList.toggle('is-active', isOpen);
    }
  }

  if (tocToggle) {
    tocToggle.addEventListener('click', () => {
      setTocOpen(!floatingToc.classList.contains('is-open'));
    });
  }

  if (mobileTocShortcut) {
    const tocAvailable = !!floatingToc;
    mobileTocShortcut.classList.toggle('is-disabled', !tocAvailable);
    mobileTocShortcut.classList.toggle('is-available', tocAvailable);
    mobileTocShortcut.disabled = !tocAvailable;

    if (tocAvailable) {
      mobileTocShortcut.addEventListener('click', () => {
        setTocOpen(!floatingToc.classList.contains('is-open'));
      });
    }
  }

  if (scrollTopButton) {
    scrollTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  tocLinks.forEach(link => {
    link.addEventListener('click', () => setTocOpen(false));
  });

  const readingProgress = document.querySelector('[data-reading-progress]');
  const readingContainer = document.querySelector('.post-single .post-content');

  function updateReadingProgress() {
    if (!readingProgress) return;

    if (!readingContainer) {
      readingProgress.style.width = '0%';
      return;
    }

    const contentTop = readingContainer.getBoundingClientRect().top + window.scrollY;
    const contentHeight = readingContainer.offsetHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = Math.max(contentHeight - viewportHeight * 0.65, 1);
    const progress = Math.min(Math.max((window.scrollY - contentTop + viewportHeight * 0.22) / maxScroll, 0), 1);
    readingProgress.style.width = (progress * 100).toFixed(2) + '%';
  }

  function handleMediaChange(event) {
    if (event.matches) {
      if (header) {
        header.classList.remove('nav--hidden');
      }
    } else {
      closeMobileNav();
      setTocOpen(false);
    }
  }

  mobileMedia.addEventListener('change', handleMediaChange);

  updateReadingProgress();
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);

  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-group')) {
      closeGroups();
    }

    if (floatingToc && !event.target.closest('[data-floating-toc]') && !event.target.closest('[data-mobile-toc-shortcut]')) {
      setTocOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeGroups();
      closeMobileNav();
      setTocOpen(false);
    }
  });
})();


(function () {
  const mobileMedia = window.matchMedia('(max-width: 640px)');

  document.querySelectorAll('[data-mobile-back]').forEach(button => {
    button.addEventListener('click', () => {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      const fallbackUrl = button.getAttribute('data-fallback-url');
      if (fallbackUrl) {
        window.location.href = fallbackUrl;
      }
    });
  });

  function getRailStep(rail) {
    const firstCard = rail.querySelector('.category-card');
    if (!firstCard) {
      return Math.max(rail.clientWidth * 0.8, 280);
    }
    const style = window.getComputedStyle(rail);
    const gap = parseFloat(style.columnGap || style.gap || '0');
    return firstCard.getBoundingClientRect().width + gap;
  }

  function scrollRail(rail, direction) {
    rail.scrollBy({ left: getRailStep(rail) * direction, behavior: 'smooth' });
  }

  document.querySelectorAll('[data-category-rail-prev]').forEach(button => {
    button.addEventListener('click', () => {
      const rail = document.getElementById(button.getAttribute('data-category-rail-prev'));
      if (rail) {
        scrollRail(rail, -1);
      }
    });
  });

  document.querySelectorAll('[data-category-rail-next]').forEach(button => {
    button.addEventListener('click', () => {
      const rail = document.getElementById(button.getAttribute('data-category-rail-next'));
      if (rail) {
        scrollRail(rail, 1);
      }
    });
  });

  document.querySelectorAll('[data-category-rail]').forEach(rail => {
    rail.addEventListener('wheel', event => {
      if (mobileMedia.matches) {
        return;
      }
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
        return;
      }
      event.preventDefault();
      rail.scrollBy({ left: event.deltaY, behavior: 'auto' });
    }, { passive: false });
  });
})();
