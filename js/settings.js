/* Quadra Pixel – Settings page */
(function () {
  "use strict";
  var T = window.QPTheme, S = window.QPStore, A = window.QPAuth;
  if (!T || !document.getElementById("settings")) return;
  var msg = document.getElementById("setMsg");
  function say(t) { msg.textContent = t; msg.hidden = false; clearTimeout(say.t); say.t = setTimeout(function () { msg.hidden = true; }, 2600); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  document.querySelectorAll('input[name="theme"]').forEach(function (r) {
    r.checked = r.value === T.get();
    r.addEventListener("change", function () { T.set(r.value); say("Theme: " + r.value); });
  });

  var ap = document.getElementById("optAutoplay"), mo = document.getElementById("optMotion");
  try { ap.checked = localStorage.getItem("qp-autoplay") !== "off"; } catch (e) { ap.checked = true; }
  ap.addEventListener("change", function () {
    try { localStorage.setItem("qp-autoplay", ap.checked ? "on" : "off"); } catch (e) {}
    say(ap.checked ? "Banner autoplay is on" : "Banner autoplay is off");
  });
  mo.checked = T.motion();
  mo.addEventListener("change", function () { T.setMotion(mo.checked); say(mo.checked ? "Animations reduced" : "Animations on"); });

  document.getElementById("clrLib").addEventListener("click", function () {
    if (confirm("Remove every game from your library?")) { S.clear("library"); say("Library cleared"); }
  });
  document.getElementById("clrDl").addEventListener("click", function () {
    if (confirm("Clear your download history on this device?")) { S.clear("downloads"); say("Download history cleared"); }
  });

  var box = document.getElementById("accountBox");
  A.onChange(function (u) {
    box.innerHTML = u
      ? '<div><strong>' + esc(u.name) + '</strong><p class="muted">' + esc(u.email || "") + '</p></div><button class="btn ghost sm" type="button" data-auth="logout">Log out</button>'
      : '<div><strong>Browsing as a guest</strong><p class="muted">A free account is only needed to download games.</p></div><div class="row"><button class="btn sm" type="button" data-auth="signup">Sign up</button><button class="btn ghost sm" type="button" data-auth="login">Log in</button></div>';
  });
})();
