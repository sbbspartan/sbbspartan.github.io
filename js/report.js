/* stmproject.html: contents rail behaviour (scroll-spy, mobile collapse). */
(function () {
  'use strict';
  var toc = document.querySelector('.report-toc');
  if (!toc) return;
  var narrow = window.matchMedia('(max-width: 1000px)');

  // On wide screens the rail is always open; on narrow screens it starts collapsed.
  function sync() { toc.open = !narrow.matches; }
  sync();
  narrow.addEventListener ? narrow.addEventListener('change', sync) : narrow.addListener(sync);
  toc.querySelector('summary').addEventListener('click', function (e) { if (!narrow.matches) e.preventDefault(); });
  toc.addEventListener('click', function (e) {
    if (narrow.matches && e.target.closest('a')) toc.open = false;
  });

  // Scroll-spy: highlight the deepest heading above the top of the viewport.
  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  function visible(el) { return el && el.getClientRects().length > 0; }
  function update() {
    ticking = false;
    var offset = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 80;
    var current = -1;
    targets.forEach(function (el, i) {
      if (visible(el) && el.getBoundingClientRect().top - offset - 12 <= 0) current = i;
    });
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === current); });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  document.addEventListener('toggle', update, true);
  update();
})();

/* Hero carousel: buttons, dots, caption and keyboard on top of a scroll-snap track. */
(function () {
  'use strict';
  var root = document.querySelector('.hero-carousel');
  if (!root) return;
  var track = root.querySelector('.hc-track');
  var slides = Array.prototype.slice.call(track.querySelectorAll('.hc-slide'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.hc-dots button'));
  var caption = root.querySelector('.hc-caption');
  var current = 0;

  function goTo(i) {
    i = (i + slides.length) % slides.length;
    track.scrollTo({ left: i * track.clientWidth });
  }
  function sync() {
    var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
    if (i === current && caption.textContent) return;
    current = Math.max(0, Math.min(slides.length - 1, i));
    dots.forEach(function (d, k) { if (k === current) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    caption.textContent = slides[current].getAttribute('data-caption');
  }
  root.querySelector('.hc-prev').addEventListener('click', function () { goTo(current - 1); });
  root.querySelector('.hc-next').addEventListener('click', function () { goTo(current + 1); });
  dots.forEach(function (d, k) { d.addEventListener('click', function () { goTo(k); }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
  });
  var raf = 0;
  track.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
  window.addEventListener('resize', function () { track.scrollTo({ left: current * track.clientWidth, behavior: 'auto' }); });
})();
