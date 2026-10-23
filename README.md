# Quadra Pixel website

Static multi-page site (no build step). Open `index.html` in a browser or upload the folder to any host.

```
quadra-pixel/
├── index.html        Home
├── games.html        Games + search + install dialog
├── help.html         FAQ, install steps, contact form
├── about.html        Team: friend (left), you (right)
├── css/style.css     All styling / theme colours (see :root)
├── js/main.js        Shared behaviour
├── js/games-data.js  EDIT THIS to add your games and store links
└── assets/images/    logo-icon.svg, logo-full.svg, favicon.svg, team/
```

## Things to edit
- **Games:** `js/games-data.js` (name, genre, description, Android/iOS links, optional icon image).
- **Team photos:** replace `assets/images/team/friend.svg` and `me.svg` with your photos (update the `src` in `about.html` if the extension changes, e.g. `me.jpg`).
- **Names, bios, skills (percentages), tools, links:** `about.html` (the `<article class="profile ...">` blocks).
- **Contact email:** `data-email` on the form in `help.html`.
- **Colours / fonts:** CSS variables at the top of `css/style.css`.
