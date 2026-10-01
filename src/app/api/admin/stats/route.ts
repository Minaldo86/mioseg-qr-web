import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

function getBerlinDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value || 0);

  return { year: get("year"), month: get("month"), day: get("day") };
}

function berlinLocalMidnightToUtc(year: number, month: number, day: number) {
  // Start with UTC midnight and correct it to the UTC instant that represents
  // 00:00 in Europe/Berlin. Two passes also handle DST transitions safely.
  let guess = Date.UTC(year, month - 1, day, 0, 0, 0);

  for (let i = 0; i < 2; i += 1) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));

    const get = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value || 0);

    const representedAsUtc = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );

    guess -= representedAsUtc - Date.UTC(year, month - 1, day, 0, 0, 0);
  }

  return new Date(guess);
}

async function countProfiles(
  startIso?: string,
  endIso?: string,
) {
  let query = supabaseAdmin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (startIso) {
    query = query.gte("created_at", startIso);
  }

  if (endIso) {
    query = query.lt("created_at", endIso);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function countQrx(type?: "normal" | "business") {
  let query = supabaseAdmin
    .from("qr_x_entries")
    .select("id", { count: "exact", head: true });

  if (type) {
    query = query.eq("type", type);
  }

  const { count, error } = await query;

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function loadAllProfileCities() {
  const pageSize = 1000;
  let from = 0;
  const rows: Array<{ city: string | null }> = [];

  while (true) {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("city")
      .not("city", "is", null)
      .range(from, from + pageSize - 1);

    if (error) throw error;

    const batch = (data ?? []) as Array<{ city: string | null }>;
    rows.push(...batch);

    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return rows;
}

export async function GET(req: Request) {
  try {
    if (!isAdminRequest(req)) {
      return unauthorized();
    }

    const now = new Date();
    const berlin = getBerlinDateParts(now);

    const todayStart = berlinLocalMidnightToUtc(
      berlin.year,
      berlin.month,
      berlin.day,
    );

    const tomorrowLocal = new Date(Date.UTC(berlin.year, berlin.month - 1, berlin.day + 1));
    const tomorrowParts = {
      year: tomorrowLocal.getUTCFullYear(),
      month: tomorrowLocal.getUTCMonth() + 1,
      day: tomorrowLocal.getUTCDate(),
    };
    const tomorrowStart = berlinLocalMidnightToUtc(
      tomorrowParts.year,
      tomorrowParts.month,
      tomorrowParts.day,
    );

    const sevenDaysAgoLocal = new Date(
      Date.UTC(berlin.year, berlin.month - 1, berlin.day - 6),
    );
    const sevenDaysStart = berlinLocalMidnightToUtc(
      sevenDaysAgoLocal.getUTCFullYear(),
      sevenDaysAgoLocal.getUTCMonth() + 1,
      sevenDaysAgoLocal.getUTCDate(),
    );

    const monthStart = berlinLocalMidnightToUtc(
      berlin.year,
      berlin.month,
      1,
    );

    const [
      usersTotal,
      usersToday,
      usersLast7Days,
      usersThisMonth,
      qrxTotal,
      qrxNormal,
      qrxBusiness,
      cityRows,
    ] = await Promise.all([
      countProfiles(),
      countProfiles(
        todayStart.toISOString(),
        tomorrowStart.toISOString(),
      ),
      countProfiles(
        sevenDaysStart.toISOString(),
        tomorrowStart.toISOString(),
      ),
      countProfiles(
        monthStart.toISOString(),
        tomorrowStart.toISOString(),
      ),
      countQrx(),
      countQrx("normal"),
      countQrx("business"),
      loadAllProfileCities(),
    ]);

    const cityMap = new Map<string, { label: string; count: number }>();

    for (const row of cityRows) {
      const city = String(row.city || "").trim().replace(/\s+/g, " ");
      if (!city) continue;

      const key = city.toLocaleLowerCase("de-DE");
      const current = cityMap.get(key);

      if (current) {
        current.count += 1;
      } else {
        cityMap.set(key, { label: city, count: 1 });
      }
    }

    const usersWithCity = Array.from(cityMap.values()).reduce(
      (sum, item) => sum + item.count,
      0,
    );

    const cities = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, "de"))
      .slice(0, 30)
      .map((item) => ({
        city: item.label,
        count: item.count,
        percent:
          usersWithCity > 0
            ? Math.round((item.count / usersWithCity) * 1000) / 10
            : 0,
      }));

    return Response.json(
      {
        users: {
          total: usersTotal,
          today: usersToday,
          last7Days: usersLast7Days,
          thisMonth: usersThisMonth,
        },
        qrx: {
          total: qrxTotal,
          normal: qrxNormal,
          business: qrxBusiness,
        },
        cities,
        usersWithCity,
        updatedAt: now.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error: unknown) {
    console.error("admin stats GET failed:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Statistiken konnten nicht geladen werden.",
      },
      { status: 500 },
    );
  }
}
