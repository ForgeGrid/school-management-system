import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// THUNKS
// ---------------------------------------------------------------------------

export const createStaffProfile = createAsyncThunk(
  "staff/createStaffProfile",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/staff-profile/create", body);
      return data; // { message, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create profile.");
    }
  }
);

export const updateStaffProfile = createAsyncThunk(
  "staff/updateStaffProfile",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/staff-profile/update", body);
      return data; // { message, user, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update profile.");
    }
  }
);

export const getMyStaffProfile = createAsyncThunk(
  "staff/getMyStaffProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/staff-profile/me");
      return data; // { profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch your profile.");
    }
  }
);

export const getAllTeachers = createAsyncThunk(
  "staff/getAllTeachers",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/staff-profile/all-teachers");
      return data; // { profiles }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teachers.");
    }
  }
);

// Fetches ALL school users (role: teacher) — works even without a StaffProfile
export const getSchoolStaff = createAsyncThunk(
  "staff/getSchoolStaff",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/school/staff");
      return data; // { success, data: User[] }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch school staff.");
    }
  }
);

export const getOneTeacher = createAsyncThunk(
  "staff/getOneTeacher",
  async (profileId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/staff-profile/teacher/${profileId}`);
      return data; // { profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch teacher.");
    }
  }
);

export const resignStaff = createAsyncThunk(
  "staff/resignStaff",
  async ({ profileId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/staff-profile/staff/${profileId}/resign`, { reason });
      return { profileId, profile: data.profile }; // { message, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to resign staff.");
    }
  }
);

