/* ==========================================================
   Quadra Pixel – game cards, hover preview, details gallery, install flow
   window.QPGames = { render, mount, install, open, find, icon, wire }
   ========================================================== */
(function () {
  "use strict";
  var G = window.GAMES || [];
  if (!G.length) return;
  var Store = window.QPStore, Auth = window.QPAuth;
  var canHover = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  var OS = [["android", "Android", "btn"], ["ios", "iPhone", "btn cyan"], ["windows", "Windows", "btn red"]];

  /* ---------- helpers ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function folder(m) { return "assets/images/games/" + slug(m.n) + "/"; }       /* one folder per game */
  function iconSrc(m) { return m.img || folder(m) + "icon.png"; }
  function ageOf(m) { return m.age || "3+"; }
  function shotUrls(m) {
    return (m.shots || []).map(function (f) { return /^(https?:|assets\/|\/)/.test(f) ? f : folder(m) + f; });
  }
  function find(name) { for (var i = 0; i < G.length; i++) if (G[i].n === name) return i; return -1; }
  function pixelIcon(seed, c) {
    var x = seed * 9301 + 49297, cells = "";
    function rnd() { x = (x * 9301 + 49297) % 233280; return x / 233280; }
    for (var r = 0; r < 5; r++) for (var i = 0; i < 3; i++) {
      if (rnd() > 0.5) {
        cells += '<rect x="' + i + '" y="' + r + '" width="1" height="1"/>';
        if (i < 2) cells += '<rect x="' + (4 - i) + '" y="' + r + '" width="1" height="1"/>';
      }
    }
    return '<svg viewBox="-1 -1 7 7" shape-rendering="crispEdges" aria-hidden="true"><rect x="-1" y="-1" width="7" height="7" fill="' + c[0] + '"/><g fill="' + c[1] + '">' + cells + "</g></svg>";
  }
  function iconHTML(i) { return '<img src="' + esc(iconSrc(G[i])) + '" alt="" data-icon="' + i + '">'; }
  function wire(root) {   /* no custom icon yet? show the generated pixel icon */
    root.querySelectorAll("img[data-icon]").forEach(function (img) {
      var idx = Number(img.getAttribute("data-icon")), box = img.parentNode;
      function fallback() { box.innerHTML = pixelIcon(idx + 11, G[idx].c); }
      img.addEventListener("error", fallback);
      if (img.complete && img.naturalWidth === 0) fallback();
    });
  }

  /* ---------- card ---------- */
  function cardHTML(i) {
    var m = G[i];
    return '<article class="card" data-i="' + i + '"><div class="top"><div class="icon">' + iconHTML(i) + '</div><div><h3>' +
      '<button class="card-link" type="button" aria-label="Open details for ' + esc(m.n) + '">' + esc(m.n) + '</button></h3>' +
      '<div class="meta">' + esc(m.g) + '</div></div></div><p class="desc">' + esc(m.d) +
      '</p><div class="foot"><span class="rate">★ ' + m.r + '</span><button class="btn sm" type="button" data-install="' + i + '">Install</button></div></article>';
  }
  function render(container, indices) {
    container.innerHTML = indices.map(cardHTML).join("");
    wire(container); mount(container);
  }
  function mount(root) {
    if (root._qp) return; root._qp = true;
    root.addEventListener("click", function (e) {
      var ins = e.target.closest("[data-install]");
      if (ins) { install(Number(ins.getAttribute("data-install"))); return; }
      var link = e.target.closest(".card-link");   /* its ::after covers the whole card */
      if (link) openModal(Number(link.closest(".card").getAttribute("data-i")), link);
    });
    root.addEventListener("mouseover", function (e) { var c = e.target.closest(".card"); if (c) startHover(c); });
    root.addEventListener("mouseout", function (e) {
      var c = e.target.closest(".card");
      if (c && !c.contains(e.relatedTarget)) scheduleHide();
    });
  }

  /* ---------- hover preview (like the store pop-up) ---------- */
  var hc = null, hcIdx = -1, hcCard = null, pending = null, showT = null, hideT = null;
  function blocked() { return document.documentElement.classList.contains("modal-open") || !!document.querySelector("dialog[open]"); }
  function ensureHC() {
    if (hc) return;
    hc = document.createElement("div");
    hc.className = "hovercard"; hc.hidden = true; hc.setAttribute("role", "group");
    hc.addEventListener("mouseenter", function () { clearTimeout(hideT); });
    hc.addEventListener("mouseleave", scheduleHide);
    hc.addEventListener("click", function (e) {
      if (e.target.closest("[data-install]")) install(hcIdx); else openModal(hcIdx, hcCard);
    });
    document.body.appendChild(hc);
  }
  function hoverHTML(i) {
    var m = G[i], shot = shotUrls(m)[0];
    return '<div class="hc-top"><div class="icon">' + iconHTML(i) + '</div><div class="hc-title"><h4>' + esc(m.n) +
      '</h4><div class="meta">★ ' + m.r + " · " + esc(m.g) + '</div></div><button class="btn sm" type="button" data-install="' + i + '">Install</button></div>' +
      '<p class="hc-desc">' + esc(m.d) + "</p>" +
      (shot ? '<div class="hc-shot"><img src="' + esc(shot) + '" alt=""></div>' : "") +
      '<div class="hc-foot"><span class="age" title="Age rating">' + esc(ageOf(m)) + '</span><span>Click for all screenshots</span></div>';
  }
  function startHover(card) {
    if (!canHover) return;
    clearTimeout(hideT);
    if (card === hcCard && hc && hc.classList.contains("show")) return;
    if (card === pending) return;
    pending = card; clearTimeout(showT);
    var wait = hc && hc.classList.contains("show") ? 60 : 320;
    showT = setTimeout(function () { pending = null; if (!blocked()) showHover(card); }, wait);
  }
  function showHover(card) {
    ensureHC();
    hcCard = card; hcIdx = Number(card.getAttribute("data-i"));
    hc.innerHTML = hoverHTML(hcIdx); wire(hc);
    var shotImg = hc.querySelector(".hc-shot img");
    if (shotImg) shotImg.addEventListener("error", function () { shotImg.parentNode.hidden = true; });
    hc.hidden = false;
    var r = card.getBoundingClientRect(), w = hc.offsetWidth, h = hc.offsetHeight;
    var left = Math.min(Math.max(12, r.left + r.width * 0.4), window.innerWidth - w - 12);
    var top = Math.min(Math.max(12, r.top + r.height * 0.4), window.innerHeight - h - 12);
    hc.style.left = left + "px"; hc.style.top = top + "px";
    requestAnimationFrame(function () { hc.classList.add("show"); });
  }
  function scheduleHide() { clearTimeout(showT); pending = null; clearTimeout(hideT); hideT = setTimeout(hideHover, 180); }
  function hideHover() {
    clearTimeout(showT); pending = null;
    if (!hc) return;
    hc.classList.remove("show"); hcCard = null;
    setTimeout(function () { if (!hc.classList.contains("show")) hc.hidden = true; }, 240);
  }
  window.addEventListener("scroll", hideHover, { passive: true });

  /* ---------- details modal: blurred screen + screenshot gallery ---------- */
  var gm = null, gmIdx = -1, cur = 0, count = 0, opener = null, wheelAt = 0, sx = null, el = {};
  function ensureModal() {
    if (gm) return;
    gm = document.createElement("div");
    gm.className = "gm-overlay"; gm.hidden = true;
    gm.setAttribute("role", "dialog"); gm.setAttribute("aria-modal", "true"); gm.setAttribute("aria-labelledby", "gmTitle");
    gm.innerHTML =
      '<div class="gm-card">' +
      '<button class="gm-close" type="button" aria-label="Close">×</button>' +
      '<div class="gm-gallery" aria-roledescription="carousel" aria-label="Screenshots">' +
      '<div class="gm-track"></div>' +
      '<button class="gm-arrow prev" type="button" aria-label="Previous screenshot">‹</button>' +
      '<button class="gm-arrow next" type="button" aria-label="Next screenshot">›</button>' +
      '<div class="gm-dots" role="group" aria-label="Choose screenshot"></div><div class="gm-count" aria-live="polite"></div></div>' +
      '<div class="gm-info"><div class="icon"></div><div class="gm-text"><h3 id="gmTitle"></h3><div class="meta"></div></div>' +
      '<div class="gm-actions"><button class="btn ghost sm" type="button" data-save></button><button class="btn" type="button" data-install-modal>Install</button></div></div>' +
      '<p class="gm-desc"></p></div>';
    document.body.appendChild(gm);
    el.card = gm.querySelector(".gm-card"); el.close = gm.querySelector(".gm-close");
    el.gal = gm.querySelector(".gm-gallery"); el.track = gm.querySelector(".gm-track");
    el.prev = gm.querySelector(".prev"); el.next = gm.querySelector(".next");
    el.dots = gm.querySelector(".gm-dots"); el.count = gm.querySelector(".gm-count");
    el.icon = gm.querySelector(".gm-info .icon"); el.title = gm.querySelector("#gmTitle");
    el.meta = gm.querySelector(".gm-info .meta"); el.desc = gm.querySelector(".gm-desc");
    el.save = gm.querySelector("[data-save]"); el.inst = gm.querySelector("[data-install-modal]");

    el.close.addEventListener("click", closeModal);
    gm.addEventListener("click", function (e) { if (e.target === gm) closeModal(); });   /* click the blur to close */
    el.prev.addEventListener("click", function () { slideTo(cur - 1); });
    el.next.addEventListener("click", function () { slideTo(cur + 1); });
    el.dots.addEventListener("click", function (e) {
      var d = e.target.closest("[data-dot]"); if (d) slideTo(Number(d.getAttribute("data-dot")));
    });
    el.inst.addEventListener("click", function () { install(gmIdx); });
    el.save.addEventListener("click", function () { if (Store) { Store.toggleLibrary(G[gmIdx].n); saveLabel(); } });
    window.addEventListener("qp-store", function () { if (gm && !gm.hidden) saveLabel(); });

    /* mouse wheel, swipe */
    el.gal.addEventListener("wheel", function (e) {
      if (count < 2) return;
      var d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 4) return;
      e.preventDefault();
      var now = Date.now(); if (now - wheelAt < 450) return;
      wheelAt = now; slideTo(cur + (d > 0 ? 1 : -1));
    }, { passive: false });
    el.gal.addEventListener("pointerdown", function (e) { sx = e.clientX; });
    el.gal.addEventListener("pointerup", function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) slideTo(cur + (dx < 0 ? 1 : -1));
    });
    el.gal.addEventListener("pointercancel", function () { sx = null; });

    document.addEventListener("keydown", function (e) {
      if (gm.hidden || document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") closeModal();
      else if (e.key === "ArrowRight") slideTo(cur + 1);
      else if (e.key === "ArrowLeft") slideTo(cur - 1);
      else if (e.key === "Tab") {   /* keep focus inside the card */
        var f = Array.prototype.filter.call(gm.querySelectorAll("button:not([disabled])"), function (b) { return b.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    });
  }
  function saveLabel() {
    var on = Store && Store.inLibrary(G[gmIdx].n);
    el.save.textContent = on ? "★ In library" : "☆ Save to library";
    el.save.setAttribute("aria-pressed", !!on);
  }
  function slideTo(n, instant) {
    n = Math.max(0, Math.min(count - 1, n));
    if (instant) el.track.style.transition = "none";
    el.track.style.transform = "translateX(" + -n * 100 + "%)";
    if (instant) { void el.track.offsetWidth; el.track.style.transition = ""; }
    cur = n;
    el.dots.querySelectorAll(".dot").forEach(function (d, k) { d.setAttribute("aria-current", k === n ? "true" : "false"); });
    el.prev.disabled = n === 0; el.next.disabled = n >= count - 1;
    el.count.textContent = count > 1 ? (n + 1) + " / " + count : "";
  }
  function openModal(i, from) {
    ensureModal(); hideHover();
    gmIdx = i; opener = from || document.activeElement;
    var m = G[i], urls = shotUrls(m);
    el.track.innerHTML = urls.length
      ? urls.map(function (u, k) {
          return '<div class="gm-slide"><img src="' + esc(u) + '" alt="' + esc(m.n) + " screenshot " + (k + 1) + '" draggable="false"' + (k ? ' loading="lazy"' : "") + "></div>";
        }).join("")
      : '<div class="gm-slide gm-ph">' + pixelIcon(i + 11, m.c) + "<span>No screenshots yet</span></div>";
    el.track.querySelectorAll(".gm-slide img").forEach(function (img, k) {
      img.addEventListener("error", function () {
        var s = img.parentNode; s.classList.add("missing");
        s.innerHTML = "<span>Image not found:<br>" + esc(urls[k]) + "</span>";
      });
    });
    count = urls.length || 1;
    el.dots.innerHTML = count > 1 ? Array.apply(null, Array(count)).map(function (_, k) {
      return '<button class="dot" type="button" data-dot="' + k + '" aria-label="Screenshot ' + (k + 1) + '"></button>';
    }).join("") : "";
    el.gal.classList.toggle("single", count < 2);
    el.icon.innerHTML = iconHTML(i); wire(el.icon);
    el.title.textContent = m.n;
    el.meta.innerHTML = esc(m.g) + " · ★ " + m.r + ' · <span class="age">' + esc(ageOf(m)) + "</span>";
    el.desc.textContent = m.more || m.d;
    saveLabel(); slideTo(0, true);
    gm.hidden = false;
    document.documentElement.classList.add("modal-open");
    requestAnimationFrame(function () { requestAnimationFrame(function () { gm.classList.add("open"); }); });
    el.close.focus({ preventScroll: true });
  }
  function closeModal() {
    if (!gm || gm.hidden) return;
    gm.classList.remove("open");
    document.documentElement.classList.remove("modal-open");
    setTimeout(function () { if (!gm.classList.contains("open")) gm.hidden = true; }, 300);
    if (opener && opener.focus) opener.focus({ preventScroll: true });
  }

  /* ---------- install: needs an account, then pick a device ---------- */
  var od = null, odIdx = -1;
  function install(i) {
    var m = G[i];
    var ask = window.QPAuthUI
      ? window.QPAuthUI.require("Sign up or log in to download " + m.n + ". You can keep browsing without an account.")
      : Promise.resolve(true);
    ask.then(function (ok) { if (ok) osDialog(i); });
  }
  function osDialog(i) {
    if (!od) {
      od = document.createElement("dialog"); od.className = "os-dlg";
      od.innerHTML = '<h3></h3><p class="muted">Choose your device.</p><p class="dmsg" role="alert" hidden></p><div class="row">' +
        OS.map(function (o) { return '<button class="' + o[2] + '" type="button" data-os="' + o[0] + '">' + o[1] + "</button>"; }).join("") +
        '<button class="btn ghost" type="button" data-close>Close</button></div>';
      od.addEventListener("click", async function (e) {
        if (e.target === od || e.target.closest("[data-close]")) { od.close(); return; }
        var b = e.target.closest("[data-os]");
        if (!b || b.disabled) return;
        var os = b.getAttribute("data-os"), m = G[odIdx], msg = od.querySelector(".dmsg");
        if (window.QPAuthUI && !(await window.QPAuthUI.require("Please log in to download."))) return;
        msg.hidden = true;
        try {
          var url = await Auth.resolveLink(m[os]);
          Auth.logDownload(m.n, os);
          if (Store) { Store.addDownload(m.n, os); Store.addLibrary(m.n); }
          window.location.href = url;
        } catch (err) { msg.textContent = err.message || "Download failed."; msg.hidden = false; }
      });
      document.body.appendChild(od);
    }
    odIdx = i; hideHover();
    od.querySelector("h3").textContent = "Install " + G[i].n;
    od.querySelector(".dmsg").hidden = true;
    od.querySelectorAll("[data-os]").forEach(function (b) { b.disabled = !G[i][b.getAttribute("data-os")]; });
    od.showModal();
  }

  window.QPGames = { list: G, render: render, mount: mount, install: install, open: openModal, find: find,
    icon: iconHTML, wire: wire, slug: slug };
})();
