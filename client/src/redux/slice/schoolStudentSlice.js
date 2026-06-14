import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// SCHOOL THUNKS
// ---------------------------------------------------------------------------

export const createSchool = createAsyncThunk(
  "school/createSchool",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/school/create", formData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "School creation failed.");
    }
  }
);

export const getAllSchools = createAsyncThunk(
  "school/getAllSchools",
  async (status, { rejectWithValue }) => {
    try {
      const params = status ? { status } : {};
      const { data } = await api.get("/school/all", { params });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch schools.");
    }
  }
);

export const getSchoolById = createAsyncThunk(
  "school/getSchoolById",
  async (schoolId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/school/detail/${schoolId}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch school.");
    }
  }
);

export const getPendingSchools = createAsyncThunk(
  "school/getPendingSchools",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/school/pending");
      return data.schools;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch pending schools.");
    }
  }
);

export const approveSchool = createAsyncThunk(
  "school/approveSchool",
  async (schoolId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/school/${schoolId}/approve`);
      return { ...data, schoolId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Approval failed.");
    }
  }
);

export const rejectSchool = createAsyncThunk(
  "school/rejectSchool",
  async ({ schoolId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/school/${schoolId}/reject`, { reason });
      return { ...data, schoolId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Rejection failed.");
    }
  }
);

export const reAppealSchool = createAsyncThunk(
  "school/reAppealSchool",
  async (appealData, { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/school/re-appeal", appealData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Re-appeal failed.");
    }
  }
);

export const getSchoolStaff = createAsyncThunk(
  "school/getSchoolStaff",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/school/staff");
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch staff.");
    }
  }
);

export const getSchoolStaffAdmin = createAsyncThunk(
  "school/getSchoolStaffAdmin",
  async (schoolId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/school/detail/${schoolId}/staff`);
      return { schoolId, staff: data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch school staff.");
    }
  }
);

export const removeUserFromSchool = createAsyncThunk(
  "school/removeUserFromSchool",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/school/${userId}/remove`);
      return { ...data, userId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Remove user failed.");
    }
  }
);


export const enrollStudent = createAsyncThunk(
  "student/enrollStudent",
  async (payload, { rejectWithValue }) => {
    try {
      const { avatarFile, ...rest } = payload;

      const formData = new FormData();

      // Primitive fields
      formData.append("student_name",       rest.student_name       ?? "");
      formData.append("email",              rest.email              ?? "");
      formData.append("password",           rest.password           ?? "");
      formData.append("admission_no",       rest.admission_no       ?? "");
      formData.append("gender",             rest.gender             ?? "");
      formData.append("dob",                rest.dob                ?? "");
      formData.append("transport_required", String(rest.transport_required ?? false));
      formData.append("requestedGrade",     rest.requestedGrade || rest.grade || "");

      // Address fields — flattened
      formData.append("address[street]",     rest.address?.street     ?? "");
      formData.append("address[city]",       rest.address?.city       ?? "");
      formData.append("address[state]",      rest.address?.state      ?? "");
      formData.append("address[postalCode]", rest.address?.postalCode ?? "");
      formData.append("address[country]",    rest.address?.country    ?? "");

      // Parent fields — flattened
      formData.append("parent[mode]",          rest.parent?.mode          ?? "");
      formData.append("parent[parentUserId]",  rest.parent?.parentUserId  ?? "");
      formData.append("parent[name]",          rest.parent?.name          ?? "");
      formData.append("parent[email]",         rest.parent?.email         ?? "");
      formData.append("parent[primary_phone]", rest.parent?.primary_phone ?? "");
      formData.append("parent[guardian_name]",     rest.parent?.guardian_name     ?? "");
      formData.append("parent[guardian_relation]", rest.parent?.guardian_relation ?? "");

      // feePlan fields — flattened
      formData.append("feePlan[academicYear]",            rest.feePlan?.academicYear            ?? "");
      formData.append("feePlan[academicFeeStructure_id]", rest.feePlan?.academicFeeStructure_id ?? "");
      formData.append("feePlan[transportFeeStructure_id]",rest.feePlan?.transportFeeStructure_id ?? "");
      formData.append("feePlan[currentRoute_id]",         rest.feePlan?.currentRoute_id         ?? "");

      // Arrays — discounts
      (rest.feePlan?.discounts ?? []).forEach((d, i) => {
        formData.append(`feePlan[discounts][${i}][type]`,   d.type   ?? "");
        formData.append(`feePlan[discounts][${i}][amount]`, d.amount ?? 0);
      });

      // Arrays — additionalCharges
      (rest.feePlan?.additionalCharges ?? []).forEach((c, i) => {
        formData.append(`feePlan[additionalCharges][${i}][name]`,   c.name   ?? "");
        formData.append(`feePlan[additionalCharges][${i}][amount]`, c.amount ?? 0);
      });

      // Avatar
      if (avatarFile) {
        formData.append("profile-avatar", avatarFile);
      }

      const { data } = await api.post("/admission/create", formData);

      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Student admission failed.");
    }
  }
);