export const requestRejoinStaff = createAsyncThunk(
  "staff/requestRejoinStaff",
  async (profileId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/staff-profile/staff/${profileId}/request-rejoin`);
      return { profileId, profile: data.profile }; // { message, profile }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to request rejoin.");
    }
  }
);

// ---------------------------------------------------------------------------
// INITIAL STATE
// ---------------------------------------------------------------------------

const initialState = {
  teachers: [],
  schoolStaff: [],          // all school users with role:teacher (no StaffProfile required)
  selectedTeacher: null,
  myProfile: null,
  loading: {
    createStaffProfile: false,
    updateStaffProfile: false,
    getMyStaffProfile: false,
    getAllTeachers: false,
    getOneTeacher: false,
    resignStaff: false,
    requestRejoinStaff: false,
    getSchoolStaff: false,
  },
  notification: null,
};

// ---------------------------------------------------------------------------
// SLICE
// ---------------------------------------------------------------------------

const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    clearSelectedTeacher(state) {
      state.selectedTeacher = null;
    },
    setStaffNotification(state, { payload: { type, message } }) {
      state.notification = { type, message };
    },
    clearStaffNotification(state) {
      state.notification = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (key) => (state) => { state.loading[key] = true; };
    const done    = (key) => (state) => { state.loading[key] = false; };

    // Create profile
    builder
      .addCase(createStaffProfile.pending, loading("createStaffProfile"))
      .addCase(createStaffProfile.fulfilled, (state, { payload }) => {
        state.loading.createStaffProfile = false;
        state.notification = { type: "success", message: "Profile created successfully." };
        if (payload?.profile) state.myProfile = payload.profile;
      })
      .addCase(createStaffProfile.rejected, (state, { payload }) => {
        state.loading.createStaffProfile = false;
        state.notification = { type: "error", message: payload };
      });

    // Update profile
    builder
      .addCase(updateStaffProfile.pending, loading("updateStaffProfile"))
      .addCase(updateStaffProfile.fulfilled, (state, { payload }) => {
        state.loading.updateStaffProfile = false;
        state.notification = { type: "success", message: "Profile updated successfully." };
        if (payload?.profile) {
          state.myProfile = payload.profile;
          // also sync inside teachers list if present
          const idx = state.teachers.findIndex((t) => t._id === payload.profile._id);
          if (idx !== -1) state.teachers[idx] = payload.profile;
        }
      })
      .addCase(updateStaffProfile.rejected, (state, { payload }) => {
        state.loading.updateStaffProfile = false;
        state.notification = { type: "error", message: payload };
      });

    // Get my profile
    builder
      .addCase(getMyStaffProfile.pending, loading("getMyStaffProfile"))
      .addCase(getMyStaffProfile.fulfilled, (state, { payload }) => {
        state.loading.getMyStaffProfile = false;
        state.myProfile = payload?.profile ?? null;
      })
      .addCase(getMyStaffProfile.rejected, done("getMyStaffProfile"));

    // Get all teachers
    builder
      .addCase(getAllTeachers.pending, loading("getAllTeachers"))
      .addCase(getAllTeachers.fulfilled, (state, { payload }) => {
        state.loading.getAllTeachers = false;
        // backend returns { profiles } — handle all shapes defensively
        state.teachers =
          Array.isArray(payload?.profiles) ? payload.profiles :
          Array.isArray(payload?.data)     ? payload.data     :
          Array.isArray(payload)           ? payload          :
          [];
      })
      .addCase(getAllTeachers.rejected, done("getAllTeachers"));

    // Get school staff (all teachers, with or without StaffProfile)
    builder
      .addCase(getSchoolStaff.pending, loading("getSchoolStaff"))
      .addCase(getSchoolStaff.fulfilled, (state, { payload }) => {
        state.loading.getSchoolStaff = false;
        // Store ALL school members — filtering by role is done in the component
        state.schoolStaff = Array.isArray(payload?.data) ? payload.data : [];
      })
      .addCase(getSchoolStaff.rejected, (state, { payload }) => {
        state.loading.getSchoolStaff = false;
        state.notification = { type: "error", message: payload };
      });

    // Get one teacher
    builder
      .addCase(getOneTeacher.pending, loading("getOneTeacher"))
      .addCase(getOneTeacher.fulfilled, (state, { payload }) => {
        state.loading.getOneTeacher = false;
        state.selectedTeacher = payload?.profile ?? payload ?? null;
      })
      .addCase(getOneTeacher.rejected, done("getOneTeacher"));

    // Resign staff
    builder
      .addCase(resignStaff.pending, loading("resignStaff"))
      .addCase(resignStaff.fulfilled, (state, { payload }) => {
        state.loading.resignStaff = false;
        state.notification = { type: "success", message: "Staff resigned successfully." };
        // update the teacher in list
        const idx = state.teachers.findIndex((t) => t._id === payload.profileId);
        if (idx !== -1) state.teachers[idx] = payload.profile;
        if (state.selectedTeacher?._id === payload.profileId) {
          state.selectedTeacher = payload.profile;
        }
      })
      .addCase(resignStaff.rejected, (state, { payload }) => {
        state.loading.resignStaff = false;
        state.notification = { type: "error", message: payload };
      });

    // Request rejoin
    builder
      .addCase(requestRejoinStaff.pending, loading("requestRejoinStaff"))
      .addCase(requestRejoinStaff.fulfilled, (state, { payload }) => {
        state.loading.requestRejoinStaff = false;
        state.notification = { type: "success", message: "Rejoin request submitted." };
        const idx = state.teachers.findIndex((t) => t._id === payload.profileId);
        if (idx !== -1) state.teachers[idx] = payload.profile;
        if (state.selectedTeacher?._id === payload.profileId) {
          state.selectedTeacher = payload.profile;
        }
      })
      .addCase(requestRejoinStaff.rejected, (state, { payload }) => {
        state.loading.requestRejoinStaff = false;
        state.notification = { type: "error", message: payload };
      });
  },
});

// ---------------------------------------------------------------------------
// ACTIONS
// ---------------------------------------------------------------------------

export const {
  clearSelectedTeacher,
  setStaffNotification,
  clearStaffNotification,
} = staffSlice.actions;

// ---------------------------------------------------------------------------
// REDUCER
// ---------------------------------------------------------------------------

export const staffReducer = staffSlice.reducer;

// ---------------------------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------------------------

export const selectAllTeachers        = (state) => state.staff.teachers;
export const selectSchoolStaff        = (state) => state.staff.schoolStaff;
export const selectSelectedTeacher    = (state) => state.staff.selectedTeacher;
export const selectMyStaffProfile     = (state) => state.staff.myProfile;
export const selectStaffNotification  = (state) => state.staff.notification;
export const selectStaffLoading       = (key)   => (state) => state.staff.loading[key];
