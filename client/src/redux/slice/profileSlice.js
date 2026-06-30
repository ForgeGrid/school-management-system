import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/profile`;

// All requests use withCredentials so the browser sends the httpOnly
// auth_token cookie automatically — no manual Authorization header needed.
const config = { withCredentials: true };

// ─────────────────────────────────────────────
// Async Thunks
// ─────────────────────────────────────────────

/**
 * PUT /profile/update
 * Update display name
 */
export const updateProfile = createAsyncThunk(
    "profile/updateProfile",
    async ({ name }, { rejectWithValue }) => {
        try {
            const { data } = await axios.put(`${API}/update`, { name }, config);
            return data; // { message, user }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to update profile");
        }
    }
);

/**
 * PATCH /profile/avatar
 * Upload avatar image (multipart/form-data)
 */
export const updateAvatar = createAsyncThunk(
    "profile/updateAvatar",
    async (file, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append("avatar", file);

            // withCredentials + multipart — let axios set Content-Type boundary automatically
            const { data } = await axios.patch(`${API}/avatar`, formData, config);
            return data; // { message, profile_avatar: { public_id, secure_url } }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to upload avatar");
        }
    }
);

/**
 * POST /profile/password/otp-request
 * Send OTP to user's registered email
 */
export const requestPasswordOTP = createAsyncThunk(
    "profile/requestPasswordOTP",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(`${API}/password/otp-request`, {}, config);
            return data; // { message }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to send OTP");
        }
    }
);

/**
 * POST /profile/password/otp-verify
 * Verify OTP and change password
 */
export const verifyPasswordOTP = createAsyncThunk(
    "profile/verifyPasswordOTP",
    async ({ otp, newPassword }, { rejectWithValue }) => {
        try {
            const { data } = await axios.post(
                `${API}/password/otp-verify`,
                { otp, newPassword },
                config
            );
            return data; // { message }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Invalid or expired OTP");
        }
    }
);

/**
 * DELETE /profile/unlink-school
 * Remove the current user from their school
 */
export const unlinkSchool = createAsyncThunk(
    "profile/unlinkSchool",
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.delete(`${API}/unlink-school`, config);
            return data; // { message }
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Failed to unlink school");
        }
    }
);

/**
 * PATCH /profile/parent-update
 * Update parent's phone, alternate contact, and address (parent role only)
 */
export const updateParentContacts = createAsyncThunk(
    "profile/updateParentContacts",
    async ({ primary_phone, alternate_contact, address }, { rejectWithValue }) => {
        try {
            const { data } = await axios.patch(
                `${API}/parent-update`,
                { primary_phone, alternate_contact, address },
                config
            );
            return data; // { message, parentProfile }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Failed to update parent contacts"
            );
        }
    }
);

// ─────────────────────────────────────────────
// Initial State
// ─────────────────────────────────────────────

const initialState = {
    // User profile data (name + avatar) returned from updateProfile
    user: null,

    // Avatar URLs after upload
    profileAvatar: {
        public_id: null,
        secure_url: null,
    },

    // Parent-specific contact/address data
    parentProfile: null,

    // OTP flow
    otp: {
        sent: false,       // true after requestPasswordOTP succeeds
        verified: false,   // true after verifyPasswordOTP succeeds
    },

    // Per-action loading flags
    loading: {
        updateProfile: false,
        updateAvatar: false,
        requestPasswordOTP: false,
        verifyPasswordOTP: false,
        unlinkSchool: false,
        updateParentContacts: false,
    },

    // Per-action error messages
    error: {
        updateProfile: null,
        updateAvatar: null,
        requestPasswordOTP: null,
        verifyPasswordOTP: null,
        unlinkSchool: null,
        updateParentContacts: null,
    },

    // Latest success message (useful for toast notifications)
    successMessage: null,
};

// ─────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        /** Clear all error fields at once */
        clearErrors(state) {
            state.error = { ...initialState.error };
        },

        /** Clear a single action's error by key */
        clearError(state, action) {
            const key = action.payload;
            if (key in state.error) state.error[key] = null;
        },

        /** Clear the latest success message */
        clearSuccessMessage(state) {
            state.successMessage = null;
        },

        /** Reset OTP flow state (e.g. when the modal closes) */
        resetOtpFlow(state) {
            state.otp = { sent: false, verified: false };
            state.error.requestPasswordOTP = null;
            state.error.verifyPasswordOTP = null;
        },

        /** Hydrate user data from auth slice or login response */
        setProfileUser(state, action) {
            state.user = action.payload;
            if (action.payload?.profile_avatar) {
                state.profileAvatar = action.payload.profile_avatar;
            }
        },
    },
    extraReducers: (builder) => {
        // ── updateProfile ──────────────────────────────
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading.updateProfile = true;
                state.error.updateProfile = null;
                state.successMessage = null;
            })
            .addCase(updateProfile.fulfilled, (state, { payload }) => {
                state.loading.updateProfile = false;
                state.user = payload.user ?? state.user;
                state.successMessage = payload.message;
            })
            .addCase(updateProfile.rejected, (state, { payload }) => {
                state.loading.updateProfile = false;
                state.error.updateProfile = payload;
            });

        // ── updateAvatar ───────────────────────────────
        builder
            .addCase(updateAvatar.pending, (state) => {
                state.loading.updateAvatar = true;
                state.error.updateAvatar = null;
                state.successMessage = null;
            })
            .addCase(updateAvatar.fulfilled, (state, { payload }) => {
                state.loading.updateAvatar = false;
                state.profileAvatar = payload.profile_avatar ?? state.profileAvatar;
                if (state.user) state.user.profile_avatar = state.profileAvatar;
                state.successMessage = payload.message;
            })
            .addCase(updateAvatar.rejected, (state, { payload }) => {
                state.loading.updateAvatar = false;
                state.error.updateAvatar = payload;
            });

        // ── requestPasswordOTP ─────────────────────────
        builder
            .addCase(requestPasswordOTP.pending, (state) => {
                state.loading.requestPasswordOTP = true;
                state.error.requestPasswordOTP = null;
                state.otp.sent = false;
            })
            .addCase(requestPasswordOTP.fulfilled, (state, { payload }) => {
                state.loading.requestPasswordOTP = false;
                state.otp.sent = true;
                state.successMessage = payload.message;
            })
            .addCase(requestPasswordOTP.rejected, (state, { payload }) => {
                state.loading.requestPasswordOTP = false;
                state.error.requestPasswordOTP = payload;
            });

        // ── verifyPasswordOTP ──────────────────────────
        builder
            .addCase(verifyPasswordOTP.pending, (state) => {
                state.loading.verifyPasswordOTP = true;
                state.error.verifyPasswordOTP = null;
                state.otp.verified = false;
            })
            .addCase(verifyPasswordOTP.fulfilled, (state, { payload }) => {
                state.loading.verifyPasswordOTP = false;
                state.otp.verified = true;
                state.otp.sent = false;
                state.successMessage = payload.message;
            })
            .addCase(verifyPasswordOTP.rejected, (state, { payload }) => {
                state.loading.verifyPasswordOTP = false;
                state.error.verifyPasswordOTP = payload;
            });

        // ── unlinkSchool ───────────────────────────────
        builder
            .addCase(unlinkSchool.pending, (state) => {
                state.loading.unlinkSchool = true;
                state.error.unlinkSchool = null;
                state.successMessage = null;
            })
            .addCase(unlinkSchool.fulfilled, (state, { payload }) => {
                state.loading.unlinkSchool = false;
                // User is now unlinked — clear profile data
                state.user = null;
                state.profileAvatar = { public_id: null, secure_url: null };
                state.successMessage = payload.message;
            })
            .addCase(unlinkSchool.rejected, (state, { payload }) => {
                state.loading.unlinkSchool = false;
                state.error.unlinkSchool = payload;
            });

        // ── updateParentContacts ───────────────────────
        builder
            .addCase(updateParentContacts.pending, (state) => {
                state.loading.updateParentContacts = true;
                state.error.updateParentContacts = null;
                state.successMessage = null;
            })
            .addCase(updateParentContacts.fulfilled, (state, { payload }) => {
                state.loading.updateParentContacts = false;
                state.parentProfile = payload.parentProfile ?? state.parentProfile;
                state.successMessage = payload.message;
            })
            .addCase(updateParentContacts.rejected, (state, { payload }) => {
                state.loading.updateParentContacts = false;
                state.error.updateParentContacts = payload;
            });
    },
});

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────

export const {
    clearErrors,
    clearError,
    clearSuccessMessage,
    resetOtpFlow,
    setProfileUser,
} = profileSlice.actions;

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────

const selectProfileState = (state) => state.profile;

export const selectProfileUser        = (state) => state.profile.user;
export const selectProfileAvatar      = (state) => state.profile.profileAvatar;
export const selectParentProfile      = (state) => state.profile.parentProfile;
export const selectOtpState           = (state) => state.profile.otp;
export const selectSuccessMessage     = (state) => state.profile.successMessage;

// Per-action loading selectors
export const selectLoadingUpdateProfile        = (state) => state.profile.loading.updateProfile;
export const selectLoadingUpdateAvatar         = (state) => state.profile.loading.updateAvatar;
export const selectLoadingRequestOTP           = (state) => state.profile.loading.requestPasswordOTP;
export const selectLoadingVerifyOTP            = (state) => state.profile.loading.verifyPasswordOTP;
export const selectLoadingUnlinkSchool         = (state) => state.profile.loading.unlinkSchool;
export const selectLoadingUpdateParentContacts = (state) => state.profile.loading.updateParentContacts;

// Per-action error selectors
export const selectErrorUpdateProfile          = (state) => state.profile.error.updateProfile;
export const selectErrorUpdateAvatar           = (state) => state.profile.error.updateAvatar;
export const selectErrorRequestOTP             = (state) => state.profile.error.requestPasswordOTP;
export const selectErrorVerifyOTP              = (state) => state.profile.error.verifyPasswordOTP;
export const selectErrorUnlinkSchool           = (state) => state.profile.error.unlinkSchool;
export const selectErrorUpdateParentContacts   = (state) => state.profile.error.updateParentContacts;

// Composite: is any profile action currently in-flight?
export const selectIsProfileBusy = (state) =>
    Object.values(state.profile.loading).some(Boolean);

export default profileSlice.reducer;