One folder per game
===================
assets/images/games/<game-name>/

The folder name is the game name in lowercase with hyphens:

  Pixel Drift    -> pixel-drift/
  Block Garden   -> block-garden/
  Cave Runner    -> cave-runner/
  Tiny Kingdom   -> tiny-kingdom/
  Star Sorter    -> star-sorter/
  Moss & Mortar  -> moss-mortar/

Inside each folder put:

  icon.png                 square game icon (e.g. 256x256). Shown on the card.
                           Without it a pixel icon is generated.
  screenshot-1.png ...     your screenshots (16:9, e.g. 1280x720).

Then list the screenshot file names in js/games-data.js, for example:

  shots:["screenshot-1.png","screenshot-2.png","screenshot-3.png"]

The screenshots appear in the slider that opens when a card is clicked
(mouse wheel, arrow buttons, dots and the keyboard arrows all work).
The screenshot-*.svg files that ship in each folder are only placeholders:
delete them or replace them with your own pictures.

New game? Add a line in js/games-data.js and create a folder with the same
slug name here.
