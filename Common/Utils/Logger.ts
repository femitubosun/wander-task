import winston from "winston";

const Colors = {
  info: "\x1b[36m",
  error: "\x1b[31m",
  warn: "\x1b[33m",
  verbose: "\x1b[43m",
};

const customWinstonFormat = winston.format.printf(
  ({ level, message, timestamp }) => {
    return `${Colors[level as keyof typeof Colors]}[${level.toUpperCase()}] ${timestamp}: ${message}`;
  },
);

export const Logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    customWinstonFormat,
  ),
  transports: [new winston.transports.Console()],
});
