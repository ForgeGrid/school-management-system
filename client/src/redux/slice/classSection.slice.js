import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/class-sections`;

// ─── ASYNC THUNKS ─────────────────────────────────────────────────────────────

export const createClassSection = createAsyncThunk(
  "classSection/create",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE_URL}/create`, body, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateClassSection = createAsyncThunk(
  "classSection/update",
  async ({ classSectionId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${BASE_URL}/update/${classSectionId}`,
        body,
        { withCredentials: true }
      );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getClassSections = createAsyncThunk(
  "classSection/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/all`, {
        withCredentials: true,
        params,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getOneClassSection = createAsyncThunk(
  "classSection/getOne",
  async (classSectionId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/detail/${classSectionId}`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// student / parent — pass childId for parent role
export const getClassIntro = createAsyncThunk(
  "classSection/getClassIntro",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/class-intro`, {
        withCredentials: true,
        params,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// admin / teacher — pass attendanceDate as optional query param
export const getClassSectionHub = createAsyncThunk(
  "classSection/getHub",
  async ({ classSectionId, attendanceDate } = {}, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/${classSectionId}/hub`, {
        withCredentials: true,
        params: attendanceDate ? { attendanceDate } : {},
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// teacher only
export const getMyClasses = createAsyncThunk(
  "classSection/getMyClasses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/my-classes`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─── INITIAL STATE ────────────────────────────────────────────────────────────

const initialState = {
  // admin list
  classSections: [],

  // admin detail / selected
  selectedClassSection: null,

  // student / parent class intro
  classIntro: null,

  // hub (admin + teacher)
  hub: null,

  // teacher my-classes
  myClasses: {
    classTeacherSections: [],
    assignedSections: [],
    totalClassTeacherSections: 0,
    totalAssignedSections: 0,
    totalSections: 0,
    roleSummary: {
      isClassTeacher: false,
      isSubjectTeacher: false,
    },
  },

  filters: {
    academicYear: "",
    standard: "",
    status: "",
  },

  loading: {
    create: false,
    update: false,
    getAll: false,
    getOne: false,
    classIntro: false,
    hub: false,
    myClasses: false,
  },

  error: null,
};

// ─── SLICE ────────────────────────────────────────────────────────────────────

const classSectionSlice = createSlice({
  name: "classSection",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    clearSelectedClassSection(state) {
      state.selectedClassSection = null;
    },
    clearHub(state) {
      state.hub = null;
    },
    clearClassIntro(state) {
      state.classIntro = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {

    // ── Create ──────────────────────────────────────────────────────────────
    builder
      .addCase(createClassSection.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createClassSection.fulfilled, (state, action) => {
        state.loading.create = false;
        state.classSections.unshift(action.payload.classSection);
      })
      .addCase(createClassSection.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      });

    // ── Update ──────────────────────────────────────────────────────────────
    builder
      .addCase(updateClassSection.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateClassSection.fulfilled, (state, action) => {
        state.loading.update = false;
        const updated = action.payload.classSection;
        const index = state.classSections.findIndex((cs) => cs._id === updated._id);
        if (index !== -1) state.classSections[index] = updated;
        if (state.selectedClassSection?._id === updated._id) {
          state.selectedClassSection = updated;
        }
      })
      .addCase(updateClassSection.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      });

    // ── Get All ─────────────────────────────────────────────────────────────
    builder
      .addCase(getClassSections.pending, (state) => {
        state.loading.getAll = true;
        state.error = null;
      })
      .addCase(getClassSections.fulfilled, (state, action) => {
        state.loading.getAll = false;
        state.classSections = action.payload.classSections ?? [];
      })
      .addCase(getClassSections.rejected, (state, action) => {
        state.loading.getAll = false;
        state.error = action.payload;
      });

    // ── Get One ─────────────────────────────────────────────────────────────
    builder
      .addCase(getOneClassSection.pending, (state) => {
        state.loading.getOne = true;
        state.error = null;
      })
      .addCase(getOneClassSection.fulfilled, (state, action) => {
        state.loading.getOne = false;
        state.selectedClassSection = action.payload.classSection;
      })
      .addCase(getOneClassSection.rejected, (state, action) => {
        state.loading.getOne = false;
        state.error = action.payload;
      });

    // ── Class Intro ─────────────────────────────────────────────────────────
    builder
      .addCase(getClassIntro.pending, (state) => {
        state.loading.classIntro = true;
        state.error = null;
        state.classIntro = null;
      })
      .addCase(getClassIntro.fulfilled, (state, action) => {
        state.loading.classIntro = false;
        state.classIntro = action.payload ?? null;
      })
      .addCase(getClassIntro.rejected, (state, action) => {
        state.loading.classIntro = false;
        state.error = action.payload;
      });

    // ── Hub ─────────────────────────────────────────────────────────────────
    builder
      .addCase(getClassSectionHub.pending, (state) => {
        state.loading.hub = true;
        state.error = null;
        state.hub = null;
      })
      .addCase(getClassSectionHub.fulfilled, (state, action) => {
        state.loading.hub = false;
        state.hub = action.payload ?? null;
      })
      .addCase(getClassSectionHub.rejected, (state, action) => {
        state.loading.hub = false;
        state.error = action.payload;
      });

    // ── My Classes ──────────────────────────────────────────────────────────
    builder
      .addCase(getMyClasses.pending, (state) => {
        state.loading.myClasses = true;
        state.error = null;
      })
      .addCase(getMyClasses.fulfilled, (state, action) => {
        state.loading.myClasses = false;
        const payload = action.payload ?? {};
        state.myClasses.classTeacherSections  = payload.classTeacherSections  ?? [];
        state.myClasses.assignedSections       = payload.assignedSections       ?? [];
        state.myClasses.totalClassTeacherSections = payload.totalClassTeacherSections ?? 0;
        state.myClasses.totalAssignedSections     = payload.totalAssignedSections     ?? 0;
        state.myClasses.totalSections             = payload.totalSections             ?? 0;
        state.myClasses.roleSummary               = payload.roleSummary               ?? initialState.myClasses.roleSummary;
      })
      .addCase(getMyClasses.rejected, (state, action) => {
        state.loading.myClasses = false;
        state.error = action.payload;
      });
  },
});

// ─── ACTIONS ──────────────────────────────────────────────────────────────────

export const {
  setFilters,
  resetFilters,
  clearSelectedClassSection,
  clearHub,
  clearClassIntro,
  clearError,
} = classSectionSlice.actions;

export default classSectionSlice.reducer;

// ─── SELECTORS ────────────────────────────────────────────────────────────────

export const selectClassSections        = (state) => state.classSection.classSections;
export const selectSelectedClassSection = (state) => state.classSection.selectedClassSection;
export const selectClassIntro           = (state) => state.classSection.classIntro;
export const selectHub                  = (state) => state.classSection.hub;
export const selectMyClasses            = (state) => state.classSection.myClasses;
export const selectFilters              = (state) => state.classSection.filters;
export const selectLoading              = (state) => state.classSection.loading;
export const selectError                = (state) => state.classSection.error;
