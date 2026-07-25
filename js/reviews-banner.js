(function () {
  var data = window.HO_GOOGLE_REVIEWS;
  if (!data || !data.reviews || !data.reviews.length) return;

  var GAP = 14;
  var SPEED = 40; // pixels per second

  var style = document.createElement('style');
  style.textContent = [
    '.reviews-banner{background:var(--navy);color:var(--white);border-bottom:1px solid rgba(255,255,255,.08);overflow:hidden}',
    '.reviews-banner-inner{display:flex;flex-direction:row;align-items:stretch;min-height:64px}',
    '.reviews-rating{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:12px 18px;background:rgba(0,0,0,.18);border-right:1px solid rgba(255,255,255,.12);text-decoration:none;color:var(--cream);min-width:132px;z-index:2}',
    '.reviews-rating:hover{text-decoration:none;background:rgba(0,0,0,.28)}',
    '.reviews-rating .stars{color:#f5c518;font-size:.95rem;letter-spacing:1px;line-height:1}',
    '.reviews-rating .score{font-size:1.15rem;font-weight:800;color:var(--white);line-height:1.1}',
    '.reviews-rating .label{font-size:.68rem;text-transform:uppercase;letter-spacing:.6px;opacity:.85}',
    /* flex:1 1 0% + min-width:0 keeps the scroller inside the banner instead of
       letting the track push the whole row thousands of pixels wide. */
    '.reviews-marquee{flex:1 1 0%;min-width:0;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 24px,#000 calc(100% - 24px),transparent)}',
    '.reviews-marquee::-webkit-scrollbar{width:0;height:0;display:none}',
    '.reviews-track{display:flex;flex-direction:row;flex-wrap:nowrap;gap:' + GAP + 'px;width:max-content;padding:12px 0}',
    '.review-chip{flex:0 0 300px;width:300px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:10px 14px;display:flex;flex-direction:column;gap:4px}',
    '.review-chip .chip-stars{color:#f5c518;font-size:.78rem;letter-spacing:1px}',
    '.review-chip .chip-text{font-size:.82rem;line-height:1.35;color:rgba(255,255,255,.92)}',
    '.review-chip .chip-author{font-size:.68rem;opacity:.65}',
    '@media (max-width:600px){.reviews-rating{min-width:110px;padding:10px 12px}.review-chip{flex:0 0 260px;width:260px}}'
  ].join('');
  document.head.appendChild(style);

  function stars(n) {
    var s = '';
    for (var i = 0; i < 5; i++) s += i < n ? '★' : '☆';
    return s;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function chip(r, duplicate) {
    return (
      '<article class="review-chip"' + (duplicate ? ' aria-hidden="true"' : '') + '>' +
        '<div class="chip-stars" aria-label="' + r.stars + ' out of 5 stars">' + stars(r.stars) + '</div>' +
        '<p class="chip-text">' + escapeHtml(r.text) + '</p>' +
        '<div class="chip-author">' + escapeHtml(r.author || 'Google review') + '</div>' +
      '</article>'
    );
  }

  var originals = data.reviews.map(function (r) { return chip(r, false); }).join('');
  var clones = data.reviews.map(function (r) { return chip(r, true); }).join('');

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
      '<div class="reviews-marquee" tabindex="0" role="group" aria-label="Customer reviews, scrollable">' +
        '<div class="reviews-track">' + originals + clones + '</div>' +
      '</div>' +
    '</div>';

  var header = document.querySelector('header.header');
  if (header && header.parentNode) {
    header.parentNode.insertBefore(banner, header.nextSibling);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }

  var viewport = banner.querySelector('.reviews-marquee');
  var track = banner.querySelector('.reviews-track');
  if (!viewport || !track) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = false;
  var last = null;
  var pos = 0;
  var copies = 2;

  function gapPx() {
    var gap = parseFloat(getComputedStyle(track).columnGap);
    return isFinite(gap) ? gap : GAP;
  }

  // One cycle is the width of a single copy of the review list, including the
  // gap that follows it, so wrapping back to the start is seamless.
  function cycleWidth() {
    return (track.scrollWidth + gapPx()) / copies;
  }

  // Wrapping needs at least one full cycle of scrollable range beyond the
  // visible window, so on wide screens add copies until that holds.
  function ensureScrollableRange() {
    while (copies < 12 && track.scrollWidth - viewport.clientWidth < cycleWidth()) {
      track.insertAdjacentHTML('beforeend', clones);
      copies++;
    }
  }

  function pause() { paused = true; }
  function resume() {
    // Pick up wherever a manual swipe/scroll left things.
    pos = viewport.scrollLeft;
    last = null;
    paused = false;
  }

  viewport.addEventListener('mouseenter', pause);
  viewport.addEventListener('mouseleave', resume);
  viewport.addEventListener('focusin', pause);
  viewport.addEventListener('focusout', resume);
  viewport.addEventListener('pointerdown', pause);
  viewport.addEventListener('touchstart', pause, { passive: true });
  window.addEventListener('pointerup', resume);
  viewport.addEventListener('touchend', resume);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { pause(); } else { resume(); }
  });

  function step(now) {
    if (last === null) last = now;
    var elapsed = now - last;
    last = now;

    // Track the position ourselves: some engines round scrollLeft to whole
    // pixels, which would swallow the sub-pixel movement of a slow scroll.
    if (!paused && track.scrollWidth > viewport.clientWidth + 1) {
      var cycle = cycleWidth();
      pos += (SPEED * elapsed) / 1000;
      if (pos >= cycle) pos -= cycle;
      viewport.scrollLeft = pos;
    }
    requestAnimationFrame(step);
  }

  // Manual horizontal scrolling always works; auto-scroll is the enhancement.
  if (!reduceMotion && typeof requestAnimationFrame === 'function') {
    ensureScrollableRange();
    window.addEventListener('resize', function () {
      ensureScrollableRange();
      resume();
    });
    requestAnimationFrame(step);
  }
})();
