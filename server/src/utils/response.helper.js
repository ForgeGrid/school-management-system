import logger from "./logger.js";

/**
 * response.helper.js
 * 
 * Standardized success and error response handlers for controllers.
 */

/**
 * sendSuccess - Standard success response
 */
export const sendSuccess = (res, { message, httpStatus = 200, status: _ignored, ...rest }) => {
    return res.status(httpStatus).json({
        message,
        ...rest,
    });
};

/**
 * sendError - Standard error response with logging
 */
export const sendError = (res, { error, context = "Error", status = 400 }) => {
    const message = error?.message || error || "An unexpected error occurred";

    // Log with context for debugging
    logger.error(`${context}:`, error);

    return res.status(status).json({
        message,
    });
};
