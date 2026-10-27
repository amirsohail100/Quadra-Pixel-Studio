/* ==========================================================
   Quadra Pixel – "Upload your game" form (download games and Roblox games)
   Any element with data-upload="download" | "roblox" opens it. Needs an account.
   ========================================================== */
(function () {
  "use strict";
  var Auth = window.QPAuth, C = window.QPCommunity;
  if (!Auth || !C) return;
  var GENRES = ["Action", "Adventure", "Arcade", "Puzzle", "Racing", "RPG", "Simulation", "Sports", "Strategy", "Obby", "Tycoon", "Other"];
  var AGES = ["3+", "7+", "12+", "16+", "18+"];
  var dlg = null, form = null, errEl = null, submitBtn = null, type = "download";

  function opts(list) { return list.map(function (v) { return "<option>" + v + "</option>"; }).join(""); }
  function toast(msg) {
    var t = document.createElement("p"); t.className = "set-msg"; t.setAttribute("role", "status"); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 5200);
  }
  function build() {
    dlg = document.createElement("dialog"); dlg.className = "up-dlg";
    dlg.innerHTML =
      '<button class="x" type="button" aria-label="Close">×</button><h3>Upload your game</h3>' +
      '<p class="muted small">Share a game you made. New uploads are checked by us before they appear for everyone.</p>' +
      '<div class="seg" role="radiogroup" aria-label="Type of game"><label><input type="radio" name="type" value="download" checked>Download game</label>' +
      '<label><input type="radio" name="type" value="roblox">Roblox game</label></div>' +
      '<form novalidate class="up-form">' +
      '<label>Game name<input name="name" maxlength="60" autocomplete="off"></label>' +
      '<label>Genre<select name="genre">' + opts(GENRES) + "</select></label>" +
      '<label>Short description<input name="desc" maxlength="120" placeholder="One line shown on the card"></label>' +
      '<label>About this game (optional)<textarea name="more" maxlength="800"></textarea></label>' +
      '<div data-for="download"><p class="muted small">Add at least one download link (Google Drive, itch.io, GitHub, Play Store…). Only https links are accepted.</p>' +
      '<label>Android link<input name="android" type="url" placeholder="https://"></label>' +
      '<label>iPhone link<input name="ios" type="url" placeholder="https://"></label>' +
      '<label>Windows link<input name="windows" type="url" placeholder="https://"></label></div>' +
      '<div data-for="roblox" hidden><label>Roblox game link<input name="roblox" type="url" placeholder="https://www.roblox.com/games/123456789/your-game"></label></div>' +
      '<label>Age rating<select name="age">' + opts(AGES) + "</select></label>" +
      '<label>Game icon (square picture)<input name="icon" type="file" accept="image/*"></label>' +
      '<label>Screenshots (up to 6 pictures)<input name="shots" type="file" accept="image/*" multiple></label>' +
      '<label class="check"><input name="own" type="checkbox">I made this game or I have the right to share it.</label>' +
      '<p class="dmsg" role="alert" hidden></p>' +
      '<button class="btn" type="submit">Submit game</button><p class="muted small" id="upNote"></p></form>';
    document.body.appendChild(dlg);
    form = dlg.querySelector("form"); errEl = dlg.querySelector(".dmsg"); submitBtn = form.querySelector("button[type=submit]");
    dlg.querySelector(".x").addEventListener("click", function () { dlg.close(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll('input[name="type"]').forEach(function (r) { r.addEventListener("change", function () { setType(r.value); }); });
    form.addEventListener("submit", onSubmit);
  }
  function setType(t) {
    type = t;
    dlg.querySelectorAll("[data-for]").forEach(function (el) { el.hidden = el.getAttribute("data-for") !== t; });
    dlg.querySelectorAll('input[name="type"]').forEach(function (r) { r.checked = r.value === t; });
  }
  function show(msg) { errEl.textContent = msg; errEl.hidden = false; errEl.scrollIntoView({ block: "nearest" }); }

  function httpsUrl(v) { try { var u = new URL(v); return u.protocol === "https:" ? u : null; } catch (e) { return null; } }

  /* resize pictures in the browser so uploads stay small */
  function toData(file, max, quality, square) {
    return new Promise(function (res, rej) {
      if (!/^image\//.test(file.type)) return rej(new Error("“" + file.name + "” is not a picture."));
      if (file.size > 12 * 1024 * 1024) return rej(new Error("“" + file.name + "” is too big (max 12 MB)."));
      var r = new FileReader();
      r.onerror = function () { rej(new Error("Could not read “" + file.name + "”.")); };
      r.onload = function () {
        var img = new Image();
        img.onerror = function () { rej(new Error("Could not open “" + file.name + "” as a picture.")); };
        img.onload = function () {
          var c = document.createElement("canvas"), ctx = c.getContext("2d");
          if (square) {
            var s = Math.min(img.width, img.height); c.width = c.height = max;
            ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, max, max);
          } else {
            var k = Math.min(1, max / Math.max(img.width, img.height));
            c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
            ctx.drawImage(img, 0, 0, c.width, c.height);
          }
          res(c.toDataURL("image/jpeg", quality));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  function onSubmit(e) {
    e.preventDefault(); errEl.hidden = true;
    var f = form.elements, v = function (n) { return f[n].value.trim(); };
    var name = v("name"), desc = v("desc");
    if (name.length < 2) return show("Please enter the game name.");
    if (window.GAMES.some(function (g) { return !g.removed && g.n.toLowerCase() === name.toLowerCase(); })) return show("A game with this name already exists. Pick another name.");
    if (desc.length < 10) return show("Write a short description (at least 10 characters).");
    var data = { type: type, name: name, genre: f["genre"].value, desc: desc, more: v("more"), age: f["age"].value,
      android: "", ios: "", windows: "", roblox: "", icon: "", shots: [] };
    if (type === "roblox") {
      var ru = httpsUrl(v("roblox"));
      if (!ru || !/(^|\.)roblox\.com$/i.test(ru.hostname)) return show("Enter a valid Roblox link (https://www.roblox.com/games/…).");
      data.roblox = ru.href;
    } else {
      var any = false;
      for (var k = 0, names = ["android", "ios", "windows"]; k < names.length; k++) {
        var val = v(names[k]); if (!val) continue;
        var u = httpsUrl(val); if (!u) return show("The " + names[k] + " link must be a valid https:// link.");
        data[names[k]] = u.href; any = true;
      }
      if (!any) return show("Add at least one download link.");
    }
    var iconFile = f["icon"].files[0], shotFiles = Array.prototype.slice.call(f["shots"].files);
    if (shotFiles.length > 6) return show("You can add up to 6 screenshots.");
    if (!f["own"].checked) return show("Please confirm that you have the right to share this game.");

    var demo = Auth.mode() === "demo", max = demo ? 960 : 1280, q = demo ? 0.7 : 0.8;
    submitBtn.disabled = true; submitBtn.textContent = "Uploading…";
    Promise.all([iconFile ? toData(iconFile, 256, 0.85, true) : Promise.resolve(""),
                 Promise.all(shotFiles.map(function (s) { return toData(s, max, q, false); }))])
      .then(function (r) { data.icon = r[0]; data.shots = r[1]; return C.submit(data); })
      .then(function () {
        dlg.close();
        toast(demo ? "Added! Demo mode: it is only saved on this device." : "Submitted! It will appear for everyone after we review it.");
        window.location.hash = "#mine";
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      })
      .catch(function (err) { show(err.message || "Upload failed. Please try again."); })
      .then(function () { submitBtn.disabled = false; submitBtn.textContent = "Submit game"; });
  }

  function open(t) {
    if (!dlg) build();
    form.reset(); errEl.hidden = true; setType(t === "roblox" ? "roblox" : "download");
    dlg.querySelector("#upNote").textContent = Auth.mode() === "demo"
      ? "Demo mode: your game is saved only in this browser until Firebase is connected." : "";
    dlg.showModal();
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-upload]"); if (!b) return;
    var t = b.getAttribute("data-upload");
    (window.QPAuthUI ? window.QPAuthUI.require("Log in to upload a game. Browsing never needs an account.") : Promise.resolve(true))
      .then(function (ok) { if (ok) open(t); });
  });
  window.QPUpload = { open: open };
})();
