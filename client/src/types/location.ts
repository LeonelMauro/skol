export interface Location{
    id: number;
    name: string; // Ej: "Skol Centro"
    address: string;
    phone: string;
    is_active: boolean;
    imageUrl: string; // URL de la imagen
    department:string
}

export interface CreateLocationPayload{
    name:string;
    address:string;
    phone:string;
    imageUrl:string
    department:string

}