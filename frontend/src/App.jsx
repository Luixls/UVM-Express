// RUTA: frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Rastreo from "./pages/Rastreo.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/rastreo" element={<Rastreo />} />
          <Route path="*" element={<NotFound />} />

          {/* Protegidas */}
          <Route
            path="/panel"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
