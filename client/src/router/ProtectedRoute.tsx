import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactNode;
  roles?: Array<'admin' | 'barber' | 'client'>;
}

export default function ProtectedRoute({ children, roles }: Props) {

  const { user, loading } = useAuth();

  // Esperar validación de sesión
  if (loading) {
    return null; // o un loader
  }

  // No está logueado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // No autorizado
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}