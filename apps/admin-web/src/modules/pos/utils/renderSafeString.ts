export const renderSafeString = (val: any, fallback: string = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    const trimmed = val.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof val === "number" || typeof val === "boolean") {
    return String(val);
  }
  if (typeof val === "object") {
    const candidate =
      val.name ||
      val.label ||
      val.title ||
      val.phone ||
      val.address ||
      val.street ||
      val.customer_name ||
      val.customer_phone ||
      "";
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
    return fallback;
  }
  return fallback;
};
