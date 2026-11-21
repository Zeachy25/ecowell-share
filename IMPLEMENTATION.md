# EcoWell share page + Android App Links

This document lists what was created, what was changed, the tools and packages
used, and what still has to be done manually.

<<<<<<< HEAD
The share page is deployed at `https://ecowellaar.vercel.app`. The updated
`get_public_post.sql` still has to be run in Supabase before the page can show
all photos and the new counts. This update does not commit or push anything.
=======
Nothing was pushed to GitHub or Vercel. No SQL was run against Supabase.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827

## Tools used

- Flutter 3.41.2 (stable), Dart 3.11.0
- Git 2.48.1 for Windows
- PowerShell 5.1
- `keytool` from the local JDK (read signing-certificate SHA-256 fingerprints)
- Supabase SQL Editor (manual, for the two SQL files)
- GitHub (manual, repository + push)
- Vercel (manual, project import + environment variables + deploy)
- Facebook Sharing Debugger (manual, refresh the preview card)

## Packages used

Added to `D:\EcoWell`:

- `app_links: ^7.0.0` — receives Android App Links and custom-scheme links.

Already present and reused:

- `supabase_flutter` — anon/publishable key client in the app; RPC calls.
- `flutter_riverpod` — `ConsumerStatefulWidget` / repository provider.
- `go_router` — `/post/:id` route and redirects.
- `share_plus` — existing external share sheet (unchanged).
- `flutter_test` — updated post-share tests.

## Files created

### `D:\EcoWell`

- `lib/core/deep_links.dart` — parses `https://<host>/post/<id>`, stores a
  pending route for signed-out users, and consumes it after login.
- `lib/features/community/presentation/post_detail_screen.dart` — in-app
  `/post/:id` screen. Loads one post, shows the existing `PostCard`, and
  supports like, comments, share, delete, and report.

### `D:\ecowell-share`

- `package.json` — `{ "type": "module" }`.
- `vercel.json` — rewrites `/post/:id` to `/api/post?id=:id`.
- `.gitignore` — ignores `node_modules` and `.vercel`.
<<<<<<< HEAD
- `api/post.js` — serverless HTML page with an all-photo gallery, author and
  place details, rating, date, likes/comments/shares, Open Graph/Twitter tags,
  and an Android "Open in EcoWell" intent button. Uses only `SUPABASE_URL` and
=======
- `api/post.js` — serverless OG/HTML page. Uses only `SUPABASE_URL` and
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
  `SUPABASE_ANON_KEY`; calls `get_public_post`; never uses a service role key.
- `public/.well-known/assetlinks.json` — Android App Links verification file.
  Contains package `aar.ecowell.app` and the release + debug SHA-256
  fingerprints found in this workspace.
<<<<<<< HEAD
- `get_public_post.sql` — public, anon-only RPC for the web page. Returns
  author name/avatar, caption, created_at, place name/address/score, lat/lng,
  first photo path, all photo paths, place photo URL, and like/comment/share
  counts.
=======
- `get_public_post.sql` — public, anon-only RPC for the web page.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
- `get_post.sql` — authenticated RPC for the in-app `/post/:id` screen.
- `IMPLEMENTATION.md` — this document.

## Files changed

### `D:\EcoWell`

<<<<<<< HEAD
- `lib/core/config.dart` — `const kShareBaseUrl = 'https://ecowellaar.vercel.app';`
=======
- `lib/core/config.dart` — added
  `const kShareBaseUrl = 'https://<PROJECT>.vercel.app';`
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
- `lib/features/community/presentation/share_text.dart` — external post share
  is now exactly two lines:
  - `<place name> on EcoWell 🌿` (or `Post on EcoWell 🌿` when empty)
  - `$kShareBaseUrl/post/<post.id>`

  `buildPlaceShareText` and in-app repost actions are unchanged.
- `test/community_share_test.dart` — replaced the old post-share assertions
  with exact-message, two-line, and empty-place fallback tests.
- `pubspec.yaml` / `pubspec.lock` — added `app_links`.
- `android/app/src/main/AndroidManifest.xml` — added an `autoVerify` App Link
<<<<<<< HEAD
  intent filter for `https://ecowellaar.vercel.app/post/`.
=======
  intent filter for `https://your-project.vercel.app/post/`.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
- `lib/main.dart` — initializes `AppLinks`, handles the initial link, and
  handles links received while the app is running.
