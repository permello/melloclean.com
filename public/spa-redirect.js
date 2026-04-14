(function () {
  var search = window.location.search;
  if (search.indexOf('?p=/') !== -1) {
    var path = search.slice(search.indexOf('?p=') + 3).replace(/~and~/g, '&');
    var qIndex = path.indexOf('&q=');
    var query = qIndex !== -1 ? '?' + path.slice(qIndex + 3) : '';
    var cleanPath = qIndex !== -1 ? path.slice(0, qIndex) : path;
    var base = window.location.pathname.slice(0, window.location.pathname.lastIndexOf('/'));
    window.history.replaceState(null, null, base + cleanPath + query + (window.location.hash || ''));
  }
})();
