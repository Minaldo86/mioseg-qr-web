export function formatBytes(value?: number | null): string {
  const bytes = Number(value ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  const digits = index === 0 ? 0 : size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(digits).replace(".", ",")} ${units[index]}`;
}

export function formatNumber(value?: number | null): string {
  return new Intl.NumberFormat("de-DE").format(Number(value ?? 0));
}

export function formatCost(value?: number | null): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value ?? 0) / 100);
}
