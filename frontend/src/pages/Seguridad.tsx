import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Swal from "sweetalert2";
import {
  getSeguridad,
  insertarEmpleado,
  actualizarEstadoEmpleados,
} from "../api/seguridad";
import type { SeguridadData } from "../types/Seguridad";
import "../styles/seguridad.css";
import { obtenerAreas } from "../api/area";
import type { AreaData } from "../types/AreaData";
import VerificarEmail from "../components/VerificarEmail";
import "../styles/email.css";
import {
  faShieldHalved,
  faEye,
  faSearch,
  faUserPlus,
  faTimes,
  faCheck,
  faAnglesLeft,
  faChevronLeft,
  faChevronRight,
  faAnglesRight,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const Seguridad: React.FC = () => {
  const [empleados, setEmpleados] = useState<SeguridadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [campoFiltro, setCampoFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [modalAgregarEmpleadoAbierto, setModalAgregarEmpleadoAbierto] =
    useState(false);
  const [modalCambiarEstadoAbierto, setModalCambiarEstadoAbierto] =
    useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [empleadosSeleccionados, setEmpleadosSeleccionados] = useState<
    number[]
  >([]);
  const navigate = useNavigate();

  const [areas, setAreas] = useState<AreaData[]>([]);

  // ✅ AGREGADO: Estados para el formulario con verificación de email
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    dni: "",
    fecha_nacimiento: "",
    direccion: "",
    telefono: "",
    correo: "",
    id_area: "",
  });
  const [emailVerificado, setEmailVerificado] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const data = await obtenerAreas();
        console.log("Áreas obtenidas:", data); // Asegúrate de que las áreas estén llegando correctamente
        setAreas(data);
      } catch (error) {
        console.error("Error al obtener áreas", error);
      }
    };
    fetchAreas();
  }, []);

  const fetchEmpleados = useCallback(async () => {
    try {
      const data: SeguridadData[] = await getSeguridad();
      // Asigna el área correspondiente a cada empleado basado en el id_area
      const empleadosConArea = data.map((empleado) => {
        const areaAsignada = areas.find(
          (area) => area.id_area === empleado.id_area?.id_area
        );
        return { ...empleado, area: areaAsignada };
      });
      setEmpleados(empleadosConArea);
    } catch (error) {
      console.error("Error fetching employee data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron obtener los datos de los empleados.",
      });
    } finally {
      setLoading(false);
    }
  }, [areas]); // Se asegura de ejecutar nuevamente cuando 'areas' cambia

  useEffect(() => {
    fetchEmpleados();
  }, [fetchEmpleados]);

  const empleadosFiltrados = empleados.filter((empleado) => {
    // Filtrado por campo específico
    const textoBusqueda = busqueda.toLowerCase();
    let coincideBusqueda = true;

    if (campoFiltro && busqueda.trim() !== "") {
      const valorCampo = String(
        empleado[campoFiltro as keyof typeof empleado]
      ).toLowerCase();
      coincideBusqueda = valorCampo.includes(textoBusqueda);
    } else if (busqueda.trim() !== "") {
      coincideBusqueda = `${empleado.nombre} ${empleado.apellido} ${
        empleado.dni
      } ${empleado.id_area?.nombre || ""}`
        .toLowerCase()
        .includes(textoBusqueda);
    }

    // Filtrado por estado
    let coincideEstado = true;
    // Convertimos el valor de estado a número antes de compararlo
    const estadoEmpleado = Number(empleado.usuario?.estado); // Convertimos a número

    if (estadoFiltro === "activos" && estadoEmpleado !== 1) {
      coincideEstado = false;
    } else if (estadoFiltro === "inactivos" && estadoEmpleado !== 0) {
      coincideEstado = false;
    }

    return coincideBusqueda && coincideEstado;
  });
  // Función para calcular la fecha máxima para el input de nacimiento (hace 18 años)
  const getMaxFechaNacimiento = () => {
    const today = new Date();
    const year = today.getFullYear() - 18;
    const month = (today.getMonth() + 1).toString().padStart(2, "0"); // Meses son 0-indexados
    const day = today.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ✅ AGREGADO: Función para resetear formulario cuando se abre el modal
  const abrirModalAgregar = () => {
    setFormData({
      nombres: "",
      apellidos: "",
      dni: "",
      fecha_nacimiento: "",
      direccion: "",
      telefono: "",
      correo: "",
      id_area: "",
    });
    setEmailVerificado(false);
    setModalAgregarEmpleadoAbierto(true);
  };

  // ✅ MODIFICADO: Función de submit actualizada con verificación de email
  const handleSubmitAgregarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ AGREGADO: Validar que el email esté verificado
    if (!emailVerificado) {
      Swal.fire({
        icon: "warning",
        title: "Email no verificado",
        text: "Debe verificar el correo electrónico antes de continuar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // ✅ AGREGADO: Validar campos requeridos usando formData
    if (
      !formData.nombres.trim() ||
      !formData.apellidos.trim() ||
      !formData.dni.trim() ||
      !formData.fecha_nacimiento ||
      !formData.direccion.trim() ||
      !formData.telefono.trim() ||
      !formData.correo.trim() ||
      !formData.id_area
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Todos los campos son obligatorios.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación de Apellidos
    const apellidos = formData.apellidos.trim();
    const apellidosArray = apellidos.split(/\s+/);
    if (apellidosArray.length < 2) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: "Debe ingresar al menos dos apellidos.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // Validación de Edad
    const fechaNacimiento = new Date(formData.fecha_nacimiento);
    const edadMinima = 18;
    const fechaActual = new Date();
    let edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
    const mes = fechaActual.getMonth() - fechaNacimiento.getMonth();
    const dia = fechaActual.getDate() - fechaNacimiento.getDate();

    // Ajustar la edad si aún no ha cumplido el cumpleaños este año
    if (mes < 0 || (mes === 0 && dia < 0)) {
      edad--;
    }

    if (edad < edadMinima) {
      Swal.fire({
        icon: "error",
        title: "Error de Validación",
        text: `El empleado debe tener al menos ${edadMinima} años.`,
        confirmButtonText: "Aceptar",
      });
      return;
    }

    // ✅ MODIFICADO: Usar formData en lugar de obtener valores del DOM
    const nuevoEmpleado = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      dni: formData.dni.trim(),
      fecha_nacimiento: formData.fecha_nacimiento,
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      correo: formData.correo.trim(),
      id_area: Number.parseInt(formData.id_area),
    };

    try {
      const res = await insertarEmpleado(nuevoEmpleado);
      setModalAgregarEmpleadoAbierto(false);
      const nuevosEmpleados = await getSeguridad();
      setEmpleados(nuevosEmpleados);
      setPaginaActual(1);

      Swal.fire({
        icon: "success",
        title: "Empleado Registrado",
        text: res.message || "Empleado registrado con éxito.",
        confirmButtonText: "Aceptar",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          typeof error === "string"
            ? error
            : typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "Hubo un error al registrar el empleado.",
      });
    }
  };

  const handleConfirmarCambioEstado = async () => {
    if (estadoSeleccionado === "") {
      Swal.fire({
        icon: "warning",
        title: "Seleccione un estado",
        text: "Debe elegir entre Activo o Inactivo.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    if (empleadosSeleccionados.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Seleccione empleados",
        text: "Debe seleccionar al menos un empleado para cambiar su estado.",
      });
      return;
    }

    try {
      const res = await actualizarEstadoEmpleados(
        empleadosSeleccionados,
        estadoSeleccionado
      );

      const nombreEstado = estadoSeleccionado === "1" ? "Activo" : "Inactivo";

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text:
          res.message || `Los empleados fueron marcados como ${nombreEstado}.`,
      });

      fetchEmpleados();
      setEmpleadosSeleccionados([]);
      setModalCambiarEstadoAbierto(false);
      setEstadoSeleccionado("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          typeof error === "string"
            ? error
            : typeof error === "object" && error !== null && "message" in error
            ? (error as { message?: string }).message
            : "No se pudo actualizar el estado.",
      });
    }
  };

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [empleadosPorPagina, setEmpleadosPorPagina] = useState(5);

  const indiceUltimoEmpleado = paginaActual * empleadosPorPagina;
  const indicePrimerEmpleado = indiceUltimoEmpleado - empleadosPorPagina;
  const empleadosPaginaActual = empleadosFiltrados.slice(
    indicePrimerEmpleado,
    indiceUltimoEmpleado
  );

  const numeroTotalPaginas = Math.ceil(
    empleadosFiltrados.length / empleadosPorPagina
  );

  const cambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
  };

  const paginasVisibles = [];
  const maxPaginasVisibles = 5;
  let inicio = Math.max(1, paginaActual - Math.floor(maxPaginasVisibles / 2));
  const fin = Math.min(inicio + maxPaginasVisibles - 1, numeroTotalPaginas);

  if (fin - inicio + 1 < maxPaginasVisibles) {
    inicio = Math.max(1, fin - maxPaginasVisibles + 1);
  }

  for (let i = inicio; i <= fin; i++) {
    paginasVisibles.push(i);
  }

  if (loading) {
    return (
      <div className="seguridad-contenedor">
        {/* Encabezado visual */}
        <div className="seguridad-header">
          <div className="seguridad-header-icon">
            <FontAwesomeIcon icon={faShieldHalved} />
            <h1>Seguridad</h1>
          </div>
        </div>

        {/* Filtro y búsqueda */}
        <div className="busqueda-filtros-acciones-container">
          <div className="barra-herramientas">
            <div className="busqueda-container">
              <input type="text" placeholder="Buscar por empleado" />
              <FontAwesomeIcon
                icon={faSearch}
                className="seguridad-search-icon"
              />
            </div>
            <div className="filtro-container">
              <select>
                <option value="">Filtrar por...</option>
                <option value="nombre">Nombre</option>
                <option value="apellido">Apellidos</option>
                <option value="dni">DNI</option>
                <option value="area">Área</option>
              </select>
            </div>
            <div className="filtro-container">
              <select>
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mensaje de carga */}
        <div className="seguridad-cargando-datos">
          <p>Cargando datos de seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="seguridad-contenedor">
      {/* Encabezado visual */}
      <div className="seguridad-header">
        <div className="seguridad-header-icon">
          <FontAwesomeIcon icon={faShieldHalved} />
          <h1>Seguridad</h1>
        </div>
      </div>

      {/* Filtro y búsqueda */}
      <div className="busqueda-filtros-acciones-container">
        <div className="barra-herramientas">
          <div className="busqueda-container">
            <input
              type="text"
              placeholder="Buscar por empleado"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="seguridad-search-icon"
            />
          </div>
          <div className="filtro-container">
            <select
              value={campoFiltro}
              onChange={(e) => setCampoFiltro(e.target.value)}
            >
              <option value="" disabled>
                Filtrar por...
              </option>
              <option value="nombre">Nombre</option>
              <option value="apellido">Apellidos</option>
              <option value="dni">DNI</option>
              <option value="area">Área</option>
            </select>
          </div>
          <div className="filtro-container">
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="seguridad-table-container">
        <table className="seguridad-table">
          <thead>
            <tr>
              <th></th>
              <th>ID</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>DNI</th>
              <th>Área</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleadosPaginaActual.length > 0 ? (
              empleadosPaginaActual.map((empleado) => (
                <tr key={empleado.id_empleado}>
                  <td>
                    <input
                      type="checkbox"
                      checked={empleadosSeleccionados.includes(
                        empleado.id_empleado
                      )}
                      onChange={(e) => {
                        const id = empleado.id_empleado;
                        if (e.target.checked) {
                          setEmpleadosSeleccionados((prev) => [...prev, id]);
                        } else {
                          setEmpleadosSeleccionados((prev) =>
                            prev.filter((empId) => empId !== id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td>{empleado.id_empleado}</td>
                  <td>{empleado.nombre}</td>
                  <td>{empleado.apellido}</td>
                  <td>{empleado.dni}</td>
                  <td>
                    {empleado.id_area
                      ? empleado.id_area.nombre
                      : "Área no disponible"}
                  </td>
                  <td>
                    <span
                      className={`seguridad-estado ${
                        Number(empleado.usuario?.estado) === 1
                          ? "seguridad-estado-activo"
                          : "seguridad-estado-inactivo"
                      }`}
                    >
                      {Number(empleado.usuario?.estado) === 1
                        ? "Activo"
                        : "Inactivo"}
                    </span>
                  </td>
                  <td>
                    <div className="seguridad-btn-action">
                      <button
                        className="seguridad-btn-icon seguridad-btn-view"
                        title="Ver detalles"
                        onClick={() =>
                          navigate(
                            `/seguridad/detalles/${empleado.id_empleado}`
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  No hay empleados disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Paginador */}{" "}
        {numeroTotalPaginas > 1 && (
          <div className="paginacion-con-selector">
            <div className="paginacion-container">
              {/* tus botones de paginación existentes */}
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

            {/* Selector de empleados por página */}
            <div className="empleados-por-pagina-container">
              <label htmlFor="empleadosPorPagina">Empleados por página:</label>
              <select
                id="empleadosPorPagina"
                value={empleadosPorPagina}
                onChange={(e) => {
                  setEmpleadosPorPagina(Number.parseInt(e.target.value));
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
      </div>

      <div className="seguridad-acciones">
        <button
          className="btn-cambiar-estado"
          disabled={empleadosSeleccionados.length === 0}
          onClick={() => setModalCambiarEstadoAbierto(true)}
        >
          {" "}
          Cambiar Estado{" "}
        </button>
        {/* ✅ MODIFICADO: Usar función abrirModalAgregar */}
        <button className="btn-agregar" onClick={abrirModalAgregar}>
          <FontAwesomeIcon icon={faUserPlus} /> Agregar Empleado
        </button>
      </div>

      {/* ✅ MODIFICADO: Modal con verificación de email integrada */}
      {modalAgregarEmpleadoAbierto && (
        <div className="modal-overlay-empleados active">
          <div
            className="modal-empleados modal-agregar-empleado active"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-agregar">
              <div className="modal-icono">
                <FontAwesomeIcon icon={faUserPlus} />
              </div>
              <h2>Agregar Nuevo Empleado</h2>
              <button
                className="modal-cerrar"
                onClick={() => setModalAgregarEmpleadoAbierto(false)}
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <form onSubmit={handleSubmitAgregarEmpleado}>
                <div className="form-fila">
                  <div className="form-grupo">
                    <label htmlFor="nombreEmpleado">Nombres*</label>
                    <input
                      id="nombreEmpleado"
                      type="text"
                      placeholder="Ingrese nombres"
                      maxLength={50}
                      required
                      value={formData.nombres}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nombres: e.target.value,
                        }))
                      }
                      pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g,
                          ""
                        );
                      }}
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="apellidoEmpleado">Apellidos*</label>
                    <input
                      id="apellidoEmpleado"
                      type="text"
                      placeholder="Ingrese apellidos"
                      maxLength={50}
                      required
                      value={formData.apellidos}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          apellidos: e.target.value,
                        }))
                      }
                      pattern="[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,50}"
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
                    <label htmlFor="dniEmpleado">DNI*</label>
                    <input
                      id="dniEmpleado"
                      type="text"
                      inputMode="numeric"
                      placeholder="Ingrese DNI"
                      maxLength={8}
                      required
                      value={formData.dni}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dni: e.target.value,
                        }))
                      }
                      pattern="\d{8}"
                      title="Debe contener exactamente 8 dígitos"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value
                          .replace(/\D/g, "")
                          .slice(0, 8);
                      }}
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="fechaNacimientoEmpleado">
                      Fecha de Nacimiento*
                    </label>
                    <input
                      id="fechaNacimientoEmpleado"
                      type="date"
                      required
                      max={getMaxFechaNacimiento()}
                      value={formData.fecha_nacimiento}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fecha_nacimiento: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="form-fila">
                  <div className="form-grupo">
                    <label htmlFor="direccionEmpleado">Dirección*</label>
                    <input
                      id="direccionEmpleado"
                      type="text"
                      placeholder="Ingrese Dirección"
                      maxLength={100}
                      required
                      value={formData.direccion}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          direccion: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="telefonoEmpleado">Teléfono*</label>
                    <input
                      id="telefonoEmpleado"
                      type="tel"
                      placeholder="Ingrese Número"
                      inputMode="numeric"
                      maxLength={9}
                      pattern="9\d{8}"
                      required
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                      title="Debe comenzar con 9 y tener 9 dígitos"
                      onInput={(e) => {
                        const val = e.currentTarget.value
                          .replace(/\D/g, "")
                          .slice(0, 9);
                        e.currentTarget.value =
                          val.charAt(0) === "9" ? val : "";
                      }}
                    />
                  </div>
                </div>

                <div className="form-fila">
                  {/* ✅ AGREGADO: Componente VerificarEmail reemplazando el input básico */}
                  <div className="form-grupo">
                    <VerificarEmail
                      email={formData.correo}
                      onEmailChange={(email) =>
                        setFormData((prev) => ({ ...prev, correo: email }))
                      }
                      onEmailVerified={(email, isVerified) => {
                        setEmailVerificado(isVerified);
                        console.log(`Email ${email} verificado: ${isVerified}`);
                      }}
                      required={true}
                      showLabel={true}
                      placeholder="ejemplo@gmail.com"
                      className="verificar-email-empleado"
                    />
                  </div>
                  <div className="form-grupo">
                    <label htmlFor="areaEmpleado">Área*</label>
                    <select
                      id="areaEmpleado"
                      required
                      value={formData.id_area}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          id_area: e.target.value,
                        }))
                      }
                    >
                      <option value="">Seleccione un área</option>
                      {areas.map((area) => (
                        <option key={area.id_area} value={area.id_area}>
                          {area.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-pie-form">
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={() => setModalAgregarEmpleadoAbierto(false)}
                  >
                    Cancelar
                  </button>
                  {/* ✅ MODIFICADO: Botón que se deshabilita si el email no está verificado */}
                  <button
                    type="submit"
                    className={`btn-confirmar ${
                      !emailVerificado ? "btn-disabled" : ""
                    }`}
                    disabled={!emailVerificado}
                  >
                    {emailVerificado
                      ? "Registrar Empleado"
                      : "Verifica el email primero"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalCambiarEstadoAbierto && (
        <div
          className="modal-overlay-empleados active"
          onClick={() => setModalCambiarEstadoAbierto(false)}
        >
          <div
            className="modal-empleados modal-estado active modal-chico"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="encabezado-cambiar-estado">
              <h2>Cambiar Estado del Empleado</h2>
              <button
                className="modal-cerrar"
                onClick={() => setModalCambiarEstadoAbierto(false)}
                aria-label="Cerrar modal"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <div className="opciones-estado compacto">
                {[
                  { key: "1", label: "Activo", color: "verde" },
                  { key: "0", label: "Inactivo", color: "rojo" },
                ].map(({ key, label, color }) => (
                  <div
                    key={key}
                    className={`opcion-estado-mini ${
                      estadoSeleccionado === key ? "seleccionado" : ""
                    }`}
                    onClick={() => setEstadoSeleccionado(key)}
                  >
                    <div className={`check-circle-mini ${color}`}>
                      {estadoSeleccionado === key && (
                        <FontAwesomeIcon icon={faCheck} />
                      )}
                    </div>
                    <span className={`estado-label ${color}`}>{label}</span>
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
    </div>
  );
};

export default Seguridad;
