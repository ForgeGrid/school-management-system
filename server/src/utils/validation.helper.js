/**
 * validation.helper.js
 * 
 * Generic validation checks.
 */

/**
 * validateInSet - Checks if a value is within a specified set of allowed values.
 */
export const validateInSet = (value, allowedSet, fieldName = "Field") => {
    if (!allowedSet.has(value)) {
        throw new Error(`Invalid ${fieldName}: ${value}`);
    }
};

/**
 * validateInArray - Checks if a value is within a specified array of allowed values.
 */
export const validateInArray = (value, allowedArray, fieldName = "Field") => {
    if (!allowedArray.includes(value)) {
        throw new Error(`Invalid ${fieldName}: ${value}`);
    }
};

/**
 * isLikelyEmail - Simple heuristic for email identification.
 */
export const isLikelyEmail = (val) => {
    const s = String(val || "").trim();
    return s.includes("@") && s.includes(".");
};

/**
 * isLikelyPhone - Simple heuristic for phone identification.
 */
export const isLikelyPhone = (val) => {
    const s = String(val || "").trim().replace(/\s+/g, "");
    return s.length >= 10 && /^\+?[0-9]+$/.test(s);
};

/**
 * isLikelyAdmissionNo - Simple heuristic for admission number.
 */
export const isLikelyAdmissionNo = (val) => {
    const s = String(val || "").trim();
    return /^[a-zA-Z0-9/-]+$/.test(s) && (s.includes("/") || s.includes("-") || s.length >= 4);
};
