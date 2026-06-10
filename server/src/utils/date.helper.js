/**
 * date.helper.js
 * 
 * Standardized date calculations and IST handling.
 */

/**
 * getIstStartOfToday - Returns the start of today (00:00:00) in IST
 */
export const getIstStartOfToday = (date = new Date()) => {
    // Use Intl to get the date in Asia/Kolkata timezone
    const istStr = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "numeric",
        day: "numeric",
    }).format(date);

    const [m, d, y] = istStr.split("/");
    // Note: Local machine time might still be different, but we normalize to 00:00:00
    const today = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
    return today;
};

/**
 * getDaysLeft - Calculates difference in days between two dates
 */
export const getDaysLeft = (dueDate, startDate = getIstStartOfToday()) => {
    if (!dueDate) return 0;
    const target = new Date(dueDate);
    target.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const diffMs = target.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const WEEK_DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
];

/**
 * normalizeDayOfWeek - Normalizes day name.
 */
export const normalizeDayOfWeek = (value) => {
    const day = String(value || "").trim().toLowerCase();
    if (!WEEK_DAYS.includes(day)) {
        throw new Error(`Invalid day_of_week: ${value}`);
    }
    return day;
};

/**
 * normalizeTime - Normalizes time to HH:mm.
 */
export const normalizeTime = (value) => {
    if (value instanceof Date) {
        const hh = String(value.getHours()).padStart(2, "0");
        const mm = String(value.getMinutes()).padStart(2, "0");
        return `${hh}:${mm}`;
    }

    const text = String(value || "").trim();
    if (!text) {
        throw new Error("Time value is required");
    }

    const basic = text.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (basic) {
        const hours = Number.parseInt(basic[1], 10);
        const minutes = Number.parseInt(basic[2], 10);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new Error(`Invalid time format: ${text}`);
        }
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const ampm = text.match(/^(\d{1,2}):(\d{2})\s*([ap]m)$/i);
    if (ampm) {
        let hours = Number.parseInt(ampm[1], 10);
        const minutes = Number.parseInt(ampm[2], 10);
        const meridiem = ampm[3].toLowerCase();

        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            throw new Error(`Invalid time format: ${text}`);
        }

        if (meridiem === "pm" && hours !== 12) hours += 12;
        if (meridiem === "am" && hours === 12) hours = 0;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    throw new Error(`Invalid time format: ${text}`);
};

/**
 * timeToMinutes - Converts HH:mm to total minutes from midnight.
 */
export const timeToMinutes = (value) => {
    const time = normalizeTime(value);
    const [hh, mm] = time.split(":").map((v) => Number.parseInt(v, 10));
    return hh * 60 + mm;
};

/**
 * assertValidTimeRange - Validates that end is after start.
 */
export const assertValidTimeRange = (startTime, endTime) => {
    const start = timeToMinutes(startTime);
    const end = timeToMinutes(endTime);

    if (end <= start) {
        throw new Error("end_time must be greater than start_time");
    }

    return {
        start_time: normalizeTime(startTime),
        end_time: normalizeTime(endTime),
    };
};

/**
 * overlapExists - Generic interval overlap check.
 */
export const overlapExists = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd;
};

/**
 * daySortIndex - Returns index of day for sorting.
 */
export const daySortIndex = (day) => {
    const idx = WEEK_DAYS.indexOf(String(day || "").toLowerCase());
    return idx === -1 ? 999 : idx;
};

/**
 * dayBounds - Returns start and end of a given date.
 */
export const dayBounds = (inputDate) => {
    const d = new Date(inputDate);
    if (Number.isNaN(d.getTime())) {
        throw new Error("Invalid date");
    }

    const start = new Date(d);
    start.setHours(0, 0, 0, 0);

    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    return { start, end };
};
