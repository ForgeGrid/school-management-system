import logger from "./logger.js";

let _supportsTransactions = null;

/**
 * Detects whether the current MongoDB connection supports multi-document
 * transactions (i.e., is running as a replica set). Caches the result
 * after the first check.
 */
export const checkTransactionSupport = async () => {
    if (_supportsTransactions !== null) return _supportsTransactions;
    try {
        const hello = await mongoose.connection.db.admin().command({ hello: 1 });
        _supportsTransactions = !!hello.setName;

        if (!_supportsTransactions) {
            logger.warn("Transactions not supported (running standalone MongoDB). Services will run without atomic transactions.");
        }
    } catch (error) {
        _supportsTransactions = false;
        logger.warn("Error detecting transaction support, falling back to non-transactional mode:", error.message);
    }
    return _supportsTransactions;
};
