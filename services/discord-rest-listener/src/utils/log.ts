import winston from 'winston'
import config from './config'

const timestampFormat = winston.format.timestamp()

const devLog = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ],
  format: winston.format.combine(
    winston.format.colorize(),
    timestampFormat,
    winston.format.simple(),
  )
})

let datadogLog: winston.Logger;

if (config.datadog) {
  // eslint-disable-next-line no-console
  console.log('Setting up datadog')
  datadogLog = winston.createLogger({
    level: 'info',
    exitOnError: false,
    format: winston.format.json(),
    transports: [
      new winston.transports.Http({
        host: config.datadog.host,
        path: `/v1/input/${config.datadog.apiKey}?ddsource=nodejs&service=${config.datadog.service}`,
        ssl: true
      }),
    ],
  });
  datadogLog.on('error', err => {
    devLog.error(err)
  })
}

export const logDatadog = (level: string, message: string, meta?: any) => {
  if (datadogLog) {
    datadogLog.log(level, message, meta);
  }
}

const log = devLog

export default log
