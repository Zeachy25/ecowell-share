const BUCKET = "post-media";

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

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

  const imgUrl = post.photo_path
    ? `${base}/storage/v1/object/public/${BUCKET}/${post.photo_path}`
    : post.place_photo_url || "";

  const title = esc(post.place_name || "EcoWell post");
  const desc = esc(post.caption || post.place_address || "Shared from EcoWell");
  const img = esc(imgUrl);
  const score = post.place_score != null ? `Quiet Score: ${esc(post.place_score)}` : "";

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300");
  res.status(200).send(`<!doctype html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · EcoWell</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${img}">
<meta property="og:type" content="article">
</head>
<body style="font-family:sans-serif;max-width:480px;margin:auto;padding:16px">
  <h2>${title}</h2>
  ${img ? `<img src="${img}" style="width:100%;border-radius:12px">` : ""}
  ${score ? `<p><b>${score}</b></p>` : ""}
  <p>${desc}</p>
  <p style="color:#666">Shared from EcoWell 🌿</p>
</body></html>`);
}
