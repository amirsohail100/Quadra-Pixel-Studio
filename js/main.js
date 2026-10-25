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

  /* ----- games page: search + genre filter (cards, hover preview, gallery and install live in game-ui.js) ----- */
  var grid = $("#grid");
  if (grid && window.QPGames) {
    var G = window.QPGames.list, genre = "All", q = $("#q");
    function chips() {
      var gs = ["All"]; G.forEach(function (m) { if (gs.indexOf(m.g) < 0) gs.push(m.g); });
      $("#chips").innerHTML = gs.map(function (g) {
        return '<button class="chip" type="button" aria-pressed="' + (g === genre) + '" data-g="' + g + '">' + g + "</button>";
      }).join("");
    }
    function render() {
      var term = q.value.trim().toLowerCase(), ids = [];
      G.forEach(function (m, i) {
        if (genre !== "All" && m.g !== genre) return;
        if (term && (m.n + " " + m.g + " " + m.d).toLowerCase().indexOf(term) < 0) return;
        ids.push(i);
      });
      window.QPGames.render(grid, ids);
      $("#empty").hidden = ids.length > 0;
      $("#count").textContent = ids.length + (ids.length === 1 ? " game" : " games");
    }
    $("#chips").addEventListener("click", function (e) {
      var g = e.target.getAttribute("data-g"); if (!g) return; genre = g; chips(); render();
    });
    q.addEventListener("input", render);
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
