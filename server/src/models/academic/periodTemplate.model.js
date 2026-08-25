/**

* models/PeriodTemplate.js
*
* A PeriodTemplate ("bell schedule") is a reusable, school-level layout of
* periods — timings + type — that gets CLONED into actual TimetableSlot
* documents when an admin sets up a class-section's timetable.
*
* It deliberately does NOT know about subjectId / staffId / classSectionId.
* Those belong to TimetableSlot. This model only answers: "on a normal day,
* what periods exist, what time do they run, and are they class/break/lunch?"
* Keeping it dumb like this means changing bell timings later never
* silently mutates already-configured class timetables.
  */

import mongoose from 'mongoose';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // "HH:mm", 24-hour

const PERIOD_TYPES = ['CLASS', 'BREAK', 'LUNCH', 'ASSEMBLY', 'PET', 'ECA', 'FREE'];
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const templateSlotSchema = new mongoose.Schema(
    {
        periodNo: {
            type: Number,
            required: true,
            min: 1,
        },
        label: {
            type: String,
            trim: true,
            maxlength: 40,
            // e.g. "Period 1", "Lunch Break" — display-only, never used in logic
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: PERIOD_TYPES,
            default: 'CLASS',
            required: true,
        },
    },
    { _id: false }
);

// Validate time format and ordering at the subdocument level
templateSlotSchema.pre('validate', function () {
    const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    if (!TIME_REGEX.test(this.startTime)) {
        this.invalidate(
            'startTime',
            `${this.startTime} is not a valid HH:mm time`
        );
    }

    if (!TIME_REGEX.test(this.endTime)) {
        this.invalidate(
            'endTime',
            `${this.endTime} is not a valid HH:mm time`
        );
    }

    if (
        TIME_REGEX.test(this.startTime) &&
        TIME_REGEX.test(this.endTime) &&
        toMinutes(this.endTime) <= toMinutes(this.startTime)
    ) {
        this.invalidate('endTime', 'endTime must be after startTime');
    }
});

const periodTemplateSchema = new mongoose.Schema(
    {
        schoolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'School',
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 60,
            // e.g. "Standard Weekday", "Saturday Half-Day", "Exam Schedule"
        },
        appliesToDays: {
            type: [String],
            enum: DAYS,
            required: true,
        },
        slots: {
            type: [templateSlotSchema],
            required: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
            // marks the template auto-selected when seeding a new class-section
            // that doesn't specify one explicitly
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    { timestamps: true }
);

// Validate appliesToDays and slots array rules at the parent schema level
periodTemplateSchema.pre('validate', function () {
    if (!Array.isArray(this.appliesToDays) || this.appliesToDays.length === 0) {
        this.invalidate('appliesToDays', 'appliesToDays must contain at least one day');
    }

    if (!Array.isArray(this.slots) || this.slots.length === 0) {
        this.invalidate('slots', 'A template must have at least one slot');
        return;
    }

    const periodNos = this.slots.map((slot) => slot.periodNo);
    if (new Set(periodNos).size !== periodNos.length) {
        this.invalidate('slots', 'periodNo must be unique within a template');
    }

    const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const hasInvalidTime = this.slots.some(
        (slot) => !TIME_REGEX.test(slot.startTime) || !TIME_REGEX.test(slot.endTime)
    );

    if (!hasInvalidTime) {
        const sorted = [...this.slots].sort(
            (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
        );

        for (let i = 1; i < sorted.length; i++) {
            if (toMinutes(sorted[i].startTime) < toMinutes(sorted[i - 1].endTime)) {
                this.invalidate('slots', 'Slots must not overlap in time');
                break;
            }
        }
    }
});

// One school shouldn't have two templates with the same name
periodTemplateSchema.index({ schoolId: 1, name: 1 }, { unique: true });

// Only one default template per school (enforced at query time in the
// service layer on create/update — Mongo can't do "unique where isDefault=true"
// declaratively without a partial index, added here for exactly that reason)
periodTemplateSchema.index(
    { schoolId: 1, isDefault: 1 },
    { unique: true, partialFilterExpression: { isDefault: true } }
);

const PeriodTemplate = mongoose.model('PeriodTemplate', periodTemplateSchema);

export { PERIOD_TYPES, DAYS };
export default PeriodTemplate;
