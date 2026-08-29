/**
 * ssrone ERP - Centralized Structured Logger
 * Provides level-controlled logging replacing raw console.log calls.
 */

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface LogPayload {
  level: LogLevel;
  module: string;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
}

class Logger {
  private minLevel: LogLevel = "INFO";

  private levelWeights: Record<LogLevel, number> = {
    DEBUG: 10,
    INFO: 20,
    WARN: 30,
    ERROR: 40,
  };

  public setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelWeights[level] >= this.levelWeights[this.minLevel];
  }

  private format(level: LogLevel, module: string, message: string, context?: Record<string, any>): LogPayload {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      context: context ?? {},
    };
  }

  public debug(module: string, message: string, context?: Record<string, any>) {
    if (!this.shouldLog("DEBUG")) return;
    console.debug(`[DEBUG][${module}] ${message}`, context ?? "");
  }

  public info(module: string, message: string, context?: Record<string, any>) {
    if (!this.shouldLog("INFO")) return;
    console.info(`[INFO][${module}] ${message}`, context ?? "");
  }

  public warn(module: string, message: string, context?: Record<string, any>) {
    if (!this.shouldLog("WARN")) return;
    console.warn(`[WARN][${module}] ${message}`, context ?? "");
  }

  public error(module: string, message: string, context?: Record<string, any>) {
    if (!this.shouldLog("ERROR")) return;
    console.error(`[ERROR][${module}] ${message}`, context ?? "");
  }
}

export const logger = new Logger();
