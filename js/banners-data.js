/* ==========================================================
   Home page banners – edit this file to add / change banners.
   badge  = small label (e.g. "New release • Android")
   price  = optional price chip ("" to hide)
   title, sub = headline and one-line description
   cta    = button text
   href   = where the button goes (e.g. "games.html")
   action = optional: "signup" or "login" opens the account dialog instead of a link
   img    = banner picture, wide 1200x600 works best (png / jpg / webp / svg)
            put your own pictures in assets/images/banners/
   tint   = colour of the soft overlay behind the text (any hex colour)
   guestOnly = true -> hidden once the visitor is logged in
   ========================================================== */
window.BANNERS = [
  {badge:"New release • Android", price:"Free", title:"Pixel Drift", sub:"Slide through neon corners in 60-second laps.", cta:"See details", href:"games.html", img:"assets/images/banners/pixel-drift.svg", tint:"#a3202a"},
  {badge:"Puzzle • iPhone", price:"Free", title:"Block Garden", sub:"Plant, merge and grow a garden on a tiny grid.", cta:"See details", href:"games.html", img:"assets/images/banners/block-garden.svg", tint:"#0b6a78"},
  {badge:"Quadra Pixel", price:"", title:"Now on Windows", sub:"Download our games for Android, iPhone and Windows.", cta:"Browse games", href:"games.html", img:"assets/images/banners/now-on-windows.svg", tint:"#0a5f86"},
  {badge:"Arcade • Android", price:"Free", title:"Cave Runner", sub:"Dash, jump and dodge through a collapsing cave.", cta:"See details", href:"games.html", img:"assets/images/banners/cave-runner.svg", tint:"#5a2aa8"},
  {badge:"Quadra Pixel", price:"", title:"Join Quadra Pixel", sub:"A free account is only needed to download. Browsing is always open.", cta:"Sign up", action:"signup", guestOnly:true, img:"assets/images/banners/join-quadra-pixel.svg", tint:"#6a24b8"},
  {badge:"Strategy • Windows", price:"Free", title:"Tiny Kingdom", sub:"Build a small kingdom and defend it one wave at a time.", cta:"See details", href:"games.html", img:"assets/images/banners/tiny-kingdom.svg", tint:"#2a4aa0"}
];
