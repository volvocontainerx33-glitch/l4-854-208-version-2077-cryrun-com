(function () {
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
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

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    start();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var regionButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-region]'));
    var typeButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-type]'));
    var categorySelect = panel.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-card]'));
    var empty = document.querySelector('[data-empty-state]');
    var state = { query: '', region: '全部', type: '全部', category: '全部' };

    function setActive(buttons, value, attr) {
      buttons.forEach(function (button) {
        button.classList.toggle('is-active', button.getAttribute(attr) === value);
      });
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var title = (card.getAttribute('data-title') || '').toLowerCase();
        var region = card.getAttribute('data-region') || '';
        var type = card.getAttribute('data-type') || '';
        var category = card.getAttribute('data-category') || '';
        var matchQuery = !state.query || text.indexOf(state.query) !== -1 || title.indexOf(state.query) !== -1;
        var matchRegion = state.region === '全部' || region.indexOf(state.region) !== -1;
        var matchType = state.type === '全部' || type.indexOf(state.type) !== -1;
        var matchCategory = state.category === '全部' || category === state.category;
        var matched = matchQuery && matchRegion && matchType && matchCategory;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        state.query = input.value.trim().toLowerCase();
        apply();
      });
    }

    regionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.region = button.getAttribute('data-filter-region') || '全部';
        setActive(regionButtons, state.region, 'data-filter-region');
        apply();
      });
    });

    typeButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.type = button.getAttribute('data-filter-type') || '全部';
        setActive(typeButtons, state.type, 'data-filter-type');
        apply();
      });
    });

    if (categorySelect) {
      categorySelect.addEventListener('change', function () {
        state.category = categorySelect.value;
        apply();
      });
    }
  });

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchMeta = document.querySelector('[data-search-meta]');
  if (searchForm && searchInput && searchResults && typeof SEARCH_DATA !== 'undefined') {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function makeCard(item) {
      var tags = (item.tags || []).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return '<article class="movie-card">' +
        '<a href="./' + escapeHtml(item.file) + '">' +
        '<div class="card-cover"><img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="card-play">▶</span><span class="card-type">' + escapeHtml(item.type) + '</span></div>' +
        '<div class="card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p>' +
        '<div class="card-meta"><span>' + escapeHtml(item.year) + '年</span><span>' + escapeHtml(item.region) + '</span></div>' +
        '<div class="card-tags">' + tags + '</div></div></a></article>';
    }

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char];
      });
    }

    function runSearch(query) {
      var keyword = query.trim().toLowerCase();
      var source = SEARCH_DATA || [];
      var matched = keyword ? source.filter(function (item) {
        var pool = [item.title, item.year, item.region, item.type, item.genre, item.oneLine, item.category].concat(item.tags || []).join(' ').toLowerCase();
        return pool.indexOf(keyword) !== -1;
      }) : source.slice(0, 48);
      var limited = matched.slice(0, 96);
      searchResults.innerHTML = limited.map(makeCard).join('');
      searchMeta.textContent = keyword ? '已匹配 ' + matched.length + ' 部内容' : '推荐浏览以下精选内容';
    }

    searchForm.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch(searchInput.value);
      var query = searchInput.value.trim();
      var url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
      window.history.replaceState(null, '', url);
    });

    searchInput.addEventListener('input', function () {
      runSearch(searchInput.value);
    });

    runSearch(initialQuery);
  }
}());
