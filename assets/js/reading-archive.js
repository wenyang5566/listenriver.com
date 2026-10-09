/* Paginated HTML and tag links remain usable without JavaScript. */
(() => {
  const archive = document.querySelector('[data-reading-archive]');
  if (!archive || archive.dataset.page !== '1') return;
  const pagination = archive.querySelector('.taxonomy-pagination');
  const filters = Array.from(archive.querySelectorAll('[data-reading-filter]'));
  const controls = document.createElement('div');
  controls.className = 'editorial-load-more';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.tabIndex = -1;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '載入更多文章';
  controls.append(status, button);
  archive.insertBefore(controls, pagination);
  if (pagination) pagination.hidden = true;
  let next = archive.dataset.next || '';
  let busy = false;
  let failed = false;
  let automatic = 0;
  let restoring = false;
  let selected = '';
  let limit = 20;
  const loaded = [];
  const key = `reading-archive:${location.pathname}`;
  const cards = () => Array.from(archive.querySelectorAll('.taxonomy-story-card'));
  const matching = () => cards().filter(card => !selected || JSON.parse(card.dataset.readingTags || '[]').includes(selected));
  const total = () => Number(filters.find(link => link.dataset.readingFilter === selected)?.dataset.count || archive.dataset.total);
  const more = () => limit < total();
  const render = () => {
    const matches = matching();
    const visible = new Set(matches.slice(0, limit));
    cards().forEach(card => { card.hidden = !visible.has(card); });
    archive.querySelectorAll('.taxonomy-story-list').forEach(list => {
      const count = Array.from(list.children).filter(card => !card.hidden).length;
      list.hidden = !count;
      list.previousElementSibling.hidden = !count;
      list.previousElementSibling.querySelector('.taxonomy-category-topics__count').textContent = `${count} 篇`;
    });
    filters.forEach(link => {
      if (link.dataset.readingFilter === selected) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    status.textContent = `${selected || '全部'}：已顯示 ${visible.size} / ${total()} 篇文章${more() ? '' : '，已全部顯示'}`;
    button.hidden = !more();
    button.textContent = '載入更多文章';
  };
  const save = () => {
    if (restoring) return;
    try { sessionStorage.setItem(key, JSON.stringify({ pages: loaded, selected, limit, y: scrollY })); } catch (_) {}
  };
  const fetchNext = async () => {
    const url = next;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Unable to load page');
    const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
    const source = doc.querySelector('[data-reading-archive]');
    if (!source?.querySelector('.taxonomy-story-card')) throw new Error('Missing archive');
    let tail = Array.from(archive.querySelectorAll('.taxonomy-story-list')).pop();
    for (const heading of source.querySelectorAll('.taxonomy-story-year')) {
      const list = heading.nextElementSibling;
      if (!list?.matches('.taxonomy-story-list')) continue;
      if (tail.previousElementSibling.firstChild.textContent.trim() === heading.firstChild.textContent.trim()) {
        tail.append(...Array.from(list.children));
      } else {
        tail.after(heading, list);
        tail = list;
      }
    }
    next = source.dataset.next || '';
    loaded.push(url);
  };
  const run = async action => {
    if (busy) return;
    busy = true;
    failed = false;
    button.disabled = true;
    archive.setAttribute('aria-busy', 'true');
    status.textContent = '正在載入文章…';
    try {
      await action();
      if (pagination) pagination.hidden = true;
      if (!more() && document.activeElement === button) status.focus({ preventScroll: true });
      render();
      save();
    } catch (_) {
      failed = true;
      render();
      status.textContent = '暫時無法載入，請重試或使用下方分頁。';
      button.hidden = false;
      button.textContent = '重試載入';
      if (pagination) pagination.hidden = false;
    } finally {
      busy = false;
      button.disabled = false;
      archive.removeAttribute('aria-busy');
    }
  };
  const expand = () => {
    const target = failed ? limit : Math.min(limit + 20, total());
    return run(async () => {
    while (next && matching().length < target) await fetchNext();
    limit = target;
    });
  };
  button.addEventListener('click', expand);
  filters.forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (busy) return;
    selected = link.dataset.readingFilter;
    limit = 20;
    automatic = 0;
    run(async () => {
      // Fetch every page to filter the entire category, rather than just loaded rows.
      if (selected) while (next) await fetchNext();
    });
  }));
  window.addEventListener('pagehide', save);
  document.addEventListener('click', event => {
    if (event.target.closest('a[href]')) save();
  });
  render();
  const init = async () => {
    if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward') {
      let saved;
      try { saved = JSON.parse(sessionStorage.getItem(key)); } catch (_) {}
      if (saved && Array.isArray(saved.pages)) {
        restoring = true;
        await run(async () => {
          for (const url of saved.pages) {
            if (url !== next) break;
            await fetchNext();
          }
          selected = filters.some(link => link.dataset.readingFilter === saved.selected) ? saved.selected : '';
          limit = Math.max(20, Number(saved.limit) || 20);
          automatic = 1;
        });
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(saved.y) || 0);
          restoring = false;
        });
      }
    }
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting) && !busy && !failed && !restoring && more() && automatic < 1) {
        automatic += 1;
        expand();
      }
    }, { rootMargin: '0px 0px 240px 0px' });
    observer.observe(controls);
  };
  init();
})();
