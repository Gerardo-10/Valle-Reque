import type { VentaResponse } from "../types/Venta"

export const getVentas = async (): Promise<VentaResponse[]> => {
  const response = await fetch("http://localhost:5000/api/ventas")
  if (!response.ok) throw new Error("Error al obtener ventas")
  return await response.json()
}

