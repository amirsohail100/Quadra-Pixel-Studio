/* Quadra Pixel – shared behaviour for all pages */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ----- mobile nav ----- */
  var toggle = $(".nav-toggle"), nav = $(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open);
    });
  }

  /* ----- footer year ----- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ----- deterministic pixel icon for games without an image ----- */
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
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  function cardHTML(m, i, withBtn) {
    var ic = m.img ? '<img src="' + m.img + '" alt="" loading="lazy">' : pixelIcon(i + 11, m.c);
    return '<article class="card"><div class="top"><div class="icon">' + ic + '</div><div><h3>' + esc(m.n) +
      '</h3><div class="meta">' + esc(m.g) + '</div></div></div><p class="desc">' + esc(m.d) +
      '</p><div class="foot"><span class="rate">★ ' + m.r + "</span>" +
      (withBtn ? '<button class="btn sm" type="button" data-i="' + i + '">Install</button>'
               : '<a class="btn sm" href="games.html">View</a>') + "</div></article>";
  }

  /* ----- home: hero pixel field + featured games ----- */
  var stage = $("#stage");
  if (stage) {
    var cols = ["#18d3e8", "#e8403f", "#8a2be2", "transparent", "transparent", "transparent", "transparent"], s = 7, h = "";
    for (var i = 0; i < 96; i++) { s = (s * 9301 + 49297) % 233280; h += '<i style="background:' + cols[s % cols.length] + '"></i>'; }
    stage.innerHTML = h;
  }
  var featured = $("#featured");
  if (featured && window.GAMES) {
    featured.innerHTML = window.GAMES.slice(0, 3).map(function (m, i) { return cardHTML(m, i, false); }).join("");
  }

  /* ----- games page: search + genre filter + install dialog ----- */
  var grid = $("#grid");
  if (grid && window.GAMES) {
    var G = window.GAMES, genre = "All", q = $("#q"), dlg = $("#dlg");
    function chips() {
      var gs = ["All"]; G.forEach(function (m) { if (gs.indexOf(m.g) < 0) gs.push(m.g); });
      $("#chips").innerHTML = gs.map(function (g) {
        return '<button class="chip" type="button" aria-pressed="' + (g === genre) + '" data-g="' + g + '">' + g + "</button>";
      }).join("");
    }
    function render() {
      var term = q.value.trim().toLowerCase(), html = "", n = 0;
      G.forEach(function (m, i) {
        if (genre !== "All" && m.g !== genre) return;
        if (term && (m.n + " " + m.g + " " + m.d).toLowerCase().indexOf(term) < 0) return;
        n++; html += cardHTML(m, i, true);
      });
      grid.innerHTML = html;
      $("#empty").hidden = n > 0;
      $("#count").textContent = n + (n === 1 ? " game" : " games");
    }
    $("#chips").addEventListener("click", function (e) {
      var g = e.target.getAttribute("data-g"); if (!g) return; genre = g; chips(); render();
    });
    q.addEventListener("input", render);
    grid.addEventListener("click", function (e) {
      var i = e.target.getAttribute("data-i"); if (i === null) return;
      var m = G[i];
      $("#dTitle").textContent = "Install " + m.n;
      [["#dAndroid", m.android], ["#dIos", m.ios]].forEach(function (p) {
        var a = $(p[0]);
        a.href = p[1] || "#";
        a.setAttribute("aria-disabled", p[1] ? "false" : "true");
        if (p[1]) { a.target = "_blank"; a.rel = "noopener"; }
      });
      dlg.showModal();
    });
    $("#dClose").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    chips(); render();
  }

  /* ----- help page: contact form opens the visitor's mail app ----- */
  var form = $("#contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var to = form.getAttribute("data-email");
      var body = "Name: " + form.name.value + "\n\n" + form.message.value;
      window.location.href = "mailto:" + to + "?subject=" + encodeURIComponent(form.subject.value || "Quadra Pixel support") + "&body=" + encodeURIComponent(body);
    });
  }
})();
