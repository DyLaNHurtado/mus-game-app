//util/logger.ts
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { LogLevel } from "@/types/LoggerTypes";
import { EventEmitter } from "events";

class Logger extends EventEmitter {
  private MAX_LOGS = 1000;
  private logFilePath: string;

  constructor() {
    super();
    this.logFilePath = path.join(__dirname, "../logs/app.log");
    fs.mkdirSync(path.dirname(this.logFilePath), { recursive: true });
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, "");
    }
  }

  private formatTimestamp(): string {
    /* Fecha en formato dd/MM/yyyy, HH:MM:SS */
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = this.formatTimestamp();
    switch (level) {
      case LogLevel.INFO:
        return `ℹ️ [${timestamp}]  [${level.toUpperCase()}]: ${message}`;
      case LogLevel.WARN:
        return `⚠️ [${timestamp}]  [${level.toUpperCase()}]: ${message}`;
      case LogLevel.ERROR:
        return `❌ [${timestamp}]  [${level.toUpperCase()}]: ${message} \n${new Error().stack}`;
      case LogLevel.DEBUG:
        return `🐛 [${timestamp}]  [${level.toUpperCase()}]: ${message}`;
      default:
        return `🔍 [${timestamp}]  [${level.toUpperCase()}]: ${message}`;
    }
  }

  private writeToFile(entry: string): void {
    const logs = fs.readFileSync(this.logFilePath, "utf-8").split("\n").filter(Boolean);
    if (logs.length >= this.MAX_LOGS) {
      logs.shift();
    }
    logs.unshift(entry);
    fs.writeFileSync(this.logFilePath, logs.join("\n") + "\n");
  }

  public info(message: string): void {
    const entry = this.formatMessage(LogLevel.INFO, message);
    console.log(chalk.blue(entry));
    this.writeToFile(entry);
  }

  public warn(message: string): void {
    const entry = this.formatMessage(LogLevel.WARN, message);
    console.log(chalk.yellow(entry));
    this.writeToFile(entry);
  }

  public error(message: string): void {
    const entry = this.formatMessage(LogLevel.ERROR, message);
    console.log(chalk.red(entry));
    this.writeToFile(entry);
  }

  public debug(message: string): void {
    if (process.env.NODE_ENV === "development") {
      const entry = this.formatMessage(LogLevel.DEBUG, message);
      console.log(chalk.magenta(entry));
      this.writeToFile(entry);
    }
  }

  public getLogs(): string[] {
    return fs.readFileSync(this.logFilePath, "utf-8").split("\n").filter(Boolean);
  }
}

export const logger = new Logger();
