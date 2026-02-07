// utils/fechas.ts
export function generarFechasPagos(fechaInicial: Date, numCuotas: number): string[] {
  const resultados: string[] = []
  for (let i = 1; i <= numCuotas; i++) {
    const copia = new Date(fechaInicial)
    copia.setMonth(copia.getMonth() + i)
    const dd = String(copia.getDate()).padStart(2, "0")
    const mm = String(copia.getMonth() + 1).padStart(2, "0")
    const yyyy = copia.getFullYear()
    resultados.push(`${dd}/${mm}/${yyyy}`)
  }
  return resultados
}
