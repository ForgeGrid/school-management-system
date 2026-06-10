import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    type: {
      type: String,
      enum: [
        "announcement",
        "event",
        "attendance_absent",
        "attendance_reason_submitted",
        "fee_reminder",
        "fee_payment_success",
        "fee_payment_reversed",
        "transport_update",
        "homework",
        "timetable",
        "chat_notice",
        "emergency",
        "ticket_created_admin",
        "ticket_created_user",
        "ticket_assigned",
        "ticket_in_progress",
        "ticket_resolved",
        "ticket_reply",
        "custom",
      ],
      default: "custom",
      index: true,
    },

    scope: {
      type: String,
      enum: ["all", "roles", "users", "students", "admins", "class_sections", "custom"],
      required: true,
      index: true,
    },

    audience: {
      roles: {
        type: [String],
        default: [],
      },
      user_ids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      student_ids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StudentProfile",
        },
      ],
      classSection_ids: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ClassSection",
        },
      ],
    },

    relatedModule: {
      type: String,
      enum: ["attendance", "fees", "transport", "student", "staff", "chat", "timetable", "helpdesk", "general"],
      default: "general",
      index: true,
    },

    relatedRefId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    publishAt: {
      type: Date,
      default: Date.now,
      index: true,
    },


    readBy: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    readCount: {
      type: Number,
      default: 0,
    },

    metadata: {
      reminderConfig_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeeReminder",
        default: null,
      },
      reminderStage: {
        type: String,
        default: null,
      },
      reminderDate: {
        type: String,
        default: null,
      },
      dedupeKey: {
        type: String,
        default: null,
        index: true,
      },
    },

  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  school_id: 1,
  scope: 1,
  type: 1,
  publishAt: -1,
});

notificationSchema.index({
  school_id: 1,
  createdAt: -1,
});

notificationSchema.index({
  "audience.user_ids": 1,
});

notificationSchema.index({
  "audience.roles": 1,
});

notificationSchema.index({
  "audience.student_ids": 1,
});

notificationSchema.index({
  "audience.classSection_ids": 1,
});

export const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;