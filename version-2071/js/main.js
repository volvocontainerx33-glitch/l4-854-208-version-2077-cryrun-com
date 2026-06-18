(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-header-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = 'index.html#movieGridSection';
      if (query) {
        target = 'index.html?q=' + encodeURIComponent(query) + '#movieGridSection';
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      activate(current + 1);
    }, 5000);
  }

  document.querySelectorAll('[data-filter-form]').forEach(function (panel) {
    var scopeSelector = panel.getAttribute('data-scope');
    var scope = scopeSelector ? document.querySelector(scopeSelector) : document;
    if (!scope) {
      return;
    }

    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-card]'));
    var searchInput = panel.querySelector('[data-filter-search]');
    var typeSelect = panel.querySelector('[data-filter-type]');
    var regionSelect = panel.querySelector('[data-filter-region]');
    var yearSelect = panel.querySelector('[data-filter-year]');
    var countNode = panel.querySelector('[data-filter-count]');
    var clearButton = panel.querySelector('[data-filter-clear]');

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function textOf(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' '));
    }

    function applyFilters() {
      var query = normalize(searchInput ? searchInput.value : '');
      var type = normalize(typeSelect ? typeSelect.value : '');
      var region = normalize(regionSelect ? regionSelect.value : '');
      var year = normalize(yearSelect ? yearSelect.value : '');
      var shown = 0;

      cards.forEach(function (card) {
        var haystack = textOf(card);
        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (type && normalize(card.getAttribute('data-type')).indexOf(type) === -1) {
          ok = false;
        }
        if (region && normalize(card.getAttribute('data-region')).indexOf(region) === -1) {
          ok = false;
        }
        if (year && normalize(card.getAttribute('data-year')).indexOf(year) === -1) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
        if (ok) {
          shown += 1;
        }
      });

      if (countNode) {
        countNode.textContent = shown;
      }
    }

    [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (clearButton) {
      clearButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (regionSelect) {
          regionSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q && searchInput) {
      searchInput.value = q;
    }
    applyFilters();
  });
})();
