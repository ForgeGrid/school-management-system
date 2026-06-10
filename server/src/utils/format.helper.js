/**
 * format.helper.js
 * 
 * Centralized formatting utilities for currency, dates, and strings.
 */

/**
 * formatINR - Formats as Indian Rupee style but without prefix
 */
export const formatINR = (value) => {
    const amount = Number(value || 0);
    return new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
    }).format(amount);
};

/**
 * formatCurrencyINR - Formats as Indian Rupee with ₹ prefix
 */
export const formatCurrencyINR = (value) => {
    const amount = Number(value || 0);
    return `₹${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
    }).format(amount)}`;
};

/**
 * formatDateShort - Formats date to dd/mm/yyyy (en-IN locale)
 */
export const formatDateShort = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-IN");
};

/**
 * replacePlaceholders - Replaces {key} in string with values from a map
 */
export const replacePlaceholders = (template, values = {}) => {
    const source = String(template || "");
    return source
        .replace(/\{(\w+)\}/g, (_, key) => {
            const value = values[key];
            return value === undefined || value === null ? "" : String(value);
        })
        .replace(/\s+/g, " ")
        .trim();
};

/**
 * normalizeText - Trims and handles nulls.
 */
export const normalizeText = (value) => String(value || "").trim();

/**
 * normalizeText - Trims and handles nulls then to lowercase.
 */
export const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

/**
 * escapeRegExp - Escapes special characters for regex.
 */
export const escapeRegExp = (value) => {
    return normalizeText(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * isLikelyEmail - Basic email pattern check.
 */
export const isLikelyEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeText(value));
};

/**
 * isLikelyPhone - Basic phone pattern check.
 */
export const isLikelyPhone = (value) => {
    return /^\+?[\d\s-]{10,}$/.test(normalizeText(value));
};

/**
 * normalizeDigits - Keeps only digits.
 */
export const normalizeDigits = (value) => {
    return normalizeText(value).replace(/\D/g, "");
};

/**
 * normalizeComparableText - Lowercase and underscore-delimited.
 */
export const normalizeComparableText = (value = "") => {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .replace(/_+/g, "_");
};

/**
 * normalizeList - Trims, unique-ifies, and filters out empty strings/nulls from an array.
 */
export const normalizeList = (list = []) => {
    if (!Array.isArray(list)) return [];
    return [...new Set(list
        .map(item => String(item || "").trim())
        .filter(item => item !== "")
    )];
};

/**
 * normalizeComparableList - Normalizes an array or comma-separated string by applying normalizeComparableText to each item.
 */
export const normalizeComparableList = (input) => {
    let list = [];
    if (Array.isArray(input)) {
        list = input;
    } else if (typeof input === "string") {
        list = input.split(/[,;|]/); // split by comma, semicolon or pipe
    } else {
        return [];
    }

    return [...new Set(list
        .map(item => normalizeComparableText(item))
        .filter(item => item !== "")
    )];
};

/**
 * normalizeSubjectCode - Alias for normalizeComparableText
 */
export const normalizeSubjectCode = normalizeComparableText;
