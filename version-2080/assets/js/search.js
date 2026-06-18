(function () {
  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  }

  function card(movie) {
    var tags = [movie.region, movie.type, movie.year].filter(Boolean).join(' · ');
    return '' +
      '<article>' +
      '  <a href="' + escapeHtml(movie.url) + '" class="block bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">' +
      '    <div class="relative overflow-hidden">' +
      '      <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-fallback="assets/img/poster-fallback.svg" class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" />' +
      '      <span class="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">' + escapeHtml(movie.duration) + '</span>' +
      '    </div>' +
      '    <div class="p-4">' +
      '      <h2 class="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-amber-600 transition">' + escapeHtml(movie.title) + '</h2>' +
      '      <p class="text-sm text-gray-600 line-clamp-3 mb-3">' + escapeHtml(movie.oneLine) + '</p>' +
      '      <div class="flex items-center justify-between text-sm text-gray-500">' +
      '        <span>' + escapeHtml(tags) + '</span>' +
      '        <span>★ ' + escapeHtml(movie.score) + '</span>' +
      '      </div>' +
      '    </div>' +
      '  </a>' +
      '</article>';
  }

  function runSearch() {
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var summary = document.getElementById('searchSummary');
    var popular = document.getElementById('searchPopular');
    var allMovies = window.MovieSearchIndex || [];
    var query = getQuery();

    if (input) {
      input.value = query;
    }

    function render(keyword) {
      var normalized = keyword.trim().toLowerCase();
      if (!normalized) {
        results.innerHTML = '';
        summary.textContent = '输入关键词后将显示匹配影片。';
        if (popular) {
          popular.style.display = '';
        }
        return;
      }

      var words = normalized.split(/\s+/).filter(Boolean);
      var matched = allMovies.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' ').toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      }).slice(0, 120);

      summary.textContent = '找到 ' + matched.length + ' 部相关影片';
      results.innerHTML = matched.map(card).join('');
      if (popular) {
        popular.style.display = matched.length ? 'none' : '';
      }
    }

    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
    render(query);
  }

  document.addEventListener('DOMContentLoaded', runSearch);
})();
