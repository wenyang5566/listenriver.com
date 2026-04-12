document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var wrapper = carousel.closest('.salon-carousel-wrapper');
    if (!wrapper) return;
    var prevBtn = wrapper.querySelector('.carousel-btn-prev');
    var nextBtn = wrapper.querySelector('.carousel-btn-next');
    if (!prevBtn || !nextBtn) return;
    var isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    var dragState = {
      active: false,
      moved: false,
      pointerId: null,
      startX: 0,
      startScrollLeft: 0
    };

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

    if (isCoarsePointer) {
      carousel.addEventListener('pointerdown', function (event) {
        if (event.pointerType === 'mouse') return;

        dragState.active = true;
        dragState.moved = false;
        dragState.pointerId = event.pointerId;
        dragState.startX = event.clientX;
        dragState.startScrollLeft = carousel.scrollLeft;
        carousel.classList.add('is-dragging');
      });

      carousel.addEventListener('pointermove', function (event) {
        if (!dragState.active || dragState.pointerId !== event.pointerId) return;

        var deltaX = event.clientX - dragState.startX;
        if (Math.abs(deltaX) > 6) {
          dragState.moved = true;
        }

        if (dragState.moved) {
          carousel.scrollLeft = dragState.startScrollLeft - deltaX;
        }
      });

      function endDrag(event) {
        if (!dragState.active) return;
        if (typeof event.pointerId !== 'undefined' && dragState.pointerId !== event.pointerId) return;

        carousel.classList.remove('is-dragging');
        window.setTimeout(function () {
          dragState.active = false;
          dragState.pointerId = null;
        }, 0);
      }

      carousel.addEventListener('pointerup', endDrag);
      carousel.addEventListener('pointercancel', endDrag);
      carousel.addEventListener('pointerleave', endDrag);

      carousel.querySelectorAll('.salon-card').forEach(function (card) {
        card.addEventListener('click', function (event) {
          if (!dragState.moved) return;
          event.preventDefault();
          event.stopPropagation();
        }, true);
      });
    }

    updateButtons();
  });
});
