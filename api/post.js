const BUCKET = "post-media";
const APK_URL = ""; // optional: paste your APK download link to show a "Get the EcoWell app" button

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;

export default async function handler(req, res) {
  const { id } = req.query;
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  const r = await fetch(`${base}/rest/v1/rpc/get_public_post`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_id: id }),
  });
  const post = r.ok ? await r.json() : null;

  if (!post) {
    res.status(404).send("Post not found");
    return;
  }

  const storageUrl = (path) =>
    `${base}/storage/v1/object/public/${BUCKET}/${String(path).split("/").map(encodeURIComponent).join("/")}`;

  const paths = (Array.isArray(post.photo_paths) ? post.photo_paths : []).filter(Boolean);
  if (paths.length === 0 && post.photo_path) paths.push(post.photo_path);

  const images = paths.map(storageUrl);
  if (images.length === 0 && post.place_photo_url) images.push(post.place_photo_url);

  const firstImg = images[0] || "";
  const title = esc(post.place_name || "EcoWell post");
  const address = esc(post.place_address || "");
  const caption = esc(post.caption || "");
  const metaDesc = esc(String(post.caption || post.place_address || "Shared from EcoWell").replace(/\s+/g, " ").trim());
  const img = esc(firstImg);
  const authorName = String(post.author_name || "").trim();
  const author = esc(authorName || "EcoWell user");
  const initial = esc((authorName || "E").charAt(0).toUpperCase());
  const avatar = /^https?:\/\//.test(post.author_avatar || "") ? esc(post.author_avatar) : "";
  const score = post.place_score != null ? Number(post.place_score).toFixed(1) : "";
  const likes = Number(post.like_count) || 0;
  const comments = Number(post.comment_count) || 0;
  const shares = Number(post.share_count) || 0;
  const mapUrl =
    post.lat != null && post.lng != null
      ? esc(`https://www.google.com/maps/search/?api=1&query=${post.lat},${post.lng}`)
      : "";

  const safeId = encodeURIComponent(String(id));
  const proto = String(req.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "ecowellaar.vercel.app").split(",")[0].trim();
  const canonical = `${proto}://${host}/post/${safeId}`;
  const intentUrl = `intent://${host}/post/${safeId}#Intent;scheme=https;package=aar.ecowell.app;S.browser_fallback_url=${encodeURIComponent(canonical)};end`;

  let when = "";
  if (post.created_at) {
    const d = new Date(post.created_at);
    const datePart = d.toLocaleDateString("en-US", {
      month: "long", day: "numeric", year: "numeric", timeZone: "Asia/Manila",
    });
    const timePart = d.toLocaleTimeString("en-US", {
      hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila",
    });
    when = esc(`${datePart} at ${timePart}`);
  }

  const galleryClass = images.length === 1 ? "gallery single" : images.length === 2 ? "gallery pair" : "gallery many";
  const gallery = images.length
    ? `<div class="${galleryClass}">${images.map((src, i) =>
        `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${title} photo ${i + 1}" loading="${i === 0 ? "eager" : "lazy"}"></a>`
      ).join("")}</div>`
    : `<div class="photo"></div>`;

  const ogImage = firstImg
    ? `<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="${title}">
<meta name="twitter:image" content="${img}">`
    : "";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300");
  res.status(200).send(`<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · EcoWell</title>
