"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFilePdf, faUpload, faTimes, faEye } from "@fortawesome/free-solid-svg-icons"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { getClientePorDni } from "../api/clientes"
import type { ClienteVistaVentas } from "../types/Clientes"
import Swal from "sweetalert2"
import { getProyectosventas, buscarTerrenoPorProyecto } from "../api/proyecto"
import type { VentasProyectos } from "../types/Proyectos"
import { getFinanciamientos } from "../api/financiamiento"
import type { FinanciamientoActivoTip } from "../types/Financiamiento"
import { crearGeneradorCronogramaPDF } from "../components/CronogramasPDF"
import "../styles/ventas.css"
import { useLocation } from "react-router-dom"
import { generarFechasPagos } from "../utils/fechas"

// Constantes para valores por defecto
const DEFAULT_CLIENTE: ClienteVistaVentas = {
  id: 0,
  dni: "",
  nombres: "",
  apellidos: "",
  estado: "",
  ingreso: "",
  telefono: "",
  ocupacion: "",
  correo: "",
  cargaFamiliar: "",
  direccion: "",
}

const DEFAULT_VIVIENDA = {
  disponible: false,
  precio: 0,
  tipo: "",
  area: "",
  id_terreno: 0,
}

export default function Ventas() {
  const location = useLocation()
  const { id_terreno, id_proyecto, etapa, codigo_unidad } = location.state || {}

  if (!id_terreno) {
    console.warn("No se recibieron datos para el terreno.")
  }

  // Refs
  const logoFileRef = useRef<HTMLInputElement>(null)
  const [constanciaSubida, setConstanciaSubida] = useState(false) // Controla si la constancia ha sido subida
  const [modalPdfPreview, setModalPdfPreview] = useState(false)
  const [imagenConstancia, setImagenConstancia] = useState<string | null>(null)
  const [fechaAprobacion, setFechaAprobacion] = useState("")
  const [montoPreaprobado, setMontoPreaprobado] = useState("")

  // ✅ AGREGADO: Estado para el componente PDF
  const [cronogramasPDF, setCronogramasPDF] = useState<any>(null)

  // Estado del usuario
  const [usuario, setUsuario] = useState({
    id: 0,
    nombre: "",
    area: "",
  })

  // Estados principales
  const [cliente, setCliente] = useState<ClienteVistaVentas>(DEFAULT_CLIENTE)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  // Estados de proyectos y terrenos
  const [proyectos, setProyectos] = useState<VentasProyectos[]>([])
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(id_proyecto || "")
  const [maxEtapas, setMaxEtapas] = useState(0)
  const [codigoUnidad, setCodigoUnidad] = useState(codigo_unidad || "")
  const [etapaSeleccionada, setEtapaSeleccionada] = useState(etapa || "")
  const [datosVivienda, setDatosVivienda] = useState(DEFAULT_VIVIENDA)

  // Estados de financiamiento
  const [financiamientos, setFinanciamientos] = useState<FinanciamientoActivoTip[]>([])
  const [financiamientoSeleccionado, setFinanciamientoSeleccionado] = useState("")
  const [montoFinanciamiento, setMontoFinanciamiento] = useState("")
  const [interesFinanciamiento, setInteresFinanciamiento] = useState("")

  // Estados de fechas y pagos
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date())
  const [fechasPagos, setFechasPagos] = useState<string[]>([])
  const [cuotas, setCuotas] = useState(12)
  const [fechaPagoTermino, setFechaPagoTermino] = useState("")

  //Monto cuota
  const [montoCuota, setMontoCuota] = useState("0.00")
  const [montoInicial, setMontoInicial] = useState<string>("0.00")

  useEffect(() => {
    if (id_proyecto) {
      setProyectoSeleccionado(id_proyecto) // Establecer el id del proyecto recibido
    }
    if (codigo_unidad) {
      setCodigoUnidad(codigo_unidad) // Establecer el código de unidad recibido
    }
    if (etapa) {
      setEtapaSeleccionada(etapa) // Establecer la etapa recibida
    }
  }, [id_proyecto, codigo_unidad, etapa])

  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })

  const calcularMontoPorCuota = (precio: number, cuotas: number, interes: string, inicial: string): string => {
    const precioVivienda = precio
    const montoInicial = Number.parseFloat(inicial.replace(/[^\d.]/g, ""))
    const tasaInteresMensual = Number.parseFloat(interes) / 100

    if (isNaN(precioVivienda) || isNaN(montoInicial) || isNaN(tasaInteresMensual) || cuotas <= 0) {
      return "0.00"
    }
    const montoFinanciar = precioVivienda - montoInicial
    if (tasaInteresMensual === 0) {
      return (montoFinanciar / cuotas).toFixed(2)
    }
    const montoPorCuota =
      montoFinanciar *
      ((tasaInteresMensual * Math.pow(1 + tasaInteresMensual, cuotas)) / (Math.pow(1 + tasaInteresMensual, cuotas) - 1))

    return montoPorCuota.toFixed(2)
  }

  useEffect(() => {
    if (datosVivienda.precio && interesFinanciamiento && montoInicial) {
      const montoPorCuota = calcularMontoPorCuota(datosVivienda.precio, cuotas, interesFinanciamiento, montoInicial)
      setMontoCuota(montoPorCuota) // Guardar el resultado en el estado
    }
  }, [datosVivienda.precio, cuotas, interesFinanciamiento, montoInicial])

