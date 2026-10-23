/* Quadra Pixel – sign up / log in dialog + header account area.
   Exposes window.QPAuthUI.require(reason): resolves true once the visitor
   is signed in (opens the dialog if needed), false if they cancel. */
(function () {
  "use strict";
  var A = window.QPAuth;
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }

  var dlg = document.createElement("dialog");
  dlg.className = "auth-dlg";
  dlg.setAttribute("aria-labelledby", "authTitle");
  dlg.innerHTML = [
    '<button class="x" type="button" aria-label="Close">×</button>',
    '<h3 id="authTitle">Join Quadra Pixel</h3>',
    '<p class="muted" id="authReason" hidden></p>',
    '<div class="tabs" role="tablist">',
    '  <button type="button" role="tab" data-tab="signup">Sign up</button>',
    '  <button type="button" role="tab" data-tab="login">Log in</button>',
    '</div>',
    '<form class="auth-form" novalidate>',
    '  <label data-only="signup">Name<input name="name" autocomplete="name"></label>',
    '  <label>Email<input name="email" type="email" autocomplete="email"></label>',
    '  <label>Password<input name="password" type="password" autocomplete="new-password"></label>',
    '  <p class="dmsg" role="alert" hidden></p>',
    '  <button class="btn" type="submit">Create account</button>',
    '  <button class="btn ghost" type="button" id="authGoogle">Continue with Google</button>',
    '  <p class="muted small" id="authNote"></p>',
    '</form>'
  ].join("");
  document.body.appendChild(dlg);

  var form = dlg.querySelector("form"), err = dlg.querySelector(".dmsg");
  var submit = form.querySelector("button[type=submit]"), google = dlg.querySelector("#authGoogle");
  var title = dlg.querySelector("#authTitle"), reason = dlg.querySelector("#authReason"), note = dlg.querySelector("#authNote");
  var tab = "signup", resolver = null, success = false;

  function show(msg) { err.textContent = msg; err.hidden = false; }
  function busy(b) { submit.disabled = b; google.disabled = b; }
  function setTab(t) {
    tab = t; err.hidden = true;
    dlg.querySelectorAll("[role=tab]").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-tab") === t); });
    dlg.querySelectorAll("[data-only]").forEach(function (el) { el.hidden = el.getAttribute("data-only") !== t; });
    title.textContent = t === "signup" ? "Join Quadra Pixel" : "Welcome back";
    submit.textContent = t === "signup" ? "Create account" : "Log in";
    form.elements["password"].setAttribute("autocomplete", t === "signup" ? "new-password" : "current-password");
  }
  function open(opts) {
    opts = opts || {};
    setTab(opts.tab === "login" ? "login" : "signup");
    form.reset(); busy(false); success = false;
    reason.textContent = opts.reason || ""; reason.hidden = !opts.reason;
    google.hidden = A.mode() !== "firebase";
    note.textContent = A.mode() === "demo"
      ? "Demo mode: accounts live only in this browser. Add your Firebase keys in js/firebase-config.js for real accounts."
      : "You can keep exploring without an account. We only ask when you download.";
    return new Promise(function (res) {
      if (resolver) resolver(false);
      resolver = res;
      if (!dlg.open) dlg.showModal();
    });
  }
  dlg.addEventListener("close", function () {
    if (resolver) { var r = resolver; resolver = null; r(success); }
  });
  dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
  dlg.querySelector(".x").addEventListener("click", function () { dlg.close(); });
  dlg.querySelector(".tabs").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tab]"); if (b) setTab(b.getAttribute("data-tab"));
  });

  function finish(p) {
    busy(true);
    p.then(function () { success = true; dlg.close(); })
      .catch(function (x) { show(x.message || "Something went wrong."); })
      .then(function () { busy(false); });
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements["name"].value.trim(), email = form.elements["email"].value.trim(), pw = form.elements["password"].value;
    if (tab === "signup" && name.length < 2) return show("Please enter your name.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return show("Please enter a valid email address.");
    if (pw.length < 6) return show("Password must be at least 6 characters.");
    err.hidden = true;
    finish(tab === "signup" ? A.signUp({ name: name, email: email, password: pw }) : A.logIn({ email: email, password: pw }));
  });
  google.addEventListener("click", function () { err.hidden = true; finish(A.google()); });

  /* header account area + guest-only blocks */
  var slot = document.getElementById("authSlot");
  function render(u) {
    if (slot) slot.innerHTML = u
      ? '<span class="who">Hi, ' + esc(u.name) + '</span><button class="btn ghost sm" type="button" data-auth="logout">Log out</button>'
      : '<button class="btn sm" type="button" data-auth="signup">Sign up</button>';
    document.querySelectorAll("[data-guest-only]").forEach(function (el) { el.hidden = !!u; });
  }
  A.onChange(render);
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-auth]"); if (!b) return;
    var a = b.getAttribute("data-auth");
    if (a === "logout") A.logOut(); else open({ tab: a });
  });

  window.QPAuthUI = {
    open: open,
    require: function (why) {
      return A.ready.then(function () { return A.user() ? true : open({ tab: "signup", reason: why }); });
    }
  };
})();