<meta name="description" content="${metaDesc}">
<meta name="theme-color" content="#f4f9f5">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:type" content="article">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:site_name" content="EcoWell">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${metaDesc}">
${ogImage}
<style>
  *{box-sizing:border-box}
  :root{--bg:#f4f9f5;--ink:#10231a;--muted:#5c6b63;--green:#1f9d6b;--pill:#fdf1c4;--star:#f5a623;--line:#e6eee8}
  body{margin:0;background:var(--bg);color:var(--ink);font-family:Roboto,system-ui,-apple-system,"Segoe UI",sans-serif}
  .wrap{max-width:480px;margin:0 auto;padding:12px 12px 28px}
  .brand{font-size:22px;font-weight:600;padding:10px 6px 14px}
  .card{background:#fff;border-radius:24px;box-shadow:0 2px 14px rgba(16,35,26,.08);overflow:hidden}
  .head{display:flex;gap:12px;align-items:flex-start;padding:16px 16px 4px}
  .avatar{width:56px;height:56px;border-radius:50%;border:3px solid #f08a3c;object-fit:cover;flex:none;
    background:#cfe9dc;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:22px;color:#1f6d4d}
  .who{flex:1;min-width:0}
  .name{font-weight:700;font-size:18px;line-height:1.2}
  .date{color:var(--muted);font-size:14px;margin-top:3px}
  .loc{display:flex;align-items:center;gap:6px;margin-top:5px;font-size:14px;color:var(--muted);min-width:0}
  .loc b{color:var(--ink);white-space:nowrap}
  .loc span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .rating{background:var(--pill);border-radius:999px;padding:6px 12px;font-weight:700;font-size:15px;white-space:nowrap}
  .rating i{color:var(--star);font-style:normal;margin-right:4px}
  .caption{padding:10px 16px 14px;font-size:17px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
  .gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:0 16px 8px}
  .gallery.single{grid-template-columns:1fr}
  .gallery.pair{grid-template-columns:repeat(2,1fr)}
  .gallery.many a:first-child{grid-column:1/-1}
  .gallery a{display:block;min-width:0}
  .gallery img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:16px;
    background:linear-gradient(135deg,#bfe8d2,#7fcfa6)}
  .photo{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:20px;
    background:linear-gradient(135deg,#bfe8d2,#7fcfa6)}
  .stats{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:14px 18px;color:var(--muted);font-size:15px}
  .stats .l{display:flex;align-items:center;gap:6px;min-width:0}
  .actions{padding:0 16px 16px}
  .btn{display:block;text-align:center;text-decoration:none;font-weight:600;border-radius:14px;padding:13px;margin-top:10px}
  .btn.ghost{background:#e6f6ee;color:#17724f}
  .btn.primary{background:var(--green);color:#fff}
  .foot{text-align:center;color:var(--muted);font-size:13px;margin:18px 0 0}
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">EcoWell 🌿</div>
    <div class="card">
      <div class="head">
        ${avatar
          ? `<img class="avatar" src="${avatar}" alt="${author}">`
          : `<div class="avatar">${initial}</div>`}
        <div class="who">
          <div class="name">${author}</div>
          ${when ? `<div class="date">${when}</div>` : ""}
          <div class="loc">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1f9d6b" style="flex:none"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
            <b>${title}</b>${address ? `<span>· ${address}</span>` : ""}
          </div>
        </div>
        ${score ? `<div class="rating"><i>★</i>${score}</div>` : ""}
      </div>
      ${caption ? `<div class="caption">${caption}</div>` : ""}
      ${gallery}
      <div class="stats">
        <span class="l">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#e0457b" style="flex:none"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.7 5 6 5c2 0 3.4 1.1 4 2.3h4c.6-1.2 2-2.3 4-2.3 3.3 0 5.1 3.4 3.6 6.8C19.5 16.4 12 21 12 21z"/></svg>
          ${plural(likes, "like")}
        </span>
        <span class="l">${plural(comments, "comment")}</span>
        <span class="l">${plural(shares, "share")}</span>
      </div>
      <div class="actions" style="padding-top:0">
        ${mapUrl ? `<a class="btn ghost" href="${mapUrl}" target="_blank" rel="noopener">View on map</a>` : ""}
        <a id="open-app" class="btn primary" href="${esc(intentUrl)}" hidden>Open in EcoWell</a>
        ${APK_URL ? `<a class="btn ghost" href="${esc(APK_URL)}">Get the EcoWell app</a>` : ""}
      </div>
    </div>
    <p class="foot">Shared from EcoWell 🌿</p>
  </div>
  <script>
    if (/Android/i.test(navigator.userAgent)) {
      var a = document.getElementById("open-app");
      if (a) a.hidden = false;
    }
  </script>
</body></html>`);
}
