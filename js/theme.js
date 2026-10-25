/* Quadra Pixel – theme (dark / light / system) and reduced-motion setting.
   The header button flips dark <-> light; the Settings page can also pick "system". */
(function () {
  "use strict";
  var KEY = "qp-theme", MKEY = "qp-motion", root = document.documentElement;
  var btn = document.getElementById("themeToggle");
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;

  function pref() {
    try { var v = localStorage.getItem(KEY); return v === "light" || v === "dark" || v === "system" ? v : "dark"; }
    catch (e) { return "dark"; }
  }
  function resolve(p) { return p === "system" ? (mq && mq.matches ? "light" : "dark") : p; }
  function apply() {
    var t = resolve(pref());
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
  function set(p) { try { localStorage.setItem(KEY, p); } catch (e) {} apply(); }

  function motion() { try { return localStorage.getItem(MKEY) === "reduced"; } catch (e) { return false; } }
  function applyMotion() { root.classList.toggle("reduce-motion", motion()); }
  function setMotion(on) { try { localStorage.setItem(MKEY, on ? "reduced" : "full"); } catch (e) {} applyMotion(); }

  if (mq && mq.addEventListener) mq.addEventListener("change", function () { if (pref() === "system") apply(); });
  if (btn) btn.addEventListener("click", function () { set(root.getAttribute("data-theme") === "light" ? "dark" : "light"); });
  apply(); applyMotion();

  window.QPTheme = { get: pref, set: set, motion: motion, setMotion: setMotion };
})();
