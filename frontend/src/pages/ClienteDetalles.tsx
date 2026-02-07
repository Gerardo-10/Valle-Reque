import "../styles/cliente-detalles.css";
import { actualizarCliente, actualizarClienteFamiliar, getClienteById, insertarClienteFamiliar } from "../api/clientes";
import type { Cliente } from "../types/Clientes";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faPenToSquare, faPrint, faTimes, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const ClienteDetalles = () => {
    const { id } = useParams<{ id: string }>();
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [modalEditarClienteAbierto, setModalEditarClienteAbierto] = useState(false);
    const [modalEditarClienteFamiliarAbierto, setModalEditarClienteFamiliarAbierto] = useState(false);



    useEffect(() => {
        console.log("ID desde useParams:", id);
        const fetchCliente = async () => {
            try {
                console.log("Cargando cliente...");
                const data = await getClienteById(Number(id));
                console.log("Datos recibidos:", data);
                setCliente(data);
            } catch (error) {
                console.error("Error al cargar los detalles del cliente:", error);
            }
        };
        fetchCliente();
    }, [id]);

    const [formularioCliente, setFormularioCliente] = useState({
        id_cliente: "",
        nombre: "",
        apellidos: "",
        dni: "",
        direccion: "",
        correo: "",
        telefono: "",
        ocupacion: "",
        ingreso_neto: "",
        estado_cliente: "",
        carga_familiar: "0",
    });

    const tieneCargaFamiliar = (cliente?.carga_familiar ?? []).length > 0;

    useEffect(() => {
        if (modalEditarClienteAbierto && cliente) {
            setFormularioCliente({
                id_cliente: cliente.id_cliente ? String(cliente.id_cliente) : "",
                nombre: cliente.nombre || "",
                apellidos: cliente.apellidos || "",
                dni: cliente.dni || "",
                direccion: cliente.direccion || "",
                correo: cliente.correo || "",
                telefono: cliente.telefono || "",
                ocupacion: cliente.ocupacion || "",
                ingreso_neto: cliente.ingreso_neto ? String(cliente.ingreso_neto) : "",
                estado_cliente: cliente.estado_cliente|| "",
                carga_familiar: cliente.carga_familiar && cliente.carga_familiar.length > 0 ? "1" : "0",
            });
        }
    }, [modalEditarClienteAbierto, cliente, tieneCargaFamiliar]);

    const [formularioClienteFamiliar, setFormularioClienteFamiliar] = useState({
        id_familia: "",
        id_cliente: "",
        nombre: "",
        apellidos: "",
        dni: "",
        es_cotitular: "",
    });

    useEffect(() => {
        if (
            modalEditarClienteFamiliarAbierto &&
            cliente &&
            cliente.carga_familiar.length > 0
        ) {
            const familiar = cliente.carga_familiar[0];
            setFormularioClienteFamiliar({
                id_familia: familiar.id_familia ? String(familiar.id_familia) : "",
                id_cliente: cliente.id_cliente ? String(cliente.id_cliente) : "",
                nombre: familiar.nombre || "",
                apellidos: familiar.apellido || "",
                dni: familiar.dni || "",
                es_cotitular: familiar.cotitular ? String(familiar.cotitular) : "",
            });
        }
    }, [modalEditarClienteFamiliarAbierto, cliente]);

    const handleSubmitEditarCliente = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formularioCliente.apellidos.trim().includes(" ")) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El apellido debe contener al menos dos.",
            })
            return;
        }

        if (
            !formularioCliente.telefono.startsWith("9") ||
            formularioCliente.telefono.length !== 9
        ) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El teléfono debe iniciar con 9 y tener 9 dígitos",
            })
            return;
        }

        const correoRegex =
            /^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.(com|es)$/;
        if (!correoRegex.test(formularioCliente.correo)) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "El correo debe ser gmail, hotmail u outlook",
            })
            return;
        }


        if (!cliente?.id_cliente) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "ID de cliente no encontrado. No se puede actualizar.",
            });
            return;
        }

        const clienteActualizado = {
            id_cliente: cliente?.id_cliente,
            nombre: formularioCliente.nombre.toUpperCase(),
            apellidos: formularioCliente.apellidos.toUpperCase(),
            dni: formularioCliente.dni,
            direccion: formularioCliente.direccion,
            correo: formularioCliente.correo,
            telefono: formularioCliente.telefono,
            ocupacion: formularioCliente.ocupacion,
            ingreso_neto: parseFloat(formularioCliente.ingreso_neto),
            estado: cliente.estado, // se mantiene
            estado_cliente: formularioCliente.estado_cliente,
            carga_familiar: cliente.carga_familiar,
        };

        try {
            const response = await actualizarCliente(clienteActualizado);
            const clienteActualizadoRefrescado = await getClienteById(Number(cliente.id_cliente));
            setCliente(clienteActualizadoRefrescado);

            setModalEditarClienteAbierto(false); // cerrar modal cliente

            Swal.fire({
                icon: 'success',
                title: 'Cliente actualizado',
                text: response.message || "Los datos fueron actualizados correctamente.",
                confirmButtonText: "Aceptar",
            }).then(() => {
                if (formularioCliente.carga_familiar === "1") {
                    setModalEditarClienteFamiliarAbierto(true);
                }
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
                        : "Hubo un error al actualizar el cliente.",
            });
        }
    };

    const handleSubmitEditarFamiliar = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formularioClienteFamiliar.apellidos.trim().includes(" ")) {
            Swal.fire({
            icon: "error",
            title: "Error",
            text: "El apellido debe contener al menos dos.",
            });
            return;
        }

        // Prepara la data del familiar
        const familiarData = {
            id_familia: formularioClienteFamiliar.id_familia,
            id_cliente: cliente?.id_cliente,
            nombre: formularioClienteFamiliar.nombre.toUpperCase(),
            apellido: formularioClienteFamiliar.apellidos.toUpperCase(),
            dni: formularioClienteFamiliar.dni,
            cotitular: formularioClienteFamiliar.es_cotitular === "true" ? 1 : 0,
        };

        console.log("Datos familiar a enviar:", familiarData);

        try {
            let response;

            if (!formularioClienteFamiliar.id_familia) {
                // Si no tiene id_familia, insertar
                response = await insertarClienteFamiliar(familiarData);
            } else {
                // Si tiene id_familia, actualizar
                response = await actualizarClienteFamiliar(familiarData);
            }

            // Cerrar modal y refrescar cliente
            setModalEditarClienteFamiliarAbierto(false);
            const clienteActualizado = await getClienteById(Number(cliente?.id_cliente));
            setCliente(clienteActualizado);

            Swal.fire({
                icon: "success",
                title: "Familiar guardado",
                text: response.message || "Los datos fueron guardados correctamente.",
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
                        : "Hubo un error al guardar el familiar.",
            });
        }
    };

    if (!cliente) {
        return (
            <div className="loader-container">
                <img className="spin" src="/logo.png" alt="Cargando..." width={50} height={50} />
                <div className="loader-text">Cargando detalles del cliente...</div>
            </div>
        );
    }

    return (
        <div className="cliente-detalles-contenedor">
            <div className="cliente-detalles-tarjeta">
                <div className="cliente-detalles-encabezado">
                    <div className="cliente-resumen">
                        <div className="resumen-grid">
                            <div>
                                <p className="resumen-label">N° de Refinanciamientos:</p>
                                <p className="resumen-value">0</p>
                            </div>
                            <div>
                                <p className="resumen-label">N° de Traspasos:</p>
                                <p className="resumen-value">0</p>
                            </div>
                            <div>
                                <p className="resumen-label">Cambios de Titularidad:</p>
                                <p className="resumen-value">No</p>
                            </div>
                            <div>
                                <p className="resumen-label">Estado</p>
                                <p className="resumen-value" data-field="estado">{cliente.estado ? "Activo" : "Inactivo"}</p>
                            </div>
                        </div>
                    </div>

                    <div className="cliente-detalles-informacion">
                        <h2 data-field="nombre">{cliente.nombre}</h2>
                        <p data-field="correo">{cliente.correo}</p>
                    </div>

                    <div className="cliente-detalles-foto">
                        <img src="/perfil.png" alt="Foto del Cliente" />
                    </div>
                </div>

                <div className="section">
                    <div className="section-header">
                        <h3>Datos Personales</h3>
                        <button className="edit-button" onClick={() => setModalEditarClienteAbierto(true)}>
                            <FontAwesomeIcon icon={faPenToSquare} />Editar
                        </button>
                    </div>

                    <div className="data-grid">
                        <div className="data-item">
                            <p className="data-label">Nombre</p>
                            <p className="data-value" data-field="nombre">{cliente.nombre}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Apellidos</p>
                            <p className="data-value" data-field="apellido">{cliente.apellidos}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Dirección</p>
                            <p className="data-value" data-field="direccion">{cliente.direccion}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Ingreso Neto</p>
                            <p className="data-value" data-field="ingreso_neto">{cliente.ingreso_neto}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">DNI</p>
                            <p className="data-value" data-field="dni">{cliente.dni}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Teléfono</p>
                            <p className="data-value" data-field="telefono">{cliente.telefono}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Ocupación</p>
                            <p className="data-value" data-field="ocupacion">{cliente.ocupacion}</p>
                        </div>
                        <div className="data-item">
                            <p className="data-label">Carga Familiar</p>
                            <p className="data-value" data-field="carga_familiar">{tieneCargaFamiliar ? "Sí" : "No"}</p>
                        </div>
                    </div>
                </div>

                {tieneCargaFamiliar && (
                    <div className="section">
                        <div className="section-header">
                            <h3>Datos del Familiar o Cónyuge</h3>
                            <button className="edit-button" onClick={() => {
                                    setModalEditarClienteFamiliarAbierto(true);
                                }}>
                                <FontAwesomeIcon icon={faPenToSquare} />Editar
                            </button>
                        </div>

                        {cliente.carga_familiar.map((familiar) => (
                        <div className="data-grid" key={familiar.id_familia}>
                            <div className="data-item">
                                <p className="data-label">Nombre</p>
                                <p className="data-value" data-field="nombre">{familiar.nombre}</p>
                            </div>
                            <div className="data-item">
                                <p className="data-label">Apellidos</p>
                                <p className="data-value" data-field="apellidos">{familiar.apellido}</p>
                            </div>
                            <div className="data-item">
                                <p className="data-label">DNI</p>
                                <p className="data-value" data-field="dni">{familiar.dni}</p>
                            </div>
                        </div>
                        ))}
                    </div>
                )}

                <div className="section">
                    <div className="section-header">
                        <h3>Eventos</h3>
                    </div>

                    <div className="event-card">
                        <div className="event-icon">
                            <FontAwesomeIcon icon={faTriangleExclamation} />
                        </div>
                        <div className="event-details">
                            <div className="event-item">
                                <p className="event-label">Proyecto</p>
                                <p className="event-value">Valle Reque</p>
                            </div>
                            <div className="event-item">
                                <p className="event-label">Fecha de Contrato</p>
                                <p className="event-value">12/12/2022</p>
                            </div>
                            <div className="event-item">
                                <p className="event-label">Monto Amortizado</p>
                                <p className="event-value">S/. 1,244.45</p>
                            </div>
                            <div className="event-item">
                                <p className="event-label">Saldo Pendiente</p>
                                <p className="event-value">S/. 1,000.00</p>
                            </div>
                            <div className="event-item">
                                <p className="event-label">Cuotas Vencidas</p>
                                <p className="event-value">0</p>
                            </div>
                        </div>
                        <div className="event-actions">
                            <button className="action-button print-button"><FontAwesomeIcon icon={faPrint} /></button>
                            <button className="action-button export-button"><FontAwesomeIcon icon={faFileExport} /></button>
                        </div>
                    </div>
                </div>
            </div>

            {modalEditarClienteAbierto && (
                <div className="modal-overlay-cliente active">
                    <div className="modal-cliente modal-editar-cliente active">
                        <div className="modal-header-editar">
                            <div className="modal-icono">
                                <FontAwesomeIcon icon={faPenToSquare} />
                            </div>
                            <h2>Editar Datos Personales</h2>
                            <button
                                className="modal-cerrar-detalles"
                                onClick={() => setModalEditarClienteAbierto(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="modal-cuerpo">
                            <form id="formEditarCliente" onSubmit={handleSubmitEditarCliente}>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="nombre">Nombre</label>
                                        <input id="nombre" type="text" maxLength={50}
                                            value={formularioCliente.nombre}
                                            onChange={(e) => {
                                                const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
                                                if (regex.test(e.target.value) || e.target.value === "") {
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    nombre: e.target.value
                                                });
                                                }
                                            }}
                                            required />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="apellido">Apellido</label>
                                        <input id="apellido" type="text" maxLength={50}
                                            value={formularioCliente.apellidos}
                                            onChange={(e) => {
                                                const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
                                                if (regex.test(e.target.value) || e.target.value === "") {
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    apellidos: e.target.value
                                                });
                                                }
                                            }}
                                            required />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="dni">DNI</label>
                                        <input id="dni" type="text" maxLength={8}
                                            value={formularioCliente.dni}
                                            onChange={(e) => {
                                                const regex = /^[0-9]*$/;
                                                if (regex.test(e.target.value) || e.target.value === "") {
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    dni: e.target.value
                                                });
                                                }
                                            }}
                                            required />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="direccion">Dirección</label>
                                        <input id="direccion" type="text" maxLength={100}
                                            value={formularioCliente.direccion}
                                            onChange={(e) => setFormularioCliente({
                                                ...formularioCliente,
                                                direccion: e.target.value
                                            })}
                                            required />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="correo">Correo</label>
                                        <input id="correo" type="email" value={formularioCliente.correo}
                                            onChange={(e) => setFormularioCliente({
                                                ...formularioCliente,
                                                correo: e.target.value
                                            })}
                                            required />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="telefono">Teléfono</label>
                                        <input id="telefono" type="tel" maxLength={9} value={formularioCliente.telefono}
                                            onChange={(e) => {
                                                const regex = /^[0-9]*$/;
                                                if (regex.test(e.target.value) || e.target.value === "") {
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    telefono: e.target.value
                                                });
                                                }
                                            }}
                                            required />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="ocupacion">Ocupación</label>
                                        <input id="ocupacion" type="text" maxLength={50} value={formularioCliente.ocupacion}
                                            onChange={(e) => setFormularioCliente({
                                                ...formularioCliente,
                                                ocupacion: e.target.value
                                            })}
                                            required />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="ingresoNeto">Ingreso Neto</label>
                                        <input id="ingresoNeto" type="text" value={formularioCliente.ingreso_neto}
                                            onChange={(e) => {
                                            const regex = /^\d{0,10}(\.\d{0,2})?$/;
                                            if (regex.test(e.target.value) || e.target.value === "") {
                                            setFormularioCliente({
                                                ...formularioCliente,
                                                ingreso_neto: e.target.value
                                            });
                                            }
                                        }}
                                        required />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="estado">Estado</label>
                                        <select
                                            id="estado"
                                            value={formularioCliente.estado_cliente}
                                            onChange={(e) =>
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    estado_cliente: e.target.value
                                                })
                                            }
                                            required
                                        >
                                            <option value="" disabled>Seleccione un estado</option>
                                            <option value="SinEvaluar">Sin Evaluar</option>
                                            <option value="Activo">Activo</option>
                                            <option value="NoDisponible">No Disponible</option>
                                            <option value="Evaluado">Evaluado</option>
                                        </select>
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="cargaFamiliar">Carga Familiar</label>
                                        <select
                                            id="cargaFamiliar"
                                            value={formularioCliente.carga_familiar}
                                            onChange={(e) =>
                                                setFormularioCliente({
                                                    ...formularioCliente,
                                                    carga_familiar: e.target.value
                                                })
                                            }
                                            required
                                            disabled={formularioCliente.carga_familiar === "1"}
                                        >
                                            <option value="" disabled>Seleccione una opción</option>
                                            <option value="1">Sí</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-pie-form">
                                    <button type="button" className="btn-cancelar" onClick={() => setModalEditarClienteAbierto(false)}>
                                        Cancelar
                                    </button>
                                    <button className="btn-confirmar" type="submit">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarClienteFamiliarAbierto && (
                <div className="modal-overlay-cliente active">
                    <div className="modal-cliente modal-editar-cliente-familiar active">
                        <div className="modal-header-editar">
                            <div className="modal-icono"><FontAwesomeIcon icon={faPenToSquare} /></div>
                            <h2>Editar Datos del Familiar o Cónyuge</h2>
                            <button
                                className="modal-cerrar-detalles"
                                onClick={() => setModalEditarClienteFamiliarAbierto(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="modal-cuerpo">
                            <form id="formEditarClienteFamiliar" onSubmit={handleSubmitEditarFamiliar}>
                                <div className="form-grupo">
                                    <label htmlFor="familiarNombre">Nombre</label>
                                    <input id="familiarNombre" type="text" maxLength={50}
                                        value={formularioClienteFamiliar.nombre}
                                        onChange={(e) => {
                                            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
                                            if (regex.test(e.target.value) || e.target.value === "") {
                                            setFormularioClienteFamiliar({
                                                ...formularioClienteFamiliar,
                                                nombre: e.target.value,
                                            });
                                            }
                                        }}
                                        required />
                                </div>
                                <div className="form-grupo">
                                    <label htmlFor="familiarApellido">Apellido</label>
                                    <input id="familiarApellido" type="text" maxLength={50}
                                        value={formularioClienteFamiliar.apellidos}
                                        onChange={(e) => {
                                            const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]*$/;
                                            if (regex.test(e.target.value) || e.target.value === "") {
                                            setFormularioClienteFamiliar({
                                                ...formularioClienteFamiliar,
                                                apellidos: e.target.value,
                                            });
                                            }
                                        }}
                                        required />
                                </div>
                                <div className="form-grupo">
                                    <label htmlFor="familiarDni">DNI</label>
                                    <input id="familiarDni" type="text" maxLength={8}
                                        value={formularioClienteFamiliar.dni}
                                        onChange={(e) => {
                                            const regex = /^[0-9]*$/;
                                            if (regex.test(e.target.value) || e.target.value === "") {
                                            setFormularioClienteFamiliar({
                                                ...formularioClienteFamiliar,
                                                dni: e.target.value,
                                            });
                                            }
                                        }}
                                        required />
                                </div>

                                <div className="modal-pie-form">
                                    <button type="button" className="btn-cancelar" onClick={() => setModalEditarClienteFamiliarAbierto(false)}>
                                        Cancelar
                                    </button>
                                    <button className="btn-confirmar" type="submit">
                                        Guardar Cambios
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClienteDetalles;
