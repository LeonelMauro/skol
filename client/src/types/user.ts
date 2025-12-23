export type UserRole = 'admin' | 'barber' | 'client';

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
  roleId?: number;
}
