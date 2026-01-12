export class BarberAvailabilityResponseDto {
  id: number;

  day_of_week: string;
  day_of_week_es: string;

  start_time: string;
  end_time: string;

  is_active: boolean;

  barber: {
    id: number;
    name: string;
    email: string;
    location?: {
      id: number;
      name: string;
      address: string;
    };
  };
}
