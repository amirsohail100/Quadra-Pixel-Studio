/* Quadra Pixel – shared behaviour for all pages */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };

  /* ----- footer year ----- */
  var y = $("#year"); if (y) y.textContent = new Date().getFullYear();

  /* ----- home: hero pixel field + featured games ----- */
  var stage = $("#stage");
  if (stage) {
    var cols = ["#18d3e8", "#e8403f", "#8a2be2", "transparent", "transparent", "transparent", "transparent"], s = 7, h = "";
    for (var i = 0; i < 96; i++) { s = (s * 9301 + 49297) % 233280; h += '<i style="background:' + cols[s % cols.length] + '"></i>'; }
    stage.innerHTML = h;
  }
  var featured = $("#featured");
  if (featured && window.QPGames) {
    window.QPGames.render(featured, [0, 1, 2].filter(function (i) { return i < window.QPGames.list.length; }));
  }

  /* ----- games page: sub-navigation (All / Roblox / Premium / My games) + search + genre filter ----- */
  var grid = $("#grid");
  if (grid && window.QPGames) {
    var Q = window.QPGames, G = Q.list, genre = "All", q = $("#q");
    var vis = function (m) { return !m.removed && (!window.QPCommunity || window.QPCommunity.isVisible(m)); };
    var TABS = {
      all:     { intro: "Search by name or genre, then pick Android, iPhone or Windows to install.", test: function (m) { return vis(m); } },
      roblox:  { intro: "Roblox games from the Quadra Pixel team and the community. They open on Roblox.", test: function (m) { return vis(m) && m.type === "roblox"; } },
      premium: { intro: "Paid games. Buy once, then install on any device.", test: function (m) { return vis(m) && m.price > 0; } },
      mine:    { intro: "Games you uploaded. Delete a game any time.", test: function (m) { return !m.removed && !!m.own; } }
    };
    function tab() { var h = window.location.hash.slice(1); return TABS[h] ? h : "all"; }
    function chips(list) {
      var gs = ["All"]; list.forEach(function (m) { if (gs.indexOf(m.g) < 0) gs.push(m.g); });
      if (gs.indexOf(genre) < 0) genre = "All";
      $("#chips").innerHTML = gs.map(function (g) {
        return '<button class="chip" type="button" aria-pressed="' + (g === genre) + '" data-g="' + g + '">' + g + "</button>";
      }).join("");
    }
    function emptyHTML(t, searching) {
      var user = window.QPAuth && window.QPAuth.user();
      if (searching) return "<h3>No games found</h3><p>Try another name or genre.</p>";
      if (t === "mine") return user
        ? '<h3>You have not uploaded a game yet</h3><p>Share a download game or a Roblox game with everyone.</p><div class="row"><button class="btn" type="button" data-upload="download">+ Upload a game</button><button class="btn red" type="button" data-upload="roblox">+ Add Roblox game</button></div>'
        : '<h3>Log in to see your games</h3><p>Anyone with a free account can upload games. Browsing never needs one.</p><div class="row"><button class="btn" type="button" data-auth="signup">Sign up</button><button class="btn ghost" type="button" data-auth="login">Log in</button></div>';
      if (t === "roblox") return '<h3>No Roblox games yet</h3><p>Be the first to add one.</p><div class="row"><button class="btn red" type="button" data-upload="roblox">+ Add Roblox game</button></div>';
      if (t === "premium") return "<h3>No premium games yet</h3><p>Paid games will appear here.</p>";
      return "<h3>No games yet</h3>";
    }
    function render() {
      var t = tab(), term = q.value.trim().toLowerCase(), pool = [], ids = [];
      G.forEach(function (m, i) { if (TABS[t].test(m)) pool.push(i); });
      chips(pool.map(function (i) { return G[i]; }));
      pool.forEach(function (i) {
        var m = G[i];
        if (genre !== "All" && m.g !== genre) return;
        if (term && (m.n + " " + m.g + " " + m.d).toLowerCase().indexOf(term) < 0) return;
        ids.push(i);
      });
      Q.render(grid, ids, { manage: t === "mine" });
      var e = $("#empty"); e.hidden = ids.length > 0;
      if (!ids.length) e.innerHTML = emptyHTML(t, !!term || genre !== "All");
      $("#count").textContent = ids.length + (ids.length === 1 ? " game" : " games");
      $("#tabIntro").textContent = TABS[t].intro;
      document.querySelectorAll("#subnav a").forEach(function (a) {
        var k = a.getAttribute("data-tab");
        a.setAttribute("aria-current", k === t ? "true" : "false");
        var n = 0; G.forEach(function (m) { if (TABS[k].test(m)) n++; });
        a.querySelector(".n").textContent = n ? n : "";
      });
    }
    $("#chips").addEventListener("click", function (e) {
      var g = e.target.getAttribute("data-g"); if (!g) return; genre = g; render();
    });
    q.addEventListener("input", render);
    window.addEventListener("hashchange", function () { genre = "All"; render(); window.scrollTo({ top: 0 }); });
    window.addEventListener("qp-games", render);
    if (window.QPAuth) window.QPAuth.onChange(render);
    render();
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
