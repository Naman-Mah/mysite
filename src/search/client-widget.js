/**
 * Zero-dependency vanilla JS client search widget snippet.
 */
export const CLIENT_SEARCH_WIDGET_JS = `
(function() {
  var indexData = null;
  var input = document.getElementById('search-input');
  var resultsContainer = document.getElementById('search-results');

  if (!input || !resultsContainer) return;

  fetch('/search-index.json')
    .then(function(res) { return res.json(); })
    .then(function(data) { indexData = data; })
    .catch(function(err) { console.warn('[mysite search] Index load error:', err); });

  input.addEventListener('input', function() {
    var query = input.value.trim().toLowerCase();
    if (!query || !indexData) {
      resultsContainer.innerHTML = '';
      return;
    }

    var terms = query.split(/\\s+/).filter(function(t) { return t.length > 0; });
    var scores = {};

    terms.forEach(function(term) {
      var entries = indexData.index[term] || [];
      entries.forEach(function(entry) {
        scores[entry.id] = (scores[entry.id] || 0) + entry.score;
      });
    });

    var sorted = Object.keys(scores).map(function(id) {
      return { page: indexData.pages[id], score: scores[id] };
    }).sort(function(a, b) { return b.score - a.score; });

    if (sorted.length === 0) {
      resultsContainer.innerHTML = '<p class="no-results">No matches found</p>';
      return;
    }

    var html = '<ul class="search-results-list">';
    sorted.forEach(function(item) {
      html += '<li><a href="' + item.page.url + '"><strong>' + escapeHtml(item.page.title) + '</strong></a><p>' + escapeHtml(item.page.snippet) + '</p></li>';
    });
    html += '</ul>';
    resultsContainer.innerHTML = html;
  });

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
})();
`;
