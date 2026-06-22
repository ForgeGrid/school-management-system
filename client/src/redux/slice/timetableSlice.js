import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "/api/v0/timetable"; // adjust to match your router mount path

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * GET /eligible-staff/:classSectionId
 * Admin only — fetch staff eligible for a class section (optionally filtered by subject)
 * params: { classSectionId, subjectId? }
 */
export const fetchEligibleTimetableStaff = createAsyncThunk(
    "timetable/fetchEligibleTimetableStaff",
    async ({ classSectionId, subjectId = null }, { rejectWithValue }) => {
        try {
            const params = subjectId ? { subjectId } : {};
            const { data } = await axios.get(`${BASE_URL}/eligible-staff/${classSectionId}`, { params });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * POST /upsert
 * Admin only — create or update a single timetable slot
 * payload: { timetableId?, class_section_id, subject_id, staff_id?, assignment_id?,
 *            day_of_week, period_no, period_label?, start_time, end_time, status? }
 */
export const upsertTimetableSlot = createAsyncThunk(
    "timetable/upsertTimetableSlot",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/upsert`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * POST /bulk-upsert
 * Admin only — create or update multiple slots in one transaction
 * payload: { slots: [ ...slotInputs ] }
 */
export const bulkUpsertTimetableSlots = createAsyncThunk(
    "timetable/bulkUpsertTimetableSlots",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/bulk-upsert`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /all
 * Admin only — list all slots with optional filters
 * filters: { classSectionId?, dayOfWeek?, status? }
 */
export const fetchAllTimetableSlots = createAsyncThunk(
    "timetable/fetchAllTimetableSlots",
    async (filters = {}, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/all`, { params: filters });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /detail/:id
 * Admin, Staff, Teacher — get a single slot with full populated detail
 */
export const fetchTimetableSlotById = createAsyncThunk(
    "timetable/fetchTimetableSlotById",
    async (timetableId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/detail/${timetableId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /class/:classSectionId
 * Admin, Staff, Teacher, Student, Parent
 * params: { dayOfWeek? }
 */
export const fetchTimetableByClass = createAsyncThunk(
    "timetable/fetchTimetableByClass",
    async ({ classSectionId, dayOfWeek = null }, { rejectWithValue }) => {
        try {
            const params = dayOfWeek ? { dayOfWeek } : {};
            const { data } = await axios.get(`${BASE_URL}/class/${classSectionId}`, { params });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /staff  OR  /staff/:staffId
 * Admin, Staff, Teacher — admin passes staffId; teacher gets own timetable
 * params: { staffId?, dayOfWeek? }
 */
export const fetchTimetableByStaff = createAsyncThunk(
    "timetable/fetchTimetableByStaff",
    async ({ staffId = null, dayOfWeek = null } = {}, { rejectWithValue }) => {
        try {
            const url = staffId ? `${BASE_URL}/staff/${staffId}` : `${BASE_URL}/staff`;
            const params = dayOfWeek ? { dayOfWeek } : {};
            const { data } = await axios.get(url, { params });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * POST /publish
 * Admin only — publish all draft slots for a class section (optionally filter by day)
 * payload: { classSectionId, dayOfWeek? }
 */
export const publishTimetable = createAsyncThunk(
    "timetable/publishTimetable",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/publish`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * DELETE /delete/:id
 * Admin only — soft deactivate a timetable slot
 */
export const deleteTimetableSlot = createAsyncThunk(
    "timetable/deleteTimetableSlot",
    async (timetableId, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/delete/${timetableId}`);
            return { timetableId, ...data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /my-timetable
 * Student or Parent — get own timetable (parent can pass childId)
 * params: { dayOfWeek?, childId? }
 */
export const fetchMyTimetable = createAsyncThunk(
    "timetable/fetchMyTimetable",
    async (params = {}, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/my-timetable`, { params });
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState = {
    // Admin full list view
    allSlots: [],

    // Timetable by class section { classSection: {}, timetable: [] }
    classTimetable: null,

    // Timetable by staff { staffId, timetable: [] }
    staffTimetable: null,

    // Student / parent personal timetable
    myTimetable: null,

    // Detail view of a single slot
    selectedSlot: null,

    // Eligible staff for a class section (used in upsert form)
    eligibleStaff: null, // { classSection, subject, classTeacher, candidates[] }

    // Bulk upsert result { success, results[], warnings[] }
    bulkResult: null,

    // Publish result { publishedCount, skipped[], warnings[] }
    publishResult: null,

    // Granular loading per action
    loading: {
        all: false,
        detail: false,
        byClass: false,
        byStaff: false,
        myTimetable: false,
        eligibleStaff: false,
        upsert: false,
        bulkUpsert: false,
        publish: false,
        delete: false,
    },

    // Granular errors per action
    error: {
        all: null,
        detail: null,
        byClass: null,
        byStaff: null,
        myTimetable: null,
        eligibleStaff: null,
        upsert: null,
        bulkUpsert: null,
        publish: null,
        delete: null,
    },
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const timetableSlice = createSlice({
    name: "timetable",
    initialState,
    reducers: {
        /** Clear selected slot detail — call before opening detail modal */
        clearSelectedSlot(state) {
            state.selectedSlot = null;
            state.error.detail = null;
        },

        /** Clear eligible staff list — call when closing the upsert form */
        clearEligibleTimetableStaff(state) {
            state.eligibleStaff = null;
            state.error.eligibleStaff = null;
        },

        /** Clear bulk upsert result after user dismisses the summary */
        clearBulkResult(state) {
            state.bulkResult = null;
            state.error.bulkUpsert = null;
        },

        /** Clear publish result after user dismisses the summary */
        clearPublishResult(state) {
            state.publishResult = null;
            state.error.publish = null;
        },

        /** Clear a specific error key */
        clearError(state, action) {
            const key = action.payload;
            if (key && state.error[key] !== undefined) {
                state.error[key] = null;
            }
        },

        /** Reset entire slice — call on logout */
        resetTimetableState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // ── Eligible Staff ────────────────────────────
        builder
            .addCase(fetchEligibleTimetableStaff.pending, (state) => {
                state.loading.eligibleStaff = true;
                state.error.eligibleStaff = null;
            })
            .addCase(fetchEligibleTimetableStaff.fulfilled, (state, action) => {
                state.loading.eligibleStaff = false;
                state.eligibleStaff = action.payload?.data || action.payload;
            })
            .addCase(fetchEligibleTimetableStaff.rejected, (state, action) => {
                state.loading.eligibleStaff = false;
                state.error.eligibleStaff = action.payload;
            });

        // ── Upsert Single Slot ────────────────────────
        builder
            .addCase(upsertTimetableSlot.pending, (state) => {
                state.loading.upsert = true;
                state.error.upsert = null;
            })
            .addCase(upsertTimetableSlot.fulfilled, (state, action) => {
                state.loading.upsert = false;
                const slot = action.payload?.data?.timetable || action.payload?.timetable;
                if (slot) {
                    // Reflect the upsert in the allSlots list if it's already loaded
                    const idx = state.allSlots.findIndex((s) => s.id === slot.id);
                    if (idx !== -1) {
                        state.allSlots[idx] = slot;
                    } else {
                        state.allSlots.unshift(slot);
                    }
                    // Refresh class timetable list if it's for the same class
                    if (state.classTimetable?.timetable) {
                        const ci = state.classTimetable.timetable.findIndex((s) => s.id === slot.id);
                        if (ci !== -1) state.classTimetable.timetable[ci] = slot;
                        else state.classTimetable.timetable.push(slot);
                    }
                }
            })
            .addCase(upsertTimetableSlot.rejected, (state, action) => {
                state.loading.upsert = false;
                state.error.upsert = action.payload;
            });

        // ── Bulk Upsert ───────────────────────────────
        builder
            .addCase(bulkUpsertTimetableSlots.pending, (state) => {
                state.loading.bulkUpsert = true;
                state.error.bulkUpsert = null;
                state.bulkResult = null;
            })
            .addCase(bulkUpsertTimetableSlots.fulfilled, (state, action) => {
                state.loading.bulkUpsert = false;
                state.bulkResult = action.payload?.data || action.payload;
            })
            .addCase(bulkUpsertTimetableSlots.rejected, (state, action) => {
                state.loading.bulkUpsert = false;
                state.error.bulkUpsert = action.payload;
            });

        // ── All Slots (Admin List) ────────────────────
        builder
            .addCase(fetchAllTimetableSlots.pending, (state) => {
                state.loading.all = true;
                state.error.all = null;
            })
            .addCase(fetchAllTimetableSlots.fulfilled, (state, action) => {
                state.loading.all = false;
                const payload = action.payload?.data ?? action.payload;
                state.allSlots = Array.isArray(payload) ? payload : [];
            })
            .addCase(fetchAllTimetableSlots.rejected, (state, action) => {
                state.loading.all = false;
                state.error.all = action.payload;
            });

        // ── Slot Detail ───────────────────────────────
        builder
            .addCase(fetchTimetableSlotById.pending, (state) => {
                state.loading.detail = true;
                state.error.detail = null;
            })
            .addCase(fetchTimetableSlotById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.selectedSlot = action.payload?.data || action.payload;
            })
            .addCase(fetchTimetableSlotById.rejected, (state, action) => {
                state.loading.detail = false;
                state.error.detail = action.payload;
            });

        // ── Timetable By Class ────────────────────────
        builder
            .addCase(fetchTimetableByClass.pending, (state) => {
                state.loading.byClass = true;
                state.error.byClass = null;
            })
            .addCase(fetchTimetableByClass.fulfilled, (state, action) => {
                state.loading.byClass = false;
                state.classTimetable = action.payload?.data || action.payload;
            })
            .addCase(fetchTimetableByClass.rejected, (state, action) => {
                state.loading.byClass = false;
                state.error.byClass = action.payload;
            });

        // ── Timetable By Staff ────────────────────────
        builder
            .addCase(fetchTimetableByStaff.pending, (state) => {
                state.loading.byStaff = true;
                state.error.byStaff = null;
            })
            .addCase(fetchTimetableByStaff.fulfilled, (state, action) => {
                state.loading.byStaff = false;
                state.staffTimetable = action.payload?.data || action.payload;
            })
            .addCase(fetchTimetableByStaff.rejected, (state, action) => {
                state.loading.byStaff = false;
                state.error.byStaff = action.payload;
            });

        // ── Publish Timetable ─────────────────────────
        builder
            .addCase(publishTimetable.pending, (state) => {
                state.loading.publish = true;
                state.error.publish = null;
                state.publishResult = null;
            })
            .addCase(publishTimetable.fulfilled, (state, action) => {
                state.loading.publish = false;
                state.publishResult = action.payload?.data || action.payload;
                // Flip matching draft slots to "published" in classTimetable if loaded
                const published = action.payload?.data || action.payload;
                const publishedIds = new Set(
                    (published?.timetableIds || []).map(String)
                );
                if (state.classTimetable?.timetable && publishedIds.size) {
                    state.classTimetable.timetable = state.classTimetable.timetable.map((s) =>
                        publishedIds.has(String(s.id)) ? { ...s, status: "published" } : s
                    );
                }
            })
            .addCase(publishTimetable.rejected, (state, action) => {
                state.loading.publish = false;
                state.error.publish = action.payload;
            });

        // ── Delete (Deactivate) Slot ──────────────────
        builder
            .addCase(deleteTimetableSlot.pending, (state) => {
                state.loading.delete = true;
                state.error.delete = null;
            })
            .addCase(deleteTimetableSlot.fulfilled, (state, action) => {
                state.loading.delete = false;
                const deactivated = action.payload?.data || action.payload;
                const targetId = deactivated?.id || action.payload?.timetableId;
                if (targetId) {
                    // Flip to inactive in allSlots list
                    const idx = state.allSlots.findIndex((s) => s.id === targetId);
                    if (idx !== -1) state.allSlots[idx].status = "inactive";
                    // Flip in classTimetable
                    if (state.classTimetable?.timetable) {
                        const ci = state.classTimetable.timetable.findIndex((s) => s.id === targetId);
                        if (ci !== -1) state.classTimetable.timetable[ci].status = "inactive";
                    }
                    // Flip in selectedSlot
                    if (state.selectedSlot?.id === targetId) {
                        state.selectedSlot.status = "inactive";
                    }
                }
            })
            .addCase(deleteTimetableSlot.rejected, (state, action) => {
                state.loading.delete = false;
                state.error.delete = action.payload;
            });

        // ── My Timetable (Student / Parent) ──────────
        builder
            .addCase(fetchMyTimetable.pending, (state) => {
                state.loading.myTimetable = true;
                state.error.myTimetable = null;
            })
            .addCase(fetchMyTimetable.fulfilled, (state, action) => {
                state.loading.myTimetable = false;
                state.myTimetable = action.payload?.data || action.payload;
            })
            .addCase(fetchMyTimetable.rejected, (state, action) => {
                state.loading.myTimetable = false;
                state.error.myTimetable = action.payload;
            });
    },
});

// ─────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────

export const {
    clearSelectedSlot,
    clearEligibleTimetableStaff,
    clearBulkResult,
    clearPublishResult,
    clearError,
    resetTimetableState,
} = timetableSlice.actions;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectAllSlots = (state) => state.timetable.allSlots;
export const selectClassTimetable = (state) => state.timetable.classTimetable;
export const selectStaffTimetable = (state) => state.timetable.staffTimetable;
export const selectMyTimetable = (state) => state.timetable.myTimetable;
export const selectSelectedSlot = (state) => state.timetable.selectedSlot;
export const selectEligibleTimetableStaff = (state) => state.timetable.eligibleStaff;
export const selectBulkResult = (state) => state.timetable.bulkResult;
export const selectPublishResult = (state) => state.timetable.publishResult;
export const selectTimetableLoading = (state) => state.timetable.loading;
export const selectTimetableError = (state) => state.timetable.error;

// Granular loading selectors (for button spinners / skeleton loaders)
export const selectIsUpsertingSlot = (state) => state.timetable.loading.upsert;
export const selectIsBulkUpserting = (state) => state.timetable.loading.bulkUpsert;
export const selectIsPublishing = (state) => state.timetable.loading.publish;
export const selectIsDeletingSlot = (state) => state.timetable.loading.delete;
export const selectIsFetchingAllSlots = (state) => state.timetable.loading.all;
export const selectIsFetchingByClass = (state) => state.timetable.loading.byClass;
export const selectIsFetchingByStaff = (state) => state.timetable.loading.byStaff;
export const selectIsFetchingMyTimetable = (state) => state.timetable.loading.myTimetable;
export const selectIsFetchingEligibleStaff = (state) => state.timetable.loading.eligibleStaff;

// Derived — only published slots from the class timetable (used in student view)
export const selectPublishedClassSlots = (state) =>
    state.timetable.classTimetable?.timetable?.filter((s) => s.status === "published") ?? [];

// Derived — slots grouped by day (for rendering a weekly grid)
export const selectClassSlotsByDay = (state) => {
    const slots = state.timetable.classTimetable?.timetable ?? [];
    return slots.reduce((acc, slot) => {
        const day = slot.day_of_week;
        if (!acc[day]) acc[day] = [];
        acc[day].push(slot);
        return acc;
    }, {});
};

export default timetableSlice.reducer;
