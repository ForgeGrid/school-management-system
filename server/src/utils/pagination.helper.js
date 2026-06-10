/**
 * pagination.helper.js
 * 
 * Unified pagination logic.
 */

/**
 * buildPagination - Computes page, limit, skip and normalized values.
 */
export const buildPagination = ({ page = 1, limit = 20 }) => {
    const normalizedPage = Math.max(Number.parseInt(page || 1, 10), 1);
    const normalizedLimit = Math.min(Math.max(Number.parseInt(limit || 20, 10), 1), 100);

    return {
        page: normalizedPage,
        limit: normalizedLimit,
        skip: (normalizedPage - 1) * normalizedLimit,
    };
};
