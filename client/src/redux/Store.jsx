import {configureStore,} from '@reduxjs/toolkit';
import authReducer from './slice/authslice'
import getmeReducer from './slice/getmeslice'
import schoolReducer from "./slice/schoolslice";
import invitationReducer from "./slice/Invitationslice";
const store = configureStore({
  reducer: {
    auth: authReducer,
    getme: getmeReducer,
    school: schoolReducer,
    invitation: invitationReducer
  },
});

export default store;