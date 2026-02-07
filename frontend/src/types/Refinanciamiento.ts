export interface DatosRefinanciamiento {
  nombres: string
  apellidos: string
  documento_identidad: string
  ocupacion: string
  carga_familiar: "Sí" | "No"

  nombre_proyecto: string
  codigo_unidad: string
  etapa: string
  tipo_terreno: string
  area: string

  saldo: string
  monto_total_aportado: string
  numero_cuotas: number
  monto_cuota: string
  fecha_pago: string

  interes: number
  monto_preaprobado: string
  nombre_financiamiento: string
}
