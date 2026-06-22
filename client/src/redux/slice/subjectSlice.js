import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = "/api/v0/subjects"; // adjust to match your router mount path

// ─────────────────────────────────────────────
// ASYNC THUNKS
// ─────────────────────────────────────────────

/**
 * POST /create
 * Admin only — create a new subject
 * payload: { name, code?, description?, status? }
 */
export const createSubject = createAsyncThunk(
    "subject/createSubject",
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
 * Admin, Staff, Teacher — list subjects with optional filters
 * filters: { page?, limit?, status?, search? }
 */
export const fetchSubjects = createAsyncThunk(
    "subject/fetchSubjects",
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
 * Admin, Staff, Teacher — fetch a single subject by ID
 */
export const fetchSubjectById = createAsyncThunk(
    "subject/fetchSubjectById",
    async (subjectId, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${BASE_URL}/${subjectId}`);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * PATCH /update/:id
 * Admin only — partial update
 * payload: { name?, code?, description?, status? }
 */
export const updateSubject = createAsyncThunk(
    "subject/updateSubject",
    async ({ subjectId, payload }, { rejectWithValue }) => {
        try {
            const { data } = await axios.patch(`${BASE_URL}/update/${subjectId}`, payload);
            return data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || err.message);
        }
    }
);

/**
 * DELETE /delete/:id
 * Admin only — soft delete (sets status to "inactive")
 */
export const deleteSubject = createAsyncThunk(
    "subject/deleteSubject",
    async (subjectId, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/delete/${subjectId}`);
            return { subjectId, ...data };
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
    subjects: [],
    pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
    },

    // Detail view
    selectedSubject: null,

    // Granular loading states
    loading: {
        list: false,
        detail: false,
        create: false,
        update: false,
        delete: false,
    },

    // Granular error states
    error: {
        list: null,
        detail: null,
        create: null,
        update: null,
        delete: null,
    },
};

// ─────────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────────

const subjectSlice = createSlice({
    name: "subject",
    initialState,
    reducers: {
        /** Clear selected subject — call before opening detail modal/page */
        clearSelectedSubject(state) {
            state.selectedSubject = null;
            state.error.detail = null;
        },

        /** Clear a specific error key */
        clearError(state, action) {
            const key = action.payload; // "create" | "update" | "delete" | "list" | "detail"
            if (key && state.error[key] !== undefined) {
                state.error[key] = null;
            }
        },

        /** Reset entire slice (e.g. on logout) */
        resetSubjectState() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        // ── Create Subject ────────────────────────────
        builder
            .addCase(createSubject.pending, (state) => {
                state.loading.create = true;
                state.error.create = null;
            })
            .addCase(createSubject.fulfilled, (state, action) => {
                state.loading.create = false;
                const newSubject = action.payload?.data || action.payload;
                if (newSubject) {
                    state.subjects.unshift(newSubject);
                    state.pagination.total += 1;
                }
            })
            .addCase(createSubject.rejected, (state, action) => {
                state.loading.create = false;
                state.error.create = action.payload;
            });

        // ── Fetch Subjects (List) ─────────────────────
        builder
            .addCase(fetchSubjects.pending, (state) => {
                state.loading.list = true;
                state.error.list = null;
            })
            .addCase(fetchSubjects.fulfilled, (state, action) => {
                state.loading.list = false;
                const payload = action.payload?.data ?? action.payload;
                state.subjects = Array.isArray(payload) ? payload : payload?.data || [];
                state.pagination = action.payload?.pagination || initialState.pagination;
            })
            .addCase(fetchSubjects.rejected, (state, action) => {
                state.loading.list = false;
                state.error.list = action.payload;
            });

        // ── Fetch Subject By ID ───────────────────────
        builder
            .addCase(fetchSubjectById.pending, (state) => {
                state.loading.detail = true;
                state.error.detail = null;
            })
            .addCase(fetchSubjectById.fulfilled, (state, action) => {
                state.loading.detail = false;
                state.selectedSubject = action.payload?.data || action.payload;
            })
            .addCase(fetchSubjectById.rejected, (state, action) => {
                state.loading.detail = false;
                state.error.detail = action.payload;
            });

        // ── Update Subject ────────────────────────────
        builder
            .addCase(updateSubject.pending, (state) => {
                state.loading.update = true;
                state.error.update = null;
            })
            .addCase(updateSubject.fulfilled, (state, action) => {
                state.loading.update = false;
                const updated = action.payload?.data || action.payload;
                if (updated?._id) {
                    const idx = state.subjects.findIndex((s) => s._id === updated._id);
                    if (idx !== -1) state.subjects[idx] = updated;
                    if (state.selectedSubject?._id === updated._id) {
                        state.selectedSubject = updated;
                    }
                }
            })
            .addCase(updateSubject.rejected, (state, action) => {
                state.loading.update = false;
                state.error.update = action.payload;
            });

        // ── Delete (Deactivate) Subject ───────────────
        builder
            .addCase(deleteSubject.pending, (state) => {
                state.loading.delete = true;
                state.error.delete = null;
            })
            .addCase(deleteSubject.fulfilled, (state, action) => {
                state.loading.delete = false;
                // Backend soft-deletes; mirror that by flipping status in local state
                const deactivated = action.payload?.data || action.payload;
                const targetId = deactivated?._id || action.payload?.subjectId;
                if (targetId) {
                    const idx = state.subjects.findIndex((s) => s._id === targetId);
                    if (idx !== -1) state.subjects[idx].status = "inactive";
                    if (state.selectedSubject?._id === targetId) {
                        state.selectedSubject.status = "inactive";
                    }
                }
            })
            .addCase(deleteSubject.rejected, (state, action) => {
                state.loading.delete = false;
                state.error.delete = action.payload;
            });
    },
});

// ─────────────────────────────────────────────
// ACTIONS
// ─────────────────────────────────────────────

export const {
    clearSelectedSubject,
    clearError,
    resetSubjectState,
} = subjectSlice.actions;

// ─────────────────────────────────────────────
// SELECTORS
// ─────────────────────────────────────────────

export const selectSubjects = (state) => state.subject.subjects;
export const selectSubjectPagination = (state) => state.subject.pagination;
export const selectSelectedSubject = (state) => state.subject.selectedSubject;
export const selectSubjectLoading = (state) => state.subject.loading;
export const selectSubjectError = (state) => state.subject.error;

// Granular loading selectors (for button spinners)
export const selectIsCreatingSubject = (state) => state.subject.loading.create;
export const selectIsUpdatingSubject = (state) => state.subject.loading.update;
export const selectIsDeletingSubject = (state) => state.subject.loading.delete;
export const selectIsFetchingSubjects = (state) => state.subject.loading.list;
export const selectIsFetchingSubjectDetail = (state) => state.subject.loading.detail;

// Derived — only active subjects (useful for dropdowns in assignment forms)
export const selectActiveSubjects = (state) =>
    state.subject.subjects.filter((s) => s.status === "active");

export default subjectSlice.reducer;
