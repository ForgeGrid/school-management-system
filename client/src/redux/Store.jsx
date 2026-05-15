import {configureStore,} from '@reduxjs/toolkit';
import authReducer from './slice/authslice'
import schoolReducer from "./slice/schoolslice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    school: schoolReducer,
  },
});

export default store;