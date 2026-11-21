/* ==========================================================
   Quadra Pixel – account layer (window.QPAuth)
   - Firebase mode: Firebase Auth + Firestore (+ Storage links)
   - Demo mode:     no keys yet, user kept in this browser only
   Firebase is loaded from Google's CDN only when keys are set,
   so the site still opens without a build step.
   ========================================================== */
(function () {
  "use strict";
  var CFG = window.QP_FIREBASE_CONFIG || {};
  var BASE = "https://www.gstatic.com/firebasejs/10.14.1/";
  var configured = !!(CFG.apiKey && CFG.projectId);
  var mode = configured ? "firebase" : "demo";
  var DEMO_KEY = "qp-demo-user", DEMO_DL = "qp-demo-downloads";
  var current = null, listeners = [], isReady = false, readyRes, fb = null;
  var ready = new Promise(function (r) { readyRes = r; });

  function emit(u) {
    current = u; isReady = true; readyRes();
    listeners.forEach(function (f) { try { f(u); } catch (e) { console.error(e); } });
  }
  function onChange(f) { listeners.push(f); if (isReady) f(current); }
  function pub(u, name) {
    return { uid: u.uid, name: name || u.displayName || (u.email || "").split("@")[0], email: u.email };
  }
  function friendly(e) {
    var map = {
      "auth/email-already-in-use": "That email already has an account. Try logging in instead.",
      "auth/invalid-email": "That email address doesn't look right.",
      "auth/weak-password": "Choose a stronger password (at least 6 characters).",
      "auth/invalid-credential": "Wrong email or password.",
      "auth/user-not-found": "Wrong email or password.",
      "auth/wrong-password": "Wrong email or password.",
      "auth/too-many-requests": "Too many attempts. Please wait a bit and try again.",
      "auth/network-request-failed": "Network problem. Check your connection and try again.",
      "auth/popup-closed-by-user": "The Google window was closed before finishing.",
      "auth/operation-not-allowed": "This sign-in method isn't enabled in Firebase yet.",
      "auth/unauthorized-domain": "This domain isn't authorised in Firebase (Authentication > Settings > Authorized domains).",
      "storage/unauthorized": "Please log in to download.",
      "storage/object-not-found": "That file hasn't been uploaded yet."
    };
    return new Error(map[(e && e.code) || ""] || (e && e.message) || "Something went wrong. Please try again.");
  }

  /* ----- Firebase backend ----- */
  function loadFirebase() {
    return Promise.all([
      import(BASE + "firebase-app.js"),
      import(BASE + "firebase-auth.js"),
      import(BASE + "firebase-firestore.js")
    ]).then(function (m) {
      var app = m[0].initializeApp(CFG);
      fb = { app: app, A: m[1], S: m[2], auth: m[1].getAuth(app), db: m[2].getFirestore(app) };
      m[1].onAuthStateChanged(fb.auth, function (u) { emit(u ? pub(u) : null); if (u) syncPurchases(u); });
    }).catch(function (e) {
      console.error("Firebase failed to load", e);
      mode = "offline"; emit(null);
    });
  }
  /* paid games the visitor owns: users/{uid}/purchases/{gameKey} (written by you / a payment webhook, never by the browser) */
  function syncPurchases(u) {
    fb.S.getDocs(fb.S.collection(fb.db, "users", u.uid, "purchases")).then(function (snap) {
      var ids = []; snap.forEach(function (d) { ids.push(d.id); });
      try { localStorage.setItem("qp:purchases:" + u.uid, JSON.stringify(ids)); } catch (e) {}
      window.dispatchEvent(new CustomEvent("qp-store", { detail: { kind: "purchases" } }));
    }).catch(function (e) { console.warn("Purchases not loaded", e); });
  }
  function saveProfile(u, name, isNew) {
    var data = { name: name || "", email: u.email || "", lastLoginAt: fb.S.serverTimestamp() };
    if (isNew) data.createdAt = fb.S.serverTimestamp();
    return fb.S.setDoc(fb.S.doc(fb.db, "users", u.uid), data, { merge: true })
      .catch(function (e) { console.warn("Profile not saved (is Firestore enabled?)", e); });
  }

  /* ----- Demo backend (no real security) ----- */
  function demoRead() { try { return JSON.parse(localStorage.getItem(DEMO_KEY)); } catch (e) { return null; } }
  function demoLogin(name, email) {
    var prev = demoRead();
    var u = { uid: "demo-" + email, email: email,
      name: name || (prev && prev.email === email && prev.name) || email.split("@")[0] };
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(u)); } catch (e) {}
    emit(u);
  }

  var initP = configured ? loadFirebase() : Promise.resolve().then(function () { emit(demoRead()); });
  function need() {
    return initP.then(function () {
      if (mode === "offline") throw new Error("Couldn't reach Firebase. Check your connection and the keys in js/firebase-config.js.");
    });
  }

  /* ----- public API ----- */
  function signUp(o) {
    return need().then(function () {
      if (mode === "demo") return demoLogin(o.name, o.email);
      return fb.A.createUserWithEmailAndPassword(fb.auth, o.email, o.password).then(function (c) {
        return fb.A.updateProfile(c.user, { displayName: o.name })
          .then(function () { return saveProfile(c.user, o.name, true); })
          .then(function () { emit(pub(c.user, o.name)); });
      });
    }).catch(function (e) { throw friendly(e); });
  }
  function logIn(o) {
    return need().then(function () {
      if (mode === "demo") return demoLogin(null, o.email);
      return fb.A.signInWithEmailAndPassword(fb.auth, o.email, o.password)
        .then(function (c) { return saveProfile(c.user, c.user.displayName, false); });
    }).catch(function (e) { throw friendly(e); });
  }
  function google() {
    return need().then(function () {
      if (mode !== "firebase") throw new Error("Google sign-in needs Firebase keys.");
      return fb.A.signInWithPopup(fb.auth, new fb.A.GoogleAuthProvider())
        .then(function (c) { return saveProfile(c.user, c.user.displayName, false); });
    }).catch(function (e) { throw friendly(e); });
  }
  function logOut() {
    return need().then(function () {
      if (mode === "demo") { try { localStorage.removeItem(DEMO_KEY); } catch (e) {} emit(null); return; }
      return fb.A.signOut(fb.auth);
    }).catch(function (e) { console.warn(e); });
  }
  function logDownload(game, os) {
    if (!current) return;
    if (mode === "firebase" && fb) {
      fb.S.addDoc(fb.S.collection(fb.db, "downloads"), { uid: current.uid, game: game, os: os, at: fb.S.serverTimestamp() })
        .catch(function (e) { console.warn("Download not logged", e); });
    } else {
      try {
        var l = JSON.parse(localStorage.getItem(DEMO_DL) || "[]");
        l.push({ game: game, os: os, at: new Date().toISOString() });
        localStorage.setItem(DEMO_DL, JSON.stringify(l.slice(-50)));
      } catch (e) {}
    }
  }
  /* "storage:games/file.apk" -> signed download URL (login required by rules) */
  function resolveLink(url) {
    if (!url) return Promise.reject(new Error("This download isn't available yet."));
    if (url.indexOf("storage:") !== 0) {
      if (!/^https?:\/\//i.test(url)) return Promise.reject(new Error("This download link isn't valid."));
      return Promise.resolve(url);
    }
    if (mode !== "firebase") return Promise.reject(new Error("Storage links need Firebase to be set up."));
    return import(BASE + "firebase-storage.js").then(function (S) {
      return S.getDownloadURL(S.ref(S.getStorage(fb.app), url.slice(8)));
    }).catch(function (e) { throw friendly(e); });
  }

  window.QPAuth = {
    ready: ready, mode: function () { return mode; }, user: function () { return current; },
    onChange: onChange, signUp: signUp, logIn: logIn, google: google, logOut: logOut,
    logDownload: logDownload, resolveLink: resolveLink,
    /* resolves to { app, A, S, db, auth } in Firebase mode, or null in demo mode */
    firebase: function () { return initP.then(function () { return mode === "firebase" ? fb : null; }); }
  };
})();
