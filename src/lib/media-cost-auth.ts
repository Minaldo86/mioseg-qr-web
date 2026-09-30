import { timingSafeEqual } from "node:crypto";
function equal(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function isMediaCostAdmin(req: Request) {
  const user = process.env.ADMIN_USER, pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false;
  const match = /^Basic\s+(\S+)$/i.exec(req.headers.get("authorization") ?? "");
  if (!match) return false;
  try {
    const decoded = Buffer.from(match[1], "base64").toString("utf8");
    const i = decoded.indexOf(":");
    return i >= 0 && equal(decoded.slice(0, i), user) && equal(decoded.slice(i + 1), pass);
  } catch { return false; }
}
export function isMediaCostCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  return !!secret && equal(req.headers.get("authorization") ?? "", `Bearer ${secret}`);
}
