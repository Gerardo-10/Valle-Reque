import jsPDF from "jspdf"

export const generarPDFVentaFinal = (cliente: any, venta: any, cuotasPagadas: any[], montoRecaudado: string): File => {
  const doc = new jsPDF()

  // Colores del diseño
  const azulOscuro: [number, number, number] = [41, 128, 185] // #2980b9
  const grisClaro: [number, number, number] = [240, 240, 240] // #f0f0f0
  const grisTexto: [number, number, number] = [85, 85, 85] // #555555

  // Header azul oscuro
  doc.setFillColor(...azulOscuro)
  doc.rect(0, 0, 210, 45, "F")

  // Título principal en header
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("CONSTANCIA DE VENTA FINALIZADA", 105, 20, { align: "center" })

  // Subtítulo en header
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Documento Oficial de Finalización", 105, 32, { align: "center" })

  // Información del documento
  doc.setTextColor(...grisTexto)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, 20, 55)

  // Línea separadora
  doc.setDrawColor(...grisTexto)
  doc.setLineWidth(0.5)
  doc.line(20, 65, 190, 65)

  // Sección DATOS DEL CLIENTE
  let yPos = 80

  // Fondo gris para el título
  doc.setFillColor(...grisClaro)
  doc.rect(20, yPos - 5, 170, 8, "F")

  // Borde de la sección
  doc.setDrawColor(...grisTexto)
  doc.setLineWidth(0.5)
  doc.rect(20, yPos - 5, 170, 25)

  // Título de sección
  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DEL CLIENTE", 25, yPos)

  // Datos del cliente
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...azulOscuro)

  yPos += 8
  doc.text(`Nombre: ${cliente.nombres} ${cliente.apellidos}`, 25, yPos)
  yPos += 6
  doc.text(`DNI: ${cliente.dni}`, 25, yPos)

  // Sección DATOS DE LA VENTA
  yPos += 20

  // Fondo gris para el título
  doc.setFillColor(...grisClaro)
  doc.rect(20, yPos - 5, 170, 8, "F")

  // Borde de la sección
  doc.setDrawColor(...grisTexto)
  doc.rect(20, yPos - 5, 170, 45)

  // Título de sección
  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DE LA VENTA", 25, yPos)

  // Datos de la venta
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...azulOscuro)

  yPos += 8
  doc.text(`Proyecto: ${venta.proyecto}`, 25, yPos)
  yPos += 6
  doc.text(`Unidad: ${venta.codigo_unidad}`, 25, yPos)
  yPos += 6
  doc.text(`Tipo de Venta: ${venta.tipo_venta}`, 25, yPos)
  yPos += 6
  doc.text(`Estado de Terreno: ${venta.estado_terreno}`, 25, yPos)
  yPos += 6
  doc.text(`Estado Venta: ${venta.estado_venta}`, 25, yPos)

  // Sección CUOTAS PAGADAS
  yPos += 20

  // Fondo gris para el título
  doc.setFillColor(...grisClaro)
  doc.rect(20, yPos - 5, 170, 8, "F")

  // Borde inicial de la sección (se extenderá según el contenido)
  doc.setDrawColor(...grisTexto)

  // Título de sección
  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("CUOTAS PAGADAS", 25, yPos)

  // Datos de cuotas
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...azulOscuro)

  yPos += 10
  const inicioSeccionCuotas = yPos - 15

  cuotasPagadas.forEach((cuota: any) => {
    doc.text(`Cuota ${cuota.id_cuota} | Ref: ${cuota.referencia} | S/ ${cuota.monto}`, 25, yPos)
    yPos += 6
    if (yPos > 270) {
      doc.addPage()
      yPos = 20
    }
  })

  // Completar el borde de la sección de cuotas
  const alturaCuotas = yPos - inicioSeccionCuotas + 5
  doc.rect(20, inicioSeccionCuotas, 170, alturaCuotas)

  // Sección RESUMEN FINAL
  yPos += 15

  // Rectángulo azul oscuro para el resumen final
  doc.setFillColor(...azulOscuro)
  doc.rect(20, yPos - 5, 170, 25, "F")

  // Título del resumen
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("RESUMEN FINAL", 105, yPos + 5, { align: "center" })

  // Monto recaudado
  doc.setFontSize(14)
  doc.text(`Monto del bono recaudado: S/ ${montoRecaudado}`, 105, yPos + 15, { align: "center" })

  // Estado de finalización
  yPos += 35
  doc.setTextColor(...grisTexto)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("Estado: VENTA FINALIZADA", 25, yPos)
  doc.setFont("helvetica", "normal")
  doc.text("Todas las cuotas han sido pagadas exitosamente", 25, yPos + 6)

  // Línea separadora final
  doc.setDrawColor(...grisTexto)
  doc.line(20, yPos + 15, 190, yPos + 15)

  // Footer
  doc.setTextColor(...grisTexto)
  doc.setFontSize(8)
  doc.text("Este documento certifica la finalización exitosa de la venta", 105, yPos + 25, { align: "center" })
  doc.text("Conserve este documento para sus registros", 105, yPos + 30, { align: "center" })
  doc.text(`Generado el ${new Date().toLocaleDateString("es-PE")} - Sistema de Gestión de Ventas`, 105, yPos + 35, {
    align: "center",
  })

  const pdfBlob = doc.output("blob")
  const nombreArchivo = `venta_finalizada_${venta.codigo_venta}.pdf`
  const archivoPDF = new File([pdfBlob], nombreArchivo, {
    type: "application/pdf",
  })

  return archivoPDF
}
