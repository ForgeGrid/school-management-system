import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthMain from './page/Auth/Auth.Main'
import ParentDashboard from './page/Parent/ParentDashboard'
import TeacherDahboard from './page/Teacher/TeacherDahboard'
import AdminDashboard from './page/Admin/AdminDashboard'
import { Provider } from "react-redux";
import store from "./redux/Store";
import TenantMain from './page/Tenant/TenantMain'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AuthMain />} />
          <Route path="/login" element={<AuthMain />} />
          <Route path="/register" element={<AuthMain />} />


          <Route element={<TenantMain/>} />
           <Route path="/tenant" element={<TenantMain/>} />
          <Route path="/dashboard/parent" element={<ParentDashboard />} />
          <Route path="/dashboard/teacher" element={<TeacherDahboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App