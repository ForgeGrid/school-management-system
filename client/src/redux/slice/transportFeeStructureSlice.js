import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/transport-fee-structure`,
  withCredentials: true,
});


// POST /create
export const createTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/create",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/create", body);
      return data.structures;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create transport fee structure.");
    }
  }
);

// GET /all  
export const getAllTransportFeeStructures = createAsyncThunk(
  "transportFeeStructure/getAll",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/all", { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch transport fee structures.");
    }
  }
);

// GET /detail/:structureId
export const getOneTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/getOne",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/detail/${structureId}`);
      return data.structure;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch transport fee structure.");
    }
  }
);

// GET /active  — query: { academicYear, route_id, dropPoint? }
// A 404 means no fee is configured for that stop yet — treat as null, not an error.
export const getActiveTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/getActive",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/active", { params });
      return data.structure ?? null;
    } catch (err) {
      // 404 = no fee configured yet → not a hard error, resolve with null
      if (err.response?.status === 404) return null;
      return rejectWithValue(err.response?.data?.message || "Failed to fetch active transport fee structure.");
    }
  }
);

// PATCH /update/:structureId
export const updateTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/update",
  async ({ structureId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/update/${structureId}`, body);
      return data.structure;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update transport fee structure.");
    }
  }
);

// PATCH /:structureId/activate
export const activateTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/activate",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/${structureId}/activate`);
      return data.structure;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to activate transport fee structure.");
    }
  }
);

// PATCH /:structureId/archive
export const archiveTransportFeeStructure = createAsyncThunk(
  "transportFeeStructure/archive",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/${structureId}/archive`);
      return data.structure;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to archive transport fee structure.");
    }
  }
);

// PATCH /update/route/:routeId
export const bulkUpdateTransportFeeStructures = createAsyncThunk(
  "transportFeeStructure/bulkUpdate",
  async ({ routeId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/update/route/${routeId}`, body);
      // controller spreads service result: { success, summary }
      return { routeId, ...data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to bulk update transport fee structures.");
    }
  }
);


const initialState = {
  structures: [],
  pagination: null,
  selected: null,
  active: null,

  bulkSummary: null,

  modal: {
    type: null,
    payload: null,
  },

  notification: null,

  loading: {
    create: false,
    getAll: false,
    getOne: false,
    getActive: false,
    update: false,
    activate: false,
    archive: false,
    bulkUpdate: false,
  },
};


// Replace a structure in the list by _id
const replaceStructure = (list, updated) =>
  list.map((s) => (s._id === updated._id ? updated : s));