// Ventas.tsx (resumido)
  useEffect(() => {
    setFechasPagos(generarFechasPagos(fechaSeleccionada, cuotas))
  }, [fechaSeleccionada, cuotas])


  // ✅ AGREGADO: Efecto para inicializar el componente PDF cuando tengas todos los datos
  useEffect(() => {
    if (cliente.dni && datosVivienda.precio && financiamientoSeleccionado && mostrarDetalles) {
      console.log("✅ Código Unidad:", codigoUnidad)
      console.log("✅ Manzana detectada:", obtenerManzanaDesdeCodigo(codigoUnidad))
      console.log("✅ Direccion:", cliente.direccion)
      console.log(fechasPagos)
      const cronogramaPDFInstance = crearGeneradorCronogramaPDF({
        cliente,
        vivienda: {
          proyecto:
            proyectos.find((p) => p.id_proyecto === Number.parseInt(proyectoSeleccionado))?.nombre_proyecto || "",
          manzana: obtenerManzanaDesdeCodigo(codigoUnidad),
          codigoUnidad,
          etapa: etapaSeleccionada,
          area: datosVivienda.area,
          areaConstruida: "60.00",
          tipo: datosVivienda.tipo,
          precio: (() => {
            const precio = datosVivienda.precio
            return `S/ ${precio.toFixed(2)}`
          })(),
          disponible: datosVivienda.disponible,
        },
        financiamiento: {
          financiamiento:
            financiamientos.find((f) => f.id === Number.parseInt(financiamientoSeleccionado))?.nombre || "",
          montoFinanciamiento,
          interes: interesFinanciamiento,
          cuotas,
          montoCuota: `S/ ${montoCuota}`,
          fechaPagoInicial: fechaSeleccionada,
          fechaPagoTermino,
          fechasPagos,
          montoInicial,
        },
        usuario,
        fechaActual,
        esCotizacion: true,
      })

      setCronogramasPDF(cronogramaPDFInstance)
    }
  }, [
    cliente,
    datosVivienda,
    financiamientoSeleccionado,
    fechasPagos,
    cuotas,
    montoCuota,
    fechaSeleccionada,
    mostrarDetalles,
    proyectos,
    financiamientos,
    usuario,
    fechaActual,
  ])

  // Formateadores
  const formatearMoneda = (valor: string): string => {
    const numero = Number.parseFloat(valor.replace(/[^\d.]/g, ""))
    return isNaN(numero) ? "" : `S/ ${numero.toFixed(2)}`
  }

  const obtenerManzanaDesdeCodigo = (codigo: string): string => {
    const match = codigo.match(/^([A-Z])\s*-\s*\d+$/)
    return match ? match[1] : "-"
  }

  // Efectos
  const cargarUsuario = () => {
    const storedUser = localStorage.getItem("usuario")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setUsuario({
          id: user.id_usuario || 0,
          nombre: user.nombre_usuario || "Usuario",
          area: user.area || "Área Desconocida",
        })
      } catch (e) {
        console.error("Error al parsear datos de usuario:", e)
        localStorage.removeItem("usuario")
      }
    }
  }

  // Cargar proyectos
  const cargarProyectos = async () => {
    try {
      const data = await getProyectosventas()
      setProyectos(data)
    } catch (error) {
      console.error("Error al cargar proyectos:", error)
    }
  }

  // Cargar financiamientos
  const cargarFinanciamientos = async () => {
    try {
      const data = await getFinanciamientos()
      setFinanciamientos(data)
    } catch (err) {
      console.error("Error al cargar financiamientos:", err)
    }
  }

  useEffect(() => {
    cargarUsuario()
    cargarProyectos()
    cargarFinanciamientos()
  }, [])

  // Funciones de utilidad

  // Función para formatear fechas
  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Función para calcular fecha término
  const calcularFechaPagoTermino = useCallback((fechaInicial: Date, numCuotas: number): string => {
    const fechaTermino = new Date(fechaInicial)
    fechaTermino.setMonth(fechaTermino.getMonth() + numCuotas)
    return formatDate(fechaTermino)
  }, [])

  // Manejadores de eventos
  const handleDateChange = (date: Date) => {
    if (!isNaN(date.getTime())) {
      setFechaSeleccionada(date)
      setFechasPagos(generarFechasPagos(date, cuotas))
      setFechaPagoTermino(calcularFechaPagoTermino(date, cuotas))
    }
  }

  const handleCuotasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeroCuotas = Number.parseInt(e.target.value)
    if (!isNaN(numeroCuotas) && numeroCuotas > 0) {
      setCuotas(numeroCuotas)
      setFechaPagoTermino(calcularFechaPagoTermino(fechaSeleccionada, numeroCuotas))
      setFechasPagos(generarFechasPagos(fechaSeleccionada, numeroCuotas))
    }
  }

  const handleDniChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value
    if (/^\d{0,8}$/.test(valor)) {
      setCliente(valor.length < 8 ? DEFAULT_CLIENTE : { ...cliente, dni: valor })
    }
  }

  const handleDniKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && cliente.dni.length === 8) {
      e.preventDefault()
      buscarClientePorDni()
    }
  }

  const buscarClientePorDni = async () => {
    if (cliente.dni.trim().length !== 8) {
      toast.error("❌ El DNI debe tener 8 dígitos")
      return
    }

    try {
      const data = await getClientePorDni(cliente.dni)
      if (data) {
        setCliente({
          id: data.id,
          dni: data.dni,
          nombres: data.nombre,
          apellidos: data.apellidos,
          estado: data.estado_cliente,
          ingreso: `S/ ${data.ingreso_neto.toFixed(2)}`,
          telefono: data.telefono,
          ocupacion: data.ocupacion,
          correo: data.correo,
          cargaFamiliar: data.carga_familiar ? "Sí" : "No",
          direccion: data.direccion || "",
        })
        toast.success("Cliente encontrado")
      } else {
        toast.error("Cliente no encontrado")
      }
    } catch {
      toast.error("Error al buscar cliente")
    }
  }

  const handleProyectoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idProyecto = e.target.value // Aquí debes guardar el id_proyecto, no el nombre
    setProyectoSeleccionado(idProyecto) // Asigna el id_proyecto al estado

    // Si el proyecto está vacío, reseteamos las etapas y otros campos relacionados
    if (idProyecto === "") {
      setMaxEtapas(0)
      setCodigoUnidad("")
      setEtapaSeleccionada("")
      setDatosVivienda(DEFAULT_VIVIENDA)
      return
    }

    // Busca el proyecto y ajusta la cantidad de etapas
    const proyecto = proyectos.find((p) => p.id_proyecto === Number(idProyecto))
    if (proyecto) setMaxEtapas(proyecto.cantidad_etapas) // Asegúrate de usar el id_proyecto para la búsqueda
  }

  useEffect(() => {
    const buscarTerreno = async () => {
      if (!proyectoSeleccionado || !codigoUnidad.trim() || !etapaSeleccionada.trim()) {
        setDatosVivienda(DEFAULT_VIVIENDA)
        return
      }

      try {
        const data = await buscarTerrenoPorProyecto(proyectoSeleccionado, codigoUnidad, etapaSeleccionada)

        if (!data) {
          toast.error("Terreno no encontrado")
          setDatosVivienda({
            ...DEFAULT_VIVIENDA,
            disponible: false ,
          })
          return
        }

        setDatosVivienda({
          disponible: data.disponible ? true : false,  // Aquí asignamos un booleano
          precio: data.precio ? data.precio : 0,
          tipo: data.tipo || "-",
          area: data.area || "-",
          id_terreno: data.id_terreno,
        })

        toast.success("Terreno encontrado correctamente")
      } catch (error) {
        console.error("Error al buscar terreno:", error)
        toast.error("Error al buscar terreno")
        setDatosVivienda(DEFAULT_VIVIENDA)
      }
    }

    const timer = setTimeout(buscarTerreno, 500) // Debounce para evitar múltiples llamadas
    return () => clearTimeout(timer)
  }, [proyectoSeleccionado, codigoUnidad, etapaSeleccionada])

  const handleFinanciamientoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (!cliente.dni || cliente.cargaFamiliar === "") {
      toast.error("❌ Primero debe buscar un cliente antes de seleccionar un financiamiento")
      setFinanciamientoSeleccionado("")
      return
    }

    setFinanciamientoSeleccionado(id)

    const financiamiento = financiamientos.find((f) => f.id === Number.parseInt(id))
    if (financiamiento) {
      setMontoFinanciamiento(`S/ ${financiamiento.monto.toFixed(2)}`)
      setInteresFinanciamiento(financiamiento.interes.toFixed(2))
    }
  }

  const financiamientosFiltrados = financiamientos.filter((f) => {
    if (cliente.cargaFamiliar === "Sí") return f.estado === "Activo"
    if (cliente.cargaFamiliar === "No") return f.estado === "Activo" && f.tipo === 2
    return false
  })

  const confirmarVenta = async () => {
    if (!cronogramasPDF || !logoFileRef.current?.files?.[0]) {
      toast.error("❌ Faltan archivos por subir o datos incompletos.")
      return
    }

    // 🚨 Validar que la fecha de aprobación no sea futura
    const hoy = new Date();
    const fechaAprob = new Date(fechaAprobacion);
    if (fechaAprob > hoy) {
      toast.error("❌ La fecha de aprobación no puede ser futura");
      return;
    }

    if (datosVivienda.disponible !== true) {
      toast.error("❌ No se puede registrar la venta: el terreno no está disponible.")
      return
    }

    const result = await Swal.fire({
      title: "¿Desea registrar la venta?",
      text: "Esta acción guardará la venta con todos sus documentos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    })

    if (!result.isConfirmed) return

    try {
      Swal.fire({
        title: "Registrando venta...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      })

      if (!datosVivienda.precio || !cronogramasPDF?.obtenerDatosFormulario) {
        toast.error("❌ Datos incompletos para generar el PDF.")
        Swal.close()
        return
      }

      const blobPDF = await cronogramasPDF.generarBlobPDF(false) // false = no es cotización
      const contratoFile = new File([blobPDF], "contrato.pdf", { type: "application/pdf" })
      const cronogramaFile = new File([blobPDF], "cronograma.pdf", { type: "application/pdf" })

      const precioTerreno = datosVivienda.precio.toFixed(2)
      const valorFinanciamiento = Number.parseFloat(montoFinanciamiento.replace(/[^\d.]/g, "") || "0")
      const precioVentaTotal = (precioTerreno + valorFinanciamiento)

      const formData = new FormData()
      formData.append("id_cliente", cliente.id.toString())
      formData.append("id_terreno", datosVivienda.id_terreno.toString())
      formData.append("id_usuario", usuario.id.toString())
      formData.append("codigo_venta", `V-${Date.now()}`)
      formData.append("fecha_venta", new Date().toISOString().split("T")[0])
      formData.append("precio_venta", precioVentaTotal)
      formData.append("pago_inicial", montoInicial)
      formData.append("monto_financiar", (precioTerreno - Number.parseFloat(montoInicial)).toFixed(2))
      formData.append("tipo_venta", "Clasica")
      formData.append("id_venta_origen", "0")
      formData.append("contrato", contratoFile)
      formData.append("cronograma", cronogramaFile)
      formData.append("constancia", logoFileRef.current.files[0])
      formData.append("id_financiamiento", financiamientoSeleccionado)
      formData.append("fecha_aprobacion", fechaAprobacion)
      formData.append("interes_real", interesFinanciamiento)
      formData.append("monto_preaprobado", montoPreaprobado)
      formData.append("monto_total_aportado", "0.00")
      formData.append("fecha_inicio", fechaSeleccionada.toISOString().split("T")[0])
      formData.append("fecha_final", fechaPagoTermino.split("/").reverse().join("-"))
      formData.append("numero_cuotas", cuotas.toString())
      const cuotasParaEnviar = fechasPagos.map((fechaStr, i) => {
      const [day, month, year] = fechaStr.split("/");
      const fechaParaBD = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      return {
        numero: i + 1,
        fecha_pago: fechaParaBD, 
        monto: montoCuota,
        estado: "Pendiente",
      };
    });
    console.log(JSON.stringify(cuotasParaEnviar, null, 2));
    formData.append("cuotas", JSON.stringify(cuotasParaEnviar));

      const response = await fetch("http://localhost:5000/api/ventas/registrar", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      Swal.close()

      if (data.success) {
        Swal.fire("✅ Venta registrada", "Se ha registrado correctamente.", "success")

        const url = window.URL.createObjectURL(blobPDF)
        const a = document.createElement("a")
        a.href = url
        a.download = `cronograma-${cliente.dni || "venta"}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)

        resetearFormularioVenta()
      } else {
        Swal.fire("❌ Error", data.message || "Error al registrar venta", "error")
      }
    } catch (err) {
      Swal.close()
      console.error(err)
      Swal.fire("❌ Error", "Error inesperado al registrar venta", "error")
    }
  }

  // Lógica de la constancia
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        // Guardar la imagen en base64
        setImagenConstancia(reader.result as string)
      }
      reader.readAsDataURL(file)
      setConstanciaSubida(true)
      toast.success("Constancia subida correctamente")
    } else {
      setImagenConstancia(null) 
      setConstanciaSubida(false)
      setMostrarDetalles(false) 
      setModalPdfPreview(false)
    }
  }

  // Manejo del clic en el ícono del ojo
  const abrirModalPdf = () => {
    if (constanciaSubida) {
      setModalPdfPreview(true)
    }
  }

  // Cerrar modal PDF
  const cerrarModalPdf = () => {
    setModalPdfPreview(false)
  }

  // Manejo del clic en el botón "Continuar"
  const continuarVenta = () => {
    const errores: string[] = [];

    const precioTerreno = datosVivienda.precio
    const inicialFloat = parseFloat(montoInicial);
    const preaprobadoFloat = parseFloat(montoPreaprobado);
    const fechaAprob = new Date(fechaAprobacion);
    const hoy = new Date();

    // Validaciones
    if (cliente.id === 0) errores.push("Debe buscar y seleccionar un cliente válido.");
    if (!proyectoSeleccionado) errores.push("Seleccione un proyecto.");
    if (!codigoUnidad.trim()) errores.push("Ingrese el código de unidad.");
    if (!etapaSeleccionada.trim()) errores.push("Ingrese la etapa.");
    if (datosVivienda.disponible !== true) errores.push("El terreno no está disponible.");
    if (!financiamientoSeleccionado) errores.push("Seleccione un financiamiento.");

    if (!fechaAprobacion) {
      errores.push("Ingrese la fecha de aprobación.");
    } else if (fechaAprob > hoy) {
      errores.push("La fecha de aprobación no puede ser futura.");
    }

    if (montoPreaprobado === "") {
      errores.push("Ingrese el monto preaprobado.");
    } else if (isNaN(preaprobadoFloat) || preaprobadoFloat < 0 || preaprobadoFloat > 9999999999.99) {
      errores.push("⚠️ El monto preaprobado debe tener hasta 10 dígitos, 2 decimales y no ser negativo.");
    }

    if (montoInicial === "") {
      errores.push("Ingrese el pago inicial.");
    } else if (isNaN(inicialFloat) || inicialFloat < 0) {
      errores.push("El pago inicial debe ser un número positivo válido.");
    } else if (inicialFloat > precioTerreno) {
      errores.push("El pago inicial no puede ser mayor al precio del terreno.");
    }

    if (!constanciaSubida) errores.push("Debe subir la constancia financiera.");

    // Mostrar errores si existen
    if (errores.length > 0) {
      toast.warning(
        errores.map((e) => `• ${e}`).join("\n"),
        {
          autoClose: 5000,
          style: { whiteSpace: "pre-line" }, // Permite saltos de línea en el toast
        }
      );
      return;
    }

    // ✅ Todo correcto
    setMostrarDetalles(true);
    setTimeout(() => {
      const detallesSection = document.getElementById("venta-detalles-section");
      if (detallesSection) detallesSection.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };


  const handleInicialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    const regex = /^[0-9]{0,6}(\.[0-9]{0,2})?$/;
    if (!regex.test(valor)) return;

    const montoInicialFloat = parseFloat(valor);
    const precioTerrenoFloat = datosVivienda.precio

    if (!isNaN(montoInicialFloat) && montoInicialFloat > precioTerrenoFloat) {
      toast.warning("⚠️ El pago inicial no puede ser mayor al precio del terreno");
      return;
    }

    setCliente({ ...cliente, ingreso: valor });
    setMontoInicial(valor);
  };


  const resetearFormularioVenta = () => {
    setCliente(DEFAULT_CLIENTE)
    setProyectoSeleccionado("")
    setMaxEtapas(0)
    setCodigoUnidad("")
    setEtapaSeleccionada("")
    setDatosVivienda(DEFAULT_VIVIENDA)
    setFechaAprobacion("")
    setMontoPreaprobado("")
    setConstanciaSubida(false)
    setImagenConstancia(null)
    setModalPdfPreview(false)
    setFinanciamientoSeleccionado("")
    setMontoFinanciamiento("")
    setInteresFinanciamiento("")
    setFechaSeleccionada(new Date())
    setFechasPagos([])
    setFechaPagoTermino("")
    setMontoInicial("0.00")
    setMontoCuota("0.00")
    setCuotas(12)
    setMostrarDetalles(false)
    setCronogramasPDF(null)

    if (logoFileRef.current) {
      logoFileRef.current.value = ""
    }

    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  const handleGenerarPDF = () => {
    if (!cronogramasPDF) {
      toast.error("❌ Complete todos los datos antes de generar el cronograma")
      return
    }
    cronogramasPDF.mostrarVistaPreviaPDFConTabs()
  }

  const handleDescargarPDFCotizacion = async () => {
    if (!cronogramasPDF) {
      toast.error("❌ Complete todos los datos antes de descargar el cronograma")
      return
    }

    try {
      const blobPDF = await cronogramasPDF.generarBlobPDF(true) // true = es cotización

      const url = URL.createObjectURL(blobPDF)
      const a = document.createElement("a")
      a.href = url
      a.download = `cotizacion-${cliente.dni || "cliente"}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error("❌ Error al generar PDF de cotización")
      console.error("[Error PDF Cotización]:", error)
    }
  }
  

  return (
    <div className="contenedor-principal">
      <div className="venta-card">
        <div className="venta-card-header">
          <div className="venta-header-left">
            <div>
              <h2>Datos del Cliente</h2>
              <p className="venta-subtitle">Verifica que los datos del cliente estén correctos</p>
            </div>
          </div>
          <div className="venta-header-right">
            <p>
              <span>Fecha: {fechaActual}</span>
              <span className="venta-separator">|</span>
              <span>Asesor: {usuario.nombre}</span>
              <span className="venta-separator">|</span>
              <span>Area: {usuario.area}</span>
            </p>
          </div>
        </div>

        {/* Sección de datos del cliente */}
        <div className="venta-form-section">
          <div className="venta-form-grid">
            <div className="venta-form-group">
              <label htmlFor="venta-dni">DNI</label>
              <input
                id="venta-dni"
                className="venta-form-input"
                maxLength={8}
                inputMode="numeric"
                pattern="\d{8}"
                title="El DNI debe contener exactamente 8 dígitos"
                value={cliente.dni}
                required
                onChange={handleDniChange}
                onKeyDown={handleDniKeyDown}
                onBlur={() => {
                  if (cliente.dni.length === 8) {
                    buscarClientePorDni()
                  }
                }}
              />
              {cliente.dni.length > 0 && cliente.dni.length < 8 && (
                <small style={{ color: "red" }}>⚠️ El DNI debe tener 8 dígitos</small>
              )}
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-nombres">Nombres</label>
              <input
                id="venta-nombres"
                className="venta-form-input"
                value={cliente.nombres}
                onChange={(e) => setCliente({ ...cliente, nombres: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-apellidos">Apellidos</label>
              <input
                id="venta-apellidos"
                className="venta-form-input"
                value={cliente.apellidos}
                onChange={(e) => setCliente({ ...cliente, apellidos: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-estado">Estado del Cliente</label>
              <input
                id="venta-estado"
                className={`venta-form-input estado-color ${cliente.estado}`}
                value={cliente.estado.replace(/([a-z])([A-Z])/g, "$1 $2")}
                onChange={(e) => setCliente({ ...cliente, estado: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-ingreso">Ingreso Neto</label>
              <input
                id="venta-ingreso"
                className="venta-form-input"
                value={cliente.ingreso}
                onChange={(e) => setCliente({ ...cliente, ingreso: formatearMoneda(e.target.value) })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-telefono">Teléfono</label>
              <input
                id="venta-telefono"
                className="venta-form-input"
                value={cliente.telefono}
                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-ocupacion">Ocupación</label>
              <input
                id="venta-ocupacion"
                className="venta-form-input"
                value={cliente.ocupacion}
                onChange={(e) => setCliente({ ...cliente, ocupacion: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-carga">Correo Electronico</label>
              <input
                id="venta-carga"
                className="venta-form-input"
                value={cliente.correo}
                onChange={(e) => setCliente({ ...cliente, correo: e.target.value })}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-carga">Carga Familiar</label>
              <input
                id="venta-carga"
                className="venta-form-input"
                value={cliente.cargaFamiliar}
                onChange={(e) => setCliente({ ...cliente, cargaFamiliar: e.target.value })}
                readOnly
              />
            </div>
          </div>
        </div>

        {/* Sección de selección de vivienda */}
        <div className="venta-form-section">
          <h3 className="venta-section-title">Selección de Vivienda</h3>
          <p className="venta-subtitle">
            Solo podrás seleccionar aquellos terrenos que estén disponibles. Verifica en Logística &gt; Terrenos
          </p>
          <div className="venta-form-grid">
            <div className="venta-form-group">
              <label htmlFor="venta-proyecto">Seleccione el proyecto</label>
              <select
                id="venta-proyecto"
                className="venta-form-input"
                value={proyectoSeleccionado}
                onChange={handleProyectoChange}
              >
                <option value="">-- Seleccione un proyecto --</option>
                {proyectos.map((proy) => (
                  <option key={proy.id_proyecto} value={proy.id_proyecto}>
                    {proy.nombre_proyecto}
                  </option>
                ))}
              </select>
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-codigo">Código de Unidad</label>
              <input
                id="venta-codigo"
                className="venta-form-input"
                value={codigoUnidad}
                onChange={(e) => {
                  setCodigoUnidad(e.target.value.toUpperCase()) // Convierte el valor a mayúsculas
                  setDatosVivienda({ disponible: false, precio: 0, tipo: "", area: "", id_terreno: 0}); // Limpiar datos de vivienda
                }}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-etapa">Etapa</label>
              <input
                id="venta-etapa"
                className="venta-form-input"
                type="number"
                placeholder={`Ingrese etapa (Máx: ${maxEtapas})`}
                min="1"
                max={maxEtapas}
                value={etapaSeleccionada}
                onChange={(e) => {
                  const valor = Number.parseInt(e.target.value)
                  if (!isNaN(valor)) {
                    if (valor < 1) {
                      toast.error("La etapa no puede ser menor a 1")
                      setEtapaSeleccionada("1")
                    } else if (maxEtapas > 0 && valor > maxEtapas) {
                      toast.error(`La etapa máxima permitida es ${maxEtapas}`)
                      setEtapaSeleccionada(maxEtapas.toString())
                    } else {
                      setEtapaSeleccionada(valor.toString())
                    }
                    // Resetear datos de vivienda al cambiar etapa
                    setDatosVivienda(DEFAULT_VIVIENDA)
                  } else if (e.target.value === "") {
                    // Permitir campo vacío
                    setEtapaSeleccionada("")
                  }
                }}
                onBlur={() => {
                  if (etapaSeleccionada === "" || Number.parseInt(etapaSeleccionada) < 1) {
                    setEtapaSeleccionada("1")
                  }
                }}
              />
              {maxEtapas > 0 && <small className="venta-hint">Máximo de etapas: {maxEtapas}</small>}
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-disponible">¿Disponible?</label>
             <input
                id="venta-disponible"
                className={`venta-form-input ${datosVivienda.disponible ? "texto-verde" : "texto-rojo"}`}
                value={datosVivienda.disponible ? "Sí" : "No"}
                readOnly
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-precio">Precio</label>
              <input id="venta-precio" className="venta-form-input" value={datosVivienda.precio} readOnly />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-tipo">Tipo</label>
              <input id="venta-tipo" className="venta-form-input" value={datosVivienda.tipo} readOnly />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-area">Área</label>
              <input id="venta-area" className="venta-form-input" value={datosVivienda.area} readOnly />
            </div>
          </div>
        </div>

        {/* Sección de información financiera del cliente */}
        <div className="venta-form-section">
          <h3 className="venta-section-title">Información Financiera del Cliente</h3>
          <p className="venta-subtitle">Aquí se registra la preaprobación del financiamiento otorgado al cliente.</p>
          <div className="venta-form-grid">
            {/* Fecha de aprobación */}
            <div className="venta-form-group">
              <label htmlFor="venta-fecha-aprobacion">Fecha de Aprobación</label>
              <input
                type="date"
                id="venta-fecha-aprobacion"
                className="venta-form-input"
                value={fechaAprobacion}
                onChange={(e) => setFechaAprobacion(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            {/* Monto preaprobado */}
            <div className="venta-form-group">
              <label htmlFor="venta-monto-preaprobado">Monto Preaprobado</label>
              <input
                type="number"
                id="venta-monto-preaprobado"
                className="venta-form-input"
                value={montoPreaprobado}
                placeholder="Ingrese el monto"
                onChange={(e) => {
                  const valor = e.target.value;

                  // Solo permite hasta 8 enteros y 2 decimales, sin negativos
                  const regex = /^(?!-)\d{0,8}(\.\d{0,2})?$/;

                  if (valor === "" || regex.test(valor)) {
                    setMontoPreaprobado(valor);
                  } else {
                    toast.warning("⚠️ Solo se permiten hasta 10 dígitos y 2 decimales. Sin negativos.");
                  }
                }}
                
              />
            </div>
            {/* Subir constancia */}
            <div className="venta-form-group">
              <label htmlFor="file-constancia-financiamiento" className="venta-constancia-label">
                <FontAwesomeIcon icon={faUpload} /> Subir Constancia Financiera
              </label>
              <input
                type="file"
                id="file-constancia-financiamiento"
                name="file-constancia-financiamiento"
                accept="image/*,application/pdf"
                className="banco-file-input"
                ref={logoFileRef}
                onChange={handleLogoChange}
              />
            </div>
            {/* Ver constancia */}
            {constanciaSubida && (
              <div className="venta-eye-icon" onClick={abrirModalPdf}>
                <FontAwesomeIcon icon={faEye} />
                <span>Ver constancia</span>
              </div>
            )}
          </div>
        </div>

        {/* Sección de operaciones */}
        <div className="venta-form-section">
          <h3 className="venta-section-title">Operaciones</h3>
          <p className="venta-subtitle">
            Verifica si los financiamientos actuales están disponibles para realizar una venta
          </p>
          <div className="venta-form-grid">
            <div className="venta-form-group">
              <label htmlFor="venta-financiamiento">Seleccione el financiamiento</label>
              <div className="venta-select-container">
                <select
                  id="venta-financiamiento"
                  className="venta-form-select"
                  value={financiamientoSeleccionado}
                  onChange={handleFinanciamientoChange}
                >
                  <option value="">-- Seleccione un financiamiento --</option>
                  {financiamientosFiltrados.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-monto-bono">Monto del bono o financiamiento</label>
              <input id="venta-monto-bono" className="venta-form-input" value={montoFinanciamiento} readOnly />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-interes">Interés</label>
              <input
                id="venta-interes"
                className="venta-form-input"
                readOnly
                value={interesFinanciamiento}
                onChange={(e) => setInteresFinanciamiento(e.target.value)}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-cuotas">N de Cuotas</label>
              <input
                id="venta-cuotas"
                className="venta-form-input"
                type="number"
                min="1"
                value={cuotas}
                onChange={handleCuotasChange}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-monto-cuota">Monto x Cuota</label>
              <input id="venta-monto-cuota" className="venta-form-input" value={montoCuota} readOnly />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-fecha-pagos">Fecha de Pago Inicial</label>
              <input
                type="date"
                id="venta-fecha-pagos"
                className="venta-form-input"
                value={fechaSeleccionada.toISOString().split("T")[0]}
                min={new Date().toISOString().split("T")[0]} 
                onChange={e => {
                  const [yyyy, mm, dd] = e.target.value.split("-").map(Number);
                  handleDateChange(new Date(yyyy, mm - 1, dd));
                }}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-fecha-ultimo-pago">Fecha del Último Pago</label>
              <input id="venta-fecha-ultimo-pago" className="venta-form-input" value={fechaPagoTermino} readOnly />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-inicial">Pago Inicial</label>
              <input
                id="venta-inicial"
                className="venta-form-input"
                onChange={handleInicialChange}
                value={montoInicial}
                maxLength={9} // Límite de caracteres (6 dígitos + 1 punto + 2 decimales)
                placeholder="Ingrese monto"
              />
            </div>
          </div>
        </div>

        <div className="venta-button-container-center">
          <button
            id="venta-btn-continuar"
            className="venta-btn-continuar"
            onClick={continuarVenta}
          >
            Continuar
          </button>
        </div>

        {/* Modal PDF de la constancia */}
        {modalPdfPreview && (
          <div className="venta-modal venta-modal-pdf">
            <div className="venta-modal-pdf-content">
              <div className="venta-modal-pdf-header">
                <h3>Vista Previa de la Constancia</h3>
                <button className="venta-close-btn" onClick={cerrarModalPdf}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="venta-modal-pdf-body">
                {/* Aquí mostramos la imagen de la constancia */}
                <div className="venta-contenido-vista-previa">
                  {imagenConstancia ? (
                    <img src={imagenConstancia || "/placeholder.svg"} alt="Constancia" className="venta-imagen-pdf" />
                  ) : (
                    <p>No se ha subido ninguna constancia aún.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <br />
        <hr />

        {/* Sección de detalles de la venta */}
        <div id="venta-detalles-section" className={`venta-detalles-section ${mostrarDetalles ? "" : "venta-hidden"}`}>
          <div className="venta-section-header">
            <h3 className="venta-section-title">Resumen Final</h3>
            <p className="venta-subtitle">
              Es obligatorio brindar al cliente toda la información relacionada con la cotización del proceso. Verifica
              que los datos sean correctos y confirma que el cliente comprenda cada punto antes de proceder.
            </p>
          </div>
          <div className="venta-table-container">
            <table className="venta-detalles-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto a Financiar</th>
                  <th>Monto de venta</th>
                  <th>Pago Inicial</th>
                  <th>Interés</th>
                  <th>Cuotas</th>
                  <th>Fechas de pago</th>
                  <th>Cronogramas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* ✅ MODIFICADO: Datos dinámicos en lugar de valores hardcodeados */}
                  <td>
                    Proyecto:{" "}
                    {proyectos.find((p) => p.id_proyecto === Number.parseInt(proyectoSeleccionado))?.nombre_proyecto ||
                      "-"}
                    <br />
                    Código: {codigoUnidad || "-"}
                  </td>
                  <td>
                    S/{" "}
                    {datosVivienda.precio && montoInicial
                      ? (
                          datosVivienda.precio -
                          Number.parseFloat(montoInicial.replace(/[^\d.]/g, "") || "0")
                        ).toFixed(2)
                      : "0.00"}
                  </td>
                  <td>
                    {(() => {
                      const precio = datosVivienda.precio
                      const bono = Number.parseFloat(montoFinanciamiento.replace(/[^\d.]/g, "") || "0")
                      return `S/ ${(precio + bono).toFixed(2)}`
                    })()}
                  </td>
                  <td>S/ {Number.parseFloat(montoInicial.replace(/[^\d.]/g, "") || "0").toFixed(2)}</td>
                  <td>{interesFinanciamiento}%</td>
                  <td>{cuotas}</td>
                  <td>
                    {formatDate(fechaSeleccionada)} - {fechaPagoTermino}
                  </td>
                  <td className="venta-constancia-cell">
                    {/* ✅ MODIFICADO: Botón PDF con funcionalidad */}
                    <button
                      className="venta-pdf-button"
                      onClick={handleGenerarPDF}
                      disabled={!cronogramasPDF}
                      title={cronogramasPDF ? "Generar cronograma de pagos" : "Complete todos los datos primero"}
                    >
                      <FontAwesomeIcon icon={faFilePdf} className="icono-pdf" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="venta-button-container">
            <div className="venta-button-group">
              {/* Botón Cotización: siempre visible */}
              <button className="venta-btn-cotizacion" onClick={handleDescargarPDFCotizacion}>
                Cotización
              </button>
              {/* Botón Confirmar: solo si cliente está Evaluado o Activo */}
              {["Evaluado", "Activo"].includes(cliente.estado) && (
                <button className="venta-btn-confirmar" onClick={confirmarVenta}>
                  Confirmar
                </button>
              )}
              <button className="venta-btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}
