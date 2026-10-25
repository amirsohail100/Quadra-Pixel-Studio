/* Quadra Pixel – Library page (#libraryGrid) and Downloads page (#dlList) */
(function () {
  "use strict";
  var lib = document.getElementById("libraryGrid"), dl = document.getElementById("dlList");
  if (!window.QPGames || !window.QPStore || (!lib && !dl)) return;
  var Q = window.QPGames, S = window.QPStore, A = window.QPAuth;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
  var OSN = { android: "Android", ios: "iPhone", windows: "Windows" };

  function renderLibrary() {
    var ids = S.library().map(Q.find).filter(function (i) { return i >= 0; });
    Q.render(lib, ids);
    document.getElementById("libEmpty").hidden = ids.length > 0;
    document.getElementById("libCount").textContent = ids.length + (ids.length === 1 ? " game" : " games");
    document.getElementById("libClear").hidden = !ids.length;
  }

  function renderDownloads() {
    var empty = document.getElementById("dlEmpty"), user = A.user(), items = user ? S.downloads() : [];
    var rows = items.map(function (d) { return { d: d, i: Q.find(d.game) }; }).filter(function (r) { return r.i >= 0; });
    dl.innerHTML = rows.map(function (r) {
      var when = new Date(r.d.at).toLocaleString([], { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
      return '<li class="dl-row"><div class="icon">' + Q.icon(r.i) + '</div><div class="dl-main"><strong>' + esc(r.d.game) +
        '</strong><span class="muted">' + esc(OSN[r.d.os] || r.d.os) + " · " + esc(when) + '</span></div>' +
        '<button class="btn sm" type="button" data-again="' + r.i + '">Download again</button></li>';
    }).join("");
    Q.wire(dl);
    empty.hidden = rows.length > 0;
    if (!rows.length) {
      empty.innerHTML = user
        ? '<h3>No downloads yet</h3><p>Games you download will show up here.</p><div class="row"><a class="btn" href="games.html">Browse games</a></div>'
        : '<h3>Log in to see your downloads</h3><p>Downloads need a free account. Browsing the site never does.</p><div class="row"><button class="btn" type="button" data-auth="signup">Sign up</button><button class="btn ghost" type="button" data-auth="login">Log in</button></div>';
    }
    document.getElementById("dlCount").textContent = rows.length ? rows.length + (rows.length === 1 ? " download" : " downloads") : "";
    document.getElementById("dlClear").hidden = !rows.length;
  }

  if (dl) {
    dl.addEventListener("click", function (e) {
      var b = e.target.closest("[data-again]"); if (b) Q.install(Number(b.getAttribute("data-again")));
    });
    document.getElementById("dlClear").addEventListener("click", function () {
      if (confirm("Clear your download history on this device?")) S.clear("downloads");
    });
  }
  if (lib) {
    document.getElementById("libClear").addEventListener("click", function () {
      if (confirm("Remove every game from your library?")) S.clear("library");
    });
  }
  function render() { if (lib) renderLibrary(); if (dl) renderDownloads(); }
  A.onChange(render);                         /* runs once the account state is known, and on login/logout */
  window.addEventListener("qp-store", render);
})();
