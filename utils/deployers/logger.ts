import chalk from "chalk";

const DEFAULTS = {
  verbose: true,
  silent: false,
};

export class Logger {
  actor: string;
  color: string;

  static setDefaults(silent: boolean, verbose: boolean): void {
    DEFAULTS.silent = silent;
    DEFAULTS.verbose = verbose;
  }

  constructor(actor = "", color = "white") {
    this.actor = actor;
    this.color = color;
  }

  info(msg: string): void {
    if (!DEFAULTS.verbose) return;
    this.log(msg, "️  ", "orange");
  }

  success(msg: string): void {
    this.log(msg, "✅", "green");
  }

  warn(msg: string, error?: Error): void {
    this.log(msg, "⚠️ ", "yellow");
    if (error) console.error(error);
  }

  error(msg: string, error?: Error): void {
    this.log(msg, "🚨", "red");
    if (error) console.error(error);
  }

  log(msg: string, emoji: string, color = "white"): void {
    if (DEFAULTS.silent) return;
    let formattedMessage = chalk.keyword(color)(`${emoji}  ${msg}`);
    if (DEFAULTS.verbose) {
      const formattedPrefix = chalk.keyword(this.color)(`[${this.actor}]`);
      formattedMessage = `${formattedPrefix} ${formattedMessage}`;
    }
    console.error(formattedMessage);
  }
}

export const logger = new Logger();
