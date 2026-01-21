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
import AdminUsers from '../pages/admin/AdminUsers';
import Location from '../pages/admin/Location';
import Services from '../pages/admin/Services';
import BarberAvailability from '../pages/admin/BarberAvailability';
import Reserve from '../pages/client/Reserve';
import SelectBarber from '../pages/client/SelectBarber';
import SelectService from '../pages/client/SelectService';
import SelectDateTime from '../pages/client/SelectDateTime';
import ConfirmReservation from '../pages/client/ConfirmReservation';
import MyReservations from '../pages/client/MyReservations';

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
          <Route
            path="/reservas"
            element={
              <ProtectedRoute roles={['client']}>
                <Reserve />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas/barberos"
            element={
              <ProtectedRoute roles={['client']}>
                <SelectBarber />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas/:locationId/servicio"
            element={
              <ProtectedRoute roles={['client']}>
                <SelectService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservas/fecha"
            element={
              <ProtectedRoute roles={['client']}>
                <SelectDateTime />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reserve/confirm"
            element={
              <ProtectedRoute roles={['client']}>
                <ConfirmReservation />
              </ProtectedRoute>
            }
          />
           <Route
            path="/mis-reservas"
            element={
              <ProtectedRoute roles={['client']}>
                <MyReservations />
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
          <Route
            path="/admin/locales"
            element={
              <ProtectedRoute roles={['admin']}>
                <Location />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute roles={['admin']}>
                <Services />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/barbers"
            element={
              <ProtectedRoute roles={['admin']}>
                <BarberAvailability />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
