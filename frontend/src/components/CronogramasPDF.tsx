// CronogramasPDF.ts
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface DatosCliente {
  dni: string
  nombres: string
  apellidos: string
  estado: string
  ingreso: string
  telefono: string
  ocupacion: string
  correo: string
  cargaFamiliar: string
  direccion: string
}

interface DatosVivienda {
  proyecto: string
  manzana: string
  codigoUnidad: string
  etapa: string
  area: string
  areaConstruida: string
  tipo: string
  precio: string
  disponible: boolean
}

interface DatosFinanciamiento {
  financiamiento: string
  montoFinanciamiento: string
  interes: string
  cuotas: number
  montoCuota: string
  fechaPagoInicial: Date
  fechaPagoTermino: string
  montoInicial: string
  fechasPagos: string[]
}

interface Usuario {
  nombre: string
  area: string
}

export interface CronogramasPDFProps {
  cliente: DatosCliente
  vivienda: DatosVivienda
  financiamiento: DatosFinanciamiento
  usuario: Usuario
  fechaActual: string
  esCotizacion?: boolean
}

export function crearGeneradorCronogramaPDF(props: CronogramasPDFProps) {
  const obtenerDatosFormulario = () => {
    const rawPrecio = props.vivienda.precio || ""
    if (!rawPrecio || rawPrecio === "-") {
      throw new Error("Precio de vivienda inválido o faltante")
    }

    const precioVivienda = Number.parseFloat(rawPrecio.replace(/[^\d.]/g, ""))
    const montoBonoFinanciamiento = Number.parseFloat(props.financiamiento.montoFinanciamiento.replace(/[^\d.]/g, ""))
    const montoVentaTotal = precioVivienda + montoBonoFinanciamiento
    const montoInicial = Number.parseFloat(props.financiamiento.montoInicial.replace(/[^\d.]/g, ""))
    const montoAFinanciar = precioVivienda - montoInicial
    const fechasPagos = props.financiamiento.fechasPagos || [];
    const dt = props.financiamiento.fechaPagoInicial;
    const dia   = String(dt.getDate()).padStart(2, "0");
    const mes   = String(dt.getMonth() + 1).padStart(2, "0");
    const año   = dt.getFullYear();
    const fechaInicio = `${dia}/${mes}/${año}`;

    const generarFechaCompletaHoy = () => {
      const hoy = new Date()
      const dia = hoy.getDate().toString().padStart(2, "0")
      const mes = hoy.toLocaleDateString("es-ES", { month: "long" })
      const año = hoy.getFullYear()
      return `Chiclayo ${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} del ${año}`
    }

    return {
      fecha: props.fechaActual,
      fechaCompleta: generarFechaCompletaHoy(),
      asesor: props.usuario.nombre,
      dni: props.cliente.dni,
      nombres: props.cliente.nombres,
      apellidos: props.cliente.apellidos,
      estadoEvaluacion: props.cliente.estado,
      ingresoMensual: props.cliente.ingreso.replace(/[^\d.]/g, ""),
      telefono: props.cliente.telefono,
      ocupacion: props.cliente.ocupacion,
      cargaFamiliar: props.cliente.cargaFamiliar,
      direction: props.cliente.direccion,
      proyecto: props.vivienda.proyecto,
      manzana: props.vivienda.manzana,
      codigoUnidad: props.vivienda.codigoUnidad,
      etapa: props.vivienda.etapa,
      disponibilidad: props.vivienda.disponible,
      precio: precioVivienda.toFixed(2),
      tipoUbicacion: props.vivienda.tipo,
      area: props.vivienda.area,
      areaConstruida: props.vivienda.areaConstruida,
      financiamiento: props.financiamiento.financiamiento,
      montoSubsidio: montoBonoFinanciamiento.toFixed(2),
      tasaInteres: props.financiamiento.interes,
      numeroCuotas: props.financiamiento.cuotas.toString(),
      fechaPagos: props.financiamiento.fechaPagoTermino,
      pagoInicial: props.financiamiento.montoInicial.replace(/[^\d.]/g, ""),
      montoVentaTotal: montoVentaTotal.toFixed(2),
      montoAFinanciar: montoAFinanciar.toFixed(2),
      montoCuotaDinamico: props.financiamiento.montoCuota.replace(/[^\d.]/g, ""),
      fechaInicio,
      esCotizacion: props.esCotizacion ?? false,
      correo: props.cliente.correo,
      fechasPagos: fechasPagos || [],
    }
  }

  const generarHTMLConvenioVentaExacto = (datos: any) => {
    return `<div class="pdf-content" style="width: 210mm; min-height: 297mm; padding: 15mm 12mm; font-family: Arial, sans-serif; color: #000; background-color: white; margin: 0 auto; font-size: 10px; line-height: 1.2;">
      ${
        datos.esCotizacion
          ? `
        <div style="text-align:center; margin-bottom: 10px;">
          <h2 style="color: red; font-size: 20px; font-weight: bold; margin: 0;">COTIZACIÓN</h2>
        </div>
      `
          : `
        <div style="text-align:center; margin-bottom: 10px;">
          <h2 style="color: green; font-size: 20px; font-weight: bold; margin: 0;">VENTA</h2>
        </div>
      `
      }

      <!-- Header exacto con logo y título -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 3px;">
        <div style="width: 100px;">
          <!-- Logo Valle Reque-->
          <!-- Logo Valle Reque -->
        <div style="position: relative; width: 120px; height: 120px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; overflow: hidden; position: relative; background: white; display: flex; align-items: center; justify-content: center;">
            <img src="public/logo.png" alt="Logo Valle Reque" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
        </div>
        <div style="text-align: center; flex: 1; margin-top: 5px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0; color: #333; letter-spacing: 1px;">CONVENIO DE VENTA</h1>
          <p style="margin: 5px 0 0 0; font-size: 12px; color: #666; font-weight: normal;">Fecha de Venta : ${datos.fecha}</p>
        </div>
        <div style="width: 100px;"></div>
      </div>

      <!-- Forma de Pago -->
      <div style="border: 2px solid #000; margin-bottom: 2px;">
        <div style="background-color: #f5f5f5; padding: 4px 8px; border-bottom: 1px solid #000; font-size: 9px;">
          Forma de Pago: Voucher depósito en cta
        </div>
      </div>

      <!-- Tabla de información del cliente EXACTA -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px; font-size: 9px; border: 2px solid #000;">
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; width: 12%; font-weight: bold; background-color: #f9f9f9;">Cliente</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; width: 48%;">${datos.nombres}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; width: 12%; font-weight: bold; background-color: #f9f9f9;">DNI</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px; width: 28%;">${datos.dni}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Dirección</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px;">${datos.direction}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Fec. Nac.</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px;">1998-06-09</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Email</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px;">${datos.correo}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Celular</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px;">${datos.telefono}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Ocupación</td>
          <td style="border-right: 1px solid #000; padding: 4px 6px;">${datos.ocupacion}</td>
          <td style="border-right: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Ingreso Neto</td>
          <td style="padding: 4px 6px;">S/ ${datos.ingresoMensual}</td>
        </tr>
      </table>

      <!-- Por concepto de venta -->
      <div style="border: 2px solid #000; margin-bottom: 2px;">
        <div style="background-color: #f5f5f5; padding: 4px 8px; border-bottom: 1px solid #000; font-size: 9px;">
          Por concepto de venta de la siguiente unidad de vivienda:
        </div>
      </div>

      <!-- Tabla del proyecto EXACTA -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px; border: 2px solid #000;">
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9; width: 15%;">Proyecto</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; width: 35%;">${datos.proyecto}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9; width: 15%;">N° Cuotas</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px; width: 35%;">${datos.numeroCuotas}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Manzana</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px;">${datos.manzana}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Cuotas</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px;">S/ ${datos.montoCuotaDinamico}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Unidad</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px;">${datos.codigoUnidad}</td>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Inicial</td>
          <td style="border-bottom: 1px solid #000; padding: 4px 6px;">S/ ${datos.pagoInicial}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Área Lote m2</td>
          <td style="border-right: 1px solid #000; padding: 4px 6px;">${datos.area}</td>
          <td style="border-right: 1px solid #000; padding: 4px 6px; font-weight: bold; background-color: #f9f9f9;">Área Construida m2</td>
          <td style="padding: 4px 6px;">${datos.areaConstruida}</td>
        </tr>
      </table>

      <!-- Condiciones EXACTAS -->
      <div style="display: flex; gap: 12px; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h3 style="text-align: center; font-size: 9px; font-weight: bold; margin: 0 0 3px 0; text-transform: uppercase;">CONDICIONES GENERALES DE CUMPLIMIENTO</h3>
          <h4 style="text-align: center; font-size: 8px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">OBLIGATORIO</h4>
          <div style="font-size: 6px; line-height: 1.3; text-align: justify;">
            <p style="margin: 0 0 4px 0;"><strong>1.</strong> Este documento debe ser presentado junto al certificado de Bono Familiar Habitacional, al momento de hacerse la firma del contrato compra-venta, el cliente indica que tiene conocimiento del cumplimiento de los requisitos del FMV.</p>
            <p style="margin: 0 0 4px 0;"><strong>2.</strong> Si el cliente incumpliera las fechas pactadas en el cronograma o desista automáticamente de la compra, Constructora Valle Reque que corresponde a la empresa, se reserva el derecho de contratar con la adjudicación del inmueble objeto del presente documento, refaccionando el mismo sin acuerdo adicional alguna.</p>
            <p style="margin: 0 0 4px 0;"><strong>3.</strong> Este documento es válido únicamente para la adquisición de una única unidad de vivienda, identificada plenamente, como consta en la parte superior del presente documento.</p>
            <p style="margin: 0 0 4px 0;"><strong>4.</strong> Todos los trámites relacionados a este documento y al contrato que se derive de él, serán de responsabilidad y costo del cliente.</p>
            <p style="margin: 0 0 4px 0;"><strong>5.</strong> Para la validez de este documento, el mismo se debe encontrar debidamente firmado por el cliente y asesor inmobiliario.</p>
            <p style="margin: 0 0 4px 0;"><strong>6.</strong> El cliente deberá haber cumplido con aportar el riesgo del modelo afectado y el aporte del cliente, conforme al cronograma pactado por el FMV.</p>
          </div>
        </div>
        <div style="flex: 1;">
          <h3 style="text-align: center; font-size: 9px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase;">CONDICIONES DE CONTRATACIÓN</h3>
          <div style="font-size: 6px; line-height: 1.3; text-align: justify;">
            <p style="margin: 0 0 4px 0;"><strong>I.</strong> El cliente manifiesta su intención de suscribir con la empresa un Compromiso-Contrato de Compraventa, respecto de la unidad de vivienda individualizada en el primer documento.</p>
            <p style="margin: 0 0 4px 0;"><strong>II.</strong> Con la finalidad de asegurar la suscripción del Compromiso-Contrato de Compraventa, el cliente ha entregado a la empresa la suma acordada en este documento.</p>
            <p style="margin: 0 0 4px 0;"><strong>III.</strong> Si el cliente manifiesta su intención de suscribir el Compromiso-Contrato de Compraventa dentro del plazo establecido, previamente en el cronograma.</p>
            <p style="margin: 0 0 4px 0;"><strong>IV.</strong> Si el cliente resuelve el Compromiso-Contrato de Compraventa dentro del plazo establecido previamente, se descontará el 100% del monto.</p>
            <p style="margin: 0 0 4px 0;"><strong>V.</strong> Vivienda deberá devolver al cliente las arras que le fueron entregadas. El cliente autoriza al vendedor el llenado de la letra de cambio firmada.</p>
            <p style="margin: 0 0 4px 0;"><strong>VI.</strong> La empresa puede cancelar las condiciones del vigente convenio de separación de acuerdo con las condiciones del mercado.</p>
            <p style="margin: 0 0 4px 0;"><strong>VII.</strong> La empresa puede cancelar las condiciones del vigente Contrato de Compraventa, considerando un plazo de 24 meses contados a partir del desembolso del cliente por parte del FMV.</p>
            <p style="margin: 0 0 4px 0;"><strong>VIII.</strong> En caso de resolver el Compromiso-Contrato de Compraventa dentro del plazo establecido previamente la devolución tendrá como plazo de 6 meses.</p>
          </div>
        </div>
      </div>

      <!-- ESTRUCTURA DE PAGOS -->
      <div style="text-align: center; margin: 15px 0 10px 0;">
        <h2 style="font-size: 11px; font-weight: bold; margin: 0; text-transform: uppercase; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 5px 0;">ESTRUCTURA DE PAGOS</h2>
      </div>

      <!-- Tabla estructura de pagos EXACTA -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px; border: 2px solid #000;">
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f9f9f9; width: 50%;">Precio de la vivienda</td>
          <td style="border-bottom: 1px solid #000; padding: 6px 8px; width: 50%;">S/ ${datos.precio}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f9f9f9;">Descuento</td>
          <td style="border-bottom: 1px solid #000; padding: 6px 8px;">S/ 0.00</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f9f9f9;">Pago Inicial</td>
          <td style="border-bottom: 1px solid #000; padding: 6px 8px;">S/ ${datos.pagoInicial}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; border-bottom: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f9f9f9;">BFH-2025</td>
          <td style="border-bottom: 1px solid #000; padding: 6px 8px;">S/ ${datos.montoSubsidio}</td>
        </tr>
        <tr>
          <td style="border-right: 1px solid #000; padding: 6px 8px; font-weight: bold; background-color: #f9f9f9;">Saldo Final</td>
          <td style="padding: 6px 8px;">S/ ${datos.montoAFinanciar}</td>
        </tr>
      </table>

      <!-- Fecha EXACTA -->
      <div style="margin-bottom: 25px;">
        <p style="font-size: 9px; margin: 0; font-weight: normal;">Fecha: ${datos.fechaCompleta}</p>
      </div>

      <!-- Sección de firmas EXACTA -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; align-items: flex-end;">
        <!-- Asesor -->
        <div style="text-align: center; width: 30%; position: relative;">
          <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 5px; position: relative; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 3px;">
            <span style="font-style: italic; font-size: 12px; font-weight: bold; color: #000;"></span>
          </div>
          <p style="font-size: 8px; margin: 0; font-weight: normal;">Asesor</p>
        </div>
        <!-- Cliente con huella -->
        <div style="text-align: center; width: 30%; position: relative;">
          <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 5px; position: relative; display: flex; align-items: center; justify-content: space-between; padding: 0 8px;">
            <!-- Firma  -->
            <!-- Huella dactilar -->
          </div>
          <p style="font-size: 8px; margin: 0; font-weight: normal;">Cliente</p>
        </div>
        <!-- V°B° D. Lazo con sello -->
        <div style="text-align: center; width: 30%; position: relative;">
          <div style="border-bottom: 2px solid #000; height: 40px; margin-bottom: 5px; position: relative; display: flex; align-items: flex-start; justify-content: flex-end; padding: 3px;">
          </div>
          <p style="font-size: 8px; margin: 0; font-weight: normal;">V°B° D. Lazo</p>
        </div>
      </div>

      <!-- Número de cuenta EXACTO -->
      <div style="margin-top: 20px;">
        <p style="font-size: 8px; font-weight: bold; margin: 0 0 5px 0;">Número de cuenta</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 7px; border: 2px solid #000;">
          <tr>
            <td style="border-bottom: 1px solid #000; padding: 5px; text-align: center; font-weight: normal;">BCP Soles N° 305-25604566-0-98 CCI: 002-305-002560456098-14</td>
          </tr>
          <tr>
            <td style="padding: 5px; text-align: center; font-weight: normal;">BBVA Soles N° 0011-0348-0100017264 CCI: 011-348-000100017264-01</td>
          </tr>
        </table>
      </div>
    </div>`
  }

  // ✅ MODIFICADO: Cronograma con paginación automática (SOLO para vista previa)
  const generarHTMLCronogramaPagosExacto = (datos: any) => {
    const precioVivienda = Number.parseFloat(datos.precio)
    const pagoInicial = Number.parseFloat(datos.pagoInicial)
    const numeroCuotas = Number.parseInt(datos.numeroCuotas)
    const interesMensual = Number.parseFloat(datos.tasaInteres)

    const montoAFinanciar = precioVivienda - pagoInicial
    const saldoFinal0 = montoAFinanciar
    const r = interesMensual / 100
    const n = numeroCuotas
    const montoPorCuota = r === 0
      ? montoAFinanciar / n
      : montoAFinanciar * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))

    let filasCronograma = ""
    let saldo = montoAFinanciar
    const filasPorPagina = 20 // Máximo de filas por página
    let contadorFilas = 0

    // Fila inicial (pago inicial)
    filasCronograma += `
      <tr>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">0</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${(montoAFinanciar + pagoInicial).toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${pagoInicial.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">0.00</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">0.00</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: right;">${saldoFinal0.toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 6px; text-align: center;">${datos.fechaInicio || "2025-05-26"}</td>
      </tr>
    `
    contadorFilas++

    for (let i = 1; i <= numeroCuotas; i++) {
      console.log('=== fechasPagos ===', datos.fechasPagos);
      const saldoInicial = saldo
      const interes = r === 0 ? 0 : saldoInicial * r
      const amortizacion = r === 0 ? montoPorCuota : montoPorCuota - interes
      const saldoFinal = saldoInicial - amortizacion
      saldo = saldoFinal

      const fechaFormateada = datos.fechasPagos?.[i - 1] || datos.fechaInicio || "2025-05-26";

      // ✅ AGREGADO: Salto de página si se excede el límite
      if (contadorFilas >= filasPorPagina) {
        filasCronograma += `
          </tbody>
        </table>
        <div style="page-break-before: always;"></div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 15px; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 7%;">N°</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 17%;">SALDO INICIAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">CUOTA</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 12%;">INTERÉS</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">AMORTIZACION</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">SALDO FINAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 22%;">FECHA VEN.</th>
            </tr>
          </thead>
          <tbody>
        `
        contadorFilas = 0
      }

      filasCronograma += `
        <tr>
          <td style="border: 1px solid #000; padding: 6px; text-align: center;">${i}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">${saldoInicial.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">${montoPorCuota.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">${interesMensual.toFixed(2)} %</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">${amortizacion.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: right;">${saldoFinal.toFixed(2)}</td>
          <td style="border: 1px solid #000; padding: 6px; text-align: center; width: 22%;">${fechaFormateada}</td>
        </tr>
      `
      contadorFilas++
    }

    return `
    <div class="pdf-content" style="width: 210mm; min-height: 297mm; padding: 20mm 15mm; font-family: Arial, sans-serif; color: #000; background-color: white; margin: 0 auto; font-size: 11px; line-height: 1.3;">
      ${
        datos.esCotizacion
          ? `
        <div style="text-align:center; margin-bottom: 10px;">
          <h2 style="color: red; font-size: 20px; font-weight: bold; margin: 0;">COTIZACIÓN</h2>
        </div>
      `
          : `
        <div style="text-align:center; margin-bottom: 10px;">
          <h2 style="color: green; font-size: 20px; font-weight: bold; margin: 0;">VENTA</h2>
        </div>
      `
      }

      <!-- Header exacto con logo y título -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
        <div style="width: 140px;">
          <!-- Logo Valle Reque exacto -->
          <div style="position: relative; width: 120px; height: 120px;">
          <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; position: relative; background: white; display: flex; align-items: center; justify-content: center;">
            <img src="public/logo.png" alt="Logo Valle Reque" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        </div>
        </div>
        <div style="text-align: right; margin-top: 10px;">
          <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #333; letter-spacing: 1px;">CRONOGRAMA DE PAGOS</h1>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">N° de cronogramas: </p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">${datos.fechaCompleta}</p>
        </div>
      </div>

      <!-- DATOS DEL CLIENTE EXACTO -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DEL CLIENTE</h2>
        <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
        <div style="display: flex; gap: 30px;">
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">NOMBRE:</span>
              <span style="margin-left: 40px;">${datos.nombres}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">DIRECCIÓN:</span>
              <span style="margin-left: 20px;">${datos.direction}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">EMAIL:</span>
              <span style="margin-left: 50px;">${datos.correo}</span>
            </div>
          </div>
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">DNI:</span>
              <span style="margin-left: 80px;">${datos.dni}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">TELÉFONO:</span>
              <span style="margin-left: 40px;">${datos.telefono}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DATOS DE LA VIVIENDA EXACTO -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DE LA VIVIENDA</h2>
        <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
        <div style="display: flex; gap: 30px;">
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">PROYECTO:</span>
              <span style="margin-left: 30px;">${datos.proyecto}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">NÚMERO:</span>
              <span style="margin-left: 40px;">${datos.codigoUnidad}</span>
            </div>
          </div>
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">ETAPA:</span>
              <span style="margin-left: 60px;">${datos.etapa}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">MANZANA:</span>
              <span style="margin-left: 30px;">${datos.manzana}</span>
            </div>
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">PRECIO:</span>
              <span style="margin-left: 50px;">S/ ${datos.precio}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DATOS DEL ASESOR EXACTO -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DEL ASESOR</h2>
        <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
        <div style="display: flex; gap: 30px;">
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">NOMBRE:</span>
              <span style="margin-left: 40px;">${datos.asesor}</span>
            </div>
          </div>
          <div style="flex: 1;">
            <div style="margin-bottom: 6px; font-size: 10px;">
              <span style="font-weight: bold;">TELÉFONO:</span>
              <span style="margin-left: 40px;">978888222</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CRONOGRAMA DE PAGOS DE CUOTAS EXACTO -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">CRONOGRAMA DE PAGOS DE CUOTAS</h2>
        <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
        <div style="margin-bottom: 10px; font-size: 10px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
          <span style="font-weight: bold;">MONTO BONO: S/ ${datos.montoSubsidio}</span>
          <span style="font-weight: bold;">PRECIO TERRENO: S/ ${datos.precio}</span>
          <span style="font-weight: bold;">PAGO INICIAL: S/ ${pagoInicial.toFixed(2)}</span>
          <span style="font-weight: bold;">NÚMERO DE CUOTAS: ${datos.numeroCuotas}</span>
        </div>

        <!-- Tabla cronograma EXACTA con datos DINÁMICOS y paginación -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 15px; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 7%;">N°</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 17%;">SALDO INICIAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">CUOTA</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 12%;">INTERÉS</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">AMORTIZACION</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">SALDO FINAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 22%;">FECHA VEN.</th>
            </tr>
          </thead>
          <tbody>
            ${filasCronograma}
            <tr style="background-color: #f0f0f0; font-weight: bold;">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">TOTAL</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">${(montoPorCuota * numeroCuotas + pagoInicial).toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">0.00</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">${montoAFinanciar.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;"></td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- NÚMERO DE CUENTA EXACTO -->
      <div style="margin-bottom: 25px;">
        <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">NÚMERO DE CUENTA</h2>
        <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; border: 2px solid #000;">
          <tr>
            <td style="border-bottom: 1px solid #000; padding: 8px; text-align: center;">BCP Soles N° 305-25604566-0-98 CCI: 002-305-002560456098-14</td>
          </tr>
          <tr>
            <td style="padding: 8px; text-align: center;">BBVA Soles N° 0011-0348-0100017264 CCI: 011-348-000100017264-01</td>
          </tr>
        </table>
      </div>

      <!-- Pie de página EXACTO -->
      <div style="margin-top: 40px; font-size: 8px; color: #666;">
        <p style="margin: 0;">Detalles del Financiamiento: * Tasa Efectiva Anual (TEA) 0.00% - * Total Costo Efectivo Anual 0.00%</p>
      </div>
    </div>
  `
  }

  // ✅ NUEVA FUNCIÓN: Generar páginas separadas del cronograma para PDF
  const generarPaginasCronogramaPDF = (datos: any) => {
    console.log('=== fechasPagos ===', datos.fechasPagos);
    const precioVivienda = Number.parseFloat(datos.precio)
    const pagoInicial = Number.parseFloat(datos.pagoInicial)
    const numeroCuotas = Number.parseInt(datos.numeroCuotas)
    const interesMensual = Number.parseFloat(datos.tasaInteres)
    const montoAFinanciar = precioVivienda - pagoInicial
    const saldoFinal0 = montoAFinanciar
    const r = interesMensual / 100
    const n = numeroCuotas
    const montoPorCuota = r === 0
    ? montoAFinanciar / n
    : montoAFinanciar * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))

    // Generar todas las filas
    const todasLasFilas = []
    let saldo = montoAFinanciar

    // Fila inicial (pago inicial)
    todasLasFilas.push({
      numero: 0,
      saldoInicial: (montoAFinanciar + pagoInicial).toFixed(2),
      cuota: pagoInicial.toFixed(2),
      interes: "0.00",
      amortizacion: "0.00",
      saldoFinal: saldoFinal0.toFixed(2),
      fecha: datos.fechaInicio || "2025-05-26",
    })

    // Generar todas las cuotas
    for (let i = 1; i <= numeroCuotas; i++) {
      const saldoInicial = saldo
      const interes = r === 0
        ? 0
        : saldoInicial * r
      const amortizacion = r === 0
        ? montoPorCuota
        : montoPorCuota - interes
      const saldoFinal = saldoInicial - amortizacion
      saldo = saldoFinal
      const fechaFormateada = datos.fechasPagos?.[i - 1] || datos.fechaInicio || "2025-05-26";

      todasLasFilas.push({
        numero: i,
        saldoInicial: saldoInicial.toFixed(2),
        cuota: montoPorCuota.toFixed(2),
        interes: `${interesMensual.toFixed(2)} %`,
        amortizacion: amortizacion.toFixed(2),
        saldoFinal: saldoFinal.toFixed(2),
        fecha: fechaFormateada,
      })
    }

    // Dividir en páginas (12 filas por página)
    const filasPorPagina = 12
    const paginas = []

    for (let i = 0; i < todasLasFilas.length; i += filasPorPagina) {
      paginas.push(todasLasFilas.slice(i, i + filasPorPagina))
    }
    
    return paginas.map((filasPagina, indicePagina) => {
      const esPrimeraPagina = indicePagina === 0
      const esUltimaPagina = indicePagina === paginas.length - 1

      const generarFilasTabla = (filas:any[]) => {
        return filas
          .map(
            (fila) => `
          <tr>
            <td style="border: 1px solid #000; padding: 6px; text-align: center;">${fila.numero}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${fila.saldoInicial}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${fila.cuota}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${fila.interes}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${fila.amortizacion}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: right;">${fila.saldoFinal}</td>
            <td style="border: 1px solid #000; padding: 6px; text-align: center;">${fila.fecha}</td>
          </tr>
        `,
          )
          .join("")
      }

      return `
      <div class="pdf-content" style="width: 210mm; min-height: 297mm; padding: 20mm 15mm; font-family: Arial, sans-serif; color: #000; background-color: white; margin: 0 auto; font-size: 11px; line-height: 1.3;">
        ${
          datos.esCotizacion
            ? `
          <div style="text-align:center; margin-bottom: 10px;">
            <h2 style="color: red; font-size: 20px; font-weight: bold; margin: 0;">COTIZACIÓN</h2>
          </div>
        `
            : `
          <div style="text-align:center; margin-bottom: 10px;">
            <h2 style="color: green; font-size: 20px; font-weight: bold; margin: 0;">VENTA</h2>
          </div>
        `
        }

        <!-- Header exacto con logo y título -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${esPrimeraPagina ? "40px" : "20px"};">
          <div style="width: 140px;">
            <div style="position: relative; width: 120px; height: 120px;">
              <div style="width: 120px; height: 120px; border-radius: 50%; overflow: hidden; position: relative; background: white; display: flex; align-items: center; justify-content: center;">
                <img src="public/logo.png" alt="Logo Valle Reque" style="width: 100%; height: 100%; object-fit: cover;">
              </div>
            </div>
          </div>
          <div style="text-align: right; margin-top: 10px;">
            <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #333; letter-spacing: 1px;">CRONOGRAMA DE PAGOS</h1>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">N° de cronogramas: </p>
            <p style="margin: 2px 0 0 0; font-size: 12px; color: #666;">${datos.fechaCompleta}</p>
          </div>
        </div>

        ${
          esPrimeraPagina
            ? `
        <!-- DATOS DEL CLIENTE EXACTO -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DEL CLIENTE</h2>
          <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
          <div style="display: flex; gap: 30px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">NOMBRE:</span>
                <span style="margin-left: 40px;">${datos.nombres}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">DIRECCIÓN:</span>
                <span style="margin-left: 20px;">${datos.direction}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">EMAIL:</span>
                <span style="margin-left: 50px;">${datos.correo}</span>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">DNI:</span>
                <span style="margin-left: 80px;">${datos.dni}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">TELÉFONO:</span>
                <span style="margin-left: 40px;">${datos.telefono}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DATOS DE LA VIVIENDA EXACTO -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DE LA VIVIENDA</h2>
          <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
          <div style="display: flex; gap: 30px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">PROYECTO:</span>
                <span style="margin-left: 30px;">${datos.proyecto}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">NÚMERO:</span>
                <span style="margin-left: 40px;">${datos.codigoUnidad}</span>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">ETAPA:</span>
                <span style="margin-left: 60px;">${datos.etapa}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">MANZANA:</span>
                <span style="margin-left: 30px;">${datos.manzana}</span>
              </div>
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">PRECIO:</span>
                <span style="margin-left: 50px;">S/ ${datos.precio}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- DATOS DEL ASESOR EXACTO -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">DATOS DEL ASESOR</h2>
          <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
          <div style="display: flex; gap: 30px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">NOMBRE:</span>
                <span style="margin-left: 40px;">${datos.asesor}</span>
              </div>
            </div>
            <div style="flex: 1;">
              <div style="margin-bottom: 6px; font-size: 10px;">
                <span style="font-weight: bold;">TELÉFONO:</span>
                <span style="margin-left: 40px;">978888222</span>
              </div>
            </div>
          </div>
        </div>

        <!-- CRONOGRAMA DE PAGOS DE CUOTAS EXACTO -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">CRONOGRAMA DE PAGOS DE CUOTAS</h2>
          <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
          <div style="margin-bottom: 10px; font-size: 10px; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <span style="font-weight: bold;">MONTO BONO: S/ ${datos.montoSubsidio}</span>
            <span style="font-weight: bold;">PRECIO TERRENO: S/ ${datos.precio}</span>
            <span style="font-weight: bold;">PAGO INICIAL: S/ ${pagoInicial.toFixed(2)}</span>
            <span style="font-weight: bold;">NÚMERO DE CUOTAS: ${datos.numeroCuotas}</span>
          </div>
        </div>
        `
            : ""
        }

        <!-- Tabla cronograma -->
        <table style="width: 100%; border-collapse: collapse; font-size: 9px; margin-bottom: 15px; border: 2px solid #000;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 7%;">N°</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 17%;">SALDO INICIAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">CUOTA</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 12%;">INTERÉS</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">AMORTIZACION</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 14%;">SALDO FINAL</th>
              <th style="border: 1px solid #000; padding: 6px; text-align: center; font-weight: bold; width: 22%;">FECHA VEN.</th>
            </tr>
          </thead>
          <tbody>
            ${generarFilasTabla(filasPagina)}
            ${
              esUltimaPagina
                ? `
            <tr style="background-color: #f0f0f0; font-weight: bold;">
              <td style="border: 1px solid #000; padding: 6px; text-align: center;">TOTAL</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">${(montoPorCuota * numeroCuotas + pagoInicial).toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">0.00</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: right;">${montoAFinanciar.toFixed(2)}</td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;"></td>
              <td style="border: 1px solid #000; padding: 6px; text-align: center;"></td>
            </tr>
            `
                : ""
            }
          </tbody>
        </table>

        ${
          esUltimaPagina
            ? `
        <!-- NÚMERO DE CUENTA EXACTO -->
        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 12px; color: #2196F3; margin: 0 0 8px 0; font-weight: bold; text-transform: uppercase;">NÚMERO DE CUENTA</h2>
          <div style="border-bottom: 2px dotted #2196F3; margin-bottom: 12px;"></div>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px; border: 2px solid #000;">
            <tr>
              <td style="border-bottom: 1px solid #000; padding: 8px; text-align: center;">BCP Soles N° 305-25604566-0-98 CCI: 002-305-002560456098-14</td>
            </tr>
            <tr>
              <td style="padding: 8px; text-align: center;">BBVA Soles N° 0011-0348-0100017264 CCI: 011-348-000100017264-01</td>
            </tr>
          </table>
        </div>

        <!-- Pie de página EXACTO -->
        <div style="margin-top: 40px; font-size: 8px; color: #666;">
          <p style="margin: 0;">Detalles del Financiamiento: * Tasa Efectiva Anual (TEA) 0.00% - * Total Costo Efectivo Anual 0.00%</p>
        </div>
        `
            : ""
        }
      </div>
      `
    })
  }

  // ✅ MODIFICADO: Función generarBlobPDF mejorada para manejar múltiples páginas
  const generarBlobPDF = async (esCotizacion = false): Promise<Blob> => {
    const datos = obtenerDatosFormulario()
    datos.esCotizacion = esCotizacion

    const pdf = new jsPDF("p", "mm", "a4")
    const tempContainer = document.createElement("div")
    tempContainer.style.position = "absolute"
    tempContainer.style.left = "-9999px"
    tempContainer.style.top = "-9999px"
    document.body.appendChild(tempContainer)

    // Primera página - Convenio de Venta
    tempContainer.innerHTML = generarHTMLConvenioVentaExacto(datos)
    const canvas1 = await html2canvas(tempContainer.querySelector(".pdf-content") as HTMLElement, { scale: 2 })
    pdf.addImage(canvas1.toDataURL("image/png"), "PNG", 0, 0, 210, (canvas1.height * 210) / canvas1.width)

    // ✅ MEJORADO: Generar páginas del cronograma con paginación automática
    const paginasCronograma = generarPaginasCronogramaPDF(datos)

    for (let i = 0; i < paginasCronograma.length; i++) {
      pdf.addPage()
      tempContainer.innerHTML = paginasCronograma[i]
      const canvas = await html2canvas(tempContainer.querySelector(".pdf-content") as HTMLElement, { scale: 2 })
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width)
    }

    document.body.removeChild(tempContainer)
    return pdf.output("blob")
  }

  const generarYDescargarPDFCotizacion = async () => {
    const blob = await generarBlobPDF(true)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Cotizacion_Valle_Reque.pdf"
    a.click()
    URL.revokeObjectURL(url)
  }

  // ✅ NUEVO: Modal con tabs mejorado
  const mostrarVistaPreviaPDFConTabs = () => {
    const datos = obtenerDatosFormulario()

    const modal = document.createElement("div")
    modal.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000000b0; display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div style="background:white; padding:0; max-height:90%; overflow:hidden; border-radius:8px; width:90%; max-width:1200px; display:flex; flex-direction:column;">
          
          <!-- Header del modal -->
          <div style="background: linear-gradient(135deg, #4CAF50, #2196F3); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-radius: 8px 8px 0 0;">
            <h3 style="margin: 0; font-size: 18px; font-weight: bold;">Vista Previa - Documentos Valle Reque</h3>
            <button id="cerrar-modal-pdf" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 12px; font-size: 16px; cursor: pointer; border-radius: 4px; font-weight: bold;">✕</button>
          </div>

          <!-- Tabs -->
          <div style="background: #f5f5f5; padding: 0; border-bottom: 1px solid #ddd;">
            <div style="display: flex;">
              <button id="tab-convenio" class="tab-button" style="background: #2196F3; color: white; border: none; padding: 12px 24px; cursor: pointer; font-weight: bold; border-radius: 0;">Convenio de Venta</button>
              <button id="tab-cronograma" class="tab-button" style="background: #e0e0e0; color: #666; border: none; padding: 12px 24px; cursor: pointer; font-weight: bold; border-radius: 0;">Cronograma de Pagos</button>
            </div>
          </div>

          <!-- Contenido -->
          <div style="flex: 1; overflow: auto; padding: 20px; max-height: 70vh;">
            <div id="contenido-convenio" class="tab-content" style="display: block;">
              ${generarHTMLConvenioVentaExacto(datos)}
            </div>
            <div id="contenido-cronograma" class="tab-content" style="display: none;">
              ${generarHTMLCronogramaPagosExacto(datos)}
            </div>
          </div>

          <!-- Footer con botón de descarga -->
          <div style="background: #f9f9f9; padding: 15px 20px; border-top: 1px solid #ddd; text-align: center; border-radius: 0 0 8px 8px;">
            <button id="descargar-pdf-completo" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; font-size: 14px; cursor: pointer; border-radius: 4px; font-weight: bold;">📄 Descargar PDF Completo</button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // Event listeners para tabs
    const tabConvenio = document.getElementById("tab-convenio")
    const tabCronograma = document.getElementById("tab-cronograma")
    const contenidoConvenio = document.getElementById("contenido-convenio")
    const contenidoCronograma = document.getElementById("contenido-cronograma")

    tabConvenio?.addEventListener("click", () => {
      tabConvenio.style.background = "#2196F3"
      tabConvenio.style.color = "white"
      tabCronograma!.style.background = "#e0e0e0"
      tabCronograma!.style.color = "#666"
      contenidoConvenio!.style.display = "block"
      contenidoCronograma!.style.display = "none"
    })

    tabCronograma?.addEventListener("click", () => {
      tabCronograma.style.background = "#2196F3"
      tabCronograma.style.color = "white"
      tabConvenio!.style.background = "#e0e0e0"
      tabConvenio!.style.color = "#666"
      contenidoCronograma!.style.display = "block"
      contenidoConvenio!.style.display = "none"
    })

    // Cerrar modal
    document.getElementById("cerrar-modal-pdf")?.addEventListener("click", () => {
      document.body.removeChild(modal)
    })

    // Descargar PDF completo
    document.getElementById("descargar-pdf-completo")?.addEventListener("click", async () => {
      try {
        const blob = await generarBlobPDF(false) // false = no es cotización, es venta
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `venta-${datos.dni || "cliente"}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Error al generar PDF:", error)
        alert("Error al generar el PDF")
      }
    })
  }

  const mostrarVistaPreviaPDF = () => {
    const datos = obtenerDatosFormulario()
    const modal = document.createElement("div")
    modal.innerHTML = `
      <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:#000000b0; display:flex; align-items:center; justify-content:center; z-index:9999;">
        <div style="background:white; padding:20px; max-height:90%; overflow:auto; border-radius:8px; width:90%; max-width:1000px;">
          <button id="cerrar-modal-pdf" style="float:right; background:#f44336; color:white; border:none; padding:5px 10px; font-size:14px; cursor:pointer;">Cerrar</button>
          ${generarHTMLConvenioVentaExacto(datos)}
        </div>
      </div>
    `
    document.body.appendChild(modal)
    document.getElementById("cerrar-modal-pdf")?.addEventListener("click", () => {
      document.body.removeChild(modal)
    })
  }

  return {
    obtenerDatosFormulario,
    generarHTMLConvenioVentaExacto,
    generarHTMLCronogramaPagosExacto,
    generarBlobPDF,
    generarYDescargarPDFCotizacion,
    mostrarVistaPreviaPDF,
    mostrarVistaPreviaPDFConTabs, // ✅ NUEVO método
  }
}
