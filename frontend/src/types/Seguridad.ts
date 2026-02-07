import type { AreaData } from "./AreaData";
import type { UserData } from "./UserData";

export interface SeguridadData {
  id_empleado: number;
  nombre: string;
  apellido: string;
  dni: string;
  direccion: string;
  correo: string;
  telefono: string;
  fecha_nacimiento: string;
  id_area?: AreaData;      
  usuario?: UserData;
}