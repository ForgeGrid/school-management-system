import logger from "../utils/logger.js";
import Notification from "../models/notification/notification.model.js";
import { buildNotificationMatch, resolveNotificationUserContext } from "../utils/notificationHelper.js";


/**
 * Get all notifications for the current user (with pagination)
 */
export const getNotifications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit ?? "50", 10), 1), 100);
        const skip = (page - 1) * limit;

        const userContext = await resolveNotificationUserContext(req.user);
        const baseMatch = buildNotificationMatch(userContext);

        const [notifications, unreadCount] = await Promise.all([
            Notification.find(baseMatch)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),

            Notification.countDocuments({
                ...baseMatch,
                readBy: { $not: { $elemMatch: { user_id: req.user.id } } },
            }),
        ]);

        res.status(200).json({
            notifications,
            unreadCount,
            page,
            limit,
        });
    } catch (err) {
        logger.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;
        const userContext = await resolveNotificationUserContext(req.user);

        const updated = await Notification.findOneAndUpdate(
            {
                _id: id,
                ...buildNotificationMatch(userContext),
                readBy: { $not: { $elemMatch: { user_id: userId } } },
            },
            {
                $addToSet: {
                    readBy: {
                        user_id: userId,
                        role,
                        readAt: new Date(),
                    },
                },
                $inc: { readCount: 1 },
            },
            { returnDocument: "after" }
        );

        if (updated) {
            return res.status(200).json(updated);
        }

        const notification = await Notification.findOne({
            _id: id,
            ...buildNotificationMatch(userContext),
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json(notification);
    } catch (err) {
        logger.error("Error marking notification as read:", err);
        res.status(500).json({ message: "Error marking notification as read" });
    }
};

/**
 * Mark all notifications as read for current user
 */
export const markAllAsRead = async (req, res) => {
    try {
        const { id: userId, role } = req.user;
        const userContext = await resolveNotificationUserContext(req.user);
        const baseMatch = buildNotificationMatch(userContext);

        await Notification.updateMany(
            {
                ...baseMatch,
                readBy: { $not: { $elemMatch: { user_id: userId } } },
            },
            {
                $addToSet: {
                    readBy: {
                        user_id: userId,
                        role,
                        readAt: new Date(),
                    },
                },
                $inc: { readCount: 1 },
            }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        logger.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Error marking all notifications as read" });
    }
};

/**
 * Delete a notification (Archive for the user if we wanted personal delete, but model is global)
 * For now, we'll just implement simple delete if the user is an admin or the creator
 */
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { id: userId, role } = req.user;

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Only sender or school admin can delete
        if (notification.sender_id?.toString() !== userId.toString() && role !== "school_admin") {
            return res.status(403).json({ message: "Unauthorized to delete this notification" });
        }

        await Notification.findByIdAndDelete(id);

        res.status(200).json({ message: "Notification deleted" });
    } catch (err) {
        logger.error("Error deleting notification:", err);
        res.status(500).json({ message: "Error deleting notification" });
    }
};
