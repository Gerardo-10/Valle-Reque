import type { Cuota } from "./Cuota";

export interface VentaCuota {
  id_venta: number;
  codigo_venta: string;
  id_proyecto: number;
  estado_venta: string;
  proyecto: string; 
  codigo_unidad: string;
  estado_terreno: string;
  documento_contrato: string;
  tipo_venta: string;
  id_venta_origen: number;
  cuotas: Cuota[];
}

export interface VentaResponse {
  id_venta: number
  codigo_venta: string
  nombre_cliente: string
  apellido_cliente: string
  dni: string
  codigo_unidad: string
  estado_terreno: string
  precio_venta: string
  monto_financiar: string
  total_amortizado: string
  estado: string
  tipo: string
  documento_contrato: string
}