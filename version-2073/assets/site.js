(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    var timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle("is-active", position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle("is-active", position === active);
      });
    }

    function start() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = parseInt(dot.getAttribute("data-hero-dot"), 10);
        show(next);
        start();
      });
    });

    show(0);
    start();
  }

  function getCards() {
    return Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  }

  function getActiveFilters() {
    var filters = {};
    var activeButtons = document.querySelectorAll(".filter-chip.is-active[data-filter-key]");
    activeButtons.forEach(function (button) {
      var key = button.getAttribute("data-filter-key");
      var value = button.getAttribute("data-filter-value");
      if (key && value && value !== "all") {
        filters[key] = normalize(value);
      }
    });
    return filters;
  }

  function applyFilters() {
    var cards = getCards();
    var filters = getActiveFilters();
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
    var keyword = normalize(inputs.map(function (input) { return input.value; }).find(Boolean) || "");
    var shown = 0;

    cards.forEach(function (card) {
      var search = normalize(card.getAttribute("data-search"));
      var matchedKeyword = !keyword || search.indexOf(keyword) !== -1;
      var matchedFilters = Object.keys(filters).every(function (key) {
        return normalize(card.getAttribute("data-" + key)).indexOf(filters[key]) !== -1;
      });
      var visible = matchedKeyword && matchedFilters;
      card.hidden = !visible;
      if (visible) {
        shown += 1;
      }
    });

    document.querySelectorAll("[data-empty-state]").forEach(function (empty) {
      empty.classList.toggle("is-visible", shown === 0);
    });
  }

  function initFilters() {
    document.querySelectorAll(".filter-chip[data-filter-key]").forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-filter-key");
        document.querySelectorAll(".filter-chip[data-filter-key='" + key + "']").forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        applyFilters();
      });
    });
  }

  function initSearch() {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get("keyword") || "";
    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      if (keyword) {
        input.value = keyword;
      }
      input.addEventListener("input", applyFilters);
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("[data-search-input]");
        var target = form.getAttribute("data-search-target");
        var value = input ? input.value.trim() : "";
        if (target && window.location.pathname.indexOf("rankings.html") === -1) {
          window.location.href = target + (value ? "?keyword=" + encodeURIComponent(value) : "");
          return;
        }
        applyFilters();
      });
    });

    applyFilters();
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
  });
})();