- `lib/core/router.dart` — added `/post/:id`, and applies a pending deep link
  after login.
- `lib/features/auth/presentation/splash_screen.dart` — sends a signed-in user
  to the pending post instead of `/home`.
- `lib/features/community/data/community_repository.dart` — added
  `fetchPost(postId)` using the new `get_post` RPC.

## SQL to review and run yourself

Run both files in Supabase Dashboard > SQL Editor > New query:

1. `get_public_post.sql` — needed by the Vercel page. `anon` can execute it.
<<<<<<< HEAD
   It exposes the post id, caption, created_at, author name/avatar, place
   name/address/score, lat/lng, first photo path, all photo paths, place photo
   URL, and like/comment/share counts. `share_count` counts in-app reposts
   only; external Messenger/WhatsApp shares are not tracked. It does not expose
   user id or email.
=======
   It exposes only: post id, caption, place name, place address, place score,
   first photo path, and place photo URL. It does not expose user id, user
   name, email, likes, or comments.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
2. `get_post.sql` — needed by the in-app post screen. Only `authenticated`
   can execute it. It wraps the existing `feed_post_json` helper.

After running them, PostgREST reloads its schema (`notify pgrst`).

<<<<<<< HEAD
## Host and fingerprints

- `D:\EcoWell\lib\core\config.dart` — `kShareBaseUrl` is
  `https://ecowellaar.vercel.app`.
- `D:\EcoWell\android\app\src\main\AndroidManifest.xml` — App Link host is
  `ecowellaar.vercel.app` (no `https://`).
- `D:\ecowell-share\public\.well-known\assetlinks.json` — package
  `aar.ecowell.app`, release fingerprint, and debug fingerprint are filled in.
=======
## Placeholders to replace after Vercel gives you the real URL

- `D:\EcoWell\lib\core\config.dart`
  - `https://<PROJECT>.vercel.app` -> your real Vercel URL.
- `D:\EcoWell\android\app\src\main\AndroidManifest.xml`
  - `android:host="your-project.vercel.app"` -> your real host, without
    `https://`.
- `D:\ecowell-share\public\.well-known\assetlinks.json`
  - Release and debug fingerprints are already filled in.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
  - If the app is distributed through Google Play, add the **Play App Signing**
    SHA-256 fingerprint from Play Console > Test and release > Setup >
    App signing. Play installs are signed by Google, not by your local release
    keystore.

## Manual steps

<<<<<<< HEAD
1. **Run the updated SQL.** In Supabase Dashboard > SQL Editor, run
   `get_public_post.sql`, then `get_post.sql` (if you have not run the
   authenticated one yet). This adds `photo_paths`, `created_at`, author
   details, and like/comment/share counts to the public page.
2. **Make `post-media` public.** Supabase Dashboard > Storage > `post-media`
   > bucket settings > enable public bucket. This makes every post photo
   readable by URL, which is required for the gallery and `og:image`. Test with
   an incognito window by opening one post photo URL.
3. **Deploy the web update.** From `D:\ecowell-share`, commit and push the
   updated `api/post.js`, `get_public_post.sql`, and this document, or redeploy
   the project from your existing Vercel connection. Vercel serves
   `https://ecowellaar.vercel.app`.
4. **Confirm environment variables.** In Vercel, `SUPABASE_URL` and
   `SUPABASE_ANON_KEY` must be present. Use only the anon key; never add the
   service role key.
5. **Test the web page.** Open
   `https://ecowellaar.vercel.app/post/85359330-2ea3-4135-ae4d-285cc67bb464`
   after the SQL and deploy. It should show all three photos, the author, the
   rating/date, and like/comment/share counts. Then open
   `https://ecowellaar.vercel.app/.well-known/assetlinks.json` and confirm it
   returns JSON with HTTP 200 (no redirect).
6. **Test App Links.** Rebuild and reinstall the app after the manifest host
   change. Then:
   ```powershell
   C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe shell pm verify-app-links --reverify aar.ecowell.app
   C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe shell pm get-app-links aar.ecowell.app
   C:\Users\User\AppData\Local\Android\Sdk\platform-tools\adb.exe shell am start -a android.intent.action.VIEW -d "https://ecowellaar.vercel.app/post/85359330-2ea3-4135-ae4d-285cc67bb464"
   ```
   Expected: `ecowellaar.vercel.app: verified`.
7. **Test the social preview.** Paste the link into Messenger. If the card is
   empty or stale, use Facebook Sharing Debugger > Scrape Again. Messenger
   shows one cover image even though the page shows the full gallery.
