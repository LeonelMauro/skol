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
  locationId: number;
  availabilities: EditableBarberAvailability[];
  removedIds?: number[];
}
// Lo que se usa para editar/guardar
export interface EditableBarberAvailability {
  day_of_week: string;
  is_active: boolean;
  timeRanges: {
    id?: number;
    start_time: string;
    end_time: string;
  }[];
}
