import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { loginUser, verifyOtp } from "./authslice";

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

const getmeSlice = createSlice({
  name: "getme",
  initialState: {
    user: null,
    school: null,
    invitation: null,
    state: null,        // "ACTIVE" | "INVITED" | "NO_SCHOOL" | "PENDING_VERIFICATION" | "REJECTED_VERIFICATION" | "SCHOOL_INACTIVE" | "SCHOOL_MISSING"
    status: typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true" ? "idle" : "failed",
    error: null,
  },
  reducers: {
    logout(state) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("isLoggedIn");
      }
      state.user = null;
      state.school = null;
      state.invitation = null;
      state.state = null;
      state.status = "failed";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Reset getme status to idle so it fetches again when user logs in or verifies OTP
      .addCase(loginUser.fulfilled, (state) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
        }
        state.status = "idle";
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("isLoggedIn", "true");
        }
        state.status = "idle";
      })
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
        if (action.payload?.state === "SCHOOL_MISSING") {
          state.status = "succeeded";
          state.state = "NO_SCHOOL";
          state.user = action.payload.user ?? null;
          state.school = null;
          state.invitation = null;
        } else {
          if (typeof window !== "undefined") {
            localStorage.removeItem("isLoggedIn");
          }
          state.status = "failed";
          state.error = action.payload?.message || "Something went wrong";
        }
      });
  },
});

export const { logout } = getmeSlice.actions;
export default getmeSlice.reducer;