export const getAllStudents = createAsyncThunk(
  "student/getAllStudents",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/student-profile/all");
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch students.");
    }
  }
);

export const getStudentById = createAsyncThunk(
  "student/getStudentById",
  async (studentId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/student-profile/${studentId}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch student.");
    }
  }
);

export const updateStudent = createAsyncThunk(
  "student/updateStudent",
  async ({ studentId, data: body }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/student-profile/update/${studentId}`, body);
      return { studentId, data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Student update failed.");
    }
  }
);

export const deleteStudent = createAsyncThunk(
  "student/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      await api.delete(`/student-profile/${studentId}`);
      return studentId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Student deletion failed.");
    }
  }
);

// ---------------------------------------------------------------------------
// PARENT THUNKS (Link Existing Parent — admission flow)
// ---------------------------------------------------------------------------

export const searchParents = createAsyncThunk(
  "student/searchParents",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/admission/search-parent", { params: { q: query } });
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Parent search failed.");
    }
  }
);

// ---------------------------------------------------------------------------
// SCHOOL SLICE  (unchanged)
// ---------------------------------------------------------------------------

const schoolInitialState = {
  allSchools: [],
  pendingSchools: [],
  selectedSchool: null,
  staff: [],
  adminStaff: {},

  selectedSchoolId: null,
  statusFilter: null,

  modal: {
    type: null,
    payload: null,
  },

  reAppealDraft: null,
  notification: null,

  loading: {
    createSchool: false,
    getAllSchools: false,
    getSchoolById: false,
    getPendingSchools: false,
    approveSchool: false,
    rejectSchool: false,
    reAppealSchool: false,
    getSchoolStaff: false,
    getSchoolStaffAdmin: false,
    removeUserFromSchool: false,
  },
};

const schoolSlice = createSlice({
  name: "school",
  initialState: schoolInitialState,

  reducers: {
    setSelectedSchool(state, { payload: schoolId }) {
      state.selectedSchoolId = schoolId;
    },
    clearSelectedSchool(state) {
      state.selectedSchoolId = null;
      state.selectedSchool = null;
    },
    setStatusFilter(state, { payload: status }) {
      state.statusFilter = status;
    },
    clearStatusFilter(state) {
      state.statusFilter = null;
    },
    openModal(state, { payload: { type, payload } }) {
      state.modal = { type, payload };
    },
    closeModal(state) {
      state.modal = { type: null, payload: null };
    },
    setReAppealDraft(state, { payload }) {
      state.reAppealDraft = payload;
    },
    clearReAppealDraft(state) {
      state.reAppealDraft = null;
    },
    setNotification(state, { payload: { type, message } }) {
      state.notification = { type, message };
    },
    clearNotification(state) {
      state.notification = null;
    },
  },

  extraReducers: (builder) => {
    const loading = (key) => (state) => { state.loading[key] = true; };
    const done    = (key) => (state) => { state.loading[key] = false; };

    builder
      .addCase(createSchool.pending,   loading("createSchool"))
      .addCase(createSchool.fulfilled, (state) => {
        state.loading.createSchool = false;
        state.notification = { type: "success", message: "School created! Awaiting admin approval." };
      })
      .addCase(createSchool.rejected,  (state, { payload }) => {
        state.loading.createSchool = false;
        state.notification = { type: "error", message: payload };
      });

    builder
      .addCase(getAllSchools.pending,   loading("getAllSchools"))
      .addCase(getAllSchools.fulfilled, (state, { payload }) => {
        state.loading.getAllSchools = false;
        state.allSchools = payload;
      })
      .addCase(getAllSchools.rejected,  (state, { payload }) => {
        state.loading.getAllSchools = false;
        state.notification = { type: "error", message: payload };
      });

    builder
      .addCase(getSchoolById.pending,   loading("getSchoolById"))
      .addCase(getSchoolById.fulfilled, (state, { payload }) => {
        state.loading.getSchoolById = false;
        state.selectedSchool = payload;
      })
      .addCase(getSchoolById.rejected,  done("getSchoolById"));

    builder
      .addCase(getPendingSchools.pending,   loading("getPendingSchools"))
      .addCase(getPendingSchools.fulfilled, (state, { payload }) => {
        state.loading.getPendingSchools = false;
        state.pendingSchools = payload;
      })
      .addCase(getPendingSchools.rejected,  done("getPendingSchools"));

    builder
      .addCase(approveSchool.pending,   loading("approveSchool"))
      .addCase(approveSchool.fulfilled, (state, { payload }) => {
        state.loading.approveSchool = false;
        state.notification = { type: "success", message: "School approved successfully!" };
        state.modal = { type: null, payload: null };
        state.pendingSchools = state.pendingSchools.filter((s) => s._id !== payload.schoolId);
        const school = state.allSchools.find((s) => s._id === payload.schoolId);
        if (school) school.verificationStatus = "approved";
      })
      .addCase(approveSchool.rejected, (state, { payload }) => {
        state.loading.approveSchool = false;
        state.notification = { type: "error", message: payload };
      });

    builder
      .addCase(rejectSchool.pending,   loading("rejectSchool"))
      .addCase(rejectSchool.fulfilled, (state, { payload }) => {
        state.loading.rejectSchool = false;
        state.notification = { type: "success", message: "School rejected." };
        state.modal = { type: null, payload: null };
        state.pendingSchools = state.pendingSchools.filter((s) => s._id !== payload.schoolId);
        const school = state.allSchools.find((s) => s._id === payload.schoolId);
        if (school) school.verificationStatus = "rejected";
      })
      .addCase(rejectSchool.rejected, (state, { payload }) => {
        state.loading.rejectSchool = false;
        state.notification = { type: "error", message: payload };
      });

    builder
      .addCase(reAppealSchool.pending,   loading("reAppealSchool"))
      .addCase(reAppealSchool.fulfilled, (state) => {
        state.loading.reAppealSchool = false;
        state.notification = { type: "success", message: "Re-appeal submitted successfully!" };
        state.reAppealDraft = null;
      })
      .addCase(reAppealSchool.rejected, (state, { payload }) => {
        state.loading.reAppealSchool = false;
        state.notification = { type: "error", message: payload };
      });

    builder
      .addCase(getSchoolStaff.pending,   loading("getSchoolStaff"))
      .addCase(getSchoolStaff.fulfilled, (state, { payload }) => {
        state.loading.getSchoolStaff = false;
        state.staff = payload;
      })
      .addCase(getSchoolStaff.rejected,  done("getSchoolStaff"));

    builder
      .addCase(getSchoolStaffAdmin.pending,   loading("getSchoolStaffAdmin"))
      .addCase(getSchoolStaffAdmin.fulfilled, (state, { payload }) => {
        state.loading.getSchoolStaffAdmin = false;
        state.adminStaff[payload.schoolId] = payload.staff;
      })
      .addCase(getSchoolStaffAdmin.rejected,  done("getSchoolStaffAdmin"));

    builder
      .addCase(removeUserFromSchool.pending,   loading("removeUserFromSchool"))
      .addCase(removeUserFromSchool.fulfilled, (state, { payload }) => {
        state.loading.removeUserFromSchool = false;
        state.notification = { type: "success", message: "User removed from school." };
        state.modal = { type: null, payload: null };
        state.staff = state.staff.filter((u) => u._id !== payload.userId);
        Object.keys(state.adminStaff).forEach((schoolId) => {
          state.adminStaff[schoolId] = state.adminStaff[schoolId].filter(
            (u) => u._id !== payload.userId
          );
        });
      })
      .addCase(removeUserFromSchool.rejected, (state, { payload }) => {
        state.loading.removeUserFromSchool = false;
        state.notification = { type: "error", message: payload };
      });
  },
});

export const {
  setSelectedSchool,
  clearSelectedSchool,
  setStatusFilter,
  clearStatusFilter,
  openModal,
  closeModal,
  setReAppealDraft,
  clearReAppealDraft,
  setNotification,
  clearNotification,
} = schoolSlice.actions;

export const schoolReducers = schoolSlice.reducer;

export const selectAllSchools       = (state) => state.school.allSchools;
export const selectPendingSchools   = (state) => state.school.pendingSchools;
export const selectSelectedSchool   = (state) => state.school.selectedSchool;
export const selectSelectedSchoolId = (state) => state.school.selectedSchoolId;
export const selectStatusFilter     = (state) => state.school.statusFilter;
export const selectModal            = (state) => state.school.modal;
export const selectReAppealDraft    = (state) => state.school.reAppealDraft;
export const selectNotification     = (state) => state.school.notification;
export const selectSchoolStaff      = (state) => state.school.staff;
export const selectAdminStaff       = (schoolId) => (state) => state.school.adminStaff[schoolId] ?? [];
export const selectSchoolLoading    = (key) => (state) => state.school.loading[key];

export const selectFilteredSchools = (state) => {
  const { allSchools, statusFilter } = state.school;
  if (!statusFilter) return allSchools;
  return allSchools.filter((s) => s.verificationStatus === statusFilter);
};

// ---------------------------------------------------------------------------
// STUDENT SLICE  (unchanged)
// ---------------------------------------------------------------------------

const studentInitialState = {
  students: [],
  selectedStudent: null,

  parentSearchResults: [],
  parentSearchLoading: false,
  parentSearchError: null,

  loading: {
    enrollStudent: false,
    getAllStudents: false,
    getStudentById: false,
    updateStudent: false,
    deleteStudent: false,
  },

  notification: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState: studentInitialState,

  reducers: {
    setSelectedStudent(state, { payload }) {
      state.selectedStudent = payload;
    },
    clearSelectedStudent(state) {
      state.selectedStudent = null;
    },
    setStudentNotification(state, { payload: { type, message } }) {
      state.notification = { type, message };
    },
    clearStudentNotification(state) {
      state.notification = null;
    },
    clearParentSearchResults(state) {
      state.parentSearchResults = [];
      state.parentSearchError = null;
    },
  },

  extraReducers: (builder) => {
    const loading = (key) => (state) => { state.loading[key] = true; };
    const done    = (key) => (state) => { state.loading[key] = false; };

    // ---- enrollStudent ----
    builder
      .addCase(enrollStudent.pending, loading("enrollStudent"))
      .addCase(enrollStudent.fulfilled, (state, { payload }) => {
        state.loading.enrollStudent = false;
        state.notification = { type: "success", message: "Student admitted successfully." };
        const newStudent = payload?.data?.studentProfile || payload?.studentProfile;
        if (newStudent) state.students.unshift(newStudent);
      })
      .addCase(enrollStudent.rejected, (state, { payload }) => {
        state.loading.enrollStudent = false;
        state.notification = { type: "error", message: payload };
      });

    // ---- getAllStudents ----
    builder
      .addCase(getAllStudents.pending,   loading("getAllStudents"))
      .addCase(getAllStudents.fulfilled, (state, { payload }) => {
        state.loading.getAllStudents = false;
        state.students = payload?.data ?? payload;
      })
      .addCase(getAllStudents.rejected,  done("getAllStudents"));

    // ---- getStudentById ----
    builder
      .addCase(getStudentById.pending,   loading("getStudentById"))
      .addCase(getStudentById.fulfilled, (state, { payload }) => {
        state.loading.getStudentById = false;
        state.selectedStudent = payload?.data ?? payload;
      })
      .addCase(getStudentById.rejected,  done("getStudentById"));

    // ---- updateStudent ----
    builder
      .addCase(updateStudent.pending,   loading("updateStudent"))
      .addCase(updateStudent.fulfilled, (state, { payload }) => {
        state.loading.updateStudent = false;
        state.notification = { type: "success", message: "Student updated successfully." };
        const updated = payload.data?.data ?? payload.data;
        const idx = state.students.findIndex((s) => s._id === payload.studentId);
        if (idx !== -1) state.students[idx] = updated;
        if (state.selectedStudent?._id === payload.studentId) {
          state.selectedStudent = updated;
        }
      })
      .addCase(updateStudent.rejected, (state, { payload }) => {
        state.loading.updateStudent = false;
        state.notification = { type: "error", message: payload };
      });

    // ---- deleteStudent ----
    builder
      .addCase(deleteStudent.pending,   loading("deleteStudent"))
      .addCase(deleteStudent.fulfilled, (state, { payload: studentId }) => {
        state.loading.deleteStudent = false;
        state.notification = { type: "success", message: "Student deleted successfully." };
        state.students = state.students.filter((s) => s._id !== studentId);
        if (state.selectedStudent?._id === studentId) state.selectedStudent = null;
      })
      .addCase(deleteStudent.rejected, (state, { payload }) => {
        state.loading.deleteStudent = false;
        state.notification = { type: "error", message: payload };
      });

    // ---- searchParents ----
    builder
      .addCase(searchParents.pending, (state) => {
        state.parentSearchLoading = true;
        state.parentSearchError = null;
      })
      .addCase(searchParents.fulfilled, (state, { payload }) => {
        state.parentSearchLoading = false;
        state.parentSearchResults = payload ?? [];
      })
      .addCase(searchParents.rejected, (state, { payload }) => {
        state.parentSearchLoading = false;
        state.parentSearchResults = [];
        state.parentSearchError = payload;
      });
  },
});

export const {
  setSelectedStudent,
  clearSelectedStudent,
  setStudentNotification,
  clearStudentNotification,
  clearParentSearchResults,
} = studentSlice.actions;

export const studentReducer = studentSlice.reducer;

export const selectAllStudents         = (state) => state.student.students;
export const selectSelectedStudent     = (state) => state.student.selectedStudent;
export const selectStudentLoading      = (key) => (state) => state.student.loading[key];
export const selectStudentNotification = (state) => state.student.notification;

export const selectParentSearchResults = (state) => state.student.parentSearchResults;
export const selectParentSearchLoading = (state) => state.student.parentSearchLoading;
export const selectParentSearchError   = (state) => state.student.parentSearchError;