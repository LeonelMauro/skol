import type { UserRole } from './role';
import type { Location } from './location';
import type { BarberAvailability } from './barberAvailability';


export interface Role {
  id: number;
  name: UserRole;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate: string;
  isActive: boolean;
  role: Role;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: string;
}

export interface Barber {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birthDate: string;
  isActive: boolean;
  location?: Location | null;
  availabilities: BarberAvailability[];
  avatar?: string | null;
}

export interface CreateBarberPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  birthDate: string;
  location?: Location | null;
}
export interface BarberTodayMetrics {
  servicesDone: number;
  totalEarned: number;
  cash: number;
  mercadoPago: number;
  commissionPercentage: number;
}