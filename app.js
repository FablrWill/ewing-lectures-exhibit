/* Ewing Lectures exhibit — minimal vanilla enhancement.
   Everything here is progressive: with JS off, the page is fully readable,
   the light/dark default follows the system, and nothing is hidden. */

(function () {
  "use strict";

  /* ---- theme toggle (persisted; falls back to system preference) ---- */
  var root = document.documentElement;
  var KEY = "ewing-theme";
  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);

  var btn = document.querySelector(".theme-toggle");
  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if (btn) {
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || (systemDark() ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll("main .section"));

  /* ---- reliable in-page nav ---- instant jumps (smooth scrolling proved
         unreliable on this very tall page); respects the sticky header via
         each section's scroll-margin-top. */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href").slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });

  /* ---- active section in the top nav ---- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".topbar__links a"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  if ("IntersectionObserver" in window && links.length) {
    var navIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = byId[en.target.id];
        if (a && en.isIntersecting) {
          links.forEach(function (l) { l.removeAttribute("aria-current"); });
          a.setAttribute("aria-current", "true");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (byId[s.id]) navIo.observe(s); });
  }

  /* ---- journey map ---- */
  document.querySelectorAll("[data-map]").forEach(function (map) {
    var card = map.querySelector("[data-map-card]");
    var pins = Array.prototype.slice.call(map.querySelectorAll("[data-map-pin]"));
    function select(id) {
      var note = map.querySelector('[data-map-note="' + id + '"]');
      if (!note || !card) return;
      pins.forEach(function (pin) {
        pin.classList.toggle("is-active", pin.getAttribute("data-map-pin") === id);
      });
      card.innerHTML = note.innerHTML;
    }
    pins.forEach(function (pin) {
      pin.addEventListener("click", function () {
        select(pin.getAttribute("data-map-pin"));
      });
      pin.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          select(pin.getAttribute("data-map-pin"));
        }
      });
    });
  });

  /* ---- timeline lane filters ---- */
  document.querySelectorAll("[data-timeline]").forEach(function (tool) {
    var buttons = Array.prototype.slice.call(tool.querySelectorAll(".timeline-filters [data-lane]"));
    var cards = Array.prototype.slice.call(tool.querySelectorAll(".timeline-card"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var lane = button.getAttribute("data-lane");
        buttons.forEach(function (b) { b.classList.toggle("is-active", b === button); });
        cards.forEach(function (card) {
          var match = lane === "all" || card.getAttribute("data-lane") === lane;
          card.hidden = !match;
        });
      });
    });
  });

  /* ---- archive sections: open the relevant drawer when a citation target is used ---- */
  function openTargetArchive() {
    if (!location.hash) return;
    var target = document.getElementById(location.hash.slice(1));
    if (!target) return;
    var details = target.closest && target.closest("details");
    if (details) details.open = true;
  }
  window.addEventListener("hashchange", openTargetArchive);
  openTargetArchive();

  /* ---- lightweight image lightbox for available gallery images ---- */
  var lightbox = null;
  function closeLightbox() {
    if (lightbox) {
      lightbox.remove();
      lightbox = null;
    }
  }
  document.querySelectorAll("figure img").forEach(function (img) {
    img.setAttribute("tabindex", "0");
    img.style.cursor = "zoom-in";
    function open() {
      closeLightbox();
      lightbox = document.createElement("button");
      lightbox.type = "button";
      lightbox.className = "lightbox";
      lightbox.setAttribute("aria-label", "Close enlarged image");
      lightbox.innerHTML = '<img alt="">';
      var big = lightbox.querySelector("img");
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || "";
      lightbox.addEventListener("click", closeLightbox);
      document.body.appendChild(lightbox);
    }
    img.addEventListener("click", open);
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });
})();
