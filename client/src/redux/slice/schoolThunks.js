import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createSchool = createAsyncThunk(
  "school/createSchool",
  async (formData, { rejectWithValue }) => {
    try {
      // The server issues auth via an httpOnly cookie (auth_token).
      // withCredentials: true tells the browser to send that cookie automatically.
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/school/create`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Something went wrong");
    }
  }
);