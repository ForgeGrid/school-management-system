import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createSchool = createAsyncThunk(
  "school/createSchool",
  async (formData, { rejectWithValue, getState }) => {
    try {
      // Get token from Redux state
      const token = getState().auth.token; 

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/school/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Something went wrong");
    }
  }
);