import type { DatosRefinanciamiento } from "../types/Refinanciamiento"

export const getDatosRefinanciamiento = async (id_venta: number): Promise<DatosRefinanciamiento> => {
  const response = await fetch(`http://localhost:5000/api/ventas/refinanciamiento?id_venta=${id_venta}`)
  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Error al obtener datos de refinanciamiento")
  }

  const datos: DatosRefinanciamiento = data.data

  // ✅ Formatear fecha_pago (ej: DD/MM/YYYY)
  if (datos.fecha_pago) {
    const fecha = new Date(datos.fecha_pago)
    const dia = String(fecha.getDate()).padStart(2, "0")
    const mes = String(fecha.getMonth() + 1).padStart(2, "0") // Mes base 0
    const anio = fecha.getFullYear()
    datos.fecha_pago = `${dia}/${mes}/${anio}`
  }

  // ✅ Formatear carga_familiar: 1 => "Sí", 0 => "No"
  datos.carga_familiar = datos.carga_familiar ? "Sí" : "No"

  return datos
}
