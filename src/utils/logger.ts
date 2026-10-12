type LogLevel = 'info' | 'success' | 'warn' | 'error' | 'debug';

const LOG_PREFIX: Record<LogLevel, string> = {
  info: '[INFO]',
  success: '[SUCCESS]',
  warn: '[WARN]',
  error: '[ERROR]',
  debug: '[DEBUG]',
};

function formatMessage(level: LogLevel, message: string, context?: object): string {
  const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
  return `${LOG_PREFIX[level]} ${message}${contextStr}`;
}

async function logAsStep(level: LogLevel, message: string, context?: object) {
  const formatted = formatMessage(level, message, context);
  console.log(formatted);
}

export const logger = {
  info: (msg: string, ctx?: object) => logAsStep('info', msg, ctx),
  success: (msg: string, ctx?: object) => logAsStep('success', msg, ctx),
  warn: (msg: string, ctx?: object) => logAsStep('warn', msg, ctx),
  error: (msg: string, ctx?: object) => logAsStep('error', msg, ctx),
  debug: (msg: string, ctx?: object) => {
    if (process.env.LOG_LEVEL === 'debug') logAsStep('debug', msg, ctx);
  },
};