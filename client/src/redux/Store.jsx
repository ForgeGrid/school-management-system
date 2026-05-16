import {configureStore,} from '@reduxjs/toolkit';
import authReducer from './slice/authslice'
import getmeReducer from './slice/getmeslice'
import schoolReducer from "./slice/schoolslice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    getme: getmeReducer,
    school: schoolReducer,
  },
});

export default store;