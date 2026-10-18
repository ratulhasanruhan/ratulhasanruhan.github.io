/* Field journal enhancements. Content is in the HTML; this file only helps. */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".js-copy").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var done = function () {
        var prev = btn.textContent;
        btn.textContent = btn.getAttribute("data-copied") || "Copied";
        window.setTimeout(function () { btn.textContent = prev; }, 1400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText("ratulhasan1644@gmail.com").then(done).catch(function () {});
      }
    });
  });

  var search = document.getElementById("specimen-search");
  var cards = document.querySelectorAll("[data-specimen]");
  var status = document.getElementById("specimen-status");
  if (search && cards.length) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (card) {
        var hit = !q || card.textContent.toLowerCase().indexOf(q) !== -1;
        card.hidden = !hit;
        if (hit) shown += 1;
      });
      if (status) {
        status.textContent = q ? shown + " matching " + (shown === 1 ? "specimen" : "specimens") : "";
      }
    });
  }

  var links = document.querySelectorAll(".bookmarks a[href^='#']");
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (id) byId[id] = a;
    });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute("aria-current"); });
          link.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-20% 0px -55% 0px", threshold: 0.01 });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) obs.observe(el);
    });
  }

  if (!reduce && !CSS.supports("animation-timeline", "view()")) {
    var strokes = document.querySelectorAll(".ink-stroke");
    if (strokes.length && "IntersectionObserver" in window) {
      strokes.forEach(function (path) { path.style.strokeDashoffset = "1"; });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.transition = "stroke-dashoffset 2.2s ease";
          entry.target.style.strokeDashoffset = "0";
          io.unobserve(entry.target);
        });
      }, { threshold: 0.35 });
      strokes.forEach(function (path) { io.observe(path); });
    }
  }
})();
