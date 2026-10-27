/* ==========================================================
   Game catalogue – edit this file to add / change your games.
   n = name, g = genre, d = description, r = rating,
   android / ios / windows = store or download links (leave "" if not ready).
   A link can also be "storage:games/file.apk" to serve the file from
   Firebase Storage (only logged-in users can fetch it).
   img = optional icon image. By default the site looks for
   assets/images/games/<game-name-as-slug>/icon.png (e.g. pixel-drift/icon.png);
   set img:"assets/images/games/other.jpg" to use a different file.
   If no image is found, a pixel icon is generated automatically.
   age   = age rating shown on the hover card and details (e.g. "3+", "12+").
   shots = screenshot file names inside the game's own folder
           assets/images/games/<slug>/  (shown in the gallery when a card is clicked).
   type  = "roblox" for a Roblox game (then set roblox:"https://www.roblox.com/games/..."); leave it out for a download game.
   price = price in rupees for PREMIUM (paid) games, e.g. price:249. Leave it out (or 0) for free games.
   payLink = optional payment link (Razorpay / Stripe payment link) opened by the Buy button.
   more  = optional longer description for the details card (falls back to d).
   ========================================================== */
window.GAMES = [
  {n:"Pixel Drift",  g:"Racing",    d:"Slide through neon corners in 60-second laps.",            r:4.6, c:["#e8403f","#18d3e8"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Block Garden", g:"Puzzle",    d:"Plant, merge and grow a garden on a tiny grid.",           r:4.8, c:["#18d3e8","#f4f4ff"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Cave Runner",  g:"Arcade",    d:"Dash, jump and dodge through a collapsing cave.",          r:4.4, c:["#8a2be2","#f5b700"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Tiny Kingdom", g:"Strategy",  d:"Build a small kingdom and defend it one wave at a time.",  r:4.7, c:["#8a2be2","#18d3e8"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Star Sorter",  g:"Puzzle",    d:"Sort falling stars into the right colour lanes.",          r:4.5, c:["#e8403f","#8a2be2"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Moss & Mortar",g:"Adventure", d:"Explore a ruined town and bring its tiles back to life.",  r:4.9, c:["#18d3e8","#e8403f"], android:"", ios:"", windows:"", img:"", age:"3+", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Neon Raiders",  g:"Action", d:"Fast side-scrolling shooter with neon bosses.",              r:4.8, c:["#18d3e8","#e8403f"], android:"", ios:"", windows:"", img:"", age:"7+",  price:249, payLink:"", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Dungeon Forge", g:"RPG",    d:"Craft gear and fight through 40 pixel dungeons.",              r:4.9, c:["#8a2be2","#f5b700"], android:"", ios:"", windows:"", img:"", age:"12+", price:399, payLink:"", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Pixel Obby",    g:"Obby",   d:"Race through colourful obstacle courses with your friends.",   r:4.5, c:["#18d3e8","#8a2be2"], img:"", age:"3+", type:"roblox", roblox:"https://www.roblox.com/", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]},
  {n:"Block Tycoon",  g:"Tycoon", d:"Build your block empire and invite friends to your base.",     r:4.6, c:["#e8403f","#f5b700"], img:"", age:"3+", type:"roblox", roblox:"https://www.roblox.com/", shots:["screenshot-1.svg","screenshot-2.svg","screenshot-3.svg"]}
];
