/**
 * Utility for evaluating Store Operating Hours and Menu Item Timed Availability
 */

export interface StoreOperatingHoursConfig {
  enabled?: boolean;
  openTime?: string; // e.g. "10:30" or "10:30 AM"
  closeTime?: string; // e.g. "22:00" or "10:00 PM"
  isManuallyClosed?: boolean;
  closedMessage?: string;
}

export interface ItemAvailabilityRule {
  isAvailable?: boolean;
  availableFrom?: string; // "17:00"
  availableTo?: string;   // "22:00"
  message?: string;
}

/**
 * Parses time string like "10:30", "10:30 AM", "22:00", "10 PM" to minutes from midnight
 */
export function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr || typeof timeStr !== "string") return null;
  const clean = timeStr.trim().toLowerCase();

  const isPM = clean.includes("pm");
  const isAM = clean.includes("am");
  const numPart = clean.replace(/[^0-9:]/g, "");
  const parts = numPart.split(":");

  let hours = parseInt(parts[0], 10);
  let minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(hours)) return null;
  if (isNaN(minutes)) minutes = 0;

  if (isPM && hours < 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Gets current minutes from midnight in Indian Standard Time (IST / UTC+5:30)
 */
export function getCurrentMinutesInIST(): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(new Date());
    const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    return h * 60 + m;
  } catch {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }
}

/**
 * Checks if the store is currently open and accepting orders
 */
export function checkStoreOperatingStatus(config?: StoreOperatingHoursConfig): {
  isOpen: boolean;
  message: string;
  openTimeFormatted: string;
  closeTimeFormatted: string;
} {
  const openTime = config?.openTime || "10:30";
  const closeTime = config?.closeTime || "22:00";
  const customMessage = config?.closedMessage?.trim();

  // 1. Check if manually closed (holiday, emergency, off-day)
  if (config?.isManuallyClosed) {
    return {
      isOpen: false,
      message: customMessage || "The Baithak Cafe is currently closed today. We are sorry, we will meet you soon!",
      openTimeFormatted: openTime,
      closeTimeFormatted: closeTime,
    };
  }

  // 2. If operating hours checking is disabled, treat as open
  if (config?.enabled === false) {
    return {
      isOpen: true,
      message: "Open for service",
      openTimeFormatted: openTime,
      closeTimeFormatted: closeTime,
    };
  }

  const openMinutes = parseTimeToMinutes(openTime) ?? 10 * 60 + 30; // 10:30 AM
  const closeMinutes = parseTimeToMinutes(closeTime) ?? 22 * 60;     // 10:00 PM
  const currentMinutes = getCurrentMinutesInIST();

  if (currentMinutes < openMinutes || currentMinutes >= closeMinutes) {
    return {
      isOpen: false,
      message: customMessage || `The Baithak Cafe is closed right now. We serve daily from ${openTime} to ${closeTime}. We are sorry, see you soon!`,
      openTimeFormatted: openTime,
      closeTimeFormatted: closeTime,
    };
  }

  return {
    isOpen: true,
    message: "Open for service",
    openTimeFormatted: openTime,
    closeTimeFormatted: closeTime,
  };
}

/**
 * Formats time string e.g. "17:00" -> "5:00 PM"
 */
export function formatTimeDisplay(timeStr?: string): string {
  if (!timeStr) return "";
  const minutes = parseTimeToMinutes(timeStr);
  if (minutes === null) return timeStr;

  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mStr = m > 0 ? `:${m < 10 ? "0" + m : m}` : "";
  return `${h12}${mStr} ${ampm}`;
}

/**
 * Checks item availability and timed serving window
 */
export function checkMenuItemAvailability(
  itemId: string | number,
  itemName: string,
  rules?: Record<string, ItemAvailabilityRule>,
  itemObj?: any
): {
  isAvailable: boolean;
  badgeText?: string;
  reason?: string;
  isTimed?: boolean;
} {
  // 1. Direct item property check from backend MenuItem
  if (itemObj) {
    const isAvailOnline = itemObj.is_available_online ?? itemObj.isAvailableOnline ?? itemObj.nutrition?.is_available_online;
    if (isAvailOnline === false) {
      return {
        isAvailable: false,
        badgeText: "Unavailable on Food App",
        reason: "This item is currently unavailable for online orders.",
      };
    }

    const startTime = itemObj.online_start_time || itemObj.onlineStartTime || itemObj.nutrition?.online_start_time;
    const endTime = itemObj.online_end_time || itemObj.onlineEndTime || itemObj.nutrition?.online_end_time;
    if (startTime && endTime) {
      const fromMins = parseTimeToMinutes(startTime);
      const toMins = parseTimeToMinutes(endTime);
      const currentMins = getCurrentMinutesInIST();

      if (fromMins !== null && toMins !== null) {
        const fromFormatted = formatTimeDisplay(startTime);
        const toFormatted = formatTimeDisplay(endTime);
        const timeWindowLabel = `${fromFormatted} – ${toFormatted}`;

        let isWithin = false;
        if (fromMins <= toMins) {
          isWithin = currentMins >= fromMins && currentMins <= toMins;
        } else {
          // Cross-midnight window (e.g. 20:00 to 02:00)
          isWithin = currentMins >= fromMins || currentMins <= toMins;
        }

        if (!isWithin) {
          return {
            isAvailable: false,
            isTimed: true,
            badgeText: `Available ${timeWindowLabel}`,
            reason: `This dish is freshly prepared and served only from ${timeWindowLabel}.`,
          };
        } else {
          return {
            isAvailable: true,
            badgeText: `Available ${timeWindowLabel}`,
            isTimed: true,
          };
        }
      }
    }
  }

  // 2. Rules lookup fallback
  if (!rules) return { isAvailable: true };

  const rule =
    rules[String(itemId)] ||
    rules[itemName.toLowerCase().trim()] ||
    rules[itemName.trim()];

  if (!rule) return { isAvailable: true };

  // Explicitly marked out of stock
  if (rule.isAvailable === false) {
    return {
      isAvailable: false,
      badgeText: "Out of Stock",
      reason: rule.message || "This item is currently not available, sorry!",
    };
  }

  // Check timed availability
  if (rule.availableFrom) {
    const fromMins = parseTimeToMinutes(rule.availableFrom);
    const toMins = rule.availableTo ? parseTimeToMinutes(rule.availableTo) : 24 * 60;
    const currentMins = getCurrentMinutesInIST();

    if (fromMins !== null && (currentMins < fromMins || (toMins !== null && currentMins >= toMins))) {
      const fromFormatted = formatTimeDisplay(rule.availableFrom);
      return {
        isAvailable: false,
        isTimed: true,
        badgeText: `Available after ${fromFormatted}`,
        reason: rule.message || `This item is freshly prepared after ${fromFormatted} to cafe close. We are sorry!`,
      };
    }
  }

  return { isAvailable: true };
}
