import winston from 'winston';
import fs from 'fs';
import path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const LOGS_FOLDER = './logs/';
const APP_NAME = 'node-server';
const logger = new winston.Logger();
let currentLogsFolder = LOGS_FOLDER,
  currentTransports;

export function configureLogger({ logsFolder }) {
  logsFolder = logsFolder || currentLogsFolder;

  if (!path.isAbsolute(logsFolder)) {
    logsFolder = path.resolve(process.cwd(), logsFolder);
  }
  if (!fs.existsSync(logsFolder)) {
    fs.mkdirSync(logsFolder);
  }
  currentLogsFolder = logsFolder;

  currentTransports = [
    new (winston.transports.Console)({
      colorize: true,
      level: process.env.VERBOSE ? 'verbose' : 'info',
    }),
    new (DailyRotateFile)({
      filename: `${APP_NAME}.info`,
      dirname: currentLogsFolder,
      name: APP_NAME,
      level: process.env.VERBOSE ? 'verbose' : 'info',
    }),
    new (DailyRotateFile)({
      filename: `${APP_NAME}.err`,
      dirname: currentLogsFolder,
      name: `${APP_NAME}-error`,
      level: 'error',
    }),
  ];

  logger.configure({
    transports: currentTransports,
  });
}

configureLogger({ logsFolder: LOGS_FOLDER });

export default logger;
