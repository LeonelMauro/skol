import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePublic from '../pages/HomePublic';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* HOME PÚBLICO */}
          <Route path="/" element={<HomePublic />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ÁREA PRIVADA */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
