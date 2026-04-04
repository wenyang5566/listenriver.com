document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var wrapper = carousel.closest('.salon-carousel-wrapper');
    if (!wrapper) return;
    var prevBtn = wrapper.querySelector('.carousel-btn-prev');
    var nextBtn = wrapper.querySelector('.carousel-btn-next');
    if (!prevBtn || !nextBtn) return;

    function getScrollAmount() {
      return Math.max(carousel.clientWidth * 0.85, 240);
    }

    function updateButtons() {
      var atStart = carousel.scrollLeft <= 4;
      var atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 4;
      prevBtn.classList.toggle('hidden', atStart);
      nextBtn.classList.toggle('hidden', atEnd);
    }

    prevBtn.addEventListener('click', function () {
      carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function () {
      carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();
  });
});
