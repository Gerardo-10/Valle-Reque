export interface DatosCancelacion {
  documento_identidad: string
  nombre: string
  apellidos: string
  carga_familiar: number
  nombre_financiamiento: string

  nombre_proyecto: string
  codigo_unidad: string
  etapa: string
  tipo_terreno: string
  area: string
  precio_terreno: string

  codigo_venta: string
  total_amortizado: string
  numero_cuotas: number
  cuotas_pagadas: number
  fecha_final: string
  tipo_financiamiento: string
}
