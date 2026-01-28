export interface AvailableSlotsResponse {
  barberId: number;
  date: string;
  serviceDuration: number;
  availableSlots: string[];
}

export interface TodayBooking {
  id: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'canceled' | 'no_show' | 'completed';
  client: { name: string };
  service: { name: string; price: number };
  location: { name: string; address: string };
};