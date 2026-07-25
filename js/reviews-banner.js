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

  // JS-driven horizontal marquee so it scrolls even when CSS animations
  // are disabled (e.g. OS "Reduce motion"), which previously forced a grid.
  var track = banner.querySelector('.reviews-track');
  if (!track) return;

  var offset = 0;
  var speed = 0.45; // px per frame at ~60fps
  var paused = false;
  var halfWidth = 0;

  function measure() {
    halfWidth = track.scrollWidth / 2;
  }

  measure();
  window.addEventListener('resize', measure);

  banner.addEventListener('mouseenter', function () { paused = true; });
  banner.addEventListener('mouseleave', function () { paused = false; });
  banner.addEventListener('focusin', function () { paused = true; });
  banner.addEventListener('focusout', function () { paused = false; });

  function tick() {
    if (!paused && halfWidth > 0) {
      offset += speed;
      if (offset >= halfWidth) offset -= halfWidth;
      track.style.transform = 'translate3d(' + (-offset) + 'px,0,0)';
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
