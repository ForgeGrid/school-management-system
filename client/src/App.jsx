import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AuthMain from './page/Auth/Auth.Main'
import ParentDashboard from './page/Parent/ParentDashboard'
import TeacherDahboard from './page/Teacher/TeacherDahboard'
import AdminDashboard from './page/Admin/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
       
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AuthMain />} />
        <Route path="/register" element={<AuthMain />} />

        {/* Dashboard routes */}

        <Route path="/dashboard/parent" element={<ParentDashboard />} />
        <Route path="/dashboard/teacher" element={<TeacherDahboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App