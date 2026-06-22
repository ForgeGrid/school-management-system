import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "/api/v0/class-subject-assignments"; // adjust prefix to match your router mount path

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * GET /eligible-staff/:subjectId
 * Admin only — fetch staff eligible to teach a given subject
 */
export const fetchEligibleStaff = createAsyncThunk(
    "classSubjectAssignment/fetchEligibleStaff",
    async (subjectId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/eligible-staff/${subjectId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * POST /create
 * Admin only — create a new assignment
 * payload: { subject_id, staff_id, class_section_ids: [] }
 */
export const createAssignment = createAsyncThunk(
    "classSubjectAssignment/createAssignment",
    async (payload, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${BASE_URL}/create`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * GET /all
 * Admin sees all; Teacher sees own.
 * filters: { page, limit, staff_id, subject_id, class_id, status, search }
 */
export const fetchAssignments = createAsyncThunk(
    "classSubjectAssignment/fetchAssignments",
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
 * GET /:id
 * Admin or owner teacher — fetch a single assignment
 */
export const fetchAssignmentById = createAsyncThunk(
    "classSubjectAssignment/fetchAssignmentById",
    async (assignmentId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/${assignmentId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * PATCH /update/:id
 * Admin only — partial update (subject, staff, sections, status)
 * payload: { subject_id?, staff_id?, class_section_ids?: [], status? }
 */
export const updateAssignment = createAsyncThunk(
    "classSubjectAssignment/updateAssignment",
    async ({ assignmentId, payload }, { rejectWithValue }) => {
        try {
            const { data } = await axios.patch(`${BASE_URL}/update/${assignmentId}`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * DELETE /delete/:id
 * Admin only — deactivates the assignment (soft delete)
 */
export const deactivateAssignment = createAsyncThunk(
    "classSubjectAssignment/deactivateAssignment",
    async (assignmentId, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/delete/${assignmentId}`);
            return { assignmentId, ...data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

// ─────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────

const initialState = {
    // List view
    assignments: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },

    // Detail view
    selectedAssignment: null,

    // Eligible staff for a subject (used in create/update form)
    eligibleStaff: [],

    // Loading states per action
    loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        deactivate: false,
        eligibleStaff: false,
    },

    // Error states per action
    error: {
        list: null,
        detail: null,
        create: null,
        update: null,
        deactivate: null,
        eligibleStaff: null,
    },
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const classSubjectAssignmentSlice = createSlice({
    name: "classSubjectAssignment",
    initialState,
    reducers: {
        /** Call before opening the detail modal/page to reset stale data */
        clearSelectedAssignment(state) {
            state.selectedAssignment = null;
            state.error.detail = null;
        },

        /** Call when closing the create/update form */
        clearEligibleStaff(state) {
            state.eligibleStaff = [];
            state.error.eligibleStaff = null;
        },

        /** Manually clear any specific error key */
        clearError(state, action) {
            const key = action.payload; // e.g. "create" | "update" | "list" …
            if (key && state.error[key] !== undefined) {
                state.error[key] = null;
            }
        },

        /** Reset the entire slice (e.g. on logout) */
        resetAssignmentState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // ── Fetch Eligible Staff ──────────────────────
        builder
            .addCase(fetchEligibleStaff.pending, (state) => {
                state.loading.eligibleStaff = true;
                state.error.eligibleStaff = null;
            })
            .addCase(fetchEligibleStaff.fulfilled, (state, action) => {
                state.loading.eligibleStaff = false;
                state.eligibleStaff = action.payload?.data || action.payload || [];
            })
            .addCase(fetchEligibleStaff.rejected, (state, action) => {
                state.loading.eligibleStaff = false;
                state.error.eligibleStaff = action.payload;
            });

        // ── Create Assignment ─────────────────────────
        builder
            .addCase(createAssignment.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
            })
            .addCase(createAssignment.fulfilled, (state, action) => {
                state.loading.create = false;
                const newAssignment = action.payload?.data || action.payload;
                if (newAssignment) {
                    state.assignments.unshift(newAssignment);
                    state.pagination.total += 1;
                }
            })
            .addCase(createAssignment.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload;
            });

        // ── Fetch Assignments (List) ──────────────────
        builder
            .addCase(fetchAssignments.pending, (state) => {
                state.loading.list = true;
                state.error.list = null;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.loading.list = false;
                const payload = action.payload?.data ?? action.payload;
                state.assignments = Array.isArray(payload)
                    ? payload
                    : payload?.data || [];
                state.pagination = action.payload?.pagination || initialState.pagination;
            })
            .addCase(fetchAssignments.rejected, (state, action) => {
                state.loading.list = false;
                state.error.list = action.payload;
            });

        // ── Fetch Single Assignment ───────────────────
        builder
            .addCase(fetchAssignmentById.pending, (state) => {
                state.loading.detail = true;
                state.error.detail = null;
            })
            .addCase(fetchAssignmentById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.selectedAssignment = action.payload?.data || action.payload;
            })
            .addCase(fetchAssignmentById.rejected, (state, action) => {
                state.loading.detail = false;
                state.error.detail = action.payload;
            });

        // ── Update Assignment ─────────────────────────
        builder
            .addCase(updateAssignment.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
            })
            .addCase(updateAssignment.fulfilled, (state, action) => {
                state.loading.update = false;
                const updated = action.payload?.data || action.payload;
                if (updated?.id) {
                    // Patch in the list
                    const idx = state.assignments.findIndex((a) => a.id === updated.id);
                    if (idx !== -1) state.assignments[idx] = updated;
                    // Patch the selected detail if it's the same record
                    if (state.selectedAssignment?.id === updated.id) {
                        state.selectedAssignment = updated;
                    }
                }
            })
            .addCase(updateAssignment.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload;
            });

        // ── Deactivate Assignment ─────────────────────
        builder
            .addCase(deactivateAssignment.pending, (state) => {
                state.loading.deactivate = true;
                state.error.deactivate = null;
            })
            .addCase(deactivateAssignment.fulfilled, (state, action) => {
                state.loading.deactivate = false;
                const deactivated = action.payload?.data || action.payload;
                const targetId = deactivated?.id || action.payload?.assignmentId;
                if (targetId) {
                    // Update status to "inactive" in list rather than removing —
                    // mirrors the soft-delete behaviour on the backend.
                    const idx = state.assignments.findIndex((a) => a.id === targetId);
                    if (idx !== -1) state.assignments[idx].status = "inactive";
                    if (state.selectedAssignment?.id === targetId) {
                        state.selectedAssignment.status = "inactive";
                    }
                }
            })
            .addCase(deactivateAssignment.rejected, (state, action) => {
                state.loading.deactivate = false;
                state.error.deactivate = action.payload;
            });
    },
});

