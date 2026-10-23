/* Quadra Pixel – light / dark theme toggle (choice is remembered) */
(function () {
  "use strict";
  var KEY = "qp-theme", root = document.documentElement;
  var btn = document.getElementById("themeToggle");

  function apply(t) {
    root.setAttribute("data-theme", t);
    if (btn) {
      var light = t === "light";
      btn.setAttribute("aria-pressed", light);
      btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
      btn.querySelector(".ico").textContent = light ? "☾" : "☀";
    }
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#f4f4ff" : "#07070d");
  }
  apply(root.getAttribute("data-theme") === "light" ? "light" : "dark");
  if (btn) btn.addEventListener("click", function () {
    var t = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    try { localStorage.setItem(KEY, t); } catch (e) {}
    apply(t);
  });
})();
