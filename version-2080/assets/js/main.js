(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMobileMenu() {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupCarousel() {
    var carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-carousel-slide]'));
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var intervalId = null;

    function show(nextIndex) {
      slides[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
    }

    function start() {
      intervalId = window.setInterval(function () {
        show(index + 1);
      }, 6000);
    }

    function reset() {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      start();
    }

    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        reset();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        reset();
      });
    }
    start();
  }

  function setupImageFallbacks() {
    var images = document.querySelectorAll('img[data-fallback]');
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        var fallback = image.getAttribute('data-fallback');
        if (fallback && image.getAttribute('src') !== fallback) {
          image.setAttribute('src', fallback);
        }
      });
    });
  }

  function setupDirectorySearch() {
    var input = document.querySelector('[data-directory-search]');
    var grid = document.querySelector('[data-directory-grid]');
    var count = document.querySelector('[data-directory-count]');
    if (!input || !grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

    function filter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = card.getAttribute('data-search') || '';
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = '显示 ' + visible + ' 部影片';
      }
    }

    input.addEventListener('input', filter);
    filter();
  }

  ready(function () {
    setupMobileMenu();
    setupCarousel();
    setupImageFallbacks();
    setupDirectorySearch();
  });
})();
