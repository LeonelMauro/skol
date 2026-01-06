import type { ServiceIconKey } from "../utils/serviceIcons";

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  icon: ServiceIconKey;
}

export interface CreateServicePayload {
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  icon: ServiceIconKey;
}
