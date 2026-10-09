(() => {
  const button = document.querySelector('[data-article-share]');
  if (button) button.hidden = false;
  button?.addEventListener('click', async () => {
    const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
    const title = document.querySelector('.post-title')?.textContent.trim() || document.title;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else {
        await navigator.clipboard.writeText(url);
        button.textContent = '連結已複製';
        setTimeout(() => { button.textContent = '分享'; }, 2500);
      }
    } catch (error) {
      if (error.name !== 'AbortError') button.textContent = '請複製網址分享';
    }
  });
  document.querySelectorAll('[data-post-views], [data-post-likes], [data-post-comments]').forEach(value => {
    const update = () => {
      value.hidden = !value.textContent.trim() || value.textContent.trim() === '--';
      if (value.hasAttribute('data-post-views')) value.closest('.post-stat').hidden = value.hidden;
    };
    new MutationObserver(update).observe(value, { childList: true, characterData: true, subtree: true });
    update();
  });
})();
