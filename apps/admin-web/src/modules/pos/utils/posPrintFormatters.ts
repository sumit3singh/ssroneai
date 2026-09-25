/**
 * Shared POS Thermal Print & Receipt Formatters
 * Enforces unified formatting across KOT, Customer Receipt, and WhatsApp Slips.
 */

/**
 * Strips 'Table' prefixes to display clean table identifier (e.g. 'Table C-8' -> 'C-8')
 */
export function cleanTableName(rawTable?: string | number | null): string {
  if (!rawTable && rawTable !== 0) return "";
  let s = String(rawTable).trim();
  s = s.replace(/^table\s*[-:#]?\s*/i, "").trim();
  return s;
}

/**
 * Robustly formats branch address whether stored as a JSONB dictionary or string
 */
export function formatBranchAddress(rawAddress: any): string {
  if (!rawAddress) return "";
  if (typeof rawAddress === "string") {
    const trimmed = rawAddress.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        return formatBranchAddress(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
    return trimmed === "null" || trimmed === "undefined" ? "" : trimmed;
  }

  if (typeof rawAddress === "object") {
    if (rawAddress.full_address && typeof rawAddress.full_address === "string") {
      return rawAddress.full_address.trim();
    }
    if (rawAddress.address && typeof rawAddress.address === "string") {
      return rawAddress.address.trim();
    }
    const parts = [
      rawAddress.line1,
      rawAddress.line2,
      rawAddress.street,
      rawAddress.landmark,
      rawAddress.area,
      rawAddress.city,
      rawAddress.state,
      rawAddress.pincode || rawAddress.zip,
    ]
      .filter(Boolean)
      .map((p) => String(p).trim());

    if (parts.length > 0) {
      return parts.join(", ");
    }

    const stringVals = Object.values(rawAddress).filter(
      (v) => typeof v === "string" && v.trim() && v.trim() !== "null"
    );
    if (stringVals.length > 0) {
      return stringVals.map((v) => String(v).trim()).join(", ");
    }
  }

  return "";
}

/**
 * Formats a clean safe string, filtering out 'null' and 'undefined'
 */
export function cleanString(val: any): string {
  if (!val && val !== 0) return "";
  const s = String(val).trim();
  return s === "null" || s === "undefined" ? "" : s;
}

/**
 * Extracts comma-separated names of selected addons
 */
export function formatAddonsString(addons?: any[]): string {
  if (!addons || !Array.isArray(addons) || addons.length === 0) return "";
  return addons
    .map((a: any) => {
      if (!a) return "";
      if (typeof a === "string") return a.trim();
      return cleanString(a.name || a.addon_name || a.title || a.label);
    })
    .filter(Boolean)
    .join(", ");
}

/**
 * Inlines variant and addons directly into dish title
 * Examples:
 * - 'Paneer Kurkure Momos', 'Full' -> 'Paneer Kurkure Momos (Full)' (spaced) or 'Paneer Kurkure Momos(Full)' (compact)
 * - 'Veg Pizza', 'Medium', ['Cheese Burst'] -> 'Veg Pizza (Medium) + Cheese Burst'
 * - 'Veg Pizza', null, ['Cheese Burst'] -> 'Veg Pizza + Cheese Burst'
 * - 'Paneer Chilli Momos', null, null -> 'Paneer Chilli Momos'
 */
export function formatItemWithVariantAndAddons(
  name: string,
  variantName?: string | null,
  addons?: any[],
  style: "spaced" | "compact" = "spaced"
): string {
  const cleanName = cleanString(name);
  const cleanVariant = cleanString(variantName);
  const cleanAddons = formatAddonsString(addons);

  let result = cleanName;
  if (cleanVariant) {
    result += style === "compact" ? `(${cleanVariant})` : ` (${cleanVariant})`;
  }
  if (cleanAddons) {
    result += ` + ${cleanAddons}`;
  }
  return result;
}
