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

## Community games (people uploading their games)

- In Firebase mode a visitor with an account can upload a download game or a Roblox game from **Games > Upload a game / Add Roblox game**.
- Pictures go to Storage (`uploads/<uid>/<gameId>/`), the game goes to the Firestore collection `games` with `status: "pending"`.
- **To approve a game:** Firebase console > Firestore > `games` > open the document > change `status` from `pending` to `approved`. It then appears for everyone. Set it back to `pending` (or delete it) to take it down.
- Check download links before approving: visitors can paste any https link, so look at what it points to.
- Publish the updated rules (`firebase deploy --only firestore:rules,storage`) and enable **Storage** (Build > Storage).
- In demo mode uploads are only saved in that visitor's browser.

## Premium (paid) games

- Give a game a price in `js/games-data.js` (`price:249`). It shows in **Games > Premium** and with a gold Buy button everywhere.
- Money: the site has **no payment processor built in**. Put a Razorpay / Stripe *payment link* in the game's `payLink`. The Buy button opens it.
- Access: after you confirm a payment, add a Firestore document `users/<uid>/purchases/<game name>` (any fields, the document ID must be the game name exactly as in `games-data.js`). Do this by hand or from a payment webhook / Cloud Function. The game then switches from Buy to Install.
- Real protection: upload the game file to Storage at `premium/<game name>/<file>` and use `"storage:premium/<game name>/<file>"` as the download link. The storage rules only let users who own the game download it.
- In demo mode the Buy dialog has an "Unlock (demo)" button so you can test the flow.

