import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/Store";
import AuthMain from "./page/Auth/Auth.Main";
import TenantMain from "./page/Dashboard/Dashboard";
import AuthProtectRoute from "./middleware/AuthProtect.route";
import PublicRoute from "./middleware/PublicRoute";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<PublicRoute> <AuthMain /> </PublicRoute> } />

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
                <TenantMain />
              </AuthProtectRoute>
            }
          />


        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;