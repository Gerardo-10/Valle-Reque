"use client"

import type React from "react"
import { useEffect } from "react"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { buscarCuotasPorDni } from "../api/cuotas"

interface Props {
  dni: string
  isOpen: boolean
  onClose: () => void
}

const logoUrl = "/logo.png"


function convertirImagenConFiltro(img: HTMLImageElement): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  ctx!.filter = "brightness(0) invert(1)"
  ctx!.drawImage(img, 0, 0)

  return canvas.toDataURL("image/png")
}


const ReporteCuotasPDF: React.FC<Props> = ({ dni, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return
    ;(async () => {
      // 1️⃣ Obtengo datos del cliente
      const cliente = await buscarCuotasPorDni(dni)
      if (!cliente) {
        alert("Cliente no encontrado")
        onClose()
        return
      }

      // 2️⃣ Inicializo jsPDF en formato A4
      const doc = new jsPDF({ format: "a4", unit: "pt" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 40
      let cursorY = margin

      // Colores del gradiente
      const primaryGreen = [76, 175, 80]
      const primaryBlue = [33, 150, 243]
      const lightGray = [248, 249, 250]
      const darkGray = [73, 80, 87]

      // Función para crear gradiente simulado horizontal
      const createHorizontalGradient = (x: number, y: number, width: number, height: number) => {
        const steps = 50
        const stepWidth = width / steps
        for (let i = 0; i < steps; i++) {
          const ratio = i / steps
          const r = Math.round(primaryGreen[0] + (primaryBlue[0] - primaryGreen[0]) * ratio)
          const g = Math.round(primaryGreen[1] + (primaryBlue[1] - primaryGreen[1]) * ratio)
          const b = Math.round(primaryGreen[2] + (primaryBlue[2] - primaryGreen[2]) * ratio)
          doc.setFillColor(r, g, b)
          doc.rect(x + i * stepWidth, y, stepWidth + 1, height, "F")
        }
      }

      // 3️⃣ Header principal con gradiente
      createHorizontalGradient(0, 0, pageWidth, 80)

  try {
  const originalImg = new Image()
  originalImg.crossOrigin = "anonymous"
  originalImg.src = logoUrl

  await new Promise<void>((resolve, reject) => {
    originalImg.onload = () => resolve()
    originalImg.onerror = () => reject("No se pudo cargar el logo")
  })

  const imagenBase64 = convertirImagenConFiltro(originalImg)

  doc.addImage(imagenBase64, "PNG", pageWidth - margin - 60, 15, 50, 50)
} catch {
  // Si falla la carga del logo, no lo insertamos
}


      // Título principal en blanco sobre el gradiente
      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(28)
      doc.text("REPORTE DE CUOTAS", margin, 45)

      doc.setFontSize(14)
      doc.setFont("helvetica", "normal")
      doc.text("Sistema de Gestión Valle Reque", margin, 65)

      cursorY = 100

      // 5️⃣ Información del cliente mejorada
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, cursorY, pageWidth - 2 * margin, 140, 8, 8, "F")

      // Borde izquierdo verde
      doc.setFillColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
      doc.rect(margin, cursorY, 6, 140, "F")

      cursorY += 25

      // Título de la sección
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("INFORMACIÓN DEL CLIENTE", margin + 20, cursorY)

      cursorY += 30

      // Información del cliente en layout mejorado
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)

      // Primera fila
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont("helvetica", "bold")
      doc.text("CLIENTE:", margin + 20, cursorY)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "normal")
      doc.text(`${cliente.nombres} ${cliente.apellidos}`, margin + 100, cursorY)

      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont("helvetica", "bold")
      doc.text("DNI:", margin + 320, cursorY)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "normal")
      doc.text(cliente.dni, margin + 360, cursorY)

      cursorY += 25

      // Segunda fila
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont("helvetica", "bold")
      doc.text("CONTRATOS VIGENTES:", margin + 20, cursorY)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "normal")
      doc.text(cliente.num_contratos_vigentes.toString(), margin + 180, cursorY)

      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont("helvetica", "bold")
      doc.text("TOTAL DE CUOTAS:", margin + 320, cursorY)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "normal")
      doc.text(cliente.total_cuotas.toString(), margin + 450, cursorY)

      cursorY += 25

      // Tercera fila
      doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
      doc.setFont("helvetica", "bold")
      doc.text("CUOTAS PENDIENTES:", margin + 20, cursorY)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])
      doc.setFont("helvetica", "normal")
      doc.text(cliente.cuotas_pendientes.toString(), margin + 170, cursorY)

      cursorY += 40

      // 6️⃣ Preparo resumen de pagos
      let totalPagado = 0
      const pagosPorVenta: Record<string, number> = {}

      // 7️⃣ Para cada venta genero una tabla con header gradiente
      for (const venta of cliente.ventas) {
        if (cursorY > pageHeight - 200) {
          doc.addPage()
          cursorY = margin
        }

        // Header de la venta con gradiente horizontal
        createHorizontalGradient(margin, cursorY, pageWidth - 2 * margin, 35)

        doc.setTextColor(255, 255, 255)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
        doc.text(
          `VENTA ${venta.codigo_venta} • UNIDAD ${venta.codigo_unidad} • ${venta.proyecto}`,
          margin + 15,
          cursorY + 22,
        )

        cursorY += 45

        // Cuerpo de la tabla
        const body = venta.cuotas.map((c) => {
          const d = new Date(c.fecha_vencimiento)
          const fecha = isNaN(d.getTime())
            ? c.fecha_vencimiento
            : `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`

          if (c.estado_cuota_logica === "Pagada") {
            pagosPorVenta[venta.codigo_venta] = (pagosPorVenta[venta.codigo_venta] || 0) + Number.parseFloat(c.monto)
            totalPagado += Number.parseFloat(c.monto)
          }

          return [
            c.id_cuota,
            fecha,
            c.referencia,
            `S/${Number.parseFloat(c.monto).toFixed(2)}`,
            c.interes,
            c.estado_cuota_logica,
          ]
        })

        autoTable(doc, {
          startY: cursorY,
          margin: { left: margin, right: margin },
          head: [["#", "FECHA", "REFERENCIA", "MONTO", "INTERÉS", "ESTADO"]],
          body,
          theme: "plain",
          headStyles: {
            fillColor: [240, 242, 247],
            textColor: [52, 58, 64],
            fontStyle: "bold",
            fontSize: 10,
            cellPadding: 8,
          },
          bodyStyles: {
            textColor: [52, 58, 64],
            fontSize: 9,
            cellPadding: 6,
          },
          alternateRowStyles: {
            fillColor: [248, 249, 250],
          },
          didParseCell: (data) => {
            if (data.section === "body" && data.column.index === 5) {
              switch (data.cell.raw) {
                case "Pagada":
                  data.cell.styles.textColor = [76, 175, 80]
                  data.cell.styles.fontStyle = "bold"
                  break
                case "ConRetraso":
                  data.cell.styles.textColor = [244, 67, 54]
                  data.cell.styles.fontStyle = "bold"
                  break
                case "Pendiente":
                  data.cell.styles.textColor = [255, 152, 0]
                  data.cell.styles.fontStyle = "bold"
                  break
              }
            }
          },
          styles: {
            lineColor: [222, 226, 230],
            lineWidth: 0.5,
          },
        })

        // @ts-ignore
        cursorY = (doc as any).lastAutoTable.finalY + 25
      }

      // 8️⃣ Resumen de pagos elegante
      if (cursorY > pageHeight - 180) {
        doc.addPage()
        cursorY = margin
      }

      // Header del resumen con gradiente
      createHorizontalGradient(margin, cursorY, pageWidth - 2 * margin, 30)

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(16)
      doc.text("RESUMEN DE PAGOS", margin + 15, cursorY + 20)

      cursorY += 40

      // Card del resumen con fondo blanco
      const resumenHeight = 60 + Object.keys(pagosPorVenta).length * 18
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, cursorY, pageWidth - 2 * margin, resumenHeight, 8, 8, "F")

      // Sombra simulada
      doc.setFillColor(230, 230, 230)
      doc.roundedRect(margin + 2, cursorY + 2, pageWidth - 2 * margin, resumenHeight, 8, 8, "F")
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(margin, cursorY, pageWidth - 2 * margin, resumenHeight, 8, 8, "F")

      cursorY += 25

      // Total principal destacado con fondo
      doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
      doc.roundedRect(margin + 20, cursorY, pageWidth - 2 * margin - 40, 30, 5, 5, "F")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(18)
      doc.setTextColor(primaryGreen[0], primaryGreen[1], primaryGreen[2])
      doc.text(`TOTAL ABONADO: S/${totalPagado.toFixed(2)}`, margin + 35, cursorY + 20)

      cursorY += 45

      // Detalle por venta con bullets elegantes
      doc.setFont("helvetica", "normal")
      doc.setFontSize(12)
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2])

      Object.entries(pagosPorVenta).forEach(([venta, suma]) => {
        // Bullet point circular
        doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2])
        doc.circle(margin + 35, cursorY - 3, 2, "F")

        doc.text(`Venta ${venta}: S/${suma.toFixed(2)}`, margin + 45, cursorY)
        cursorY += 18
      })

      // Footer elegante (mantener como está)
      const footerY = pageHeight - 30
      createHorizontalGradient(0, footerY - 10, pageWidth, 40)

      doc.setTextColor(255, 255, 255)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text("Valle Reque - Sistema de Gestión de Cuotas", margin, footerY + 5)
      doc.text(`Generado el: ${new Date().toLocaleDateString("es-PE")}`, pageWidth - margin - 100, footerY + 5)

      // 9️⃣ Descarga el PDF
      doc.save(`reporte_cuotas_${dni}.pdf`)
      onClose()
    })()
  }, [dni, isOpen, onClose])

  return null
}

export default ReporteCuotasPDF
