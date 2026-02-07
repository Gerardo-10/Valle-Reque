import type {VentaCuota} from './Venta';

export interface ListarCliente {
  id: number;         
  nombre: string;
  apellidos: string;
  dni: string;
  direccion: string;
  correo: string;
  telefono: string;
  ocupacion: string;
  ingreso_neto: number;
  estado: boolean;
  estado_cliente: string;
  carga_familiar: boolean;
}

export interface Cliente {
  id_cliente: number;
  nombre: string;
  apellidos: string;
  dni: string;
  direccion: string;
  correo: string;
  telefono: string;
  ocupacion: string;
  ingreso_neto: number;
  estado: boolean;
  estado_cliente: string;
  carga_familiar: ClienteFamiliar[];
}

export interface ClienteFamiliar {
  id_familia: number;
  id_cliente: number;
  nombre: string;
  apellido: string;
  dni: string;
  cotitular: boolean;
}

export interface ClienteVistaVentas {
  id: number;
  dni: string;
  nombres: string;
  apellidos: string;
  estado: string;
  ingreso: string;
  telefono: string;
  ocupacion: string;
  correo : string;
  cargaFamiliar: string;
  direccion: string;
}

export interface ClienteCuotasVentas {
  nombres: string;
  apellidos: string;
  dni: string;
  id_cliente: number,
  num_contratos_vigentes: number;
  cuotas_pendientes: number;
  total_cuotas: number;
  ventas: VentaCuota[];
}