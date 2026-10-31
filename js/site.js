/* sambelden.com — small progressive enhancements: mobile nav + image lightbox. */
(function () {
  'use strict';

  // ----- Mobile navigation toggle -----
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ----- Collapsible article sections (details.sec) -----
  var secs = Array.prototype.slice.call(document.querySelectorAll('details.sec'));
  if (secs.length) {
    // Open every collapsed section that contains the element with this id.
    var reveal = function (id) {
      var el = id && document.getElementById(id);
      if (!el) return;
      for (var d = el.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
      el.scrollIntoView();
    };
    reveal(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener('hashchange', function () { reveal(decodeURIComponent(location.hash.slice(1))); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (a && a.getAttribute('href') === location.hash) reveal(a.getAttribute('href').slice(1));
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sec]'), function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('data-sec') === 'open';
        secs.forEach(function (d) { d.open = open; });
      });
    });
    // Print everything, then restore what the reader had open.
    var saved = null;
    window.addEventListener('beforeprint', function () { saved = secs.map(function (d) { return d.open; }); secs.forEach(function (d) { d.open = true; }); });
    window.addEventListener('afterprint', function () { if (saved) secs.forEach(function (d, i) { d.open = saved[i]; }); saved = null; });
  }

  // ----- Lightbox for gallery images -----
  var links = Array.prototype.slice.call(document.querySelectorAll('.gallery a[href], .hero-figure a[href], .hc-slide a[href]'))
    .filter(function (a) { return /\.(jpe?g|png|gif|webp)$/i.test(a.getAttribute('href')); });
  if (!links.length) return;

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.innerHTML =
    '<button type="button" class="lb-close" aria-label="Close">&times;</button>' +
    '<button type="button" class="lb-nav lb-prev" aria-label="Previous image">&#8249;</button>' +
    '<img alt="">' +
    '<button type="button" class="lb-nav lb-next" aria-label="Next image">&#8250;</button>';
  document.body.appendChild(box);
  var img = box.querySelector('img');
  var current = -1;
  var lastFocus = null;

  function show(i) {
    current = (i + links.length) % links.length;
    var a = links[current];
    var thumb = a.querySelector('img');
    img.src = a.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    box.classList.add('is-open');
    document.body.classList.add('no-scroll');
    box.querySelector('.lb-prev').hidden = box.querySelector('.lb-next').hidden = links.length < 2;
  }
  function close() {
    box.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    img.src = '';
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      lastFocus = a;
      show(i);
      box.querySelector('.lb-close').focus();
    });
  });
  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.addEventListener('click', function (e) { if (e.target === box || e.target === img) close(); });
  document.addEventListener('keydown', function (e) {
    if (!box.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // basic swipe support
  var startX = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();
