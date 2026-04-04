import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import type { UserRole } from '../types/role';
import type { Location } from '../types/location';

export interface AuthUser {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  birthDate?: string;
  role: UserRole;
  location?: Location | null;
  access_token?: string;
  avatar?: string | null;
  isActive?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  setUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUserState] = useState<AuthUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const setUser = (updatedUser: AuthUser) => {
    setUserState(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const login = (userData: AuthUser) => {
    setUserState(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUserState(null);
    localStorage.removeItem('user');
  };

  /**
   * Validar sesión al iniciar la app
   */
  useEffect(() => {
    const validateSession = async () => {

      if (!user?.access_token) return;

      try {
        await api.get('/auth/profile');
      } catch (error) {
        logout();
      }

    };

    validateSession();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;

}