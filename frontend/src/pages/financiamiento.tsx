import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";
import "../styles/financiamientos.css";
import Swal from "sweetalert2";
import { actualizarFinanciamiento } from "../api/financiamiento";
import type { Financiamiento } from "../types/Financiamiento";

const Financiamientos: React.FC = () => {
  const [financiamientos, setFinanciamientos] = useState<Financiamiento[]>([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarModalAgregar, setMostrarModalAgregar] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [financiamientoSeleccionado, setFinanciamientoSeleccionado] = useState<Financiamiento | null>(null);

  // ✅ FUNCION REUTILIZABLE PARA TRAER FINANCIAMIENTOS
  const fetchFinanciamientos = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/financiamientos/");
      const result = await response.json();

      if (result.success) {
        type ApiFinanciamiento = {
          id: number;
          tipo: number;
          nombre: string;
          monto: number;
          interes: number;
          estado: string;
          fecha: string;
          foto_ref: string;
        };

        const datos: Financiamiento[] = result.data.map((f: ApiFinanciamiento) => ({
          id_financiamiento: f.id,
          tipo: f.tipo,
          nombre: f.nombre,
          monto: f.monto,
          interes: f.interes,
          estado: f.estado,
          fecha: f.fecha,
          imagen: f.foto_ref 
        }));
        setFinanciamientos(datos);
        } else {
        console.error("Error desde la API:", result.message);
      }
    } catch (error) {
      console.error("Error al cargar financiamientos:", error);
    }
  };

  // 🔁 AL MONTAR EL COMPONENTE
  useEffect(() => {
    fetchFinanciamientos();
  }, []);

  // ✅ GUARDAR FINANCIAMIENTO
  const handleGuardar = async () => {
    const form = document.getElementById("formAgregarFinanciamiento") as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch("http://localhost:5000/api/financiamientos/insertar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Respuesta:", result);

      if (result.success) {
        await Swal.fire({
          icon: "success",
          title: "Financiamiento agregado",
          text: result.message,
          timer: 1500,
          showConfirmButton: false,
        });

        setMostrarModalAgregar(false);
        form.reset();
        fetchFinanciamientos(); // Recarga la lista de financiamientos actualizada
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Error al insertar:", error);
      Swal.fire("Error", "No se pudo insertar el financiamiento", "error");
    }
  };

  // 🔎 FILTRO DE FINANCIAMIENTOS
  const filtrarFinanciamientos = () => {
    return financiamientos.filter((f) => {
      const coincideBusqueda = f.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const coincideTipo = filtroTipo === "todos" || f.tipo.toString() === filtroTipo;
      const coincideEstado = filtroEstado === "todos" || f.estado.toLowerCase() === filtroEstado;
      return coincideBusqueda && coincideTipo && coincideEstado;
    });
  };

  const abrirModalEditar = (financiamiento: Financiamiento) => {
    setFinanciamientoSeleccionado(financiamiento);
    setMostrarModalEditar(true);
  };

  const handleVistaPrevia = (e: React.ChangeEvent<HTMLInputElement>) => {
  const archivo = e.target.files?.[0];
  const preview = document.getElementById("previewImagen") as HTMLImageElement;

  if (archivo) {
    const url = URL.createObjectURL(archivo);
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
};

  const handleActualizar = async () => {
    const form = document.getElementById("formEditarFinanciamiento") as HTMLFormElement;
    const formData = new FormData(form);

    if (!financiamientoSeleccionado) return;

    formData.append("id_financiamiento", financiamientoSeleccionado.id_financiamiento.toString());

    // Validaciones adicionales
    const fecha = formData.get("fecha")?.toString().trim();
    if (!fecha) {
      Swal.fire("Error", "La fecha de creación no puede estar vacía", "warning");
      return;
    }

    const imagen = formData.get("imagen") as File;
    if (imagen && imagen.size === 0) {
      formData.delete("imagen");
    }

    // Log para debug
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const result = await actualizarFinanciamiento(formData);
      console.log("Respuesta:", result);

      if (result.success) {
        await Swal.fire("Actualizado", result.message, "success");
        setMostrarModalEditar(false);
        fetchFinanciamientos();
      } else {
        Swal.fire("Error", result.message, "error");
      }
    } catch (error) {
      console.error("Error al actualizar:", error);
      Swal.fire("Error", "No se pudo actualizar el financiamiento", "error");
    }
  };


  const handleVistaPreviaEditar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    const preview = document.getElementById("previewEditar") as HTMLImageElement;

    if (archivo) {
      const url = URL.createObjectURL(archivo);
      preview.src = url;
      preview.style.display = "block";
    } else {
      preview.src = "";
      preview.style.display = "none";
    }
  };

  const cambiarEstado = async (f: Financiamiento) => {
    const nuevoEstado = f.estado === "Activo" ? "Inactivo" : "Activo";
    const accion = nuevoEstado === "Activo" ? "activar" : "desactivar";

    const confirmacion = await Swal.fire({
      title: `¿Estás seguro?`,
      text: `¿Deseas ${accion} el financiamiento "${f.nombre}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      const formData = new FormData();
      formData.append("id_financiamiento", f.id_financiamiento.toString());
      formData.append("nuevo_estado", nuevoEstado);

      try {
        const response = await fetch("http://localhost:5000/api/financiamientos/cambiar_estado", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log("Respuesta:", result);

        if (result.success) {
          Swal.fire("Actualizado", result.message, "success");
          fetchFinanciamientos();
        } else {
          Swal.fire("Error", result.message, "error");
        }
      } catch (error) {
        console.error("Error al cambiar estado:", error);
        Swal.fire("Error", "No se pudo cambiar el estado", "error");
      }
    }
  };


  return (
    <div className="financiamiento-container">
      <div className="financiamiento-header">
        <div className="financiamiento-header-icon">
          <FontAwesomeIcon icon={faMoneyBillWave} />
        </div>
        <h1>Financiamientos</h1>
        <button className="btn btn-primary" onClick={() => setMostrarModalAgregar(true)}>
          <FontAwesomeIcon icon={faPlus} /> Agregar
        </button>
      </div>

      <div className="financiamiento-filters">
        <div className="financiamiento-search-box">
          <input
            type="text"
            placeholder="Buscar financiamiento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}/>
            <FontAwesomeIcon icon={faSearch} className="financiamientos-search-icon"
          />
        </div>
        <div className="financiamiento-filter-selects">
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            <option value="1">Estatal</option>
            <option value="2">Privado</option>
          </select>
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      <div className="cards">
        {filtrarFinanciamientos().map((f) => (
          <div
            key={f.id_financiamiento}
            className="card"
            data-id={f.id_financiamiento}
            data-estado={f.estado.toLowerCase()}
            data-tipo={f.tipo.toString()}
          >
            <img
              src={`http://localhost:5000/api/financiamientos/imagen/${f.imagen}`}
              alt={f.nombre}
              className="card-img-top object-fit-contain"
              style={{ height: "200px" }}
            />
            <div className="card-body m-auto" style={{ width: "90%" }}>
              <div className="card-title text-center">
                <h2>{f.nombre}</h2>
                <span className={`rounded p-1 my-2 financiamiento-badge ${f.estado === "Activo" ? "active" : "inactive"}`}>
                  {f.estado === "Activo" ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="card-text d-flex flex-column gap-2">
                <div className="d-flex flex-row justify-content-between">
                  <div>
                    <span className="label">Tipo:</span> <span className="value">{f.tipo === 1 ? "Estatal" : "Privado"}</span>
                  </div>
                  <div>
                    <span className="label">Monto:</span> <span className="value">S/ {f.monto.toLocaleString()}</span>
                  </div>
                </div>
                <div className="d-flex flex-row justify-content-between">
                  <div>
                    <span className="label">Interés:</span> <span className="value highlight">{f.interes}% Anual</span>
                  </div>
                  <div>
                    <span className="label">Creación:</span> <span className="value">{new Date(f.fecha).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <div style={{ width: "90%" }} className="m-auto">
                <div className="d-flex justify-content-between">
                  <button
                    className={`btn-outline ${f.estado === "Activo" ? "btn-danger" : "btn-success"}`}
                    onClick={() => cambiarEstado(f)}
                  >
                    <i className="fas fa-power-off"></i> {f.estado === "Activo" ? "Desactivar" : "Activar"}
                  </button>
                  <button className="btn-outline btn-info" onClick={() => abrirModalEditar(f)}>
                    <i className="fas fa-edit"></i> Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mostrarModalEditar && financiamientoSeleccionado && (
        <div className="modal-financiamiento active" id="modalEditarFinanciamiento">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <div className="icon-circle"><i className="fas fa-edit"></i></div>
                <div><h2>Editar Financiamiento</h2></div>
              </div>
              <span className="close" onClick={() => setMostrarModalEditar(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form id="formEditarFinanciamiento">
                <div className="form-group">
                  <label htmlFor="nombreEditar">Nombre*</label>
                  <input
                    id="nombreEditar"
                    name="nombre"
                    type="text"
                    defaultValue={financiamientoSeleccionado.nombre}
                    required
                    maxLength={50}
                    title="Máximo 50 caracteres"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="montoEditar">Monto del Bono*</label>
                  <input
                    id="montoEditar"
                    name="monto"
                    type="text"
                    defaultValue={financiamientoSeleccionado.monto}
                    required
                    title="Máximo 8 enteros y 2 decimales"
                    onInput={(e) => {
                      let valor = e.currentTarget.value;
                      valor = valor.replace(/[^0-9.]/g, "");
                      const partes = valor.split(".");
                      if (partes.length > 2) valor = partes[0] + "." + partes[1];
                      if (partes[0].length > 8) partes[0] = partes[0].slice(0, 8);
                      if (partes.length === 2) {
                        partes[1] = partes[1].slice(0, 2);
                        valor = partes[0] + "." + partes[1];
                      } else {
                        valor = partes[0];
                      }
                      e.currentTarget.value = valor;
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interesEditar">Interés anualmente*</label>
                  <input
                    id="interesEditar"
                    name="interes"
                    type="text"
                    defaultValue={financiamientoSeleccionado.interes}
                    required
                    title="Máximo 2 enteros y 2 decimales"
                    onInput={(e) => {
                      let valor = e.currentTarget.value;
                      valor = valor.replace(/[^0-9.]/g, "");
                      const partes = valor.split(".");
                      if (partes.length > 2) valor = partes[0] + "." + partes[1];
                      if (partes[0].length > 2) partes[0] = partes[0].slice(0, 2);
                      if (partes.length === 2) {
                        partes[1] = partes[1].slice(0, 2);
                        valor = partes[0] + "." + partes[1];
                      } else {
                        valor = partes[0];
                      }
                      e.currentTarget.value = valor;
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tipoEditar">Tipo de Financiamiento*</label>
                  <select id="tipoEditar" name="tipo" defaultValue={financiamientoSeleccionado.tipo} required>
                    <option value="1">Estatal</option>
                    <option value="2">Privado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fechaEditar">Fecha de Creación*</label>
                  <input
                    id="fechaEditar"
                    name="fecha"
                    type="date"
                    defaultValue={financiamientoSeleccionado.fecha}
                    required
                    max="2025-06-25"
                    onInput={(e) => {
                      const hoy = new Date();
                      const inputFecha = new Date(e.currentTarget.value);
                      if (inputFecha > hoy) {
                        alert("No se permiten fechas futuras");
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imagenEditar">Foto de Referencia</label>
                  <input
                    id="imagenEditar"
                    name="imagen"
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      const allowed = ["image/png", "image/jpeg"];
                      if (file && !allowed.includes(file.type)) {
                        alert("Solo se permiten archivos .jpg y .png");
                        e.currentTarget.value = "";
                        return;
                      }
                      handleVistaPreviaEditar(e); // mantiene la funcionalidad de vista previa
                    }}
                  />
                  <img
                    id="previewEditar"
                    style={{ marginTop: "10px", maxHeight: "150px", display: "none" }}
                    alt="Vista previa"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModalEditar(false)}>Cancelar</button>
              <button className="btn-agregar" onClick={handleActualizar} type="button">
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
      {mostrarModalAgregar && (
        <div className="modal-financiamiento active" id="modalAgregarFinanciamiento">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <div className="icon-circle"><i className="fas fa-money-bill-wave"></i></div>
                <div><h2>Agregar Financiamiento</h2></div>
              </div>
              <span className="close" onClick={() => setMostrarModalAgregar(false)}>&times;</span>
            </div>
            <div className="modal-body">
              <form id="formAgregarFinanciamiento">
                <div className="form-group">
                  <label htmlFor="nombreNuevo">Nombre*</label>
                  <input
                    id="nombreNuevo"
                    name="nombre"
                    type="text"
                    placeholder="Ej: Bono Vivienda"
                    required
                    maxLength={50}
                    title="Máximo 50 caracteres"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="montoNuevo">Monto del Bono*</label>
                  <input
                    id="montoNuevo"
                    name="monto"
                    type="text"
                    placeholder="Ej: S/10000.00"
                    required
                    title="Máximo 8 enteros y 2 decimales"
                    onInput={(e) => {
                      let valor = e.currentTarget.value;

                      // Elimina caracteres no válidos
                      valor = valor.replace(/[^0-9.]/g, "");

                      // Solo permitir un punto decimal
                      const partes = valor.split(".");
                      if (partes.length > 2) {
                        valor = partes[0] + "." + partes[1];
                      }

                      // Limita los enteros a 10 dígitos
                      if (partes[0].length > 8) {
                        partes[0] = partes[0].slice(0, 8);
                      }

                      // Limita los decimales a 2 dígitos
                      if (partes.length === 2) {
                        partes[1] = partes[1].slice(0, 2);
                        valor = partes[0] + "." + partes[1];
                      } else {
                        valor = partes[0];
                      }

                      e.currentTarget.value = valor;
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interesNuevo">Interés anualmente*</label>
                  <input
                    id="interesNuevo"
                    name="interes"
                    type="text"
                    placeholder="Ej: 2.5"
                    required
                    pattern="^\d{1,2}(\.\d{1,2})?$"
                    title="Hasta 2 enteros y 2 decimales"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^\d.]/g, '')
                        .replace(/^(\d{0,2})(\.\d{0,2})?.*$/, '$1$2')
                        .replace(/^\.*/, '')
                        .replace(/(\..*)\./g, '$1');
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tipoNuevo">Tipo de Financiamiento*</label>
                  <select id="tipoNuevo" name="tipo" required>
                    <option value="">Seleccionar...</option>
                    <option value="1">Estatal</option>
                    <option value="2">Privado</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="fechaNuevo">Fecha de Creación*</label>
                  <input
                    id="fechaNuevo"
                    name="fecha"
                    type="date"
                    required
                    max="2025-06-25" // fecha del sistema
                    onInput={(e) => {
                      const hoy = new Date();
                      const inputFecha = new Date(e.currentTarget.value);
                      if (inputFecha > hoy) {
                        alert("No se permiten fechas futuras");
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="imagenNuevo">Foto de Referencia</label>
                  <input
                    id="imagenNuevo"
                    name="imagen"
                    type="file"
                    accept=".png, .jpg, .jpeg"
                    required
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      const allowed = ["image/png", "image/jpeg"];
                      if (file && !allowed.includes(file.type)) {
                        alert("Solo se permiten archivos .jpg y .png");
                        e.currentTarget.value = "";
                        return;
                      }
                      handleVistaPrevia(e);
                    }}
                  />
                  <img
                    id="previewImagen"
                    style={{ marginTop: "10px", maxHeight: "150px", display: "none" }}
                    alt="Vista previa"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setMostrarModalAgregar(false)}>Cancelar</button>
              <button className="btn-agregar" onClick={handleGuardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Financiamientos;