const transportFeeStructureSlice = createSlice({
  name: "transportFeeStructure",
  initialState,

  reducers: {
    openModal(state, { payload: { type, payload } }) {
      state.modal = { type, payload };
    },
    closeModal(state) {
      state.modal = { type: null, payload: null };
    },
    setNotification(state, { payload: { type, message } }) {
      state.notification = { type, message };
    },
    clearNotification(state) {
      state.notification = null;
    },
    clearSelected(state) {
      state.selected = null;
    },
    clearActive(state) {
      state.active = null;
    },
    clearBulkSummary(state) {
      state.bulkSummary = null;
    },
  },

  extraReducers: (builder) => {
    const pending = (key) => (state) => { state.loading[key] = true; };
    const rejected = (key) => (state, { payload }) => {
      state.loading[key] = false;
      state.notification = { type: "error", message: payload };
    };

    // ── create
    builder
      .addCase(createTransportFeeStructure.pending, pending("create"))
      .addCase(createTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.create = false;
        // payload is an array (insertMany); prepend all new structures
        if (Array.isArray(payload)) {
          state.structures.unshift(...payload);
        }
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Transport fee structure(s) created successfully." };
      })
      .addCase(createTransportFeeStructure.rejected, rejected("create"));

    // ── getAll 
    builder
      .addCase(getAllTransportFeeStructures.pending, pending("getAll"))
      .addCase(getAllTransportFeeStructures.fulfilled, (state, { payload }) => {
        state.loading.getAll = false;
        state.structures = payload.items ?? [];
        state.pagination = payload.pagination ?? null;
      })
      .addCase(getAllTransportFeeStructures.rejected, (state, { payload }) => {
        state.loading.getAll = false;
        state.notification = { type: "error", message: payload };
      });

    // ── getOne 
    builder
      .addCase(getOneTransportFeeStructure.pending, pending("getOne"))
      .addCase(getOneTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.getOne = false;
        state.selected = payload;
      })
      .addCase(getOneTransportFeeStructure.rejected, (state, { payload }) => {
        state.loading.getOne = false;
        state.notification = { type: "error", message: payload };
      });

    // ── getActive
    // fulfilled with null = stop has no fee configured yet (not a hard error)
    builder
      .addCase(getActiveTransportFeeStructure.pending, (state) => {
        state.loading.getActive = true;
        state.active = null; // clear stale value while fetching
      })
      .addCase(getActiveTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.getActive = false;
        state.active = payload; // null if not found, object if found
      })
      .addCase(getActiveTransportFeeStructure.rejected, (state) => {
        // Only reaches here for non-404 errors (network, auth, etc.)
        state.loading.getActive = false;
        state.active = null;
        // Intentionally no error notification — don't spam the user
      });

    // ── update 
    builder
      .addCase(updateTransportFeeStructure.pending, pending("update"))
      .addCase(updateTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.update = false;
        if (payload?._id) {
          state.structures = replaceStructure(state.structures, payload);
        }
        if (state.selected?._id === payload?._id) state.selected = payload;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Transport fee structure updated successfully." };
      })
      .addCase(updateTransportFeeStructure.rejected, rejected("update"));

    // ── activate 
    builder
      .addCase(activateTransportFeeStructure.pending, pending("activate"))
      .addCase(activateTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.activate = false;
        if (payload?._id) {
          state.structures = replaceStructure(state.structures, payload);
        }
        if (state.selected?._id === payload?._id) state.selected = payload;
        state.notification = { type: "success", message: "Transport fee structure activated." };
      })
      .addCase(activateTransportFeeStructure.rejected, rejected("activate"));

    // ── archive
    builder
      .addCase(archiveTransportFeeStructure.pending, pending("archive"))
      .addCase(archiveTransportFeeStructure.fulfilled, (state, { payload }) => {
        state.loading.archive = false;
        if (payload?._id) {
          state.structures = replaceStructure(state.structures, payload);
        }
        if (state.selected?._id === payload?._id) state.selected = payload;
        state.notification = { type: "success", message: "Transport fee structure archived." };
      })
      .addCase(archiveTransportFeeStructure.rejected, rejected("archive"));

    // ── bulkUpdate
    builder
      .addCase(bulkUpdateTransportFeeStructures.pending, pending("bulkUpdate"))
      .addCase(bulkUpdateTransportFeeStructures.fulfilled, (state, { payload }) => {
        state.loading.bulkUpdate = false;
        state.bulkSummary = payload.summary ?? null;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Transport fee structures updated successfully." };
      })
      .addCase(bulkUpdateTransportFeeStructures.rejected, rejected("bulkUpdate"));
  },
});

export const {
  openModal,
  closeModal,
  setNotification,
  clearNotification,
  clearSelected,
  clearActive,
  clearBulkSummary,
} = transportFeeStructureSlice.actions;

export default transportFeeStructureSlice.reducer;


export const selectAllFeeStructures = (state) => state.transportFeeStructure.structures;
export const selectFeeStructurePagination = (state) => state.transportFeeStructure.pagination;
export const selectSelectedFeeStructure = (state) => state.transportFeeStructure.selected;
export const selectActiveFeeStructure = (state) => state.transportFeeStructure.active;
export const selectBulkSummary = (state) => state.transportFeeStructure.bulkSummary;
export const selectFeeStructureModal = (state) => state.transportFeeStructure.modal;
export const selectFeeStructureNotif = (state) => state.transportFeeStructure.notification;
export const selectFeeStructureLoading = (key) => (state) => state.transportFeeStructure.loading[key];

// Derived — filter by route
export const selectFeeStructuresByRoute = (routeId) => (state) =>
  state.transportFeeStructure.structures.filter(
    (s) => s.route_id?._id === routeId || s.route_id === routeId
  );

// Derived — active structures only
export const selectActiveFeeStructures = (state) =>
  state.transportFeeStructure.structures.filter((s) => s.status === "active");

// Derived — by academic year
export const selectFeeStructuresByYear = (academicYear) => (state) =>
  state.transportFeeStructure.structures.filter((s) => s.academicYear === academicYear);
