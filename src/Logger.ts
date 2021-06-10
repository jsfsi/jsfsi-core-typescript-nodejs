/* eslint-disable @typescript-eslint/no-explicit-any */
import * as log4js from 'log4js'

export class Logger {
  public static logger: log4js.Logger

  private static defaultLoggerParameters = {
    appenders: {
      out: { type: 'stdout' },
    },
    categories: {
      default: { appenders: ['out'], level: 'info' },
    },
  }

  public static configure(param: Record<string, unknown> | string): void {
    if (this.logger) {
      Logger.warn('Logger already configured.')
    }

    if (typeof param === 'string') {
      log4js.configure({
        appenders: this.defaultLoggerParameters.appenders,
        categories: {
          default: {
            appenders: this.defaultLoggerParameters.categories.default.appenders,
            level: param,
          },
        },
      })
    } else {
      log4js.configure(
        (param as unknown as log4js.Configuration) || this.defaultLoggerParameters,
      )
    }

    this.logger = log4js.getLogger()
  }

  public static trace(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.trace.apply(this.logger, args as [any[]])
  }

  public static debug(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.debug.apply(this.logger, args as [any[]])
  }

  public static info(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.info.apply(this.logger, args as [any[]])
  }

  public static warn(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.warn.apply(this.logger, args as [any[]])
  }

  public static error(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.error.apply(this.logger, args as [any[]])
  }

  public static fatal(...args: any[]) {
    // eslint-disable-next-line prefer-spread
    this.logger.fatal.apply(this.logger, args as [any[]])
  }
}
