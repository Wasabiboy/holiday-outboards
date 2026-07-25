(function () {
  var data = window.HO_GOOGLE_REVIEWS;
  if (!data || !data.reviews || !data.reviews.length) return;

  function stars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function chip(r) {
    return (
      '<article class="review-chip">' +
        '<div class="chip-stars" aria-label="' + r.stars + ' out of 5 stars">' + stars(r.stars) + '</div>' +
        '<p class="chip-text">' + escapeHtml(r.text) + '</p>' +
        '<div class="chip-author">' + escapeHtml(r.author || 'Google review') + '</div>' +
      '</article>'
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  var cards = data.reviews.map(chip).join('');
  var banner = document.createElement('div');
  banner.className = 'reviews-banner';
  banner.setAttribute('aria-label', 'Google customer reviews');
  banner.innerHTML =
    '<div class="reviews-banner-inner">' +
      '<a class="reviews-rating" href="' + escapeHtml(data.mapsUrl) + '" target="_blank" rel="noopener noreferrer">' +
        '<div class="stars" aria-hidden="true">★★★★★</div>' +
        '<div class="score">' + escapeHtml(String(data.rating)) + '</div>' +
        '<div class="label">' + escapeHtml(data.countLabel || 'Google reviews') + '</div>' +
      '</a>' +
      '<div class="reviews-marquee">' +
        '<div class="reviews-track">' + cards + cards + '</div>' +
      '</div>' +
    '</div>';

  var header = document.querySelector('header.header');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(banner, header.nextSibling);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }
})();
