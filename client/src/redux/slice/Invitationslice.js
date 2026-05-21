import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";



export const inviteUser = createAsyncThunk(
  "invitation/invite",
  async ({ email, role }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/invitation/invite`, { email, role }, { withCredentials: true } );
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getPendingInvitations = createAsyncThunk(
  "invitation/getPending",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/invitation/pending`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const revokeInvitation = createAsyncThunk(
  "invitation/revoke",
  async (invitationId, { rejectWithValue }) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/invitation/${invitationId}`, { withCredentials: true });
      return invitationId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const getInvitationDetails = createAsyncThunk(
  "invitation/getDetails",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/invitation/details/${token}`, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const acceptInvitation = createAsyncThunk(
  "invitation/accept",
  async ({ token, ...rest }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/invitation/accept`, { token, ...rest }, { withCredentials: true });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ────────────────────────────────────────────────
const invitationSlice = createSlice({
  name: "invitation",
  initialState: {
    pending: [],
    details: null,
    loading: false,
    actionLoading: false,
    error: null,
    successMessage: null,
  },
  reducers: {
    clearInvitationStatus(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // ── invite user ──
    builder
      .addCase(inviteUser.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(inviteUser.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.successMessage = action.payload.message || "Invitation sent.";
        if (action.payload.invitation) {
          state.pending.unshift(action.payload.invitation);
        }
      })
      .addCase(inviteUser.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── pending invitations ──
    builder
      .addCase(getPendingInvitations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPendingInvitations.fulfilled, (state, action) => {
        state.loading = false;
        state.pending = action.payload?.data || action.payload || [];
      })
      .addCase(getPendingInvitations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── revoke invitation ──
    builder
      .addCase(revokeInvitation.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(revokeInvitation.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.pending = state.pending.filter((inv) => inv.id !== action.payload && inv._id !== action.payload);
        state.successMessage = "Invitation revoked.";
      })
      .addCase(revokeInvitation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });

    // ── invitation details ──
    builder
      .addCase(getInvitationDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvitationDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.details = action.payload?.data || action.payload;
      })
      .addCase(getInvitationDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── accept invitation ──
    builder
      .addCase(acceptInvitation.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(acceptInvitation.fulfilled, (state) => {
        state.actionLoading = false;
        state.details = null;
        state.successMessage = "Invitation accepted.";
      })
      .addCase(acceptInvitation.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInvitationStatus } = invitationSlice.actions;
export default invitationSlice.reducer;