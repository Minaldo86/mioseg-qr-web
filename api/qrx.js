export default async function handler(req, res) {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Missing id" });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return res.status(500).json({ error: "Server not configured" });
    }

    const headers = {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    };

    // Entry laden
    const entryUrl =
      `${SUPABASE_URL}/rest/v1/qr_x_entries?` +
      `id=eq.${encodeURIComponent(id)}` +
      `&select=id,owner_user_id,title,description,news,location_name,location_lat,location_lng,logo_url`;

    const entryResp = await fetch(entryUrl, { headers });

    if (!entryResp.ok) {
      const t = await entryResp.text().catch(() => "");
      return res.status(502).json({ error: "Supabase error (entries)", detail: t });
    }

    const entryArr = await entryResp.json();
    const entry = Array.isArray(entryArr) ? entryArr[0] : null;

    if (!entry) {
      // Wichtig: diese Meldung willst du im Browser anzeigen
      return res.status(404).json({ error: "QRX_NOT_FOUND" });
    }

    // Media laden
    const mediaUrl =
      `${SUPABASE_URL}/rest/v1/qr_x_media?` +
      `qrx_id=eq.${encodeURIComponent(id)}` +
      `&select=id,qrx_id,type,url,filename,bytes`;

    const mediaResp = await fetch(mediaUrl, { headers });

    if (!mediaResp.ok) {
      const t = await mediaResp.text().catch(() => "");
      return res.status(502).json({ error: "Supabase error (media)", detail: t });
    }

    const media = await mediaResp.json();

    // Antwort
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");
    return res.status(200).json({ entry, media });
  } catch (e) {
    console.error("api/qrx error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}