8. **Rebuild the APK.** After the host change:
   ```powershell
   cd D:\EcoWell
   flutter build apk --debug
=======
1. **Run the SQL.** In Supabase Dashboard > SQL Editor, run
   `get_public_post.sql`, then `get_post.sql`.
2. **Make `post-media` public.** Supabase Dashboard > Storage > `post-media`
   > bucket settings > enable public bucket. This makes every post photo
   readable by URL, which is required for the `og:image` preview and the web
   page image. Test with an incognito window by opening one post photo URL.
3. **Create the GitHub repository.** Create an empty repo named
   `ecowell-share` (no README, no .gitignore). Then from PowerShell:
   ```powershell
   cd D:\ecowell-share
   git remote add origin https://github.com/<your-username>/ecowell-share.git
   git push -u origin main
   ```
4. **Import into Vercel.** Sign in with GitHub > Add New > Project > import
   `ecowell-share`. Add environment variables:
   - `SUPABASE_URL` = `https://exempcepcoqusewmwjuw.supabase.co`
   - `SUPABASE_ANON_KEY` = your Supabase anon/publishable key

   Use only the anon key. Never add the service role key. Deploy.
5. **Test the web page.** Open
   `https://<PROJECT>.vercel.app/post/<a real post id>` in a browser. Then open
   `https://<PROJECT>.vercel.app/.well-known/assetlinks.json` and confirm it
   returns JSON with HTTP 200 (no redirect).
6. **Test App Links.** Rebuild and reinstall the app after replacing the host
   in `config.dart` and `AndroidManifest.xml`. Then:
   ```powershell
   adb shell pm get-app-links aar.ecowell.app
   adb shell am start -a android.intent.action.VIEW -d "https://<PROJECT>.vercel.app/post/<real-id>"
   ```
   If verification failed:
   ```powershell
   adb shell pm verify-app-links --reverify aar.ecowell.app
   ```
7. **Test the social preview.** Paste the link into Messenger. If the card is
   empty or stale, use Facebook Sharing Debugger > Scrape Again.
8. **Rebuild the APK.** Replace `kShareBaseUrl` with the real Vercel URL, then:
   ```powershell
   cd D:\EcoWell
   flutter build apk --release
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
   ```
   Existing installs keep opening the browser until they receive the new APK
   with the App Link intent filter.

## Test results

- `flutter test` in `D:\EcoWell`: **All tests passed** (62 tests).
- New tests:
  - post share text is exactly the place title plus the public link;
  - post share text is exactly two lines;
  - empty place name falls back to `Post on EcoWell 🌿`.
- `flutter analyze`: no errors from the new code. It reported 2 pre-existing
  info-level issues in `lib/features/map/presentation/map_screen.dart`
  (`unnecessary_import`, `unnecessary_underscores`).
<<<<<<< HEAD
- `node --check api/post.js`: passed.
- Mock render test with three `photo_paths`: passed (3 gallery images, author,
  5 likes, 1 comment, 2 shares, Open in EcoWell intent, correct `og:image` and
  `og:url`).
=======
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827

## Notes and limits

- The web page uses only the anon key. The service role key is never used.
- Android App Links only open the app when the app is installed, the intent
<<<<<<< HEAD
  filter is present, `assetlinks.json` verifies for
  `ecowellaar.vercel.app`, and the user has not disabled "Open supported links"
  for EcoWell.
- Messenger/Facebook in-app browsers often ignore App Links and keep the link
  inside their webview. The page includes an "Open in EcoWell" intent button as
  a fallback.
- Messenger/Facebook preview cards show one cover image even though the web
  page shows all photos.
- `share_count` counts in-app reposts only. External shares (Messenger,
  WhatsApp, copy link) are not tracked without a separate analytics table and
  endpoint.
=======
  filter is present, `assetlinks.json` verifies, and the user has not disabled
  "Open supported links" for EcoWell.
- Messenger/Facebook in-app browsers often ignore App Links and keep the link
  inside their webview. The OG preview still works, but tapping may stay in the
  in-app browser.
>>>>>>> 62a3f34e002798b510258f9769cf10e71354d827
- The in-app post screen requires the user to be signed in. A signed-out user
  is sent to login first, then to the pending post after login.
- iOS deep linking would need `apple-app-site-association` and Associated
  Domains. This work is Android-only.
