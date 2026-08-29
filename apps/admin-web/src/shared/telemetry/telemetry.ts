/**
 * ssrone ERP - Client Telemetry Stream
 * Captures user navigation, action frequencies, and performance metrics.
 */

import { api } from "@ssrone/api-client";
import { logger } from "../logging/logger";

export interface TelemetryEvent {
  eventName: string;
  category: "NAVIGATION" | "USER_ACTION" | "PERFORMANCE" | "ERROR";
  metadata?: Record<string, any>;
  timestamp?: string;
}

class TelemetryStream {
  private queue: TelemetryEvent[] = [];

  public track(event: TelemetryEvent) {
    const payload: TelemetryEvent = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };

    logger.debug("TELEMETRY", `Event tracked: ${payload.eventName}`, payload);
    this.queue.push(payload);

    if (this.queue.length >= 5) {
      this.flush();
    }
  }

  public async flush() {
    if (this.queue.length === 0) return;
    const batch = [...this.queue];
    this.queue = [];

    try {
      await api.post("/telemetry/batch", { events: batch });
    } catch {
      // Silent telemetry catch
    }
  }
}

export const telemetry = new TelemetryStream();
