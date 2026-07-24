(function () {
  var data = window.HO_GOOGLE_REVIEWS;
  if (!data || !data.reviews || !data.reviews.length) return;

  var style = document.createElement('style');
  style.textContent = [
    '.reviews-banner{background:var(--navy);color:var(--white);border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden}',
    '.reviews-banner-inner{display:flex;align-items:stretch;min-height:64px}',
    '.reviews-rating{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:12px 18px;background:rgba(0,0,0,.18);border-right:1px solid rgba(255,255,255,.12);text-decoration:none;color:var(--cream);min-width:132px;z-index:2}',
    '.reviews-rating:hover{text-decoration:none;background:rgba(0,0,0,.28)}',
    '.reviews-rating .stars{color:#f5c518;font-size:.95rem;letter-spacing:1px;line-height:1}',
    '.reviews-rating .score{font-size:1.15rem;font-weight:800;color:var(--white);line-height:1.1}',
    '.reviews-rating .label{font-size:.68rem;text-transform:uppercase;letter-spacing:.6px;opacity:.85}',
    '.reviews-marquee{flex:1;overflow:hidden;mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)}',
    '.reviews-track{display:flex;gap:14px;width:max-content;padding:12px 0;animation:ho-reviews-scroll 55s linear infinite}',
    '.reviews-banner:hover .reviews-track{animation-play-state:paused}',
    '.review-chip{flex:0 0 auto;max-width:340px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:4px}',
    '.review-chip .chip-stars{color:#f5c518;font-size:.78rem;letter-spacing:1px}',
    '.review-chip .chip-text{font-size:.82rem;line-height:1.35;color:rgba(255,255,255,.92)}',
    '.review-chip .chip-author{font-size:.68rem;opacity:.65}',
    '@keyframes ho-reviews-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}',
    '@media (prefers-reduced-motion:reduce){.reviews-track{animation:none;flex-wrap:wrap;width:auto;padding:12px 16px}}',
    '@media (max-width:600px){.reviews-rating{min-width:110px;padding:10px 12px}.review-chip{max-width:280px}}'
  ].join('');
  document.head.appendChild(style);

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
