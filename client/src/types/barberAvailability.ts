import type { Location } from './location';

export interface Barber {
  id: number;
  name: string;
  email: string;
  location?: Location | null;  
}

// Lo que viene del backend
export interface BarberAvailability {
  id: number;
  barber: Barber;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface CreateBarberAvailabilityPayload {
  barberId: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface UpdateBarberAvailabilityPayload {
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}
  export interface BarberTableInfo {
  id: number;
  name: string;
  location?: Location | null;
}
export interface UpdateBarberSchedulePayload {
  barberId: number;
  availabilities: EditableBarberAvailability[];
  locationId: number | null;
  removedIds?: number[];
}
// Lo que se usa para editar/guardar
export interface EditableBarberAvailability {
  id?: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}