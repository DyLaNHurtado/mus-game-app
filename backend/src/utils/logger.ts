import chalk from "chalk";
import { LogLevel, LogContext } from "@/types/LoggerTypes";

class Logger {
  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this.formatTimestamp();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext): void {
    console.log(chalk.blue(this.formatMessage(LogLevel.INFO, message, context)));
  }

  warn(message: string, context?: LogContext): void {
    console.log(chalk.yellow(this.formatMessage(LogLevel.WARN, message, context)));
  }

  error(message: string, context?: LogContext): void {
    console.log(chalk.red(this.formatMessage(LogLevel.ERROR, message, context)));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === "development") {
      console.log(chalk.gray(this.formatMessage(LogLevel.DEBUG, message, context)));
    }
  }

  game(message: string, roomId?: string): void {
    const prefix = roomId ? `[ROOM:${roomId}]` : "[GAME]";
    console.log(chalk.green(`${prefix} ${message}`));
  }

  socket(message: string, socketId?: string): void {
    const prefix = socketId ? `[SOCKET:${socketId.substring(0, 8)}]` : "[SOCKET]";
    console.log(chalk.cyan(`${prefix} ${message}`));
  }
}

export const logger = new Logger();
