import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/bus-route`,
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// THUNKS
// ---------------------------------------------------------------------------

export const createBusRoute = createAsyncThunk(
  "busRoute/createBusRoute",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/create", body);
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create bus route.");
    }
  }
);

export const getAllBusRoutes = createAsyncThunk(
  "busRoute/getAllBusRoutes",
  async (params = {}, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/all", { params });
      // controller spreads: { message, ...result } — result has routes + meta
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch bus routes.");
    }
  }
);

export const getOneBusRoute = createAsyncThunk(
  "busRoute/getOneBusRoute",
  async (routeId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/detail/${routeId}`);
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch bus route.");
    }
  }
);

export const updateBusRoute = createAsyncThunk(
  "busRoute/updateBusRoute",
  async ({ routeId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/update/${routeId}`, body);
      // controller spreads service result: { message, route, transportFeeSyncRequired, ... }
      return { routeId, route: data.route };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update bus route.");
    }
  }
);

export const activateBusRoute = createAsyncThunk(
  "busRoute/activateBusRoute",
  async (routeId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/${routeId}/activate`);
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to activate bus route.");
    }
  }
);

export const archiveBusRoute = createAsyncThunk(
  "busRoute/archiveBusRoute",
  async (routeId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/${routeId}/archive`);
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to archive bus route.");
    }
  }
);

export const addStopToRoute = createAsyncThunk(
  "busRoute/addStopToRoute",
  async ({ routeId, stopName }, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/${routeId}/stops/add`, { stopName });
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to add stop.");
    }
  }
);

export const updateStopInRoute = createAsyncThunk(
  "busRoute/updateStopInRoute",
  async ({ routeId, oldStopName, newStopName }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/${routeId}/stops/update`, { oldStopName, newStopName });
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update stop.");
    }
  }
);

export const removeStopFromRoute = createAsyncThunk(
  "busRoute/removeStopFromRoute",
  async ({ routeId, stopName }, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/${routeId}/stops/remove`, { data: { stopName } });
      return data.route;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to remove stop.");
    }
  }
);

// ---------------------------------------------------------------------------
// SLICE
// ---------------------------------------------------------------------------

const initialState = {
  routes: [],          // full list from getAllBusRoutes
  pagination: null,    // { total, page, limit, pages } from server
  selectedRoute: null, // from getOneBusRoute

  // UI
  modal: {
    type: null,    // "create" | "edit" | "add_stop" | "edit_stop" | "remove_stop" | null
    payload: null, // routeId or stop data
  },
  notification: null, // { type: "success" | "error", message }

  loading: {
    createBusRoute:      false,
    getAllBusRoutes:      false,
    getOneBusRoute:      false,
    updateBusRoute:      false,
    activateBusRoute:    false,
    archiveBusRoute:     false,
    addStopToRoute:      false,
    updateStopInRoute:   false,
    removeStopFromRoute: false,
  },
};

// Shared helper — replaces a route in the list by _id
const replaceRoute = (routes, updated) =>
  routes.map((r) => (r._id === updated._id ? updated : r));

