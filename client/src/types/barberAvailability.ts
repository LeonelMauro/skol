import type { Location } from './location';

export interface Barber {
  id: number;
  name: string;
  email: string;
  location?: Location | null;  
}

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
}

export type UpdateBarberAvailabilityPayload =
  Partial<CreateBarberAvailabilityPayload>;