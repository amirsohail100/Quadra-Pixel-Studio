# Quadra Pixel website

Static multi-page site (no build step).

**Run it:** from this folder run `python -m http.server 8000` and open http://localhost:8000
(a local server is needed for sign-in; plain pages also open by double-clicking `index.html`).

```
quadra-pixel/
├── index.html          Home (+ sign-up call to action)
├── games.html          Games, search, genre filter, install dialog (Android / iPhone / Windows)
├── help.html           FAQ, install steps, contact form
├── downloads.html      Download history (needs an account)
├── library.html        Saved / downloaded games
├── settings.html       Theme, banner autoplay, animations, account, clear data
├── about.html          Team: friend (left), you (right)
├── css/style.css       Styling + dark/light theme variables (see :root)
├── js/main.js          Page behaviour
├── js/theme.js         Dark / light / system theme + reduce-motion
├── js/store.js         Library + download history on this device
├── js/game-ui.js       Game cards, hover preview, screenshot gallery, install flow
├── js/library.js       Library and Downloads pages
├── js/settings.js      Settings page
├── js/auth.js          Accounts (Firebase, or demo mode without keys)
├── js/auth-ui.js       Sign up / log in dialog, header account area
├── js/firebase-config.js   PASTE YOUR FIREBASE KEYS HERE
├── js/games-data.js    EDIT THIS: games, links, ratings
├── js/banners-data.js  EDIT THIS: home page banners (text, picture, button)
├── js/banners.js       Home banner slider (auto, wheel, swipe)
├── assets/images/      logo files, team photos, banners/, games/<game-name>/ (icon + screenshots per game)
├── firebase/           Firestore + Storage security rules
├── firebase.json       Firebase CLI config
└── docs/FIREBASE_SETUP.md
```

## Things to edit
- **Games:** `js/games-data.js` (name, genre, description, Android / iOS / Windows links).
- **Home banners:** `js/banners-data.js`; put your banner pictures (1200x600) in `assets/images/banners/`.
- **Game icon + screenshots:** one folder per game in `assets/images/games/<game-name>/` (`icon.png` + screenshots), then list the screenshot names in `js/games-data.js` (see the README.txt there).
- **Team photos:** replace `assets/images/team/friend.svg` and `me.svg` (update `src` in `about.html` if the extension changes).
- **Names, bios, skills, links:** `about.html`.
- **Contact email:** `data-email` on the form in `help.html`.
- **Firebase accounts and download gate:** follow `docs/FIREBASE_SETUP.md`.
- **Colours / fonts:** CSS variables at the top of `css/style.css` (dark) and the `[data-theme="light"]` block.
