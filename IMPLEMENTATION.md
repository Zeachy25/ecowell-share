# EcoWell share page + Android App Links

This document lists what was created, what was changed, the tools and packages
used, and what still has to be done manually.

Nothing was pushed to GitHub or Vercel. No SQL was run against Supabase.

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
- `api/post.js` — serverless OG/HTML page. Uses only `SUPABASE_URL` and
  `SUPABASE_ANON_KEY`; calls `get_public_post`; never uses a service role key.
- `public/.well-known/assetlinks.json` — Android App Links verification file.
  Contains package `aar.ecowell.app` and the release + debug SHA-256
  fingerprints found in this workspace.
- `get_public_post.sql` — public, anon-only RPC for the web page.
- `get_post.sql` — authenticated RPC for the in-app `/post/:id` screen.
- `IMPLEMENTATION.md` — this document.

## Files changed

### `D:\EcoWell`

- `lib/core/config.dart` — added
  `const kShareBaseUrl = 'https://<PROJECT>.vercel.app';`
- `lib/features/community/presentation/share_text.dart` — external post share
  is now exactly two lines:
  - `<place name> on EcoWell 🌿` (or `Post on EcoWell 🌿` when empty)
  - `$kShareBaseUrl/post/<post.id>`

  `buildPlaceShareText` and in-app repost actions are unchanged.
- `test/community_share_test.dart` — replaced the old post-share assertions
  with exact-message, two-line, and empty-place fallback tests.
- `pubspec.yaml` / `pubspec.lock` — added `app_links`.
- `android/app/src/main/AndroidManifest.xml` — added an `autoVerify` App Link
  intent filter for `https://your-project.vercel.app/post/`.
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
   It exposes only: post id, caption, place name, place address, place score,
   first photo path, and place photo URL. It does not expose user id, user
   name, email, likes, or comments.
2. `get_post.sql` — needed by the in-app post screen. Only `authenticated`
   can execute it. It wraps the existing `feed_post_json` helper.

After running them, PostgREST reloads its schema (`notify pgrst`).

## Placeholders to replace after Vercel gives you the real URL

- `D:\EcoWell\lib\core\config.dart`
  - `https://<PROJECT>.vercel.app` -> your real Vercel URL.
- `D:\EcoWell\android\app\src\main\AndroidManifest.xml`
  - `android:host="your-project.vercel.app"` -> your real host, without
    `https://`.
- `D:\ecowell-share\public\.well-known\assetlinks.json`
  - Release and debug fingerprints are already filled in.
  - If the app is distributed through Google Play, add the **Play App Signing**
    SHA-256 fingerprint from Play Console > Test and release > Setup >
    App signing. Play installs are signed by Google, not by your local release
    keystore.

## Manual steps

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

## Notes and limits

- The web page uses only the anon key. The service role key is never used.
- Android App Links only open the app when the app is installed, the intent
  filter is present, `assetlinks.json` verifies, and the user has not disabled
  "Open supported links" for EcoWell.
- Messenger/Facebook in-app browsers often ignore App Links and keep the link
  inside their webview. The OG preview still works, but tapping may stay in the
  in-app browser.
- The in-app post screen requires the user to be signed in. A signed-out user
  is sent to login first, then to the pending post after login.
- iOS deep linking would need `apple-app-site-association` and Associated
  Domains. This work is Android-only.