const busRouteSlice = createSlice({
  name: "busRoute",
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
    clearSelectedRoute(state) {
      state.selectedRoute = null;
    },
  },

  extraReducers: (builder) => {
    const loading = (key) => (state) => { state.loading[key] = true; };
    const done    = (key) => (state) => { state.loading[key] = false; };

    // ── createBusRoute ──
    builder
      .addCase(createBusRoute.pending,   loading("createBusRoute"))
      .addCase(createBusRoute.fulfilled, (state, { payload }) => {
        state.loading.createBusRoute = false;
        state.routes.unshift(payload);
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Bus route created successfully." };
      })
      .addCase(createBusRoute.rejected, (state, { payload }) => {
        state.loading.createBusRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── getAllBusRoutes ──
    builder
      .addCase(getAllBusRoutes.pending,   loading("getAllBusRoutes"))
      .addCase(getAllBusRoutes.fulfilled, (state, { payload }) => {
        state.loading.getAllBusRoutes = false;
        // service returns { items, pagination } spread into controller response
        state.routes = payload.items ?? [];
        state.pagination = payload.pagination ?? null;
      })
      .addCase(getAllBusRoutes.rejected,  done("getAllBusRoutes"));

    // ── getOneBusRoute ──
    builder
      .addCase(getOneBusRoute.pending,   loading("getOneBusRoute"))
      .addCase(getOneBusRoute.fulfilled, (state, { payload }) => {
        state.loading.getOneBusRoute = false;
        state.selectedRoute = payload;
      })
      .addCase(getOneBusRoute.rejected,  done("getOneBusRoute"));

    // ── updateBusRoute ──
    builder
      .addCase(updateBusRoute.pending,   loading("updateBusRoute"))
      .addCase(updateBusRoute.fulfilled, (state, { payload }) => {
        state.loading.updateBusRoute = false;
        const updated = payload.route;
        if (updated?._id) state.routes = replaceRoute(state.routes, updated);
        if (state.selectedRoute?._id === updated?._id) state.selectedRoute = updated;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Bus route updated successfully." };
      })
      .addCase(updateBusRoute.rejected, (state, { payload }) => {
        state.loading.updateBusRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── activateBusRoute ──
    builder
      .addCase(activateBusRoute.pending,   loading("activateBusRoute"))
      .addCase(activateBusRoute.fulfilled, (state, { payload }) => {
        state.loading.activateBusRoute = false;
        state.routes = replaceRoute(state.routes, payload);
        if (state.selectedRoute?._id === payload._id) state.selectedRoute = payload;
        state.notification = { type: "success", message: "Bus route activated." };
      })
      .addCase(activateBusRoute.rejected, (state, { payload }) => {
        state.loading.activateBusRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── archiveBusRoute ──
    builder
      .addCase(archiveBusRoute.pending,   loading("archiveBusRoute"))
      .addCase(archiveBusRoute.fulfilled, (state, { payload }) => {
        state.loading.archiveBusRoute = false;
        state.routes = replaceRoute(state.routes, payload);
        if (state.selectedRoute?._id === payload._id) state.selectedRoute = payload;
        state.notification = { type: "success", message: "Bus route archived." };
      })
      .addCase(archiveBusRoute.rejected, (state, { payload }) => {
        state.loading.archiveBusRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── addStopToRoute ──
    builder
      .addCase(addStopToRoute.pending,   loading("addStopToRoute"))
      .addCase(addStopToRoute.fulfilled, (state, { payload }) => {
        state.loading.addStopToRoute = false;
        state.routes = replaceRoute(state.routes, payload);
        if (state.selectedRoute?._id === payload._id) state.selectedRoute = payload;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Stop added successfully." };
      })
      .addCase(addStopToRoute.rejected, (state, { payload }) => {
        state.loading.addStopToRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── updateStopInRoute ──
    builder
      .addCase(updateStopInRoute.pending,   loading("updateStopInRoute"))
      .addCase(updateStopInRoute.fulfilled, (state, { payload }) => {
        state.loading.updateStopInRoute = false;
        state.routes = replaceRoute(state.routes, payload);
        if (state.selectedRoute?._id === payload._id) state.selectedRoute = payload;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Stop updated successfully." };
      })
      .addCase(updateStopInRoute.rejected, (state, { payload }) => {
        state.loading.updateStopInRoute = false;
        state.notification = { type: "error", message: payload };
      });

    // ── removeStopFromRoute ──
    builder
      .addCase(removeStopFromRoute.pending,   loading("removeStopFromRoute"))
      .addCase(removeStopFromRoute.fulfilled, (state, { payload }) => {
        state.loading.removeStopFromRoute = false;
        state.routes = replaceRoute(state.routes, payload);
        if (state.selectedRoute?._id === payload._id) state.selectedRoute = payload;
        state.modal = { type: null, payload: null };
        state.notification = { type: "success", message: "Stop removed successfully." };
      })
      .addCase(removeStopFromRoute.rejected, (state, { payload }) => {
        state.loading.removeStopFromRoute = false;
        state.notification = { type: "error", message: payload };
      });
  },
});

export const {
  openModal,
  closeModal,
  setNotification,
  clearNotification,
  clearSelectedRoute,
} = busRouteSlice.actions;

export default busRouteSlice.reducer;

// ---------------------------------------------------------------------------
// SELECTORS
// ---------------------------------------------------------------------------
export const selectAllBusRoutes      = (state) => state.busRoute.routes;
export const selectSelectedBusRoute  = (state) => state.busRoute.selectedRoute;
export const selectBusRouteModal     = (state) => state.busRoute.modal;
export const selectBusRouteNotif     = (state) => state.busRoute.notification;
export const selectBusRouteLoading   = (key)   => (state) => state.busRoute.loading[key];

// Derived — active routes only
export const selectActiveBusRoutes   = (state) =>
  state.busRoute.routes.filter((r) => r.status === "active");

// Derived — archived routes only
export const selectArchivedBusRoutes = (state) =>
  state.busRoute.routes.filter((r) => r.status === "archived");