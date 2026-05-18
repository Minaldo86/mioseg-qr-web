import { supabaseAdmin } from "../../../../lib/supabase-admin";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

function isAdminRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return false;

  const [scheme, encoded] = authHeader.split(" ");
  if (scheme !== "Basic" || !encoded) return false;

  try {
    const decoded = Buffer.from(encoded, "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    if (separatorIndex === -1) return false;

    const username = decoded.slice(0, separatorIndex);
    const password = decoded.slice(separatorIndex + 1);

    return (
      username === process.env.ADMIN_USER &&
      password === process.env.ADMIN_PASSWORD
    );
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const { data, error } = await supabaseAdmin
      .from("admin_action_log")
      .select("id, action_type, target_user_id, qrx_id, amount, note, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return Response.json(
        { error: "Admin-Aktionen konnten nicht geladen werden", details: error.message },
        { status: 500 }
      );
    }

    return Response.json(data ?? []);
  } catch (e: unknown) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
