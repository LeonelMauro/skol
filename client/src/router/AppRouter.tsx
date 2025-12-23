// src/routes/AppRouter.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePublic from '../pages/HomePublic';
import Login from '../pages/Login';
import Register from '../pages/Register';

import ClientDashboard from '../pages/client/ClientDashboard';
import BarberDashboard from '../pages/barber/BarberDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';

import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { Box } from '@mui/material';
import AdminUsers from '../pages/admin/AdminUsers';

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

          {/* CLIENT */}
          <Route
            path="/client"
            element={
              <ProtectedRoute roles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />

          {/* BARBER */}
          <Route
            path="/barber"
            element={
              <ProtectedRoute roles={['barber']}>
                <BarberDashboard />
              </ProtectedRoute>
            }
          />

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
