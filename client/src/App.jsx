import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/Store";
import AuthMain from "./page/Auth/Auth.Main";
import TenantMain from "./page/Dashboard/Dashboard";
import AuthProtectRoute from "./middleware/AuthProtect.route";
import PublicRoute from "./middleware/PublicRoute";
import AdminDashboard from "./page/Admin/AdminDashboard";
import StudentDashboard from "./page/StudentDhasboard/ParentDashboard"

import { Toaster, toast } from 'sonner';
import AppGate from "./middleware/AppGate";
function App() {
  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<PublicRoute> <AuthMain /> </PublicRoute>} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthMain />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <AuthMain />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthProtectRoute>
                <AppGate>
                  <TenantMain />
                </AppGate>
              </AuthProtectRoute>
            }
          />
          <Route
            path="/portal"
            element={
              <AuthProtectRoute>
                <AppGate>
                 <StudentDashboard/>
                </AppGate>
              </AuthProtectRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AuthProtectRoute>
                <AppGate>
                  <AdminDashboard />
                </AppGate>
              </AuthProtectRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;