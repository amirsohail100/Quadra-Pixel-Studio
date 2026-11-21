/* ==========================================================
   Quadra Pixel – community games (uploaded by visitors)
   Firebase mode: Firestore collection "games" + Storage "uploads/<uid>/<gameId>/".
                  New uploads start as status "pending" and go live when you set status to "approved".
   Demo mode:     uploads stay in this browser only (localStorage).
   window.QPCommunity = { ready, load, submit, remove, isVisible, isMine }
   ========================================================== */
(function () {
  "use strict";
  var G = window.GAMES, A = window.QPAuth;
  if (!G || !A) return;
  var BASE = "https://www.gstatic.com/firebasejs/10.14.1/";
  var DEMO_KEY = "qp-community-demo";
  var PAL = [["#18d3e8", "#e8403f"], ["#8a2be2", "#18d3e8"], ["#e8403f", "#f5b700"], ["#18d3e8", "#8a2be2"], ["#2fbf71", "#18d3e8"], ["#f5b700", "#8a2be2"]];

  function colors(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return PAL[h % PAL.length]; }
  function fromDoc(id, d) {
    return { id: id, n: d.name, g: d.genre || "Other", d: d.desc || "", more: d.more || "", r: 0, c: colors(d.name || "x"),
      android: d.android || "", ios: d.ios || "", windows: d.windows || "", img: d.icon || "", age: d.age || "3+",
      type: d.type === "roblox" ? "roblox" : undefined, roblox: d.roblox || "", shots: d.shots || [], price: 0,
      owner: d.owner || "", by: d.ownerName || "", status: d.status || "approved" };
  }
  function addGame(m) {
    for (var i = 0; i < G.length; i++) if (m.id && G[i].id === m.id) { Object.assign(G[i], m); return G[i]; }
    G.push(m); return m;
  }
  function refreshOwn() {
    var u = A.user();
    G.forEach(function (m) { if (m.owner || m.status === "demo") m.own = m.status === "demo" || !!(u && m.owner === u.uid); });
  }
  function isVisible(m) {
    if (m.removed) return false;
    return !m.owner && m.status !== "demo" ? true : (m.status === "approved" || m.status === "demo");
  }
  function isMine(m) { return !!m.own; }

  function demoRead() { try { var v = JSON.parse(localStorage.getItem(DEMO_KEY)); return Array.isArray(v) ? v : []; } catch (e) { return []; } }
  function demoWrite(l) { try { localStorage.setItem(DEMO_KEY, JSON.stringify(l)); return true; } catch (e) { return false; } }

  var firstLoad = null;
  function load() {
    return A.ready.then(function () { return A.firebase(); }).then(function (fb) {
      var u = A.user();
      if (!fb) {
        demoRead().forEach(function (m) { addGame(Object.assign({}, m, { status: "demo" })); });
        return;
      }
      var S = fb.S, col = S.collection(fb.db, "games");
      var qs = [S.getDocs(S.query(col, S.where("status", "==", "approved")))];
      if (u) qs.push(S.getDocs(S.query(col, S.where("owner", "==", u.uid))));
      return Promise.all(qs).then(function (res) {
        res.forEach(function (snap) { snap.forEach(function (d) { addGame(fromDoc(d.id, d.data())); }); });
      });
    }).catch(function (e) { console.warn("Community games not loaded", e); })
      .then(function () { refreshOwn(); window.dispatchEvent(new CustomEvent("qp-games")); });
  }

  /* d = { type, name, genre, desc, more, android, ios, windows, roblox, age, icon (dataURL|""), shots [dataURL] } */
  function submit(d) {
    return A.ready.then(function () { return A.firebase(); }).then(function (fb) {
      var u = A.user();
      if (!u) throw new Error("Please log in to upload a game.");
      if (!fb) {
        var rec = { id: "demo-" + Date.now(), n: d.name, g: d.genre, d: d.desc, more: d.more, r: 0, c: colors(d.name),
          android: d.android, ios: d.ios, windows: d.windows, img: d.icon, age: d.age,
          type: d.type === "roblox" ? "roblox" : undefined, roblox: d.roblox, shots: d.shots, price: 0, owner: u.uid, by: u.name };
        var l = demoRead(); l.push(rec);
        if (!demoWrite(l)) throw new Error("Not enough space on this device for these pictures. Try fewer or smaller images.");
        addGame(Object.assign({}, rec, { status: "demo" }));
        refreshOwn(); window.dispatchEvent(new CustomEvent("qp-games"));
        return rec;
      }
      var S = fb.S, id = S.doc(S.collection(fb.db, "games")).id;
      return import(BASE + "firebase-storage.js").then(function (ST) {
        var st = ST.getStorage(fb.app), base = "uploads/" + u.uid + "/" + id + "/";
        function up(dataUrl, name) {
          return fetch(dataUrl).then(function (r) { return r.blob(); }).then(function (b) {
            var ref = ST.ref(st, base + name);
            return ST.uploadBytes(ref, b, { contentType: "image/jpeg" }).then(function () { return ST.getDownloadURL(ref); });
          });
        }
        var iconP = d.icon ? up(d.icon, "icon.jpg") : Promise.resolve("");
        var shotsP = Promise.all(d.shots.map(function (s, k) { return up(s, "shot-" + (k + 1) + ".jpg"); }));
        return Promise.all([iconP, shotsP]);
      }).then(function (r) {
        var data = { name: d.name, genre: d.genre, desc: d.desc, more: d.more || "", type: d.type === "roblox" ? "roblox" : "download",
          android: d.android || "", ios: d.ios || "", windows: d.windows || "", roblox: d.roblox || "", age: d.age,
          icon: r[0], shots: r[1], price: 0, owner: u.uid, ownerName: u.name, status: "pending", createdAt: S.serverTimestamp() };
        return S.setDoc(S.doc(fb.db, "games", id), data).then(function () {
          var m = addGame(fromDoc(id, data)); refreshOwn();
          window.dispatchEvent(new CustomEvent("qp-games")); return m;
        });
      });
    });
  }

  function remove(m) {
    return A.firebase().then(function (fb) {
      if (!fb || String(m.id).indexOf("demo-") === 0) {
        demoWrite(demoRead().filter(function (x) { return x.id !== m.id; }));
      } else {
        return fb.S.deleteDoc(fb.S.doc(fb.db, "games", m.id)).then(function () {
          return import(BASE + "firebase-storage.js").then(function (ST) {
            var st = ST.getStorage(fb.app), base = "uploads/" + m.owner + "/" + m.id + "/";
            var names = ["icon.jpg"].concat((m.shots || []).map(function (_, k) { return "shot-" + (k + 1) + ".jpg"; }));
            return Promise.all(names.map(function (n) { return ST.deleteObject(ST.ref(st, base + n)).catch(function () {}); }));
          });
        });
      }
    }).then(function () { m.removed = true; m.own = false; window.dispatchEvent(new CustomEvent("qp-games")); });
  }

  firstLoad = load();
  A.onChange(function () { firstLoad.then(function () { refreshOwn(); window.dispatchEvent(new CustomEvent("qp-games")); }); });
  var lastUid;   /* undefined until the first account state arrives */
  A.onChange(function (u) { var id = u ? u.uid : null; if (lastUid !== undefined && id !== lastUid && id) load(); lastUid = id; });

  window.QPCommunity = { ready: firstLoad, load: load, submit: submit, remove: remove, isVisible: isVisible, isMine: isMine };
})();