// ─────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────

export const {
    clearSelectedAssignment,
    clearEligibleStaff,
    clearError,
    resetAssignmentState,
} = classSubjectAssignmentSlice.actions;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectAssignments = (state) => state.classSubjectAssignment.assignments;
export const selectAssignmentPagination = (state) => state.classSubjectAssignment.pagination;
export const selectSelectedAssignment = (state) => state.classSubjectAssignment.selectedAssignment;
export const selectEligibleStaff = (state) => state.classSubjectAssignment.eligibleStaff;
export const selectAssignmentLoading = (state) => state.classSubjectAssignment.loading;
export const selectAssignmentError = (state) => state.classSubjectAssignment.error;

// Granular loading selectors (handy for button spinners)
export const selectIsCreating = (state) => state.classSubjectAssignment.loading.create;
export const selectIsUpdating = (state) => state.classSubjectAssignment.loading.update;
export const selectIsDeactivating = (state) => state.classSubjectAssignment.loading.deactivate;
export const selectIsFetchingList = (state) => state.classSubjectAssignment.loading.list;
export const selectIsFetchingDetail = (state) => state.classSubjectAssignment.loading.detail;
export const selectIsFetchingEligibleStaff = (state) => state.classSubjectAssignment.loading.eligibleStaff;

export default classSubjectAssignmentSlice.reducer;
