export type CostSettings = {
  budget_eur: number; warn_percent: number; critical_percent: number;
  usd_to_eur: number; worker_plan: "unknown" | "free" | "paid";
  email_enabled: boolean; email_to: string;
};
export type CloudflareRow = {
  sum?: Record<string, number>; max?: Record<string, number>;
  dimensions?: Record<string, string>;
};
const CLASS_A = new Set(["listbuckets", "putbucket", "listobjects", "putobject", "copyobject", "completemultipartupload", "createmultipartupload", "lifecyclestoragetiertransition", "listmultipartuploads", "uploadpart", "uploadpartcopy", "listparts", "putbucketencryption", "putbucketcors", "putbucketlifecycleconfiguration"]);
const CLASS_B = new Set(["headbucket", "headobject", "getobject", "usagesummary", "getbucketencryption", "getbucketlocation", "getbucketcors", "getbucketlifecycleconfiguration"]);
const FREE = new Set(["deleteobject", "deletebucket", "abortmultipartupload"]);
export function nonnegative(value: unknown) {
  const n = Number(value); return Number.isFinite(n) && n >= 0 ? n : 0;
}
export function classifyOperations(rows: CloudflareRow[]) {
  let classA = 0, classB = 0, free = 0, unknown = 0;
  for (const row of rows) {
    const name = (row.dimensions?.actionType ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const count = nonnegative(row.sum?.requests);
    if (CLASS_A.has(name)) classA += count;
    else if (CLASS_B.has(name)) classB += count;
    else if (FREE.has(name)) free += count;
    else unknown += count;
  }
  return { classA, classB, free, unknown };
}
export function estimateCosts(input: { classA: number; classB: number; unknown: number; storageBytes: number; workerRequests: number }, settings: CostSettings) {
  // Gross model intentionally does not allocate account-wide free allowances.
  // Current storage projected for a whole month, not measured GB-month usage.
  const r2OperationsUsd = ((input.classA + input.unknown) / 1e6) * 4.5 + (input.classB / 1e6) * 0.36;
  const storageRunRateUsd = input.storageBytes / 1e9 * 0.015;
  const workerRequestsUsd = settings.worker_plan === "paid" ? 5 + input.workerRequests / 1e6 * 0.3 : settings.worker_plan === "free" ? 0 : null;
  const subtotalEur = (r2OperationsUsd + storageRunRateUsd + (workerRequestsUsd ?? 0)) * settings.usd_to_eur;
  return { r2OperationsUsd, storageRunRateUsd, workerRequestsUsd, subtotalEur, budgetPercent: subtotalEur / settings.budget_eur * 100, complete: false as const };
}
export function validateSettings(value: unknown): CostSettings {
  if (!value || typeof value !== "object") throw new Error("Ungültige Einstellungen.");
  const v = value as Record<string, unknown>;
  const finite = (key: string, min: number, max: number, integer = false) => {
    const n = Number(v[key]);
    if (!Number.isFinite(n) || n < min || n > max || (integer && !Number.isInteger(n))) throw new Error(`Ungültiger Wert: ${key}`);
    return n;
  };
  const warn = finite("warn_percent", 1, 99, true), critical = finite("critical_percent", 2, 100, true);
  if (critical <= warn) throw new Error("Die kritische Schwelle muss über der Warnschwelle liegen.");
  if (!["unknown", "free", "paid"].includes(String(v.worker_plan))) throw new Error("Ungültiger Worker-Tarif.");
  if (typeof v.email_enabled !== "boolean") throw new Error("Ungültige E-Mail-Einstellung.");
  const email = typeof v.email_to === "string" ? v.email_to.trim() : "";
  if ((email || v.email_enabled) && (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(email) || email.length > 254)) throw new Error("Bitte eine gültige Betreiber-E-Mail-Adresse angeben.");
  return { budget_eur: finite("budget_eur", 0.01, 100000), usd_to_eur: finite("usd_to_eur", 0.01, 10), warn_percent: warn, critical_percent: critical, worker_plan: v.worker_plan as CostSettings["worker_plan"], email_enabled: v.email_enabled, email_to: email };
}
