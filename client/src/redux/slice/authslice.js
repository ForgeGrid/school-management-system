import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// LOAD USER FROM LOCAL STORAGE
const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed"
      );
    }
  }
);


export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ email, otp }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-signup-otp`,
        { email, otp },
        { withCredentials: true }  // store the auth_token cookie the server sets
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);


export const resendOtp = createAsyncThunk(
  "auth/resendOtp",
  async ({ email }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/resend-verify-otp`,
        { email }
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Resend failed"
      );
    }
  }
);

export const fetchUserPreview = createAsyncThunk(
  "auth/fetchUserPreview",
  async (email, thunkAPI) => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/user-preview`,
        {
          params: { email },
        }
      );

      return data;
    } catch {
      return thunkAPI.rejectWithValue(null);
    }
  }
);


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }  // store the auth_token cookie the server sets
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logoutUser",
  async (_, thunkAPI) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {},
        { withCredentials: true }
      );
      return true;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Logout failed"
      );
    }
  }
);

export const forgotPasswordRequest = createAsyncThunk(
  "auth/forgotPasswordRequest",
  async (email, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email }
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP"
      );
    }
  }
);


export const verifyResetOtp = createAsyncThunk(
  "auth/verifyResetOtp",
  async ({ email, otp }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/verify-reset-otp`,
        { email, otp }
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Invalid or expired OTP"
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, thunkAPI) => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        { email, otp, newPassword }
      );

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to reset password"
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",

  initialState: {
    user: userFromStorage,

    loading: false,
    error: null,
    success: false,
    registered: false,
    message: "",

    // LOGIN
    loginLoading: false,
    loginError: null,

    // PREVIEW
    preview: null,
    previewFound: false,
    previewLoading: false,

    // FORGOT PASSWORD
    forgotLoading: false,
    forgotError: null,
    forgotSuccess: false,

    // VERIFY RESET OTP
    verifyResetLoading: false,
    verifyResetError: null,
    verifyResetSuccess: false,

    // RESET PASSWORD
    resetPasswordLoading: false,
    resetPasswordError: null,
    resetPasswordSuccess: false,

    // RESEND OTP
    resendLoading: false,
    resendError: null,
    resendSuccess: false,
  },

  reducers: {
    clearAuthState: (state) => {
      state.error = null;
      state.success = false;
      state.registered = false;
      state.loading = false;
      state.message = "";

      state.loginError = null;
      state.loginLoading = false;

      state.resendLoading = false;
      state.resendError = null;
      state.resendSuccess = false;
    },

    clearPreview: (state) => {
      state.preview = null;
      state.previewFound = false;
      state.previewLoading = false;
    },

    clearForgotState: (state) => {
      state.forgotLoading = false;
      state.forgotError = null;
      state.forgotSuccess = false;

      state.verifyResetLoading = false;
      state.verifyResetError = null;
      state.verifyResetSuccess = false;

      state.resetPasswordLoading = false;
      state.resetPasswordError = null;
      state.resetPasswordSuccess = false;
    },

    clearRegistered: (state) => {
      state.registered = false;
    },

    // LOGOUT
    logout: (state) => {
      state.user = null;
      state.success = false;

      localStorage.removeItem("userInfo");
    },
  },

  extraReducers: (builder) => {
    builder

      //  REGISTER 
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.registered = true;
        state.user = action.payload.user;
      })

      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //  VERIFY OTP 
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload.user;
        state.message = action.payload.message;

        // SAVE TO LOCAL STORAGE
        localStorage.setItem(
          "userInfo",
          JSON.stringify(action.payload.user)
        );
      })

      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload;
      })

      //  RESEND OTP
      .addCase(resendOtp.pending, (state) => {
        state.resendLoading = true;
        state.resendError = null;
        state.resendSuccess = false;
      })

      .addCase(resendOtp.fulfilled, (state) => {
        state.resendLoading = false;
        state.resendSuccess = true;
      })

      .addCase(resendOtp.rejected, (state, action) => {
        state.resendLoading = false;
        state.resendError = action.payload;
      })

      // FETCH USER PREVIEW
      .addCase(fetchUserPreview.pending, (state) => {
        state.previewLoading = true;
        state.preview = null;
        state.previewFound = false;
      })

      .addCase(fetchUserPreview.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.previewFound = action.payload.found;

        state.preview = action.payload.found
          ? action.payload.preview
          : null;
      })

      .addCase(fetchUserPreview.rejected, (state) => {
        state.previewLoading = false;
        state.preview = null;
        state.previewFound = false;
      })

      // LOGIN 
      .addCase(loginUser.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.loginError = null;
        state.user = action.payload.user;
        state.success = true;

        // SAVE USER
        localStorage.setItem(
          "userInfo",
          JSON.stringify(action.payload.user)
        );
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload;
      })

      // LOGOUT THUNK
      .addCase(logoutUserThunk.fulfilled, (state) => {
        state.user = null;
        state.success = false;
        localStorage.removeItem("userInfo");
      })

      // FORGOT PASSWORD
      .addCase(forgotPasswordRequest.pending, (state) => {
        state.forgotLoading = true;
        state.forgotError = null;
        state.forgotSuccess = false;
      })

      .addCase(forgotPasswordRequest.fulfilled, (state) => {
        state.forgotLoading = false;
        state.forgotSuccess = true;
      })

      .addCase(forgotPasswordRequest.rejected, (state, action) => {
        state.forgotLoading = false;
        state.forgotError = action.payload;
      })

      // VERIFY RESET OTP
      .addCase(verifyResetOtp.pending, (state) => {
        state.verifyResetLoading = true;
        state.verifyResetError = null;
        state.verifyResetSuccess = false;
      })

      .addCase(verifyResetOtp.fulfilled, (state) => {
        state.verifyResetLoading = false;
        state.verifyResetSuccess = true;
      })

      .addCase(verifyResetOtp.rejected, (state, action) => {
        state.verifyResetLoading = false;
        state.verifyResetError = action.payload;
      })

      // RESET PASSWORD 
      .addCase(resetPassword.pending, (state) => {
        state.resetPasswordLoading = true;
        state.resetPasswordError = null;
        state.resetPasswordSuccess = false;
      })

      .addCase(resetPassword.fulfilled, (state) => {
        state.resetPasswordLoading = false;
        state.resetPasswordSuccess = true;
      })

      .addCase(resetPassword.rejected, (state, action) => {
        state.resetPasswordLoading = false;
        state.resetPasswordError = action.payload;
      });
  },
});

export const {
  clearAuthState,
  clearPreview,
  clearForgotState,
  clearRegistered,
  logout,
} = authSlice.actions;

export default authSlice.reducer;