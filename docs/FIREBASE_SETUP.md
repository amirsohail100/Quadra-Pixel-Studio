# Firebase setup

Until you add keys the site runs in **demo mode** (accounts are kept only in the visitor's browser, no real security).

1. Create a project at https://console.firebase.google.com
2. Add a **Web app** (</> icon) and copy its config into `js/firebase-config.js`.
3. **Authentication > Sign-in method:** enable *Email/Password* (and *Google* if you want the Google button).
4. **Authentication > Settings > Authorized domains:** add your website domain (`localhost` is already allowed).
5. **Firestore Database:** create a database, then publish `firebase/firestore.rules`.
6. *(Optional, real download gate)* **Storage:** upload game files under `games/`, publish `firebase/storage.rules`,
   and put `"storage:games/your-file.apk"` in the matching field of `js/games-data.js`.
7. Run the site from a local server (Firebase needs http, not a file path):
   `python -m http.server 8000` then open http://localhost:8000

Deploy rules with the Firebase CLI: `firebase deploy --only firestore:rules,storage`.

The web `apiKey` is not a secret. Real protection comes from the security rules above.
A plain link in `js/games-data.js` is visible to anyone who views the page source,
so use `storage:` links when downloads must be truly login-only.

Collections used: `users/{uid}` (name, email, createdAt, lastLoginAt) and `downloads` (uid, game, os, at).
