/* Quadra Pixel – small per-user store on this device (library + download history).
   Data is kept in localStorage under qp:<kind>:<user id | guest>. */
(function () {
  "use strict";
  function uid() { var u = window.QPAuth && window.QPAuth.user(); return u ? u.uid : "guest"; }
  function key(kind) { return "qp:" + kind + ":" + uid(); }
  function read(kind) {
    try { var v = JSON.parse(localStorage.getItem(key(kind))); return Array.isArray(v) ? v : []; }
    catch (e) { return []; }
  }
  function changed(kind) { window.dispatchEvent(new CustomEvent("qp-store", { detail: { kind: kind } })); }
  function write(kind, v) { try { localStorage.setItem(key(kind), JSON.stringify(v)); } catch (e) {} changed(kind); }

  /* games saved while browsing as a guest move into the account the visitor logs in to */
  if (window.QPAuth) window.QPAuth.onChange(function (u) {
    if (!u) return;
    try {
      var g = JSON.parse(localStorage.getItem("qp:library:guest"));
      if (!Array.isArray(g) || !g.length) return;
      var k = "qp:library:" + u.uid, l = JSON.parse(localStorage.getItem(k)) || [];
      g.forEach(function (n) { if (l.indexOf(n) < 0) l.push(n); });
      localStorage.setItem(k, JSON.stringify(l));
      localStorage.removeItem("qp:library:guest");
      changed("library");
    } catch (e) {}
  });

  window.QPStore = {
    library: function () { return read("library"); },
    inLibrary: function (name) { return read("library").indexOf(name) >= 0; },
    addLibrary: function (name) {
      var l = read("library");
      if (l.indexOf(name) < 0) { l.push(name); write("library", l); }
    },
    /* returns true if the game is now in the library */
    toggleLibrary: function (name) {
      var l = read("library"), i = l.indexOf(name);
      if (i < 0) l.push(name); else l.splice(i, 1);
      write("library", l);
      return i < 0;
    },
    downloads: function () { return read("downloads"); },
    addDownload: function (game, os) {
      var l = read("downloads");
      l.unshift({ game: game, os: os, at: new Date().toISOString() });
      write("downloads", l.slice(0, 100));
    },
    purchases: function () { return read("purchases"); },
    owns: function (key) { return read("purchases").indexOf(key) >= 0; },
    addPurchase: function (key) {
      var l = read("purchases");
      if (l.indexOf(key) < 0) { l.push(key); write("purchases", l); }
    },
    clear: function (kind) { try { localStorage.removeItem(key(kind)); } catch (e) {} changed(kind); }
  };
})();
