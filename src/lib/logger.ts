type LogLevel = 'debug' | 'info' | 'warn' | 'error'
type LogContext = Record<string, unknown>

function log(level: LogLevel, msg: string, context?: LogContext) {
  const entry = {
    level,
    msg,
    ts: new Date().toISOString(),
    ...(context || {}),
  }
  if (process.env.NODE_ENV === 'production') {
    process.stdout.write(JSON.stringify(entry) + '\n')
  } else {
    const colors: Record<LogLevel, string> = {
      debug: '\x1b[37m', info: '\x1b[36m', warn: '\x1b[33m', error: '\x1b[31m',
    }
    const reset = '\x1b[0m'
    const ctxStr = context ? ' ' + JSON.stringify(context) : ''
    console.log(`${colors[level]}[${level.toUpperCase()}]${reset} ${msg}${ctxStr}`)
  }
}

export function createLogger(baseContext?: LogContext) {
  return {
    debug: (msg: string, ctx?: LogContext) => log('debug', msg, { ...baseContext, ...ctx }),
    info:  (msg: string, ctx?: LogContext) => log('info',  msg, { ...baseContext, ...ctx }),
    warn:  (msg: string, ctx?: LogContext) => log('warn',  msg, { ...baseContext, ...ctx }),
    error: (msg: string, ctx?: LogContext) => log('error', msg, { ...baseContext, ...ctx }),
  }
}

export const logger = createLogger()
