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
import ReservationsBarber from '../pages/barber/TodayBookings';
import BarberHistoryPanel from '../pages/barber/BarberHistoryPanel';
import AddService from '../pages/barber/AddService';
import SelectClient from '../pages/barber/SelectClient';
import BarberAgendaStructurePage from '../pages/barber/BarberAgendaStructurePage';
import PaymentStep from '../pages/barber/PaymentStep';
import RepostsHIstory from '../pages/admin/Reposts';
import Profile from '../pages/Profile';

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
          <Route path="/perfil" element={
              <ProtectedRoute roles={['client', 'barber', 'admin']}>
                <Profile />
              </ProtectedRoute>
            }
          />

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
          <Route
            path="/turnos"
            element={
              <ProtectedRoute roles={['barber']}>
                <ReservationsBarber />
              </ProtectedRoute>
            }
          />
          <Route
            path="/metricas"
            element={
              <ProtectedRoute roles={['barber']}>
                <BarberHistoryPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios"
            element={
              <ProtectedRoute roles={['barber']}>
                <AddService />
              </ProtectedRoute>
            }
          />
          <Route
          path="/add-service/client"
          element={
            <ProtectedRoute roles={['barber']}>
              <SelectClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agenda"
          element={
            <ProtectedRoute roles={['barber']}>
              <BarberAgendaStructurePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-service/payment"
          element={
            <ProtectedRoute roles={['barber']}>
              <PaymentStep />
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
          <Route
            path="/admin/reportes"
            element={
              <ProtectedRoute roles={['admin']}>
                <RepostsHIstory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}
