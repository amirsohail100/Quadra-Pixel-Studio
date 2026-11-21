One folder per game
===================
assets/images/games/<game-name>/

The folder name is the game name in lowercase with hyphens (no spaces):

  Pixel Drift    -> pixel-drift/
  Block Garden   -> block-garden/
  Moss & Mortar  -> moss-mortar/

If your folder has a different name (for example "block garden" with a space),
tell the site in js/games-data.js:   folder:"block garden"

What goes inside a game folder
------------------------------
  index.html          the game itself. This is the file that runs when someone
                      clicks Play. It can load its own game.js, css, sounds...
  game.js, game.html  any other files the game needs (use relative paths)
  logo.svg            game icon, shown on the card (or set img:"..." in games-data.js)
  screenshot-1.svg    screenshots (16:9), listed in games-data.js as
  screenshot-2.svg    shots:["screenshot-1.svg","screenshot-2.svg", ...]

Turning on the Play button
--------------------------
In js/games-data.js add  play:"index.html"  to the game. A "Play" button then
runs the game inside the site (full screen button and "New tab" included).
Games without play:"..." only get Install.

Rules for browser games
-----------------------
- Use relative paths inside the game (src="game.js", not "/game.js").
- The game runs inside a frame on your own site, so keep it self-contained.
- Free games: anyone can Play without an account. Paid games: Play appears after the visitor owns the game.
- Test it by opening the game's index.html directly in the browser first.

New game? Add a line in js/games-data.js and create a folder with the same name here.
