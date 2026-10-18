'use strict';

(function () {
  var root = document.documentElement;
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { reduce = false; }
  if (reduce) root.classList.add('reduce');
  root.classList.add('has-js');

  var coarse = false;
  try { coarse = window.matchMedia('(pointer: coarse)').matches; } catch (e2) { coarse = false; }

  function setTheme(next, animate) {
    var prev = root.getAttribute('data-theme') || 'light';
    if (animate && !reduce && prev !== next) {
      var turn = document.createElement('div');
      turn.className = 'turn';
      turn.setAttribute('aria-hidden', 'true');
      turn.style.background = prev === 'dark' ? '#1C1916' : '#F4EFE4';
      document.body.appendChild(turn);
      window.setTimeout(function () { turn.remove(); }, 700);
    }
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (err) { /* private mode */ }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', next === 'dark' ? '#1C1916' : '#F4EFE4');
    var btn = document.getElementById('theme-toggle');
    if (btn) btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
  }

  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (err2) { saved = null; }
  if (saved === 'dark' || saved === 'light') setTheme(saved, false);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark', false);

  var toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
    });
  }

  var index = document.getElementById('section-index');
  var wide = window.matchMedia('(min-width: 1024px)');
  function syncIndex() {
    if (!index) return;
    if (wide.matches) index.setAttribute('open', '');
  }
  syncIndex();
  if (wide.addEventListener) wide.addEventListener('change', syncIndex);

  var timeEl = document.getElementById('edition-date');
  if (timeEl) {
    var now = new Date();
    var lang = root.lang === 'bn' ? 'bn-BD' : 'en-GB';
    try {
      timeEl.textContent = now.toLocaleDateString(lang, { day: 'numeric', month: 'long', year: 'numeric' });
      timeEl.setAttribute('datetime', now.toISOString().slice(0, 10));
    } catch (err3) { /* keep the static date */ }
  }

  document.querySelectorAll('.copy-email').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email') || 'ratulhasan1644@gmail.com';
      btn.classList.add('is-sent');
      window.setTimeout(function () { btn.classList.remove('is-sent'); }, 700);
      var done = function () {
        var label = btn.querySelector('.btn-label');
        var prev = label ? label.textContent : btn.textContent;
        if (label) label.textContent = btn.getAttribute('data-copied') || 'Copied';
        else btn.textContent = btn.getAttribute('data-copied') || 'Copied';
        window.setTimeout(function () {
          if (label) label.textContent = prev;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(function () {});
      }
    });
  });

  var fold = document.getElementById('fold');
  function finishFold() {
    if (!fold) return;
    fold.remove();
    fold = null;
  }
  if (fold && !reduce) {
    fold.hidden = false;
    var skip = document.getElementById('fold-skip');
    if (skip) skip.addEventListener('click', finishFold);
    window.setTimeout(finishFold, 1200);
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') finishFold();
    });
  }

  var pages = Array.prototype.slice.call(document.querySelectorAll('[data-page]'));
  var pageLabel = document.getElementById('page-label');
  function renderPage() {
    if (!pages.length || !pageLabel) return;
    var mark = window.scrollY + 96;
    var current = 1;
    pages.forEach(function (section) {
      if (section.offsetTop <= mark) current = parseInt(section.getAttribute('data-page'), 10) || current;
    });
    var total = pages.length;
    var tpl = pageLabel.getAttribute('data-tpl') || 'Page {n} of {total}';
    pageLabel.textContent = tpl.replace('{n}', String(current)).replace('{total}', String(total));
    root.style.setProperty('--bar', String(current / total));
  }
  renderPage();
  window.addEventListener('scroll', renderPage, { passive: true });

  document.addEventListener('click', function (ev) {
    var link = ev.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    ev.preventDefault();
    target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (target.tabIndex < 0) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    if (index && !wide.matches) index.removeAttribute('open');
    if (history.pushState) history.pushState(null, '', '#' + id);
  });

  if (!reduce && 'IntersectionObserver' in window) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        seen.unobserve(entry.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.sheet-section, .clippings').forEach(function (el) { seen.observe(el); });
  } else {
    document.querySelectorAll('.sheet-section, .clippings').forEach(function (el) { el.classList.add('in'); });
  }

  var bnDigits = '০১২৩৪৫৬৭৮৯';
  function paintCount(n, sample) {
    var text = String(n);
    if (sample && /[০-৯]/.test(sample)) {
      text = text.replace(/\d/g, function (d) { return bnDigits[d]; });
    }
    return text;
  }

  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (!target || reduce) return;
    var sample = el.textContent;
    var t0 = 0;
    function tick(now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / 900);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = paintCount(Math.round(target * eased), sample);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = paintCount(target, sample);
    }
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('[data-count]').forEach(function (el) {
    if (reduce || !('IntersectionObserver' in window)) return;
    var once = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      runCount(el);
      once.disconnect();
    }, { threshold: 0.6 });
    once.observe(el);
  });

  if (!reduce && !coarse) {
    var pending = false;
    window.addEventListener('scroll', function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () {
        root.style.setProperty('--shift', (window.scrollY * 0.035) + 'px');
        pending = false;
      });
    }, { passive: true });
  }

  var buttons = document.querySelectorAll('[data-filter-btn]');
  var cards = document.querySelectorAll('.flipcard');
  var search = document.getElementById('project-search');
  var status = document.getElementById('filter-status');
  function applyFilter() {
    var active = document.querySelector('[data-filter-btn][aria-pressed="true"]');
    var cat = active ? active.getAttribute('data-filter-btn') : 'All';
    var q = search ? search.value.trim().toLowerCase() : '';
    var shown = 0;
    cards.forEach(function (card) {
      var catOk = cat === 'All' || card.getAttribute('data-category') === cat;
      var text = (card.textContent || '').toLowerCase();
      var ok = catOk && (!q || text.indexOf(q) !== -1);
      card.hidden = !ok;
      if (ok) shown += 1;
    });
    if (status) {
      var noun = status.getAttribute('data-noun') || 'notices';
      status.textContent = shown + ' ' + noun;
    }
  }
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (other) { other.setAttribute('aria-pressed', other === btn ? 'true' : 'false'); });
      applyFilter();
    });
  });
  if (search) search.addEventListener('input', applyFilter);

  document.querySelectorAll('.flipcard').forEach(function (card) {
    var back = card.querySelector('.face.back');
    if (back && !reduce) back.inert = true;
  });

  document.addEventListener('click', function (ev) {
    var flip = ev.target.closest('[data-flip]');
    if (!flip || reduce) return;
    var card = flip.closest('.flipcard');
    if (!card) return;
    var on = card.classList.toggle('is-flipped');
    card.querySelectorAll('[data-flip]').forEach(function (b) { b.setAttribute('aria-expanded', on ? 'true' : 'false'); });
    var front = card.querySelector('.face.front');
    var back = card.querySelector('.face.back');
    if (front) front.inert = on;
    if (back) back.inert = !on;
  });

  var deck = document.getElementById('project-deck');
  function nudge(dir) {
    if (!deck) return;
    var card = deck.querySelector('.flipcard');
    var amount = card ? card.getBoundingClientRect().width + 12 : 280;
    deck.scrollBy({ left: dir * amount, behavior: reduce ? 'auto' : 'smooth' });
  }
  var prev = document.getElementById('deck-prev');
  var next = document.getElementById('deck-next');
  if (prev) prev.addEventListener('click', function () { nudge(-1); });
  if (next) next.addEventListener('click', function () { nudge(1); });
  if (deck) {
    deck.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight') { nudge(1); ev.preventDefault(); }
      if (ev.key === 'ArrowLeft') { nudge(-1); ev.preventDefault(); }
    });
  }
})();
