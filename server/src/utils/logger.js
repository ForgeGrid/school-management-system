import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format for development/console
const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
    const safeStringify = (obj) => {
        const cache = new Set();
        return JSON.stringify(obj, (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (cache.has(value)) return "[Circular]";
                cache.add(value);
            }
            return value;
        }, 2);
    };

    return `${timestamp} [${level}]: ${stack || message} ${Object.keys(meta).length ? safeStringify(meta) : ""}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }), // capture stack trace
        process.env.NODE_ENV === "production" ? winston.format.json() : devFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                process.env.NODE_ENV === "production" ? winston.format.json() : devFormat
            ),
        }),
    ],
});

export default logger;
