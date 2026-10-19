(() => {
  const documentBody = document.querySelector('.thesis-document');
  if (!documentBody) return;
  const reveal = (hash, scroll = false) => {
    let id;
    try { id = decodeURIComponent(hash.replace(/^#/, '')); } catch { return; }
    const target = document.getElementById(id);
    if (!target || !documentBody.contains(target)) return;
    for (let parent = target; parent; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS') parent.open = true;
    }
    if (scroll) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && !link.classList.contains('thesis-citation')) reveal(link.hash);
  }, true);
  window.addEventListener('hashchange', () => reveal(location.hash, true));
  reveal(location.hash, true);

  const dialog = document.createElement('dialog');
  dialog.className = 'thesis-reference-popup';
  dialog.id = 'thesis-reference-popup';
  dialog.setAttribute('aria-labelledby', 'thesis-popup-title');
  dialog.setAttribute('data-pagefind-ignore', '');
  dialog.innerHTML = '<div class="thesis-popup-header"><h2 id="thesis-popup-title">參考文獻</h2><button type="button" class="thesis-popup-close" aria-label="關閉參考文獻">×</button></div><div class="thesis-popup-content"></div>';
  document.body.append(dialog);
  const content = dialog.querySelector('.thesis-popup-content');
  const closeButton = dialog.querySelector('button');
  const desktop = () => innerWidth > 760 && matchMedia('(hover: hover) and (pointer: fine)').matches;
  let trigger = null;
  let pinned = false;
  let openTimer;
  let closeTimer;
  let returnFocus = false;
  let restoringFocus = false;
  const clearTimers = () => { clearTimeout(openTimer); clearTimeout(closeTimer); };
  const close = (restore = false) => {
    clearTimers();
    returnFocus = restore;
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    trigger?.setAttribute('aria-expanded', 'false');
    const previous = trigger;
    trigger = null;
    pinned = false;
    if (returnFocus && previous?.isConnected) {
      restoringFocus = true;
      previous.focus({preventScroll: true});
      restoringFocus = false;
    }
    returnFocus = false;
  });
  const position = () => {
    if (!desktop() || !trigger) {
      dialog.style.removeProperty('left');
      dialog.style.removeProperty('top');
      return;
    }
    const rect = trigger.getBoundingClientRect();
    const box = dialog.getBoundingClientRect();
    dialog.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - box.width - 12))}px`;
    const below = rect.bottom + 10;
    const above = rect.top - box.height - 10;
    dialog.style.top = `${Math.max(12, Math.min(below + box.height <= innerHeight - 12 ? below : above, innerHeight - box.height - 12))}px`;
  };
  const show = (link, pin) => {
    clearTimers();
    if (pinned && !pin) return;
    // close fires asynchronously; use a separate dialog session only when necessary.
    if (dialog.open && trigger === link) {
      if (pin && !pinned && !desktop()) { dialog.close(); }
      else { pinned ||= pin; if (pin) closeButton.focus({preventScroll: true}); return; }
    }
    if (dialog.open) dialog.close();
    trigger?.setAttribute('aria-expanded', 'false');
    trigger = link;
    pinned = pin;
    returnFocus = false;
    content.replaceChildren();
    for (const id of link.dataset.referenceIds.split(' ')) {
      const original = document.getElementById(id);
      if (!original) continue;
      const copy = original.cloneNode(true);
      copy.removeAttribute('id');
      copy.querySelectorAll('[id],[data-thesis-source]').forEach(node => {
        node.removeAttribute('id'); node.removeAttribute('data-thesis-source');
      });
      content.append(copy);
    }
    if (!content.children.length) return;
    link.setAttribute('aria-expanded', 'true');
    if (pin && !desktop()) dialog.showModal();
    else {
      // Nonmodal hover must not steal keyboard focus or move the reading position.
      dialog.setAttribute('open', '');
      if (pin) closeButton.focus({preventScroll: true});
    }
    content.scrollTop = 0;
    position();
  };
  const scheduleClose = () => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    if (!pinned) closeTimer = setTimeout(() => close(false), 240);
  };
  documentBody.querySelectorAll('.thesis-citation').forEach(link => {
    link.setAttribute('aria-controls', dialog.id);
    link.setAttribute('aria-expanded', 'false');
    link.addEventListener('pointerenter', event => {
      if (!desktop() || event.pointerType !== 'mouse') return;
      clearTimers();
      openTimer = setTimeout(() => show(link, false), 300);
    });
    link.addEventListener('pointerleave', scheduleClose);
    link.addEventListener('focus', () => { if (!restoringFocus && desktop()) show(link, false); });
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      show(link, true);
    }, true);
  });
  dialog.addEventListener('pointerenter', clearTimers);
  dialog.addEventListener('pointerleave', scheduleClose);
  document.addEventListener('focusin', event => {
    if (dialog.open && !pinned && !dialog.contains(event.target) && event.target !== trigger) close(false);
  });
  closeButton.addEventListener('click', () => close(true));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !pinned || desktop()) return;
    const stops = [...dialog.querySelectorAll('button, a[href], [tabindex="0"]')];
    const first = stops[0];
    const last = stops.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault(); last.focus({preventScroll: true});
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus({preventScroll: true});
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(true); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.open) { event.preventDefault(); close(pinned); }
  });
  document.addEventListener('pointerdown', event => {
    if (!dialog.open || event.target === trigger || trigger?.contains(event.target)) return;
    const box = dialog.getBoundingClientRect();
    if (!dialog.contains(event.target) || event.target === dialog &&
        (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close(pinned);
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', () => { if (dialog.open) { if (pinned) position(); else close(false); } }, {passive: true});
})();
