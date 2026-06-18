(function () {
  var body = document.body;
  var menuButton = document.querySelector("[data-mobile-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.classList.toggle("is-open");
      mobileNav.classList.toggle("is-open", isOpen);
      body.classList.toggle("menu-open", isOpen);
    });
  }

  document.querySelectorAll("img").forEach(function (image) {
    image.addEventListener("error", function () {
      image.classList.add("image-missing");
    }, { once: true });
  });

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        restart();
      });
    }

    showSlide(0);
    restart();
  });

  document.querySelectorAll("[data-search-scope]").forEach(function (scope) {
    var input = scope.querySelector("[data-movie-search]");
    var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-chip]"));
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var empty = scope.querySelector("[data-empty-state]");
    var activeFilter = "all";

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
      var query = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-summary")
        ].join(" "));
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesFilter = activeFilter === "all" || normalize(card.getAttribute("data-type")).indexOf(activeFilter) !== -1 || normalize(card.getAttribute("data-tags")).indexOf(activeFilter) !== -1 || normalize(card.getAttribute("data-genre")).indexOf(activeFilter) !== -1;
        var shouldShow = matchesQuery && matchesFilter;

        card.classList.toggle("is-hidden", !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeFilter = normalize(chip.getAttribute("data-filter-chip"));
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applyFilters();
      });
    });
  });

  var hlsPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";
        script.async = true;
        script.onload = function () {
          if (window.Hls) {
            resolve(window.Hls);
          } else {
            reject(new Error("HLS unavailable"));
          }
        };
        script.onerror = function () {
          reject(new Error("HLS load failed"));
        };
        document.head.appendChild(script);
      });
    }

    return hlsPromise;
  }

  function playNative(video, source) {
    video.src = source;
    return video.play();
  }

  function startPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var message = player.parentElement ? player.parentElement.querySelector("[data-player-message]") : null;
    var source = video ? video.getAttribute("data-source") : "";

    if (!video || !source) {
      return;
    }

    if (button) {
      button.classList.add("is-hidden");
    }

    if (message) {
      message.classList.remove("is-visible");
      message.textContent = "";
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      playNative(video, source).catch(function () {
        if (message) {
          message.textContent = "当前浏览器阻止了自动播放，请再次点击视频播放。";
          message.classList.add("is-visible");
        }
      });
      return;
    }

    loadHlsLibrary().then(function (Hls) {
      if (Hls.isSupported()) {
        if (video._hlsInstance) {
          video._hlsInstance.destroy();
        }

        var hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        video._hlsInstance = hls;
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {
            if (message) {
              message.textContent = "当前浏览器阻止了自动播放，请再次点击视频播放。";
              message.classList.add("is-visible");
            }
          });
        });
        hls.on(Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal && message) {
            message.textContent = "播放暂时不可用，请稍后重试。";
            message.classList.add("is-visible");
          }
        });
      } else {
        playNative(video, source).catch(function () {
          if (message) {
            message.textContent = "当前浏览器不支持此播放源。";
            message.classList.add("is-visible");
          }
        });
      }
    }).catch(function () {
      playNative(video, source).catch(function () {
        if (message) {
          message.textContent = "当前浏览器不支持此播放源。";
          message.classList.add("is-visible");
        }
      });
    });
  }

  document.querySelectorAll("[data-player]").forEach(function (player) {
    var button = player.querySelector("[data-play-button]");
    var video = player.querySelector("video");

    if (button) {
      button.addEventListener("click", function () {
        startPlayer(player);
      });
    }

    if (video) {
      video.addEventListener("click", function () {
        if (!video.getAttribute("src") && !video._hlsInstance) {
          startPlayer(player);
        }
      });
    }
  });
})();
