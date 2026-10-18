'use strict';

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('observatory-theme', next); } catch (e) {}
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'light' ? '#F4F0E6' : '#070B1A');
  }

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
    setTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  }

  document.addEventListener('click', function (e) {
    var copy = e.target.closest('[data-copy]');
    if (copy) {
      var value = copy.getAttribute('data-copy');
      var done = function () {
        copy.dataset.state = 'copied';
        var prev = copy.textContent;
        copy.textContent = copy.getAttribute('data-copied') || 'Copied';
        setTimeout(function () {
          copy.dataset.state = '';
          copy.textContent = prev;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done).catch(function () {});
      }
      return;
    }
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
  });

  var cardTitle = document.getElementById('star-card-title');
  var cardMeta = document.getElementById('star-card-meta');
  var cardBody = document.getElementById('star-card-body');
  var cardJump = document.getElementById('star-card-jump');
  var cardSource = document.getElementById('star-card-source');
  var chart = document.getElementById('star-chart');

  function showStar(star) {
    if (!cardTitle || !star) return;
    cardTitle.textContent = star.dataset.title || star.textContent.trim();
    if (cardMeta) cardMeta.textContent = star.dataset.meta || '';
    if (cardBody) cardBody.textContent = star.dataset.note || '';
    if (cardJump) cardJump.setAttribute('href', star.getAttribute('href') || '#chart');
    if (cardSource) {
      var src = star.dataset.source || '';
      if (src) {
        cardSource.hidden = false;
        cardSource.setAttribute('href', src);
      } else {
        cardSource.hidden = true;
      }
    }
    chart.querySelectorAll('.star.is-active').forEach(function (n) { n.classList.remove('is-active'); });
    star.classList.add('is-active');
  }

  if (chart) {
    chart.addEventListener('mouseover', function (e) {
      var star = e.target.closest('.star');
      if (star) showStar(star);
    });
    chart.addEventListener('focusin', function (e) {
      var star = e.target.closest('.star');
      if (star) showStar(star);
    });
  }

  var rows = Array.prototype.slice.call(document.querySelectorAll('#catalogue tbody tr'));
  var search = document.getElementById('project-search');
  var count = document.getElementById('project-count');
  var empty = document.getElementById('project-empty');
  var current = 'All';

  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : '';
    var shown = 0;
    rows.forEach(function (row) {
      var hay = (row.getAttribute('data-search') || '').toLowerCase();
      var cat = row.getAttribute('data-category') || '';
      var ok = (!q || hay.indexOf(q) !== -1) && (current === 'All' || cat === current);
      row.hidden = !ok;
      if (ok) shown += 1;
    });
    if (count) count.textContent = 'Showing ' + shown + ' of ' + rows.length;
    if (empty) empty.classList.toggle('show', shown === 0);
  }

  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      current = btn.getAttribute('data-filter');
      document.querySelectorAll('[data-filter]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      applyFilter();
    });
  });
  if (search) search.addEventListener('input', applyFilter);
  if (rows.length) applyFilter();

  if (!reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = Math.max(-28, Math.min(28, window.scrollY * 0.035));
        root.style.setProperty('--drift', y.toFixed(1) + 'px');
        ticking = false;
      });
    }, { passive: true });
  }
})();
