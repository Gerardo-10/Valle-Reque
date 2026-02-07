"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faPlus,
    faSearch,
    faMap,
    faPen,
    faTrash,
    faExclamation,
    faCheck,
    faChevronLeft, // Importar para paginación
    faChevronRight, // Importar para paginación
    faAnglesLeft, // Importar para paginación
    faAnglesRight, // Importar para paginación
} from "@fortawesome/free-solid-svg-icons"
import "../styles/terrenos.css"
import type { Terreno } from "../types/Terreno"
import { getTerrenos, editarTerreno, insertarTerreno} from "../api/terreno";
import Swal from "sweetalert2"
import type { Proyectos } from "../types/Proyectos"
import { getProyectosventas } from "../api/proyecto"
import { useNavigate } from 'react-router-dom';

const Terrenos: React.FC = () => {
    const navigate = useNavigate(); 
    // Datos de ejemplo para la tabla
    const [terrenos, setTerrenos] = useState<Terreno[]>([])
    // const [cargando, setCargando] = useState(true)

    // Botón para ir a venta
    const [terrenoSeleccionadoId, setTerrenoSeleccionadoId] = useState<number | null>(null);
    const handleCheckboxChange = (id: number) => {
        if (terrenoSeleccionadoId === id) {
            // Si ya está seleccionado, lo deseleccionar
            setTerrenoSeleccionadoId(null);
        } else {
            // Selecciona este y desmarca el anterior automáticamente
            setTerrenoSeleccionadoId(id);
        }
    };

    // Redirección con los datos para la venta
    const handleIrAVenta = () => {
        if (terrenoSeleccionadoId) {
            const terrenoSeleccionado = terrenos.find(
            (terreno) => terreno.id_terreno === terrenoSeleccionadoId
            );

            if (terrenoSeleccionado) {
            console.log("Terreno seleccionado:", terrenoSeleccionado);

            // Verificar si el terreno está disponible
            if (terrenoSeleccionado.estado_terreno === "Disponible") {
                // Redirigir a la página de ventas con los parámetros
                navigate('/ventas', {
                state: {
                    id_terreno: terrenoSeleccionado.id_terreno,
                    nombre_proyecto: terrenoSeleccionado.nombre_proyecto,
                    etapa: terrenoSeleccionado.etapa,
                    codigo_unidad: terrenoSeleccionado.codigo_unidad
                },
                });
            } else {
                // Mostrar un mensaje de alerta si el terreno no está disponible
                Swal.fire({
                title: "Terreno no disponible",
                text: `Este terreno no se puede usar para la venta, ya que está ${terrenoSeleccionado.estado_terreno}.`,
                icon: "warning",
                confirmButtonText: "Aceptar"
                });
            }
            }
        }
        };
    // Validación del input de cantidad de etapas
    const [cantidadEtapas, setCantidadEtapas] = useState(0)
    const handleProyectoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const proyectoSeleccionado = proyectos.find(
            (p) => p.id_proyecto === parseInt(selectedId)
        );

        if (proyectoSeleccionado) {
            setCantidadEtapas(proyectoSeleccionado.cantidad_etapas);
        } else {
            setCantidadEtapas(0);
        }
    };

    // Validación de manzana
    const [manzana, setManzana] = useState("");
    const handleManzanaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
    
        // Permitir solo letras (remueve cualquier otro carácter)
        value = value.replace(/[^a-zA-Z]/g, "");
    
        // Limitar a un carácter
        if (value.length > 1) {
            value = value[0];
        }
    
        // Convertir a mayúscula
        value = value.toUpperCase();
    
        setManzana(value);
    };

    // Validación para numero de lote
    const [numeroLote, setNumeroLote] = useState("");
    const handleNumeroLoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Permitir solo números
        value = value.replace(/[^0-9]/g, "");

        // Si empieza con 0, lo eliminamos
        if (value.startsWith("0")) {
            value = value.replace(/^0+/, "");
        }

        setNumeroLote(value);
    };

    const [proyectos, setProyectos] = useState<Proyectos[]>([])

    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                const data = await getProyectosventas()
                setProyectos(data)
            } catch (e) {
                console.error("Error al obtener los proyectos", e)
            }
        }

        fetchProyectos()
    }, [])

    // Estados para los modales
    const [modalNuevoTerreno, setModalNuevoTerreno] = useState(false)
    const [modalEditarTerreno, setModalEditarTerreno] = useState(false)
    const [modalConfirmarGuardarTerreno, setModalConfirmarGuardarTerreno] = useState(false)
    const [modalExitoTerreno, setModalExitoTerreno] = useState(false)
    const [modalConfirmarEditarTerreno, setModalConfirmarEditarTerreno] = useState(false)
    const [modalExitoEditarTerreno, setModalExitoEditarTerreno] = useState(false)
    const [modalConfirmarEliminarTerreno, setModalConfirmarEliminarTerreno] = useState(false)

    // Estado para el terreno seleccionado
    const [terrenoSeleccionado, setTerrenoSeleccionado] = useState<Terreno | null>(null)

    // Estado para la búsqueda
    const [searchTerm, setSearchTerm] = useState("")
    const [filterOption, setFilterOption] = useState("")

    // Estados para la paginación
    const [paginaActual, setPaginaActual] = useState(1)
    const [terrenosPorPagina, setTerrenosPorPagina] = useState(5) // Clientes por página

    // Función para formatear el precio
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
    }

    // Función para obtener la clase CSS según el estatus
    const getStatusClass = (estado: string) => {
        switch (estado.toLowerCase()) {
            case "disponible":
                return "terreno-estado-disponible";
            case "reservado":
                return "terreno-estado-reservado";
            case "nodisponible":
                return "terreno-estado-nodisponible";
            case "enproceso":
                return "terreno-estado-enproceso";
            case "vendido":
                return "terreno-estado-vendido";
            case "eliminado":
                return ""; // No mostrar nada
            default:
                return "";
            }
        }

    // Función para abrir el modal de eliminación
    const openDeleteModal = (id: number) => {
        Swal.fire({
            title: "¿Desea eliminar este terreno?",
            text: "Esta acción no se puede deshacer. El terreno será eliminado permanentemente.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
            deleteTerreno(id);
            }
        });
    };


    // Función para eliminar un terreno
    const deleteTerreno = (id: number) => {
        setTerrenos(terrenos.filter((terreno) => terreno.id_terreno !== id));
        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El terreno ha sido eliminado correctamente',
            timer: 1500,
            showConfirmButton: false
        });
    };      

    // Función para pasar los datos del terreno seleccionado al modal de edición
    const openEditModal = (terreno: React.SetStateAction<Terreno | null>) => {
        setTerrenoSeleccionado(terreno);
        setModalEditarTerreno(true);
    };

    // Función para filtrar terrenos (ahora solo filtra, la paginación se aplica después)
    const terrenosFiltrados = terrenos.filter((terreno) => {
        const searchTermLower = searchTerm.toLowerCase()
        if (searchTerm === "") return true

        switch (filterOption) {
            case "Proyecto":
                return terreno.nombre_proyecto?.toLowerCase().includes(searchTermLower)
            case "Etapa":
                return terreno.etapa.toString().includes(searchTermLower)
            case "Estado":
                return terreno.estado_terreno.toLowerCase().includes(searchTermLower)
            default:
                return (
                    terreno.nombre_proyecto?.toLowerCase().includes(searchTermLower) ||
                    terreno.etapa.toString().includes(searchTermLower) ||
                    terreno.manzana.toLowerCase().includes(searchTermLower) ||
                    terreno.tipo_terreno.toLowerCase().includes(searchTermLower) ||
                    terreno.estado_terreno.toLowerCase().includes(searchTermLower)
                )
        }
    })

    // Lógica de paginación
    const indiceUltimoTerreno = paginaActual * terrenosPorPagina
    const indicePrimerTerreno = indiceUltimoTerreno - terrenosPorPagina
    const terrenosPaginaActual = terrenosFiltrados.slice(indicePrimerTerreno, indiceUltimoTerreno)

    const numeroTotalPaginas = Math.ceil(terrenosFiltrados.length / terrenosPorPagina)

    const cambiarPagina = (numeroPagina: number) => {
        setPaginaActual(numeroPagina)
    }

    const getPaginasVisibles = () => {
        const paginasVisibles: (number | string)[] = []
        const maxPaginasVisibles = 5 // Número máximo de botones de página a mostrar

        if (numeroTotalPaginas <= maxPaginasVisibles) {
            for (let i = 1; i <= numeroTotalPaginas; i++) {
                paginasVisibles.push(i)
            }
        } else {
            if (paginaActual <= Math.ceil(maxPaginasVisibles / 2)) {
                for (let i = 1; i <= maxPaginasVisibles - 1; i++) {
                    paginasVisibles.push(i)
                }
                paginasVisibles.push("...", numeroTotalPaginas)
            } else if (paginaActual >= numeroTotalPaginas - Math.floor(maxPaginasVisibles / 2)) {
                paginasVisibles.push(1, "...")
                for (let i = numeroTotalPaginas - (maxPaginasVisibles - 2); i <= numeroTotalPaginas; i++) {
                    paginasVisibles.push(i)
                }
            } else {
                paginasVisibles.push(1, "...")
                for (let i = paginaActual - Math.floor((maxPaginasVisibles - 4) / 2); i <= paginaActual + Math.ceil((maxPaginasVisibles - 4) / 2); i++) {
                    paginasVisibles.push(i)
                }
                paginasVisibles.push("...", numeroTotalPaginas)
            }
        }
        return paginasVisibles
    }

    // Efecto para reiniciar la página actual cuando cambia el término de búsqueda o el filtro
    useEffect(() => {
        const cargarTerrenos = async () => {
            try {
                const data = await getTerrenos()
                setTerrenos(data)
            } catch (e) {
                console.error("Error al cargar terrenos", e)
                Swal.fire({
                    icon: "error",
                    title: "Error de Carga",
                    text: "No se pudieron cargar los terrenos. Inténtalo de nuevo más tarde.",
                })
            }
        }
        cargarTerrenos()
        setPaginaActual(1)
    }, [searchTerm, filterOption])

    // Cerrar todos los modales
    const closeAllModals = () => {
        setModalNuevoTerreno(false)
        setModalEditarTerreno(false)
        setModalConfirmarGuardarTerreno(false)
        setModalExitoTerreno(false)
        setModalConfirmarEditarTerreno(false)
        setModalExitoEditarTerreno(false)
        setModalConfirmarEliminarTerreno(false)
    }

    // Efecto para cerrar modales con ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                closeAllModals()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    // Efecto para cerrar el modal de éxito después de un tiempo
    useEffect(() => {
        if (modalExitoEditarTerreno) {
            const timer = setTimeout(() => {
                setModalExitoEditarTerreno(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [modalExitoEditarTerreno])


    // Actualizar Terreno
    const handleActualizarTerreno = async () => {
        const form = document.getElementById("form-editar-terreno") as HTMLFormElement
        if (!terrenoSeleccionado || !form) return

        const tipo_terreno = (form.elements.namedItem("tipo") as HTMLSelectElement).value
        const area = parseFloat((form.elements.namedItem("area") as HTMLInputElement).value)
        const precio_terreno = parseFloat((form.elements.namedItem("precio") as HTMLInputElement).value)
        const estado_terreno = (form.elements.namedItem("estado") as HTMLSelectElement).value

        const actualizado: Terreno = {
        ...terrenoSeleccionado,
        tipo_terreno: tipo_terreno as Terreno["tipo_terreno"],
        area,
        precio_terreno,
        estado_terreno: estado_terreno as Terreno["estado_terreno"]
        }

        try {
        const result = await editarTerreno(actualizado)
        if (result.success) {
            Swal.fire("Actualizado", result.message, "success")
            setModalEditarTerreno(false)
            const data = await getTerrenos()
            setTerrenos(data)
        } else {
            Swal.fire("Error", result.message, "error")
        }
        } catch (error) {
        console.error("Error al actualizar terreno", error)
        Swal.fire("Error", "No se pudo actualizar el terreno", "error")
        }
    }

    // Insertar Terreno
    const handleInsertarTerreno = async () => {
        const form = document.getElementById("form-nuevo-terreno") as HTMLFormElement;
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        // Lee valores
        const idProyecto = form.proyecto.value;
        const etapa = form.etapa.value;
        const tipo = form.tipo.value;
        const manzanaValue = manzana;
        const numeroLoteValue = numeroLote; 
        const area = form.ingresoAream2.value;
        const precio = form.ingresoPrecioTerreno.value;
        
        // Genera código de unidad: manzana + número de lote (ej. "A - 5")
        const codigoUnidad = `${manzanaValue} - ${numeroLoteValue}`;
        
        // Estado por defecto
        const estado = "Disponible";
        
        // Construye FormData
        const formData = new FormData();
        formData.append("idProyecto", idProyecto);
        formData.append("etapa", etapa);
        formData.append("tipo", tipo);
        formData.append("manzana", manzanaValue);
        formData.append("numeroLote", numeroLoteValue);
        formData.append("area", area);
        formData.append("precio", precio);
        formData.append("estado", estado);
        formData.append("codigoUnidad", codigoUnidad);
        
        // Llama API
        const { success, message } = await insertarTerreno(formData);
        
        if (success) {
            Swal.fire("Insertado", message, "success");
            setModalNuevoTerreno(false);
        
            // Limpia estados controlados
            setManzana("");
            setNumeroLote("");
            setCantidadEtapas(0);
        
            const data = await getTerrenos();
            setTerrenos(data);
        } else {
            Swal.fire("Error", message, "error");
        }
    };      

    return (
        <div className="contenedor-terreno">
            <header>
                <div className="terreno-container">
                    <h1
                        style={{
                            fontSize: "24px",
                            color: "white",
                        }}
                    >
                        Terrenos
                    </h1>

                    <div className="terreno-buttons">
                        <button 
                            className="terreno-btn-primary"
                            disabled={!terrenoSeleccionadoId}
                            onClick={handleIrAVenta}
                            >
                            Ir a Venta
                        </button>

                        <button className="terreno-btn-primary" onClick={() => setModalNuevoTerreno(true)}>
                            <FontAwesomeIcon icon={faPlus} /> Agregar
                        </button>
                    </div>
                </div>
            </header>

            <div className="buscarterreno-container">
                <div className="buscarterreno-box">
                    <input
                        placeholder="Buscar por proyecto, etapa, manzana..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FontAwesomeIcon icon={faSearch} className="terreno-search-icon" />
                </div>

                <div className="filtrarterreno-box">
                    <select value={filterOption} onChange={(e) => setFilterOption(e.target.value)}>
                        <option value="">Filtrar por...</option>
                        <option value="Proyecto">Proyecto</option>
                        <option value="Etapa">Etapa</option>
                        <option value="Estado">Estado</option>
                    </select>
                </div>
            </div>

            <div className="terreno-table-container">
                <table className="terreno-table">
                    <thead>
                        <tr>
                            <th className="columna-checkbox"></th>
                            <th>ID</th>
                            <th>Proyecto</th>
                            <th>Etapa</th>
                            <th>Codigo-Unidad</th>
                            <th>Área</th>
                            <th>Precio</th>
                            <th>Tipo</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {terrenosPaginaActual.map((terreno) => (
                            <tr key={terreno.id_terreno}>
                                <td>
                                    <input
                                        type="checkbox"
                                        className="checkbox-terreno"
                                        checked={terrenoSeleccionadoId === terreno.id_terreno}
                                        onChange={() => handleCheckboxChange(terreno.id_terreno)}
                                    />
                                </td>
                                <td>{terreno.id_proyecto}</td>
                                <td>{terreno.nombre_proyecto}</td>
                                <td>{terreno.etapa}</td>
                                <td>{terreno.codigo_unidad}</td>
                                <td>{terreno.area} m²</td>
                                <td>${formatPrice(terreno.precio_terreno)}</td>
                                <td>{terreno.tipo_terreno}</td>
                                <td>
                                    {terreno.estado_terreno !== "Eliminado" && (
                                        <span className={`terreno-estado ${getStatusClass(terreno.estado_terreno)}`}>
                                        {terreno.estado_terreno.replace(/([a-z])([A-Z])/g, "$1 $2")}
                                        </span>
                                    )}
                                </td>
                                <td className="terreno-columna-acciones">
                                    <div className="terreno-btn-action">
                                        <button
                                            className="terreno-btn-icon terreno-btn-edit"
                                            title="Editar"
                                            onClick={() => openEditModal(terreno)}
                                        >
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                        <button
                                            className="terreno-btn-icon terreno-btn-delete"
                                            title="Eliminar"
                                            onClick={() => openDeleteModal(terreno.id_terreno)}
                                            >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Paginador */}
            {terrenosFiltrados.length > 0 && (
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

                {/* Puntos suspensivos al inicio si aplica */}
                {(() => {
                    const primeraPagina = getPaginasVisibles()[0];
                    return (
                    typeof primeraPagina === "number" &&
                    primeraPagina > 1 && (
                        <span className="paginacion-ellipsis">...</span>
                    )
                    );
                })()}

                {/* Botones de número de página */}
                {getPaginasVisibles().map((page, index) => (
                    <button
                    key={index}
                    className={`btn-paginacion ${
                        paginaActual === page ? "activo" : ""
                    }`}
                    onClick={() => typeof page === "number" && cambiarPagina(page)}
                    disabled={typeof page !== "number"}
                    >
                    {page}
                    </button>
                ))}

                {/* Puntos suspensivos al final si aplica */}
                {(() => {
                    const ultimaPagina = getPaginasVisibles().slice(-1)[0];
                    return (
                    typeof ultimaPagina === "number" &&
                    ultimaPagina < numeroTotalPaginas && (
                        <span className="paginacion-ellipsis">...</span>
                    )
                    );
                })()}

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
                <label htmlFor="terrenosPorPagina">Terrenos por página:</label>
                <select
                    id="terrenosPorPagina"
                    value={terrenosPorPagina}
                    onChange={(e) => {
                    setTerrenosPorPagina(Number(e.target.value));
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

            {/* Modal para Nuevo Terreno */}
            {modalNuevoTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle">
                                    <FontAwesomeIcon icon={faMap} />
                                </div>
                                <div>
                                    <h2>Nuevo Terreno</h2>
                                    <p>
                                        Bienvenido a la creación de terreno. No olvide que los campos deben estar en proyecto creado, si el
                                        campo no existe debe crearlo en la sección de catálogos.
                                    </p>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalNuevoTerreno(false)}>
                                &times;
                            </span>
                        </div>
                        <div className="terreno-modal-body">
                            <form id="form-nuevo-terreno">
                                <div className="terreno-form-group">
                                    <label htmlFor="proyecto">Selecciona el Proyecto*</label>
                                    <select id="proyecto" name="proyecto" required onChange={handleProyectoChange}>
                                        <option value="">Seleccione un proyecto</option>
                                        {proyectos.map((proyecto) => (
                                            <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                                                {proyecto.nombre_proyecto}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="terreno-form-group">
                                    <label htmlFor="etapa">Selecciona la Etapa*</label>
                                    <select id="etapa" name="etapa" required disabled={cantidadEtapas === 0}>
                                        <option value="">Seleccionar...</option>
                                        {Array.from({ length: cantidadEtapas }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {i + 1}
                                        </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="terreno-form-group">
                                    <label htmlFor="manzana">Selecciona la Manzana*</label>
                                    <input id="manzana" type="text" maxLength={1} value={manzana} onChange={handleManzanaChange} required/>
                                </div>
                                <div className="terreno-form-group">
                                    <label>Número de Lote*</label>
                                    <input
                                        name="numero_lote"
                                        type="text"
                                        placeholder="Ej: 5"
                                        value={numeroLote}
                                        onChange={handleNumeroLoteChange}
                                        min={1}
                                        required
                                    />
                                    </div>
                                <div className="terreno-form-group">
                                    <label htmlFor="tipo">Tipo de terreno*</label>
                                    <select id="tipo" name="tipo" required>
                                        <option value="">Seleccion el tipo</option>
                                        <option value="Calle">Calle</option>
                                        <option value="Avenida">Avenida</option>
                                        <option value="Esquina">Esquina</option>
                                        <option value="Parque">Parque</option>
                                        <option value="Esquina_Parque">Esquina - Parque</option>
                                    </select>
                                </div>
                                <div className="terreno-form-group">
                                    <label>Área m²*</label>
                                    <input
                                        name="area"
                                        id="ingresoAream2"
                                        type="text"
                                        placeholder="Ingrese Área m²"
                                        inputMode="decimal"
                                        required
                                        pattern="^\d{1,10}(\.\d{1,2})?$"
                                        title="Solo números. Máximo 10 dígitos enteros y 2 decimales"
                                        onInput={(e) => {
                                            e.currentTarget.value = e.currentTarget.value
                                            .replace(/[^\d.]/g, '')
                                            .replace(/^(\d{4})\d+/, '$1') // Limita enteros
                                            .replace(/(\..*)\./g, '$1')   // Solo un punto
                                            .replace(/^(\d+)(\.\d{0,2})?.*$/, '$1$2') // Solo 2 decimales
                                        }}
                                        />
                                </div>
                                <div className="terreno-form-group">
                                    <label>Precio*</label>
                                    <div className="terreno-price-input">
                                        <span>$</span>
                                        <input
                                        name="precio"
                                        id="ingresoPrecioTerreno"
                                        type="text"
                                        placeholder="Ingrese Precio"
                                        inputMode="decimal"
                                        required
                                        pattern="^\d{1,10}(\.\d{1,2})?$"
                                        title="Solo números. Máximo 10 dígitos enteros y 2 decimales"
                                        onInput={(e) => {
                                            e.currentTarget.value = e.currentTarget.value
                                            .replace(/[^\d.]/g, '')
                                            .replace(/^(\d{6})\d+/, '$1') // Limita enteros
                                            .replace(/(\..*)\./g, '$1')   // Solo un punto
                                            .replace(/^(\d+)(\.\d{0,2})?.*$/, '$1$2') // Solo 2 decimales
                                        }}
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="terreno-modal-footer">
                            <button className="terreno-btn-secondary" onClick={() => setModalNuevoTerreno(false)}>
                                Cancelar
                            </button>
                            <button type="button" className="terreno-btn-primary-modal" onClick={handleInsertarTerreno}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Editar Terreno */}
            {modalEditarTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle">
                                    <FontAwesomeIcon icon={faMap} />
                                </div>
                                <div>
                                    <h2>Editar Terreno</h2>
                                    <p>
                                        Bienvenido a la edición de terreno. Solo puedes modificar los campos visibles. Si el campo contiene
                                        un candado, no se puede modificar.
                                    </p>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalEditarTerreno(false)}>&times;</span>
                        </div>
                        <div className="terreno-modal-body">
                            <form id="form-editar-terreno">
                                <div className="terreno-form-group">
                                    <label>Tipo de terreno*</label>
                                    <select name="tipo" required>
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Calle">CALLE</option>
                                        <option value="Avenida">AVENIDA</option>
                                        <option value="Esquina">ESQUINA</option>
                                        <option value="Parque">PARQUE</option>
                                        <option value="Esquina_Parque">ESQUINA-PARQUE</option>
                                        </select>
                                </div>
                                <div className="terreno-form-group">
                                    <label>Área m²*</label>
                                    <input name="area" type="number" step="0.01" defaultValue={terrenoSeleccionado!.area} required />
                                </div>
                                <div className="terreno-form-group">
                                    <label>Precio*</label>
                                    <div className="terreno-price-input">
                                        <span>$</span>
                                        <input name="precio" type="number" step="0.01" defaultValue={terrenoSeleccionado!.precio_terreno} required />
                                    </div>
                                </div>
                                <div className="terreno-form-group">
                                    <label>Estado*</label>
                                    <select name="estado" defaultValue={terrenoSeleccionado!.estado_terreno} required>
                                        <option value="" disabled>Seleccionar...</option>
                                        <option value="Disponible">Disponible</option>
                                        <option value="Reservado">Reservado</option>
                                        <option value="NoDisponible">No Disponible</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div className="terreno-modal-footer">
                            <button className="terreno-btn-secondary" onClick={() => setModalEditarTerreno(false)}>Cancelar</button>
                            <button className="terreno-btn-primary-modal" onClick={handleActualizarTerreno}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Guardar */}
            {modalConfirmarGuardarTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content terreno-modal-small">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle terreno-icon-warning">
                                    <FontAwesomeIcon icon={faExclamation} />
                                </div>
                                <div>
                                    <h2>¿Desea guardar el nuevo Terreno?</h2>
                                    <p>
                                        Recuerde que al guardar un nuevo terreno, no podrá eliminarlo, solo podrá cambiar su estado a
                                        "Inactivo".
                                    </p>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalConfirmarGuardarTerreno(false)}>
                                &times;
                            </span>
                        </div>
                        <div className="terreno-modal-footer">
                            <button
                                className="terreno-btn-secondary"
                                onClick={() => {
                                    setModalConfirmarGuardarTerreno(false)
                                    setModalNuevoTerreno(true)
                                }}
                            >
                                Atrás
                            </button>
                            <button
                                className="terreno-btn-danger"
                                onClick={() => {
                                    setModalConfirmarGuardarTerreno(false)
                                    setModalExitoTerreno(true)
                                }}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Éxito */}
            {modalExitoTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content terreno-modal-small">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle terreno-icon-success">
                                    <FontAwesomeIcon icon={faCheck} />
                                </div>
                                <div>
                                    <h2>Se ha creado un nuevo Terreno !!</h2>
                                    <p>
                                        Su Terreno fue creado con el siguiente código: su número Terreno, en el proyecto [Proyecto], en la
                                        manzana [Manzana].
                                    </p>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalExitoTerreno(false)}>
                                &times;
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Editar */}
            {modalConfirmarEditarTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content terreno-modal-small">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle terreno-icon-warning">
                                    <FontAwesomeIcon icon={faExclamation} />
                                </div>
                                <div>
                                    <h2>¿Desea guardar los cambios en el terreno?</h2>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalConfirmarEditarTerreno(false)}>
                                &times;
                            </span>
                        </div>
                        <div className="terreno-modal-footer">
                            <button
                                className="terreno-btn-secondary"
                                onClick={() => {
                                    setModalConfirmarEditarTerreno(false)
                                    setModalEditarTerreno(true)
                                }}
                            >
                                Atrás
                            </button>
                            <button
                                className="terreno-btn-danger"
                                onClick={() => {
                                    setModalConfirmarEditarTerreno(false)
                                    setModalExitoEditarTerreno(true)
                                }}
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Éxito para Editar */}
            {modalExitoEditarTerreno && (
                <div className="terreno-modal">
                    <div className="terreno-modal-content terreno-modal-small">
                        <div className="terreno-modal-header">
                            <div className="terreno-modal-title">
                                <div className="terreno-icon-circle terreno-icon-success">
                                    <FontAwesomeIcon icon={faCheck} />
                                </div>
                                <div>
                                    <h2>Se ha modificado correctamente el Terreno !!</h2>
                                </div>
                            </div>
                            <span className="terreno-close" onClick={() => setModalExitoEditarTerreno(false)}>
                                &times;
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Overlay para modales */}
            <div
                className="terreno-modal-overlay"
                style={{
                    display:
                        modalNuevoTerreno ||
                            modalEditarTerreno ||
                            modalConfirmarGuardarTerreno ||
                            modalExitoTerreno ||
                            modalConfirmarEditarTerreno ||
                            modalExitoEditarTerreno ||
                            modalConfirmarEliminarTerreno
                            ? "block"
                            : "none",
                }}
                onClick={closeAllModals}
            ></div>
        </div>
    )
}

export default Terrenos