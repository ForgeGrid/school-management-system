import { createSlice } from "@reduxjs/toolkit";
import { createSchool } from "./schoolThunks";

const initialState = {
  school: null,
  user: null,
  token: null,
  loading: false,
  error: null,
  successMessage: null,
};

const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {
    clearSchoolState: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSchool.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSchool.fulfilled, (state, action) => {
        state.loading = false;
        state.school = action.payload.school;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.successMessage = action.payload.message;

        // Optionally persist token
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(createSchool.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSchoolState } = schoolSlice.actions;
export default schoolSlice.reducer;