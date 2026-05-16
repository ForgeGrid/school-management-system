import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchMe = createAsyncThunk(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Network error" });
    }
  }
);

const authSlice = createSlice({
  name: "getme",
  initialState: {
    user: null,
    school: null,
    invitation: null,
    state: null,        // "ACTIVE" | "INVITED" | "NO_SCHOOL" | "PENDING_VERIFICATION" | "REJECTED_VERIFICATION" | "SCHOOL_INACTIVE" | "SCHOOL_MISSING"
    status: "idle",     // "idle" | "loading" | "succeeded" | "failed"
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.school = null;
      state.invitation = null;
      state.state = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        const { user, school, invitation, state: appState } = action.payload;
        state.status = "succeeded";
        state.state = appState;
        state.user = user ?? null;
        state.school = school ?? null;
        state.invitation = invitation ?? null;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || "Something went wrong";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;