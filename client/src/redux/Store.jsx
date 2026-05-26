import {configureStore,} from '@reduxjs/toolkit';
import authReducer from './slice/authslice'
import getmeReducer from './slice/getmeslice'
import schoolReducer from "./slice/schoolslice";
import invitationReducer from "./slice/Invitationslice";
import { schoolReducers, studentReducer } from "./slice/schoolStudentSlice";
import busRouteReducer from "./slice/busRouteSlice";
import academicFeeStructureReducer from "./slice/academicFeeStructureSlice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    getme: getmeReducer,
    school: schoolReducer,
    invitation: invitationReducer,
    schools: schoolReducers,
    student: studentReducer,
     busRoute: busRouteReducer,
      academicFeeStructure: academicFeeStructureReducer,
  },
});

export default store;