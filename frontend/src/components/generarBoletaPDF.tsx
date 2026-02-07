import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import QRCode from "qrcode"
import type { ClienteCuotasVentas } from "../types/Clientes"
import type { BancoDetalleActivo } from "../types/Banco"

interface Props {
  cliente: ClienteCuotasVentas
  banco: BancoDetalleActivo
  cuota: {
    numero: number
    fecha: string
    referencia: string
    monto: string
  }
}

export function generarBoletaPDF({ cliente, banco, cuota }: Props): File {
  const doc = new jsPDF()

  // Colores más oscuros según la imagen
  const azulOscuro: [number, number, number] = [41, 128, 185] // #2980b9
  const grisClaro: [number, number, number] = [240, 240, 240] // #f0f0f0
  const grisTexto: [number, number, number] = [85, 85, 85] // #555555
  const azulTabla: [number, number, number] = [52, 152, 219] // #3498db

  // Header azul oscuro
  doc.setFillColor(...azulOscuro)
  doc.rect(0, 0, 210, 45, "F")

  // Título principal en header
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text("COMPROBANTE DE PAGO", 105, 20, { align: "center" })

  // Subtítulo en header
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text("Cuota de Financiamiento", 105, 32, { align: "center" })

  // Información del comprobante
  doc.setTextColor(...grisTexto)
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")

  const fechaActual = new Date().toLocaleDateString("es-PE")
  const numeroComprobante = `REF-${cuota.referencia}`

  doc.text(`N° ${numeroComprobante}`, 20, 55)
  doc.text(`Fecha de emisión: ${fechaActual}`, 20, 62)

  // Línea separadora
  doc.setDrawColor(...grisTexto)
  doc.setLineWidth(0.5)
  doc.line(20, 70, 190, 70)

  // Sección DATOS DEL CLIENTE
  let yPos = 85

  // Fondo gris para el título
  doc.setFillColor(...grisClaro)
  doc.rect(20, yPos - 5, 170, 8, "F")

  // Borde de la sección
  doc.setDrawColor(...grisTexto)
  doc.setLineWidth(0.5)
  doc.rect(20, yPos - 5, 170, 35)

  // Título de sección
  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS DEL CLIENTE", 25, yPos)

  // Datos del cliente
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...azulOscuro)

  yPos += 10
  doc.text(`Nombres y Apellidos: ${cliente.nombres} ${cliente.apellidos}`, 25, yPos)
  yPos += 7
  doc.text(`DNI: ${cliente.dni}`, 25, yPos)

  // Sección DATOS BANCARIOS
  yPos += 20

  // Fondo gris para el título
  doc.setFillColor(...grisClaro)
  doc.rect(20, yPos - 5, 170, 8, "F")

  // Borde de la sección
  doc.setDrawColor(...grisTexto)
  doc.rect(20, yPos - 5, 170, 35)

  // Título de sección
  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DATOS BANCARIOS", 25, yPos)

  // Datos bancarios
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(...azulOscuro)

  yPos += 10
  doc.text(`Banco: ${banco.nombre}`, 25, yPos)
  yPos += 7
  doc.text(`Titular: ${banco.titular}`, 25, yPos)
  doc.text(`N° Cuenta: ${banco.numero_cuenta}`, 120, yPos)

  // Sección DETALLE DEL PAGO
  yPos += 20

  doc.setTextColor(...grisTexto)
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.text("DETALLE DEL PAGO", 25, yPos)

  // Tabla de detalle
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Concepto", "N° Cuota", "Referencia", "Fecha de Pago", "Monto"]],
    body: [["Cuota de Financiamiento", cuota.numero.toString(), cuota.referencia, cuota.fecha, `S/ ${cuota.monto}`]],
    headStyles: {
      fillColor: azulTabla,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      halign: "center",
      textColor: grisTexto,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 20, right: 20 },
    tableWidth: 170,
  })

  // Obtener la posición Y después de la tabla
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 30

  // Generar QR Code con datos del pago
  const qrData = JSON.stringify({
    referencia: cuota.referencia,
    cliente: `${cliente.nombres} ${cliente.apellidos}`,
    dni: cliente.dni,
    monto: cuota.monto,
    fecha: cuota.fecha,
    banco: banco.nombre,
    cuenta: banco.numero_cuenta,
    estado: "PAGADO",
  })

  // Sección MONTO TOTAL PAGADO
  const montoY = finalY + 15

  // Rectángulo azul oscuro para el monto total (lado izquierdo)
  doc.setFillColor(...azulOscuro)
  doc.rect(20, montoY, 100, 30, "F")

  // Texto del monto total
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.setFont("helvetica", "bold")
  doc.text("MONTO TOTAL PAGADO", 70, montoY + 10, { align: "center" })
  doc.setFontSize(16)
  doc.text(`S/ ${cuota.monto}`, 70, montoY + 22, { align: "center" })

  // Generar QR Code como imagen
  const generateQRAndAddToPDF = async () => {
    try {
      // Generar QR code como data URL
      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 80,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Agregar QR code al PDF
      doc.addImage(qrDataURL, "PNG", 135, montoY + 2, 26, 26)

      // Texto del QR
      doc.setTextColor(...grisTexto)
      doc.setFontSize(8)
      doc.text("Código QR", 148, montoY + 32, { align: "center" })
      doc.text("Escanea para verificar", 148, montoY + 36, { align: "center" })
    } catch (error) {
      console.error("Error generando QR:", error)
      // Fallback: mostrar rectángulo con texto
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(...grisTexto)
      doc.rect(135, montoY + 2, 26, 26)
      doc.setTextColor(...grisTexto)
      doc.setFontSize(8)
      doc.text("QR", 148, montoY + 16, { align: "center" })
    }
  }

  // Estado del pago
  const estadoY = montoY + 45
  doc.setTextColor(...grisTexto)
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.text("Estado: PAGADO", 25, estadoY)
  doc.text("Método de pago: Transferencia Bancaria", 25, estadoY + 5)

  // Línea separadora final
  doc.setDrawColor(...grisTexto)
  doc.line(20, estadoY + 15, 190, estadoY + 15)

  // Footer
  doc.setTextColor(...grisTexto)
  doc.setFontSize(8)
  doc.text("Este comprobante es válido como constancia de pago", 105, estadoY + 25, { align: "center" })
  doc.text("Conserve este documento para sus registros", 105, estadoY + 30, { align: "center" })
  doc.text(`Generado el ${fechaActual} - Sistema de Gestión Financiera`, 105, estadoY + 35, { align: "center" })

  // Generar QR y finalizar PDF
  generateQRAndAddToPDF().then(() => {
    const nombreArchivo = `boleta_${cuota.referencia}.pdf`
    doc.save(nombreArchivo)
  })

  // Guardar como archivo en memoria
  const pdfBlob = doc.output("blob")
  const pdfFile = new File([pdfBlob], `boleta_${cuota.referencia}.pdf`, {
    type: "application/pdf",
  })

  return pdfFile
}
