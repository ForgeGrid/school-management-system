import Notification from "../models/notification/notification.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import sendEmail from "./sendEmail.js";
import logger from "./logger.js";

/**
 * Send a notification
 * @param {Object} params
 * @param {String} params.school_id
 * @param {Object} params.audience - { user_ids: [], student_ids: [], roles: [], classSection_ids: [] }
 * @param {String} params.sender_id
 * @param {String} params.type
 * @param {String} params.title
 * @param {String} params.message
 * @param {String} params.scope
 * @param {String} params.link
 * @param {Object} params.metadata
 * @param {Boolean} params.sendEmailFlag
 * @param {String} params.recipientEmail - Only used if sendEmailFlag is true
 */
export const notify = async ({
    school_id,
    audience,
    sender_id = null,
    type,
    title,
    message,
    scope = "users",
    link = null,
    relatedModule = "general",
    relatedRefId = null,
    sendEmailFlag = false,
    recipientEmail = null,
}) => {
    try {
        // 1. Create In-App Notification
        await Notification.create({
            school_id,
            audience,
            sender_id,
            type,
            title,
            message,
            scope,
            relatedModule,
            relatedRefId,
            readBy: [],
            readCount: 0,
        });

        // 2. Send Email if requested and email is available
        if (sendEmailFlag && recipientEmail) {
            try {
                await sendEmail({
                    to: recipientEmail,
                    subject: `${title} - S-Cool`,
                    text: message,
                    html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
            <h2 style="color:#333;">${title}</h2>
            <p style="color:#555;font-size:16px;">${message}</p>
            ${link ? `<a href="${process.env.FRONTEND_URL}${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">View Details</a>` : ""}
          </div>`,
                });
            } catch (emailErr) {
                logger.error(`Failed to send notification email to ${recipientEmail}:`, emailErr);
            }
        }
    } catch (err) {
        logger.error("Error creating notification:", err);
    }
};

export const buildNotificationMatch = (user) => {
    const or = [{ scope: "all" }];

    if (user.role) or.push({ "audience.roles": user.role });
    if (user.id) or.push({ "audience.user_ids": user.id });
    if (user.studentProfile_id) or.push({ "audience.student_ids": user.studentProfile_id });
    if (user.classSection_id) or.push({ "audience.classSection_ids": user.classSection_id });

    return {
        school_id: user.school_id,
        $or: or,
    };
};

export const resolveNotificationUserContext = async (reqUser) => {
    const context = {
        id: reqUser.id,
        school_id: reqUser.school_id,
        role: reqUser.role,
        studentProfile_id: reqUser.studentProfile_id || null,
        classSection_id: reqUser.classSection_id || null,
    };

    if (reqUser.role === "student" && !context.studentProfile_id) {
        const studentProfile = await StudentProfile.findOne({
            user_id: reqUser.id, // change if your schema uses a different field
        })
            .select("_id classSection_id")
            .lean();

        if (studentProfile) {
            context.studentProfile_id = studentProfile._id;
            context.classSection_id = context.classSection_id || studentProfile.classSection_id || null;
        }
    }

    return context;
};