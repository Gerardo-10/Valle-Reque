"use client"
import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Swal from "sweetalert2"
import {
  faUserFriends,
  faSearch,
  faTrash,
  faEye,
  faTimes,
  faCheck,
  faUserPlus,
  faChevronLeft,
  faChevronRight,
  faAnglesLeft,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons"
import { eliminarClientes, actualizarEstadoClientes, insertarCliente, getClientesActivos } from "../api/clientes"
import type { ListarCliente } from "../types/Clientes"
import type { UserData } from "../types/UserData"
import VerificarEmail from "../components/VerificarEmail"
import "../styles/listar-clientes.css"
import "../styles/email.css"
import { useNavigate } from "react-router-dom"

const ListarClientes: React.FC = () => {
  // --- Estados de la Aplicación ---
  const [clientes, setClientes] = useState<ListarCliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("")
  const [filtro, setFiltro] = useState("")
  const [clientesSeleccionados, setClientesSeleccionados] = useState<number[]>([])
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string | null>(null)
  const [cargaFamiliar, setCargaFamiliar] = useState<"1" | "0" | "">("")
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const navigate = useNavigate()

  // --- Estados de los Modales ---
  const [modalCambiarEstadoAbierto, setModalCambiarEstadoAbierto] = useState(false)
  const [modalAgregarClienteAbierto, setModalAgregarClienteAbierto] = useState(false)

  // --- Estados de Paginación ---
  const [paginaActual, setPaginaActual] = useState(1)
  const [clientesPorPagina, setClientesPorPagina] = useState(5)

  // --- Estados para el formulario de cliente con verificación de email ---
  const [formDataCliente, setFormDataCliente] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    direccion: "",
    correo: "",
    telefono: "",
    ocupacion: "",
    ingreso_neto: "",
    estado_cliente: "",
    nombre_familiar: "",
    apellido_familiar: "",
    dni_familiar: "",
  })
  const [emailVerificado, setEmailVerificado] = useState(false)

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      const storedUser = localStorage.getItem("usuario")
      if (storedUser) {
        try {
          const user: UserData = JSON.parse(storedUser)
          if (user.rol) {
            setCurrentUserRole(user.rol)
          } else {
            console.warn("El rol del usuario no se encontró en los datos almacenados.")
            setCurrentUserRole(null)
          }
        } catch (error) {
          console.error("Error al parsear el usuario de localStorage:", error)
          localStorage.removeItem("usuario")
          setCurrentUserRole(null)
        }
      } else {
        setCurrentUserRole(null)
      }
    }
    cargarDatosIniciales()
  }, [])

  
  useEffect(() => {
  const cargar = async () => {
    setCargando(true);
    try {
      const raw = await getClientesActivos(); // → Promise<ListarCliente[]>
      setClientes(raw);
    } catch {
      Swal.fire("Error", "No se pudieron cargar los clientes.", "error");
    } finally {
      setCargando(false);
    }
  };
  cargar();
}, []);

  const hasPermission = useCallback(
    (rolesPermitidos: string[]): boolean => {
      if (!currentUserRole) {
        return false
      }
      return rolesPermitidos.includes(currentUserRole)
    },
    [currentUserRole],
  )

  // --- Efecto: Carga inicial de clientes ---

  // --- Efecto: Cerrar modales con la tecla ESC ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalCambiarEstadoAbierto(false)
        setModalAgregarClienteAbierto(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // --- Resetear formulario cuando se abre el modal ---
  const abrirModalAgregarCliente = () => {
    setFormDataCliente({
      nombre: "",
      apellido: "",
      dni: "",
      direccion: "",
      correo: "",
      telefono: "",
      ocupacion: "",
      ingreso_neto: "",
      estado_cliente: currentUserRole === "Usuario" ? "SinEvaluar" : "",
      nombre_familiar: "",
      apellido_familiar: "",
      dni_familiar: "",
    })
    setEmailVerificado(false)
    setCargaFamiliar("")
    setModalAgregarClienteAbierto(true)
  }

  // --- Manejadores de Eventos y Lógica de Negocio ---

  const handleSeleccionCliente = useCallback((id: number, checked: boolean) => {
    setClientesSeleccionados((prev) => (checked ? [...prev, id] : prev.filter((clienteId) => clienteId !== id)))
  }, [])

  const handleSeleccionEstado = useCallback((estado: string) => {
    setEstadoSeleccionado(estado)
  }, [])

  const handleSubmitAgregarCliente = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar que el email esté verificado
    if (!emailVerificado) {
      Swal.fire({
        icon: "warning",
        title: "Email no verificado",
        text: "Debe verificar el correo electrónico antes de continuar.",
        confirmButtonText: "Aceptar",
      })
      return
    }

    // Validar campos requeridos
    if (
      !formDataCliente.nombre.trim() ||
      !formDataCliente.apellido.trim() ||
      !formDataCliente.dni.trim() ||
      !formDataCliente.direccion.trim() ||
      !formDataCliente.correo.trim() ||
      !formDataCliente.telefono.trim() ||
      !formDataCliente.ocupacion.trim() ||
      !formDataCliente.ingreso_neto.trim() ||
      !formDataCliente.estado_cliente
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Todos los campos son obligatorios.",
        confirmButtonText: "Aceptar",
      })
      return
    }

    // Validar campos de carga familiar si está seleccionada
    if (cargaFamiliar === "1") {
      if (
        !formDataCliente.nombre_familiar.trim() ||
        !formDataCliente.apellido_familiar.trim() ||
        !formDataCliente.dni_familiar.trim()
      ) {
        Swal.fire({
          icon: "warning",
          title: "Información de familiar incompleta",
          text: "Debe completar todos los campos del familiar.",
          confirmButtonText: "Aceptar",
        })
        return
      }
    }

    const clienteNuevo = {
      nombre: formDataCliente.nombre.trim().toUpperCase(),
      apellido: formDataCliente.apellido.trim().toUpperCase(),
      dni: formDataCliente.dni.trim(),
      direccion: formDataCliente.direccion.trim(),
      correo: formDataCliente.correo.trim(),
      telefono: formDataCliente.telefono.trim(),
      ocupacion: formDataCliente.ocupacion.trim(),
      ingreso_neto: Number.parseFloat(formDataCliente.ingreso_neto),
      estado_cliente: formDataCliente.estado_cliente,
      carga_familiar: cargaFamiliar === "1",
      nombre_familiar: (cargaFamiliar === "1" ? formDataCliente.nombre_familiar.trim().toUpperCase() : "") || "",
      apellido_familiar: (cargaFamiliar === "1" ? formDataCliente.apellido_familiar.trim().toUpperCase() : "") || "",
      dni_familiar: (cargaFamiliar === "1" ? formDataCliente.dni_familiar.trim() : "") || "",
    }

    try {
      const res = await insertarCliente(clienteNuevo)
      setModalAgregarClienteAbierto(false)
      setCargaFamiliar("")

      // Recargar la lista de clientes
      const nuevosClientes = await getClientesActivos()
      setClientes(nuevosClientes)
      setPaginaActual(1)

      Swal.fire({
        icon: "success",
        title: "Cliente Registrado",
        text: res.message,
        confirmButtonText: "Aceptar",
      })
    } catch (error: unknown) {
      console.error("Error al registrar cliente:", error)
      Swal.fire({
        icon: "error",
        title: "Error al Registrar",
        text:
          error && typeof error === "object" && "message" in error
            ? (error as { message?: string }).message
            : "Hubo un error al registrar el cliente. Inténtalo de nuevo.",
        confirmButtonText: "Aceptar",
      })
    }
  }

  const handleConfirmarCambioEstado = async () => {
    if (!estadoSeleccionado) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Por favor, seleccione un estado para aplicar.",
        confirmButtonText: "Entendido",
      })
      return
    }

    try {
      const res = await actualizarEstadoClientes(clientesSeleccionados, estadoSeleccionado)
      setModalCambiarEstadoAbierto(false)
      setClientesSeleccionados([])
      setEstadoSeleccionado(null)

      const nuevosClientes = await getClientesActivos()
      setClientes(nuevosClientes)
      setPaginaActual(1)

      Swal.fire({
        icon: "success",
        title: "Estado Actualizado",
        text:
          res.message || `Se cambió el estado de ${clientesSeleccionados.length} cliente(s) a "${estadoSeleccionado}".`,
        confirmButtonText: "Aceptar",
      })
    } catch (error: unknown) {
      console.error("Error al actualizar estado:", error)
      Swal.fire({
        icon: "error",
        title: "Error al Actualizar",
        text:
          error && typeof error === "object" && "message" in error
            ? (error as { message?: string }).message
            : "Hubo un error al actualizar el estado de los clientes. Inténtalo de nuevo.",
        confirmButtonText: "Aceptar",
      })
    }
  }

  const handleEliminarClientes = async () => {
    if (clientesSeleccionados.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin Selección",
        text: "Por favor, seleccione al menos un cliente para eliminar.",
        confirmButtonText: "Entendido",
      })
      return
    }

    const result = await Swal.fire({
      title: "¿Deseas eliminar los clientes seleccionados?",
      text: "Esta acción marcará los clientes como eliminados y no serán visibles. ¡Esta acción es irreversible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })

    if (result.isConfirmed) {
      try {
        const response = await eliminarClientes(clientesSeleccionados)
        Swal.fire("Eliminados", response.message, "success")
        setClientesSeleccionados([])

        const nuevosClientes = await getClientesActivos()
        setClientes(nuevosClientes)
        setPaginaActual(1)
      } catch (error: unknown) {
        console.error("Error al eliminar clientes:", error)
        Swal.fire({
          icon: "error",
          title: "Error al Eliminar",
          text:
            error && typeof error === "object" && "message" in error
              ? (error as { message?: string }).message
              : "Hubo un error al eliminar los clientes. Inténtalo de nuevo.",
          confirmButtonText: "Aceptar",
        })
      }
    }
  }
  // --- De boton ir a ventas (DE BILLY ROSQUETE) ---
  const handleIrAVentas = async () => {
  if (clientesSeleccionados.length === 0) {
    Swal.fire({
      icon: "info",
      title: "Sin Selección",
      text: "Por favor, selecciona al menos un cliente para ir a ventas.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  // Nueva validación: Si se seleccionan más de un cliente
  if (clientesSeleccionados.length > 1) {
    Swal.fire({
      icon: "warning",
      title: "Selección Múltiple",
      text: "Solo puedes realizar una venta a un cliente a la vez. Por favor, selecciona solo un cliente.",
      confirmButtonText: "Entendido",
    });
    return;
  }

  // Si solo hay un cliente seleccionado, continuamos con el flujo normal
  const result = await Swal.fire({
    title: "¿Deseas ir a ventas con el cliente seleccionado?",
    text: "Esta acción te dirigirá al formulario de ventas con el cliente seleccionado.",
    icon: "question", // Cambiado a 'question' para un tono más neutral
    showCancelButton: true,
    confirmButtonColor: "#3085d6", // Colores de botones intercambiados para un flujo más intuitivo (confirmar en azul, cancelar en rojo)
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, ir a ventas",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    const clienteSeleccionado = clientes.find((cliente) => cliente.id === clientesSeleccionados[0]);
    if (clienteSeleccionado) {
      localStorage.setItem("clienteSeleccionado", JSON.stringify(clienteSeleccionado));
      window.location.href = "/ventas";
    } else {
      Swal.fire({
        icon: "error",
        title: "Error Inesperado",
        text: "No se pudo encontrar el cliente seleccionado. Por favor, inténtalo de nuevo.",
        confirmButtonText: "Aceptar",
      });
    }
  }
};

  // --- Lógica de Filtrado y Paginación ---
  const clientesFiltrados = useMemo(() => {
    const terminoBusqueda = busqueda.toLowerCase()
    const filtered = clientes.filter((cliente) => {
      if (!busqueda) return true

      switch (filtro) {
        case "estado":
          return cliente.estado_cliente.toLowerCase().includes(terminoBusqueda)
        case "ingreso":
          return cliente.ingreso_neto.toString().includes(terminoBusqueda)
        case "dni":
          return cliente.dni.includes(terminoBusqueda)
        default:
          return (
            `${cliente.nombre} ${cliente.apellidos}`.toLowerCase().includes(terminoBusqueda) ||
            cliente.dni.includes(terminoBusqueda) ||
            cliente.direccion.toLowerCase().includes(terminoBusqueda) ||
            cliente.correo.toLowerCase().includes(terminoBusqueda) ||
            cliente.telefono.includes(terminoBusqueda) ||
            cliente.ocupacion.toLowerCase().includes(terminoBusqueda) ||
            cliente.ingreso_neto.toString().includes(terminoBusqueda) ||
            cliente.estado_cliente.toLowerCase().includes(terminoBusqueda)
          )
      }
    })
    setPaginaActual(1)
    return filtered
  }, [clientes, busqueda, filtro])

  // Calcular clientes para la página actual
  const indiceUltimoCliente = paginaActual * clientesPorPagina
  const indicePrimerCliente = indiceUltimoCliente - clientesPorPagina
  const clientesPaginaActual = clientesFiltrados.slice(indicePrimerCliente, indiceUltimoCliente)

  // Calcular número total de páginas
  const numeroTotalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina)

  // Cambiar de página
  const cambiarPagina = (numeroPagina: number) => {
    setPaginaActual(numeroPagina)
  }

  // --- Lógica para generar los números de página a mostrar ---
  const getPaginasVisibles = () => {
    const paginas = []
    const maxPaginasVisibles = 5
    let startPage: number, endPage: number

    if (numeroTotalPaginas <= maxPaginasVisibles) {
      startPage = 1
      endPage = numeroTotalPaginas
    } else {
      const half = Math.floor(maxPaginasVisibles / 2)
      if (paginaActual <= half) {
        startPage = 1
        endPage = maxPaginasVisibles
      } else if (paginaActual + half >= numeroTotalPaginas) {
        startPage = numeroTotalPaginas - maxPaginasVisibles + 1
        endPage = numeroTotalPaginas
      } else {
        startPage = paginaActual - half
        endPage = paginaActual + half
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      paginas.push(i)
    }
    return paginas
  }

  const paginasVisibles = getPaginasVisibles()

  return (
    <div className="contenedor-terrenos">
      {/* Contenedor superior: Header, búsqueda, filtros y acciones */}
      <div className="contenedor-principal-arriba">
        <header className="header">
          <div className="header-content">
            <div className="header-icon">
              <FontAwesomeIcon icon={faUserFriends} />
            </div>
            <h1>Gestión de Clientes</h1>
          </div>
        </header>

        <div className="busqueda-filtros-acciones-container">
          <div className="barra-herramientas">
            <div className="busqueda-container">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <button className="btn-buscar" aria-label="Buscar">
                <FontAwesomeIcon icon={faSearch} />
              </button>
            </div>
            <div className="filtro-container">
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              >
                <option value="">Filtrar por...</option>
                <option value="nombre">Nombre/Apellido</option>
                <option value="estado">Estado</option>
                <option value="ingreso">Ingreso Neto</option>
                <option value="dni">DNI</option>
              </select>
            </div>
          </div>
          <div className="acciones-container">
            {/*Boton que quiere el rosquete de billy para ventas*/}
            {hasPermission(["Administrador"]) && (
              <button
                className="btn-ir-a-ventas"
                onClick={handleIrAVentas} 
                disabled={clientesSeleccionados.length === 0}
              >
                Ir a Ventas
              </button>
            )}

            {hasPermission(["Administrador"]) && (
              <button
                className="btn-cambiar-estado"
                onClick={() => setModalCambiarEstadoAbierto(true)}
                disabled={clientesSeleccionados.length === 0}
              >
                Cambiar Estado
              </button>
            )}

            {hasPermission(["Administrador"]) && (
              <button
                className="btn-eliminar"
                onClick={handleEliminarClientes}
                disabled={clientesSeleccionados.length === 0}
              >
                <FontAwesomeIcon icon={faTrash} /> Eliminar
              </button>
            )}

            {hasPermission(["Administrador", "Usuario"]) && (
              <button
                className="btn-agregar"
                onClick={abrirModalAgregarCliente}
              >
                <FontAwesomeIcon icon={faUserPlus} /> Agregar Cliente
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="tabla-container">
        {cargando ? (
          <div className="loader">Cargando clientes...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="no-data">
            No se encontraron clientes que coincidan con la búsqueda.
          </div>
        ) : (
          <>
            <table className="tabla-clientes">
              <thead>
                <tr>
                  <th className="columna-checkbox"></th>
                  <th>ID</th>
                  <th className="columna-nombre">Nombres y Apellidos</th>
                  <th>DNI</th>
                  <th>Dirección</th>
                  <th>Correo</th>
                  <th>Teléfono</th>
                  <th>Ocupación</th>
                  <th>Ingreso Neto</th>
                  <th>Estado</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {clientesPaginaActual.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="checkbox-cliente"
                        checked={clientesSeleccionados.includes(cliente.id)}
                        onChange={(e) =>
                          handleSeleccionCliente(cliente.id, e.target.checked)
                        }
                      />
                    </td>
                    <td>{cliente.id}</td>
                    <td>{`${cliente.nombre} ${cliente.apellidos}`}</td>
                    <td>{cliente.dni}</td>
                    <td>{cliente.direccion}</td>
                    <td>{cliente.correo}</td>
                    <td>{cliente.telefono}</td>
                    <td>{cliente.ocupacion}</td>
                    <td>S/ {cliente.ingreso_neto.toFixed(2)}</td>
                    <td>
                      <span
                        className={`estado-badge ${cliente.estado_cliente
                          .toLowerCase()
                          .replace(/\s/g, "")}`}
                      >
                        {cliente.estado_cliente}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-detalles"
                        aria-label="Ver detalles"
                        onClick={() =>
                          navigate(`/logistica/clientes/detalles/${cliente.id}`)
                        }
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginador */}
            {numeroTotalPaginas > 1 && (
              <div className="paginacion-con-selector">
                <div className="paginacion-container">
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(1)}
                    disabled={paginaActual === 1}
                  >
                    <FontAwesomeIcon icon={faAnglesLeft} />
                  </button>
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  {paginasVisibles[0] > 1 && (
                    <span className="paginacion-ellipsis">...</span>
                  )}
                  {paginasVisibles.map((numeroPagina) => (
                    <button
                      key={numeroPagina}
                      className={`btn-paginacion ${
                        paginaActual === numeroPagina ? "activo" : ""
                      }`}
                      onClick={() => cambiarPagina(numeroPagina)}
                    >
                      {numeroPagina}
                    </button>
                  ))}
                  {paginasVisibles[paginasVisibles.length - 1] <
                    numeroTotalPaginas && (
                    <span className="paginacion-ellipsis">...</span>
                  )}

                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === numeroTotalPaginas}
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                  <button
                    className="btn-paginacion"
                    onClick={() => cambiarPagina(numeroTotalPaginas)}
                    disabled={paginaActual === numeroTotalPaginas}
                  >
                    <FontAwesomeIcon icon={faAnglesRight} />
                  </button>
                </div>

                <div className="clientes-por-pagina-container">
                  <label htmlFor="clientesPorPagina">
                    Clientes por página:
                  </label>
                  <select
                    id="clientesPorPagina"
                    value={clientesPorPagina}
                    onChange={(e) => {
                      setClientesPorPagina(Number.parseInt(e.target.value));
                      setPaginaActual(1);
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- Modales --- */}

      {/* Modal para cambiar estado */}
      {modalCambiarEstadoAbierto && (
        <div
          className="modal-overlay-clientes active"
          onClick={() => setModalCambiarEstadoAbierto(false)}
        >
          <div
            className="modal-clientes modal-estado active"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="encabezado-cambiarestado">
              <h2>Cambiar Estado</h2>
              <button
                className="modal-cerrar"
                onClick={() => setModalCambiarEstadoAbierto(false)}
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-cuerpo">
              <div className="opciones-estado">
                {[
                  { key: "Activo", label: "Activo" },
                  { key: "Evaluado", label: "Evaluado" },
                  { key: "NoDisponible", label: "No Disponible" },
                  { key: "SinEvaluar", label: "Sin Evaluar" },
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className={`opcion-estado ${
                      estadoSeleccionado === key ? "seleccionado" : ""
                    }`}
                    onClick={() => handleSeleccionEstado(key)}
                  >
                    <div className="check-circle">
                      <FontAwesomeIcon icon={faCheck} />
                    </div>
                    <div
                      className={`estado-nombre ${key
                        .toLowerCase()
                        .replace(/\s/g, "")}`}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="modal-pie">
                <button
                  className="btn-confirmar-estado"
                  onClick={handleConfirmarCambioEstado}
                >
                  Confirmar Cambio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar cliente - CON VERIFICACIÓN DE EMAIL */}
      {modalAgregarClienteAbierto && (
        <div className="modal-overlay-clientes active">
          <div
            className="modal-clientes modal-agregar-cliente active"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-agregar">
              <div className="modal-icono">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <h2>Agregar Nuevo Cliente</h2>
              <button
                className="modal-cerrar"
                onClick={() => setModalAgregarClienteAbierto(false)}
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-cuerpo">
              <form
                id="formAgregarCliente"
                onSubmit={handleSubmitAgregarCliente}
              >
                <div className="form-fila">
                  <div className="form-grupo">
                    <label htmlFor="nombreCliente">Nombres*</label>
                    <input
                      id="nombreCliente"
                      type="text"
                      placeholder="Ingrese nombres"
                      maxLength={50}
                      pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                      title="Solo letras y espacios, máximo 50 caracteres"
                      required
                      value={formDataCliente.nombre}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                          ""
                        );
                      }}
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="apellidoCliente">Apellidos*</label>
                    <input
                      id="apellidoCliente"
                      type="text"
                      placeholder="Ingrese apellidos"
                      maxLength={50}
                      pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                      title="Solo letras y espacios, máximo 50 caracteres"
                      required
                      value={formDataCliente.apellido}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          apellido: e.target.value,
                        }))
                      }
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                          ""
                        );
                      }}
                    />
                  </div>
                </div>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label htmlFor="dniCliente">DNI*</label>
                    <input
                      id="dniCliente"
                      type="text"
                      placeholder="Ingrese DNI"
                      inputMode="numeric"
                      maxLength={8}
                      pattern="\d{8}"
                      title="Debe contener exactamente 8 dígitos"
                      required
                      value={formDataCliente.dni}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          dni: e.target.value,
                        }))
                      }
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value
                          .replace(/\D/g, "")
                          .slice(0, 8);
                      }}
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="telefonoCliente">Teléfono*</label>
                    <input
                      id="telefonoCliente"
                      type="tel"
                      placeholder="Ingrese Número"
                      inputMode="numeric"
                      maxLength={9}
                      pattern="9\d{8}"
                      title="El número debe comenzar con 9 y tener exactamente 9 dígitos"
                      required
                      value={formDataCliente.telefono}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                      onInput={(e) => {
                        const value = e.currentTarget.value
                          .replace(/\D/g, "")
                          .slice(0, 9);
                        if (value.length === 0 || value.charAt(0) === "9") {
                          e.currentTarget.value = value;
                        } else {
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label htmlFor="ocupacionCliente">Ocupación*</label>
                    <input
                      id="ocupacionCliente"
                      type="text"
                      placeholder="Ingrese Ocupación"
                      maxLength={50}
                      pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                      title="Solo letras y espacios, máximo 50 caracteres"
                      required
                      value={formDataCliente.ocupacion}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          ocupacion: e.target.value,
                        }))
                      }
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                          ""
                        );
                      }}
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="cargaFamiliar">Carga Familiar*</label>
                    <select
                      id="cargaFamiliar"
                      value={cargaFamiliar}
                      onChange={(e) =>
                        setCargaFamiliar(e.target.value as "1" | "0" | "")
                      }
                      required
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                </div>
                {cargaFamiliar === "1" && (
                  <>
                    <hr className="form-divider" />
                    <h3 className="form-section-title">
                      Información de Familiar o Cónyuge
                    </h3>
                    <div className="form-fila">
                      <div className="form-grupo">
                        <label htmlFor="nombreFamiliar">Nombre Familiar</label>
                        <input
                          id="nombreFamiliar"
                          type="text"
                          placeholder="Ingrese el nombre del familiar"
                          maxLength={50}
                          pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                          title="Solo letras y espacios, máximo 50 caracteres"
                          required
                          value={formDataCliente.nombre_familiar}
                          onChange={(e) =>
                            setFormDataCliente((prev) => ({
                              ...prev,
                              nombre_familiar: e.target.value,
                            }))
                          }
                          onInput={(e) => {
                            e.currentTarget.value =
                              e.currentTarget.value.replace(
                                /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                                ""
                              );
                          }}
                        />
                      </div>
                      <div className="form-grupo">
                        <label htmlFor="apellidoFamiliar">
                          Apellido Familiar
                        </label>
                        <input
                          id="apellidoFamiliar"
                          type="text"
                          placeholder="Ingrese el Apellido del familar"
                          maxLength={50}
                          pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                          title="Solo letras y espacios, máximo 50 caracteres"
                          required
                          value={formDataCliente.apellido_familiar}
                          onChange={(e) =>
                            setFormDataCliente((prev) => ({
                              ...prev,
                              apellido_familiar: e.target.value,
                            }))
                          }
                          onInput={(e) => {
                            e.currentTarget.value =
                              e.currentTarget.value.replace(
                                /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                                ""
                              );
                          }}
                        />
                      </div>
                    </div>
                    <div className="form-grupo">
                      <label htmlFor="dniFamiliar">DNI Familiar</label>
                      <input
                        id="dniFamiliar"
                        type="text"
                        placeholder="Ingrese el DNI familiar"
                        inputMode="numeric"
                        maxLength={8}
                        pattern="\d{8}"
                        title="Debe contener exactamente 8 dígitos"
                        required
                        value={formDataCliente.dni_familiar}
                        onChange={(e) =>
                          setFormDataCliente((prev) => ({
                            ...prev,
                            dni_familiar: e.target.value,
                          }))
                        }
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value
                            .replace(/\D/g, "")
                            .slice(0, 8);
                        }}
                      />
                    </div>
                    <hr className="form-divider" />
                  </>
                )}

                {/* COMPONENTE DE VERIFICACIÓN DE EMAIL */}
                <div className="form-grupo">
                  <VerificarEmail
                    email={formDataCliente.correo}
                    nombres={formDataCliente.nombre}
                    apellidos={formDataCliente.apellido}
                    onEmailChange={(email) =>
                      setFormDataCliente((prev) => ({ ...prev, correo: email }))
                    }
                    onEmailVerified={(email, isVerified) => {
                      setEmailVerificado(isVerified);
                      console.log(`Email ${email} verificado: ${isVerified}`);
                    }}
                    required={true}
                    showLabel={true}
                    placeholder="ejemplo@gmail.com"
                    className="verificar-email-cliente"
                  />
                </div>

                <div className="form-grupo">
                  <label htmlFor="direccionCliente">Dirección*</label>
                  <input
                    id="direccionCliente"
                    type="text"
                    placeholder="Ingrese Dirección"
                    maxLength={50}
                    required
                    pattern=".{1,50}"
                    title="Máximo 50 caracteres"
                    value={formDataCliente.direccion}
                    onChange={(e) =>
                      setFormDataCliente((prev) => ({
                        ...prev,
                        direccion: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="ingresoCliente">Ingreso Neto*</label>
                  <input
                    id="ingresoCliente"
                    type="text"
                    placeholder="Ingrese Valor Neto"
                    inputMode="decimal"
                    required
                    pattern="^\d{1,10}(\.\d{1,2})?$"
                    title="Solo números. Máximo 10 dígitos enteros y 2 decimales"
                    value={formDataCliente.ingreso_neto}
                    onChange={(e) =>
                      setFormDataCliente((prev) => ({
                        ...prev,
                        ingreso_neto: e.target.value,
                      }))
                    }
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^\d.]/g, "")
                        .replace(/^(\d{6})\d+/, "$1")
                        .replace(/(\..*)\./g, "$1")
                        .replace(/^(\d+)(\.\d{0,2})?.*$/, "$1$2");
                    }}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="estadoCliente">Estado Inicial*</label>
                  {currentUserRole === "Usuario" ? (
                    <select
                      id="estadoCliente"
                      required
                      value="SinEvaluar"
                      disabled
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          estado_cliente: e.target.value,
                        }))
                      }
                    >
                      <option value="SinEvaluar">Sin Evaluar</option>
                    </select>
                  ) : (
                    <select
                      id="estadoCliente"
                      required
                      value={formDataCliente.estado_cliente}
                      onChange={(e) =>
                        setFormDataCliente((prev) => ({
                          ...prev,
                          estado_cliente: e.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione un estado</option>
                      <option value="Activo">Activo</option>
                      <option value="Evaluado">Evaluado</option>
                      <option value="NoDisponible">No Disponible</option>
                      <option value="SinEvaluar">Sin Evaluar</option>
                    </select>
                  )}
                </div>
                <div className="modal-pie-form">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => {
                      setModalAgregarClienteAbierto(false);
                      setCargaFamiliar("");
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className={`btn-confirmar ${
                      !emailVerificado ? "btn-disabled" : ""
                    }`}
                    disabled={!emailVerificado}
                  >
                    {emailVerificado
                      ? "Registrar Cliente"
                      : "Verifica el email primero"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListarClientes
