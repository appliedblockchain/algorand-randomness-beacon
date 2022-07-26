import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: {
    env: process.env.NODE_ENV,
    app: process.env.npm_package_name,
  },
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL,
    }),
  ],
})

export default logger
