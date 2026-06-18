(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function setupImages() {
    document.querySelectorAll('img.media-image').forEach(function (img) {
      img.addEventListener('error', function () {
        img.classList.add('image-hidden');
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function setupSearchForms() {
    document.querySelectorAll('[data-go-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupLocalFilters() {
    var input = document.querySelector('[data-local-search]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var empty = document.querySelector('[data-empty-state]');
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-button]'));
    var currentCategory = 'all';
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    var main = document.querySelector('[data-main-search]');

    if (initial) {
      input.value = initial;
      if (main) {
        main.value = initial;
      }
    }

    function apply() {
      var query = text(input.value);
      var shown = 0;
      cards.forEach(function (card) {
        var hay = text(card.getAttribute('data-search'));
        var cat = card.getAttribute('data-category') || '';
        var categoryMatch = currentCategory === 'all' || cat === currentCategory;
        var queryMatch = !query || hay.indexOf(query) !== -1;
        var visible = categoryMatch && queryMatch;
        card.classList.toggle('is-filtered-out', !visible);
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('visible', shown === 0);
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        currentCategory = button.getAttribute('data-filter-button') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        apply();
      });
    });

    input.addEventListener('input', apply);
    apply();
  }

  function setupPlayers() {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var cover = box.querySelector('[data-play]');
      var src = box.getAttribute('data-source');
      var hls;
      if (!video || !src) {
        return;
      }

      function attach() {
        if (video.getAttribute('data-ready') === '1') {
          return Promise.resolve();
        }
        video.setAttribute('data-ready', '1');
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
        return Promise.resolve();
      }

      function play() {
        attach().then(function () {
          if (cover) {
            cover.classList.add('is-hidden');
          }
          var result = video.play();
          if (result && typeof result.catch === 'function') {
            result.catch(function () {
              video.controls = true;
            });
          }
        });
      }

      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupImages();
    setupHero();
    setupSearchForms();
    setupLocalFilters();
    setupPlayers();
  });
})();
