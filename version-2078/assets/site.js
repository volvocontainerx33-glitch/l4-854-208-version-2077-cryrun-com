(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        play();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    show(0);
    play();
  });

  function applyFilters() {
    var input = document.querySelector('[data-search-input]');
    var categoryFilter = document.querySelector('[data-category-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value : 'all';
    var type = typeFilter ? typeFilter.value : 'all';

    document.querySelectorAll('[data-search-scope] .searchable-card').forEach(function (card) {
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var meta = (card.getAttribute('data-meta') || '').toLowerCase();
      var cardCategory = card.getAttribute('data-category') || '';
      var matchQuery = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1;
      var matchCategory = category === 'all' || cardCategory === category;
      var matchType = type === 'all' || meta.indexOf(type.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchType));
    });
  }

  document.querySelectorAll('[data-search-input], [data-category-filter], [data-type-filter]').forEach(function (field) {
    field.addEventListener('input', applyFilters);
    field.addEventListener('change', applyFilters);
  });

  var searchParams = new URLSearchParams(window.location.search);
  var initialQuery = searchParams.get('q');
  var searchInput = document.querySelector('[data-search-input]');
  if (initialQuery && searchInput) {
    searchInput.value = initialQuery;
    applyFilters();
  }

  function attachSource(video, src) {
    if (!video || video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
    } else {
      video.src = src;
    }

    video.setAttribute('data-ready', '1');
  }

  window.MoviePlayer = {
    setup: function (videoId, src, buttonId) {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);

      if (!video) {
        return;
      }

      function start() {
        attachSource(video, src);
        if (button) {
          button.classList.add('is-hidden');
        }
        video.controls = true;
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', start);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        }
      });

      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }
  };
})();
