/* Quadra Pixel – home page banner slider
   Auto-slides, pauses on hover, mouse wheel / swipe / arrows / dots to change banner. */
(function () {
  "use strict";
  var root = document.getElementById("showcase");
  if (!root || !window.BANNERS || !window.BANNERS.length) return;

  var slider = root.querySelector(".slider"), stage = root.querySelector(".sl-stage");
  var dotsEl = root.querySelector(".sl-dots"), tiles = root.querySelectorAll(".tile");
  var INTERVAL = 5500, WHEEL_LOCK = 900;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoplayOff = false;  /* Settings page switch */
  try { autoplayOff = localStorage.getItem("qp-autoplay") === "off"; } catch (e) {}
  var list = [], slides = [], dots = [], idx = 0, timer = null, paused = false, lastSlide = 0;

  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function mod(n) { return (n + list.length) % list.length; }

  function slideHTML(b, i) {
    var cta = b.action
      ? '<button class="btn sl-cta" type="button" data-auth="' + esc(b.action) + '">' + esc(b.cta || "Open") + "</button>"
      : '<a class="btn sl-cta" href="' + esc(b.href || "games.html") + '">' + esc(b.cta || "See details") + "</a>";
    return '<article class="slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + " of " + list.length +
      '" style="--tint:' + esc(b.tint || "#6a24b8") + '"><img class="slide-img" src="' + esc(b.img) + '" alt="" draggable="false">' +
      '<div class="slide-shade"></div><div class="slide-body"><div class="meta">' +
      (b.badge ? '<span class="badge">' + esc(b.badge) + "</span>" : "") +
      (b.price ? '<span class="price">' + esc(b.price) + "</span>" : "") +
      "</div><h2>" + esc(b.title) + '</h2><p class="sub">' + esc(b.sub || "") + "</p>" + cta + "</div></article>";
  }

  function build(items) {
    list = items; idx = 0;
    stage.innerHTML = list.map(slideHTML).join("");
    slides = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
    dotsEl.innerHTML = list.map(function (b, i) {
      return '<button class="dot" type="button" data-go="' + i + '" aria-label="Show banner ' + (i + 1) + ": " + esc(b.title) + '"></button>';
    }).join("");
    dots = Array.prototype.slice.call(dotsEl.querySelectorAll(".dot"));
    root.classList.toggle("single", list.length < 2);
    show(0, 0);
  }

  /* dir: 1 = forward, -1 = backward, 0 = no animation */
  function show(n, dir) {
    n = mod(n);
    var cur = slides[idx], nxt = slides[n];
    if (dir === 0 || cur === nxt) {
      slides.forEach(function (s) { s.style.transition = "none"; s.style.transform = "translateX(100%)"; });
      nxt.style.transform = "translateX(0)";
      void stage.offsetWidth;
      slides.forEach(function (s) { s.style.transition = ""; });
    } else {
      nxt.style.transition = "none";
      nxt.style.transform = "translateX(" + dir * 100 + "%)";
      void nxt.offsetWidth;
      nxt.style.transition = "";
      nxt.style.transform = "translateX(0)";
      cur.style.transform = "translateX(" + -dir * 100 + "%)";
    }
    idx = n; lastSlide = Date.now();
    slides.forEach(function (s, i) {
      s.classList.toggle("is-active", i === n);
      s.inert = i !== n;
      s.setAttribute("aria-hidden", i === n ? "false" : "true");
    });
    dots.forEach(function (d, i) { d.setAttribute("aria-current", i === n ? "true" : "false"); });
    updateTiles(dir !== 0);
    schedule();
  }
  function go(n, dir) {
    if (list.length < 2) return;
    if (dir === undefined) dir = mod(n - idx) <= list.length / 2 ? 1 : -1;  /* shortest way round */
    show(n, dir);
  }

  /* the two small tiles show what comes next */
  function tileHTML(b) {
    return '<span class="tile-in"><img src="' + esc(b.img) + '" alt="" draggable="false"><span class="tile-shade"></span><span class="tile-title">' + esc(b.title) + "</span></span>";
  }
  function updateTiles(animate) {
    var shown = Math.min(tiles.length, list.length - 1);
    tiles.forEach(function (t, k) {
      if (k >= shown) { t.hidden = true; return; }
      t.hidden = false;
      var target = mod(idx + 1 + k);
      t.setAttribute("data-go", target);
      t.setAttribute("aria-label", "Show banner: " + list[target].title);
      function fill() { t.innerHTML = tileHTML(list[target]); t.classList.remove("swap"); }
      if (animate && t.firstChild) { t.classList.add("swap"); setTimeout(fill, 260); } else fill();
    });
  }

  /* autoplay */
  function schedule() {
    clearTimeout(timer);
    if (reduce || autoplayOff || paused || list.length < 2 || document.hidden) return;
    timer = setTimeout(function () { show(idx + 1, 1); }, INTERVAL);
  }
  function pause(v) { paused = v; schedule(); }
  root.addEventListener("mouseenter", function () { pause(true); });
  root.addEventListener("mouseleave", function () { pause(false); });
  root.addEventListener("focusin", function () { pause(true); });
  root.addEventListener("focusout", function () { pause(false); });
  document.addEventListener("visibilitychange", schedule);

  /* clicks: dots, tiles, arrows */
  root.addEventListener("click", function (e) {
    if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; return; }
    var g = e.target.closest("[data-go]");
    if (g) { go(Number(g.getAttribute("data-go"))); return; }
    if (e.target.closest(".sl-nav.prev")) go(idx - 1, -1);
    else if (e.target.closest(".sl-nav.next")) go(idx + 1, 1);
  }, true);

  /* mouse wheel while hovering the banner */
  slider.addEventListener("wheel", function (e) {
    if (list.length < 2) return;
    var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 4) return;
    e.preventDefault();
    if (Date.now() - lastSlide < WHEEL_LOCK) return;
    go(idx + (d > 0 ? 1 : -1), d > 0 ? 1 : -1);
  }, { passive: false });

  /* swipe / drag */
  var startX = null, dragged = false;
  slider.addEventListener("pointerdown", function (e) { startX = e.clientX; dragged = false; });
  slider.addEventListener("pointerup", function (e) {
    if (startX === null) return;
    var dx = e.clientX - startX; startX = null;
    if (Math.abs(dx) > 50) { dragged = true; go(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1); setTimeout(function () { dragged = false; }, 50); }
  });
  slider.addEventListener("pointercancel", function () { startX = null; });

  /* keyboard */
  slider.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { go(idx + 1, 1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { go(idx - 1, -1); e.preventDefault(); }
  });

  /* start; drop guest-only banners once we know the visitor is logged in */
  build(window.BANNERS);
  if (window.QPAuth) {
    window.QPAuth.onChange(function (u) {
      var items = window.BANNERS.filter(function (b) { return !(b.guestOnly && u); });
      if (items.length !== list.length) build(items);
    });
  }
})();
