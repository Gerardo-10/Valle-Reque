export interface Cuota {
  id_cuota: number;
  id_pago: number;
  interes: number;
  monto: string;
  estado: number;
  referencia: string;
  tipo_cuota: string;
  fecha_vencimiento: string;
  estado_cuota_logica: string;
}