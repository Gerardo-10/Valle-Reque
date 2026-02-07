import type { DatosCancelacion } from "../types/Cancelar"

export async function getDatosCancelacion(id_venta: number): Promise<DatosCancelacion> {
  const response = await fetch(`http://localhost:5000/api/ventas/cancelacion?id_venta=${id_venta}`)

  if (!response.ok) {
    throw new Error("Error al obtener datos de cancelación")
  }

  const data = await response.json()
  return data.data as DatosCancelacion
}