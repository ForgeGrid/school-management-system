import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_API_URL}/academic-fee-structure`;


export const createAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/create",
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

export const getAcademicFeeStructures = createAsyncThunk(
  "academicFeeStructure/getAll",
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

export const getActiveAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/getActive",
  async ({ academicYear, standard }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/active`, {
        withCredentials: true,
        params: { academicYear, standard },
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getOneAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/getOne",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE_URL}/detail/${structureId}`, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/update",
  async ({ structureId, ...body }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/update/${structureId}`, body, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const activateAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/activate",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/${structureId}/activate`, {}, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const archiveAcademicFeeStructure = createAsyncThunk(
  "academicFeeStructure/archive",
  async (structureId, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE_URL}/${structureId}/archive`, {}, {
        withCredentials: true,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);



const initialState = {
  structures: [],
  totalCount: 0,
  selectedStructure: null,
  activeStructure: null,

  filters: {
    page: 1,
    limit: 10,
    search: "",
  },

  loading: {
    create: false,
    getAll: false,
    getOne: false,
    getActive: false,
    update: false,
    activate: false,
    archive: false,
  },

  error: null,
};

const academicFeeStructureSlice = createSlice({
  name: "academicFeeStructure",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    clearSelectedStructure(state) {
      state.selectedStructure = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create
    builder
      .addCase(createAcademicFeeStructure.pending, (state) => {
        state.loading.create = true;
        state.error = null;
      })
      .addCase(createAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.create = false;
        state.structures.unshift(action.payload.structure);
      })
      .addCase(createAcademicFeeStructure.rejected, (state, action) => {
        state.loading.create = false;
        state.error = action.payload;
      });

    // Get All
    builder
      .addCase(getAcademicFeeStructures.pending, (state) => {
        state.loading.getAll = true;
        state.error = null;
      })
      .addCase(getAcademicFeeStructures.fulfilled, (state, action) => {
        state.loading.getAll = false;
        state.structures = action.payload.items ?? [];
        state.totalCount = action.payload.pagination?.total ?? 0;
      })
      .addCase(getAcademicFeeStructures.rejected, (state, action) => {
        state.loading.getAll = false;
        state.error = action.payload;
      });

    // Get Active
    builder
      .addCase(getActiveAcademicFeeStructure.pending, (state) => {
        state.loading.getActive = true;
        state.error = null;
        state.activeStructure = null;
      })
      .addCase(getActiveAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.getActive = false;
        state.activeStructure = action.payload.structure;
      })
      .addCase(getActiveAcademicFeeStructure.rejected, (state) => {
        state.loading.getActive = false;
        state.activeStructure = null;
      });

    // Get One
    builder
      .addCase(getOneAcademicFeeStructure.pending, (state) => {
        state.loading.getOne = true;
        state.error = null;
      })
      .addCase(getOneAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.getOne = false;
        state.selectedStructure = action.payload.structure;
      })
      .addCase(getOneAcademicFeeStructure.rejected, (state, action) => {
        state.loading.getOne = false;
        state.error = action.payload;
      });

    // Update
    builder
      .addCase(updateAcademicFeeStructure.pending, (state) => {
        state.loading.update = true;
        state.error = null;
      })
      .addCase(updateAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.update = false;
        const updated = action.payload.structure;
        const index = state.structures.findIndex((s) => s._id === updated._id);
        if (index !== -1) state.structures[index] = updated;
        if (state.selectedStructure?._id === updated._id) {
          state.selectedStructure = updated;
        }
      })
      .addCase(updateAcademicFeeStructure.rejected, (state, action) => {
        state.loading.update = false;
        state.error = action.payload;
      });

    // Activate
    builder
      .addCase(activateAcademicFeeStructure.pending, (state) => {
        state.loading.activate = true;
        state.error = null;
      })
      .addCase(activateAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.activate = false;
        const activated = action.payload.structure;
        state.structures = state.structures.map((s) => ({
          ...s,
          isActive: s._id === activated._id,
        }));
        state.activeStructure = activated;
        if (state.selectedStructure?._id === activated._id) {
          state.selectedStructure = activated;
        }
      })
      .addCase(activateAcademicFeeStructure.rejected, (state, action) => {
        state.loading.activate = false;
        state.error = action.payload;
      });

    // Archive
    builder
      .addCase(archiveAcademicFeeStructure.pending, (state) => {
        state.loading.archive = true;
        state.error = null;
      })
      .addCase(archiveAcademicFeeStructure.fulfilled, (state, action) => {
        state.loading.archive = false;
        const archived = action.payload.structure;
        const index = state.structures.findIndex((s) => s._id === archived._id);
        if (index !== -1) state.structures[index] = archived;
        if (state.selectedStructure?._id === archived._id) {
          state.selectedStructure = archived;
        }
      })
      .addCase(archiveAcademicFeeStructure.rejected, (state, action) => {
        state.loading.archive = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, clearSelectedStructure, clearError } =
  academicFeeStructureSlice.actions;

export default academicFeeStructureSlice.reducer;

// Selectors
export const selectStructures = (state) => state.academicFeeStructure.structures;
export const selectTotalCount = (state) => state.academicFeeStructure.totalCount;
export const selectSelectedStructure = (state) => state.academicFeeStructure.selectedStructure;
export const selectActiveStructure = (state) => state.academicFeeStructure.activeStructure;
export const selectFilters = (state) => state.academicFeeStructure.filters;
export const selectLoading = (state) => state.academicFeeStructure.loading;
export const selectError = (state) => state.academicFeeStructure.error;