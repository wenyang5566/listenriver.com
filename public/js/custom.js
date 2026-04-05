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

  const interactionRoot = document.querySelector('[data-post-interactions]');
  if (interactionRoot) {
    initPostInteractions(interactionRoot);
  }

  function initPostInteractions(root) {
    const apiBase = normalizeApiBase(root.dataset.apiBase || '');
    const postPath = root.dataset.postPath || window.location.pathname;
    const likeButton = root.querySelector('[data-post-like-button]');
    const viewsValue = root.querySelector('[data-post-views]');
    const likesValue = root.querySelector('[data-post-likes]');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const rabbitImageSrc = '/images/mao_3.png';
    const viewedSessionKey = 'listenriver:view:' + postPath;
    const likedSessionKey = 'listenriver:like:' + postPath;
    let isLikePending = false;

    if (!likeButton || !viewsValue || !likesValue) return;

    if (!apiBase) {
      root.classList.add('post-interactions--offline');
      likeButton.setAttribute('aria-disabled', 'true');
      likeButton.title = '尚未設定統計 API';
      viewsValue.textContent = '--';
      likesValue.textContent = '--';
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

    if (sessionStorage.getItem(likedSessionKey)) {
      likeButton.classList.add('is-liked');
    }

    likeButton.addEventListener('click', async () => {
      if (!apiBase || isLikePending) return;

      isLikePending = true;
      likeButton.classList.add('is-busy');
      likeButton.setAttribute('aria-busy', 'true');

      try {
        const payload = await postJson(apiBase + '/like', { post: postPath });
        const stats = extractStats(payload);
        if (stats.likes !== null) {
          likesValue.textContent = formatCount(stats.likes);
        }
        if (stats.views !== null) {
          viewsValue.textContent = formatCount(stats.views);
        }
        likeButton.classList.add('is-liked');
        sessionStorage.setItem(likedSessionKey, '1');
        launchRabbitBurst(likeButton, rabbitImageSrc, prefersReducedMotion.matches ? 3 : 6);
      } catch (error) {
        likeButton.title = '按讚暫時失敗，請稍後再試';
      } finally {
        isLikePending = false;
        likeButton.classList.remove('is-busy');
        likeButton.removeAttribute('aria-busy');
      }
    });

    async function loadStats() {
      try {
        const response = await fetch(apiBase + '/stats?post=' + encodeURIComponent(postPath), {
          headers: { Accept: 'application/json' },
          credentials: 'omit'
        });
        if (!response.ok) throw new Error('stats request failed');

        const payload = await response.json();
        const stats = extractStats(payload);
        viewsValue.textContent = formatCount(stats.views);
        likesValue.textContent = formatCount(stats.likes);
      } catch (error) {
        root.classList.add('post-interactions--offline');
        viewsValue.textContent = '--';
        likesValue.textContent = '--';
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
          viewsValue.textContent = formatCount(stats.views);
        }
      } catch (error) {
      }
    }
  }

  function normalizeApiBase(value) {
    return value.replace(/\/+$/, '');
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
})();
