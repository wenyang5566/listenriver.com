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
        if (window.innerWidth <= 640) {
          header.classList.remove('nav--hidden');
          lastY = Math.max(window.scrollY, 0);
          ticking = false;
          return;
        }

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

  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function syncThemeToggleState() {
    if (!themeToggle) return;

    const isDark = html.dataset.theme === 'dark';
    const nextModeLabel = isDark ? '切換為淺色模式' : '切換為深色模式';
    themeToggle.setAttribute('aria-label', nextModeLabel);
    themeToggle.setAttribute('title', nextModeLabel + ' (Alt + T)');
  }

  syncThemeToggleState();

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      window.setTimeout(syncThemeToggleState, 0);
    });
  }

  if (window.matchMedia) {
    const darkSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    if (typeof darkSchemeMedia.addEventListener === 'function') {
      darkSchemeMedia.addEventListener('change', syncThemeToggleState);
    } else if (typeof darkSchemeMedia.addListener === 'function') {
      darkSchemeMedia.addListener(syncThemeToggleState);
    }
  }

  const mobileDrawer = document.getElementById('mobile-nav-drawer');
  const mobileNavBackdrop = document.querySelector('.mobile-nav-backdrop');
  const mobileMenuToggle = document.querySelector('.header-mobile-menu-toggle');
  const mobileNavCloseButtons = document.querySelectorAll('[data-mobile-nav-close]');
  const mobileNavGroups = document.querySelectorAll('.mobile-nav-group');
  const scrollTopButtons = document.querySelectorAll('[data-scroll-top]');
  const mobileTocShortcut = document.querySelector('[data-mobile-toc-shortcut]');
  const mobileBackButtons = document.querySelectorAll('[data-mobile-back]');
  const readingProgressBar = document.querySelector('[data-reading-progress]');
  let lastMobileMenuTrigger = null;

  function toggleInert(element, inert) {
    if (!element) return;
    if (inert) {
      element.setAttribute('inert', '');
    } else {
      element.removeAttribute('inert');
    }
  }

  function setMobileNavOpen(open) {
    if (!header || !mobileDrawer || !mobileMenuToggle) return;

    header.classList.toggle('mobile-nav-open', open);
    document.body.classList.toggle('mobile-nav-locked', open);
    mobileDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    mobileMenuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggleInert(mobileDrawer, !open);
    if (mobileNavBackdrop) {
      mobileNavBackdrop.hidden = !open;
    }

    if (open) {
      const firstFocusable = mobileDrawer.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      window.requestAnimationFrame(() => {
        (firstFocusable || mobileDrawer).focus?.();
      });
    } else if (lastMobileMenuTrigger) {
      window.requestAnimationFrame(() => {
        lastMobileMenuTrigger.focus();
      });
    }
  }

  if (mobileDrawer && mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      lastMobileMenuTrigger = mobileMenuToggle;
      const willOpen = !header.classList.contains('mobile-nav-open');
      setMobileNavOpen(willOpen);
    });

    mobileNavCloseButtons.forEach((button) => {
      button.addEventListener('click', () => {
        setMobileNavOpen(false);
      });
    });

    mobileNavGroups.forEach((group) => {
      const trigger = group.querySelector('.mobile-nav-group-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', () => {
        const willOpen = !group.classList.contains('is-open');
        mobileNavGroups.forEach((item) => {
          item.classList.remove('is-open');
          const itemTrigger = item.querySelector('.mobile-nav-group-trigger');
          if (itemTrigger) itemTrigger.setAttribute('aria-expanded', 'false');
        });

        if (willOpen) {
          group.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 640) {
        setMobileNavOpen(false);
      }
    }, { passive: true });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && header.classList.contains('mobile-nav-open')) {
        setMobileNavOpen(false);
      }
    });
  }

  scrollTopButtons.forEach((button) => {
    button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    });
  });

  mobileBackButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const fallbackUrl = button.getAttribute('data-fallback-url') || '/';
      const referrer = document.referrer;
      const hasSameOriginReferrer = !!referrer && (() => {
        try {
          return new URL(referrer).origin === window.location.origin;
        } catch (error) {
          return false;
        }
      })();

      if (window.history.length > 1 && hasSameOriginReferrer) {
        window.history.back();
        return;
      }

      window.location.href = fallbackUrl;
    });
  });

  if (readingProgressBar) {
    const progressSource = document.querySelector('.post-content');
    const updateReadingProgress = () => {
      if (!progressSource) {
        readingProgressBar.style.width = '0%';
        return;
      }

      const viewportHeight = window.innerHeight;
      const contentTop = progressSource.offsetTop;
      const fullHeight = progressSource.scrollHeight;
      const contentBottom = contentTop + fullHeight;
      const scrolled = window.scrollY + viewportHeight * 0.18;
      const available = Math.max(contentBottom - contentTop - viewportHeight * 0.42, 1);
      const ratio = Math.max(0, Math.min((scrolled - contentTop) / available, 1));
      readingProgressBar.style.width = (ratio * 100).toFixed(2) + '%';
    };

    updateReadingProgress();
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress, { passive: true });
  }

  initReaderMediaEnhancements();

  const floatingToc = document.querySelector('[data-floating-toc]');
  if (floatingToc) {
    const tocButton = floatingToc.querySelector('.floating-toc-toggle');
    const tocLinks = floatingToc.querySelectorAll('.floating-toc-body a');

    function closeToc() {
      floatingToc.classList.remove('is-open');
      if (tocButton) tocButton.setAttribute('aria-expanded', 'false');
      if (mobileTocShortcut) mobileTocShortcut.setAttribute('aria-expanded', 'false');
    }

    function openToc() {
      floatingToc.classList.add('is-open');
      if (tocButton) tocButton.setAttribute('aria-expanded', 'true');
      if (mobileTocShortcut) mobileTocShortcut.setAttribute('aria-expanded', 'true');
    }

    if (tocButton) {
      tocButton.addEventListener('click', event => {
        event.preventDefault();
        const willOpen = !floatingToc.classList.contains('is-open');
        closeToc();
        if (willOpen) openToc();
      });
    }

    if (mobileTocShortcut) {
      mobileTocShortcut.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const willOpen = !floatingToc.classList.contains('is-open');
        closeToc();

        if (willOpen) {
          openToc();
        }
      });
    }

    tocLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeToc();
      });
    });

    syncActiveTocLink(tocLinks);

    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group')) closeGroups();
      if (!event.target.closest('[data-floating-toc]') && !event.target.closest('[data-mobile-toc-shortcut]')) closeToc();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeGroups();
        closeToc();
      }
    });
  } else {
    if (mobileTocShortcut) {
      mobileTocShortcut.classList.add('is-disabled');
      mobileTocShortcut.setAttribute('aria-disabled', 'true');
      mobileTocShortcut.setAttribute('aria-expanded', 'false');
    }

    document.addEventListener('click', event => {
      if (!event.target.closest('.nav-group')) closeGroups();
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeGroups();
    });
  }

  const interactionRoot = document.querySelector('[data-post-interactions]');
  if (interactionRoot) {
    initPostInteractions(interactionRoot);
  }

  function initPostInteractions(root) {
    const apiBase = normalizeApiBase(root.dataset.apiBase || '');
    const postPath = root.dataset.postPath || window.location.pathname;
    const commentsPath = normalizeCommentPath(postPath);
    const commentPathCandidates = Array.from(new Set([
      commentsPath,
      commentsPath === '/' ? '/' : commentsPath + '/'
    ]));
    const likeButtons = Array.from(document.querySelectorAll('[data-post-like-button]'));
    const commentButtons = Array.from(document.querySelectorAll('[data-post-comments-button]'));
    const viewsValues = Array.from(document.querySelectorAll('[data-post-views]'));
    const likesValues = Array.from(document.querySelectorAll('[data-post-likes]'));
    const commentValues = Array.from(document.querySelectorAll('[data-post-comments]'));
    const floatingBar = root.querySelector('[data-post-floating-bar]');
    const commentsEnabled = root.dataset.commentsEnabled === 'true';
    const commentsServerUrl = normalizeApiBase(root.dataset.commentsServerUrl || '');
    const commentsAnchor = document.querySelector('[data-comments-anchor]');
    const content = document.querySelector('.post-content');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rabbitImageSrc = '/images/mao_3.png';
    const viewedSessionKey = 'listenriver:view:' + postPath;
    const likedSessionKey = 'listenriver:like:' + postPath;
    let isLikePending = false;

    commentValues.forEach((node) => {
      node.dataset.path = commentsPath;
    });

    if (!likeButtons.length || !viewsValues.length || !likesValues.length) return;

    if (!apiBase) {
      root.classList.add('post-interactions--offline');
      likeButtons.forEach((button) => {
        button.setAttribute('aria-disabled', 'true');
        button.title = '尚未設定統計 API';
      });
      setCountText(viewsValues, '--');
      setCountText(likesValues, '--');
    } else {
      const schedule = window.requestIdleCallback || function(callback) {
        window.setTimeout(callback, 700);
      };

      schedule(() => {
        loadStats();
        if (!sessionStorage.getItem(viewedSessionKey)) {
          window.setTimeout(() => {
            recordView();
          }, 1200);
        }
      });
    }

    if (commentsEnabled && commentsServerUrl && commentValues.length) {
      loadCommentCount();
      document.addEventListener('listenriver:comments-updated', handleCommentsUpdated);
    } else if (commentValues.length) {
      setCountText(commentValues, '--');
    }

    if (sessionStorage.getItem(likedSessionKey)) {
      likeButtons.forEach((button) => button.classList.add('is-liked'));
    }

    likeButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        if (!apiBase || isLikePending) return;

        isLikePending = true;
        likeButtons.forEach((item) => {
          item.classList.add('is-busy');
          item.setAttribute('aria-busy', 'true');
        });

        try {
          const payload = await postJson(apiBase + '/like', { post: postPath });
          const stats = extractStats(payload);
          if (stats.likes !== null) {
            setCountText(likesValues, formatCount(stats.likes));
          }
          if (stats.views !== null) {
            setCountText(viewsValues, formatCount(stats.views));
          }
          likeButtons.forEach((item) => item.classList.add('is-liked'));
          sessionStorage.setItem(likedSessionKey, '1');
          launchRabbitBurst(button, rabbitImageSrc, prefersReducedMotion.matches ? 3 : 6);
        } catch (error) {
          likeButtons.forEach((item) => {
            item.title = '按讚暫時失敗，請稍後再試';
          });
        } finally {
          isLikePending = false;
          likeButtons.forEach((item) => {
            item.classList.remove('is-busy');
            item.removeAttribute('aria-busy');
          });
        }
      });
    });

    commentButtons.forEach((button) => {
      button.addEventListener('click', () => {
        if (!commentsAnchor) return;

        commentsAnchor.scrollIntoView({
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
          block: 'start'
        });
      });
    });

    if (floatingBar && content) {
      const updateFloatingBar = () => {
        const contentRect = content.getBoundingClientRect();
        const commentsRect = commentsAnchor ? commentsAnchor.getBoundingClientRect() : null;
        const passedIntro = contentRect.top < -160;
        const beforeComments = commentsRect ? commentsRect.top > window.innerHeight * 0.72 : contentRect.bottom > 220;
        const hasReadableSpace = contentRect.bottom > window.innerHeight * 0.45;
        const visible = passedIntro && beforeComments && hasReadableSpace;

        floatingBar.classList.toggle('is-visible', visible);
        floatingBar.setAttribute('aria-hidden', visible ? 'false' : 'true');
        toggleInert(floatingBar, !visible);
      };

      updateFloatingBar();
      window.addEventListener('scroll', updateFloatingBar, { passive: true });
      window.addEventListener('resize', updateFloatingBar, { passive: true });
    }

    async function loadStats() {
      try {
        const response = await fetch(apiBase + '/stats?post=' + encodeURIComponent(postPath), {
          headers: { Accept: 'application/json' },
          credentials: 'omit'
        });
        if (!response.ok) throw new Error('stats request failed');

        const payload = await response.json();
        const stats = extractStats(payload);
        setCountText(viewsValues, formatCount(stats.views));
        setCountText(likesValues, formatCount(stats.likes));
      } catch (error) {
        root.classList.add('post-interactions--offline');
        setCountText(viewsValues, '--');
        setCountText(likesValues, '--');
      }
    }

    async function recordView() {
      sessionStorage.setItem(viewedSessionKey, '1');

      try {
        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify({ post: postPath })], { type: 'application/json' });
          navigator.sendBeacon(apiBase + '/view', blob);
          return;
        }

        const payload = await postJson(apiBase + '/view', { post: postPath }, true);
        const stats = extractStats(payload);
        if (stats.views !== null) {
          setCountText(viewsValues, formatCount(stats.views));
        }
      } catch (error) {
      }
    }

    function handleCommentsUpdated(event) {
      const updatedPath = normalizeCommentPath(event.detail && event.detail.path);
      if (updatedPath === commentsPath || updatedPath === commentsPath + '/') {
        loadCommentCount();
      }
    }

    async function loadCommentCount() {
      try {
        let numericValue = 0;

        for (const candidatePath of commentPathCandidates) {
          const value = await fetchCommentCount(commentsServerUrl, candidatePath);
          numericValue = value;
          if (value > 0) break;
        }

        setCountText(commentValues, formatCount(numericValue));
      } catch (error) {
        setCountText(commentValues, '--');
      }
    }
  }

  function normalizeApiBase(value) {
    return value.replace(/\/+$/, '');
  }

  function normalizeCommentPath(value) {
    const rawValue = value || window.location.pathname;

    try {
      return decodeURIComponent(rawValue).replace(/\/$/, '') || '/';
    } catch (error) {
      return rawValue.replace(/\/$/, '') || '/';
    }
  }

  async function fetchCommentCount(serverUrl, path) {
    const response = await fetch(serverUrl + '/api/comment?type=count&url=' + encodeURIComponent(path), {
      headers: { Accept: 'application/json' },
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error('comment count request failed');
    }

    const payload = await response.json();
    const value = typeof payload === 'number'
      ? payload
      : Array.isArray(payload)
        ? payload[0]
        : Array.isArray(payload?.data)
          ? payload.data[0]
          : payload?.data ?? payload?.result ?? 0;

    return typeof value === 'number' ? value : Number(value) || 0;
  }

  async function postJson(url, body, keepalive) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body),
      keepalive: !!keepalive,
      credentials: 'omit'
    });

    if (!response.ok) {
      throw new Error('request failed');
    }

    return response.json();
  }

  function extractStats(payload) {
    const source = payload && typeof payload === 'object' && payload.result && typeof payload.result === 'object'
      ? payload.result
      : payload;

    return {
      views: typeof source?.views === 'number' ? source.views : null,
      likes: typeof source?.likes === 'number' ? source.likes : null
    };
  }

  function formatCount(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return '--';
    }

    return new Intl.NumberFormat('zh-TW').format(value);
  }

  function setCountText(nodes, value) {
    nodes.forEach((node) => {
      node.textContent = value;
    });
  }

  function launchRabbitBurst(button, imageSrc, amount) {
    const rect = button.getBoundingClientRect();
    const baseX = rect.left + rect.width * 0.5;
    const baseY = rect.top + rect.height * 0.45;

    for (let index = 0; index < amount; index += 1) {
      const burst = document.createElement('span');
      burst.className = 'post-rabbit-burst';
      burst.style.left = baseX - 22 + 'px';
      burst.style.top = baseY - 22 + 'px';
      burst.style.setProperty('--burst-x', randomInRange(-140, 140) + 'px');
      burst.style.setProperty('--burst-y', randomInRange(-170, -70) + 'px');

      const image = document.createElement('img');
      image.src = imageSrc;
      image.alt = '';
      burst.appendChild(image);
      document.body.appendChild(burst);

      burst.addEventListener('animationend', () => {
        burst.remove();
      }, { once: true });
    }
  }

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
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

  function initReaderMediaEnhancements() {
    const articleRoot = document.querySelector('.post-single');
    if (!articleRoot) return;

    const figures = Array.from(articleRoot.querySelectorAll('.post-figure, .post-single > .entry-cover'));
    const images = figures
      .map((figure) => figure.querySelector('img'))
      .filter((image) => image && !image.closest('.post-content-image--missing'));

    if (!images.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const imageMeta = images.map((image, index) => {
      const figure = image.closest('.post-figure, .entry-cover');
      const captionNode = figure ? figure.querySelector('figcaption') : null;
      const src = image.currentSrc || image.src;
      const alt = image.getAttribute('alt') || '';

      image.classList.add('is-zoomable');
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', alt ? `放大圖片：${alt}` : '放大圖片');

      return {
        image,
        src,
        alt,
        caption: captionNode ? captionNode.textContent.trim() : '',
        index
      };
    });

    const lightbox = document.createElement('div');
    lightbox.className = 'reader-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.setAttribute('inert', '');
    lightbox.innerHTML = `
      <div class="reader-lightbox-backdrop" data-reader-lightbox-close></div>
      <div class="reader-lightbox-dialog" role="dialog" aria-modal="true" aria-label="圖片預覽">
        <button class="reader-lightbox-close" type="button" aria-label="關閉圖片預覽" data-reader-lightbox-close>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M6 6l12 12"></path>
            <path d="M18 6l-12 12"></path>
          </svg>
        </button>
        <figure class="reader-lightbox-figure">
          <img class="reader-lightbox-image" alt="">
          <figcaption class="reader-lightbox-caption"></figcaption>
        </figure>
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('.reader-lightbox-image');
    const lightboxCaption = lightbox.querySelector('.reader-lightbox-caption');
    let activeIndex = -1;

    function openLightbox(index) {
      const target = imageMeta[index];
      if (!target) return;

      activeIndex = index;
      lightboxImage.src = target.src;
      lightboxImage.alt = target.alt;
      lightboxCaption.textContent = target.caption || target.alt || '';
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      toggleInert(lightbox, false);
      document.body.classList.add('reader-lightbox-open');

      if (prefersReducedMotion) {
        lightboxImage.style.transition = 'none';
      }
    }

    function closeLightbox() {
      if (!lightbox.classList.contains('is-open')) return;

      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      toggleInert(lightbox, true);
      document.body.classList.remove('reader-lightbox-open');
      activeIndex = -1;
      window.setTimeout(() => {
        if (!lightbox.classList.contains('is-open')) {
          lightboxImage.removeAttribute('src');
        }
      }, 180);
    }

    function moveLightbox(step) {
      if (activeIndex === -1 || imageMeta.length < 2) return;
      const nextIndex = (activeIndex + step + imageMeta.length) % imageMeta.length;
      openLightbox(nextIndex);
    }

    imageMeta.forEach((item) => {
      item.image.addEventListener('click', () => openLightbox(item.index));
      item.image.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openLightbox(item.index);
        }
      });
    });

    lightbox.addEventListener('click', (event) => {
      if (event.target.closest('[data-reader-lightbox-close]')) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox.classList.contains('is-open')) return;

      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowRight') {
        moveLightbox(1);
      } else if (event.key === 'ArrowLeft') {
        moveLightbox(-1);
      }
    });
  }

  function syncActiveTocLink(links) {
    if (!links || !links.length || typeof IntersectionObserver !== 'function') return;

    const headingMap = new Map();
    links.forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;
      const target = document.getElementById(decodeURIComponent(href.slice(1)));
      if (target) headingMap.set(target, link);
    });

    if (!headingMap.size) return;

    let currentId = '';

    const setActive = (id) => {
      if (!id || currentId === id) return;
      currentId = id;
      links.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', active);
        if (active) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    };

    const observer = new IntersectionObserver((entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];

      if (visibleEntry?.target?.id) {
        setActive(visibleEntry.target.id);
      }
    }, {
      rootMargin: '-18% 0px -62% 0px',
      threshold: [0, 0.25, 0.6, 1]
    });

    headingMap.forEach((_, heading) => observer.observe(heading));

    const firstHeading = headingMap.keys().next().value;
    if (firstHeading?.id) {
      setActive(firstHeading.id);
    }
  }

  document.querySelectorAll('[data-gallery-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-gallery-track]');
    const prev = slider.querySelector('[data-gallery-prev]');
    const next = slider.querySelector('[data-gallery-next]');
    const dotsContainer = slider.parentElement?.querySelector('[data-gallery-dots]');
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('[data-gallery-dot]')) : [];
    const total = track ? track.children.length : 0;
    let index = 0;

    if (!track || !prev || !next || total < 2 || dots.length !== total) {
      return;
    }

    function renderGallery() {
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === index;
        dot.classList.toggle('is-active', active);
        if (active) {
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.removeAttribute('aria-current');
        }
      });
    }

    prev.addEventListener('click', () => {
      index = (index - 1 + total) % total;
      renderGallery();
    });

    next.addEventListener('click', () => {
      index = (index + 1) % total;
      renderGallery();
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const nextIndex = Number(dot.getAttribute('data-gallery-dot'));
        if (Number.isNaN(nextIndex)) return;
        index = nextIndex;
        renderGallery();
      });
    });

    renderGallery();
  });

  document.querySelectorAll('[data-clubhouse-slider]').forEach((slider) => {
    const rail = slider.querySelector('[data-home-clubhouse-scroll]');
    const prev = slider.querySelector('[data-clubhouse-prev]');
    const next = slider.querySelector('[data-clubhouse-next]');

    if (!rail || !prev || !next) {
      return;
    }

    function getStep() {
      const card = rail.querySelector('.home-clubhouse-card');
      if (!card) return rail.clientWidth * 0.8;
      const gap = Number.parseFloat(window.getComputedStyle(rail).gap || '0');
      return card.getBoundingClientRect().width + gap;
    }

    function syncButtons() {
      const atStart = rail.scrollLeft <= 4;
      const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      prev.classList.toggle('is-disabled', atStart);
      next.classList.toggle('is-at-end', atEnd);
    }

    prev.addEventListener('click', () => {
      rail.scrollBy({ left: -getStep(), behavior: 'smooth' });
    });

    next.addEventListener('click', () => {
      rail.scrollBy({ left: getStep(), behavior: 'smooth' });
    });

    rail.addEventListener('scroll', syncButtons, { passive: true });
    window.addEventListener('resize', syncButtons);
    syncButtons();
  });
})();
