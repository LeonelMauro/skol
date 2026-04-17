export interface AvailabilityForm {
  barberId: number;
  days: string[];
  timeRanges: {
    start_time: string;
    end_time: string;
  }[];
  percentage: number | ""; // 🔥 nuevo
}
