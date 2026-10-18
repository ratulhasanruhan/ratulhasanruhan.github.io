'use strict';

(function () {
  var root = document.documentElement;

  function setTheme(next) {
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#1C1916' : '#F4EFE4');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  }

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) { saved = null; }
  if (saved === 'dark' || saved === 'light') setTheme(saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  else setTheme(root.getAttribute('data-theme') || 'light');

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  var timeEl = document.getElementById('edition-date');
  if (timeEl) {
    var now = new Date();
    var lang = root.lang === 'bn' ? 'bn-BD' : 'en-GB';
    try {
      timeEl.textContent = now.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
      timeEl.setAttribute('datetime', now.toISOString().slice(0, 10));
    } catch (e) { /* keep the static fallback */ }
  }

  document.querySelectorAll('.copy-email').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email') || 'ratulhasan1644@gmail.com';
      var done = function () {
        var prev = btn.textContent;
        btn.textContent = btn.getAttribute('data-copied') || 'Copied';
        window.setTimeout(function () { btn.textContent = prev; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {});
      }
    });
  });

  var buttons = document.querySelectorAll('[data-filter-btn]');
  var ads = document.querySelectorAll('.ad[data-category]');
  var search = document.getElementById('project-search');

  function applyFilter() {
    var active = document.querySelector('[data-filter-btn][aria-pressed="true"]');
    var cat = active ? active.getAttribute('data-filter-btn') : 'All';
    var q = search ? search.value.trim().toLowerCase() : '';
    ads.forEach(function (ad) {
      var catOk = cat === 'All' || ad.getAttribute('data-category') === cat;
      var text = (ad.textContent || '').toLowerCase();
      ad.hidden = !(catOk && (!q || text.indexOf(q) !== -1));
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      applyFilter();
    });
  });

  if (search) search.addEventListener('input', applyFilter);
})();
