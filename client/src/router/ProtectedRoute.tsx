import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: ReactNode;
  roles?: Array<'admin' | 'barber' | 'client'>;
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user } = useAuth();

  // No está logueado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Tiene rol pero no autorizado
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
