export interface Appointment {
  id: number;
  date: string; // 2026-02-24
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  client: {
    id: number;
    name: string;
    email: string;
  };
  service: {
    id: number;
    name: string;
    price: number;
    duration: number;
  };
}
