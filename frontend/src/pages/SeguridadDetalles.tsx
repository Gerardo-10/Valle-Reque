import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { actualizarEmpleado, actualizarUsuario, cambiarContraseña, getEmpleadoById } from "../api/seguridad";
import type { SeguridadData } from "../types/Seguridad";
import "../styles/seguridad-detalles.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faEye, faKey, faPenToSquare, faPhone, faTimes } from "@fortawesome/free-solid-svg-icons";
import type { AreaData } from "../types/AreaData";
import { obtenerAreas } from "../api/area";
import type { RolData } from "../types/RolData";
import { obtenerRoles } from "../api/rol";
import Swal from "sweetalert2";

const SeguridadDetalles = () => {
    const [empleado, setEmpleado] = useState<SeguridadData | null>(null);
    const { id } = useParams<{ id: string }>();
    const [modalEditarEmpleadoAbierto, setModalEditarEmpleadoAbierto] = useState(false);
    const [modalEditarUsuarioAbierto, setModalEditarUsuarioAbierto] = useState(false);
    const [modalEditarContraseñaAbierto, setModalEditarContraseñaAbierto] = useState(false);
    const [areas, setAreas] = useState<AreaData[]>([]);
    const [roles, setRoles] = useState<RolData[]>([]);

    useEffect(() => {
        const fetchAreas = async () => {
            try {
                const data = await obtenerAreas();
                setAreas(data);
            } catch (error) {
                console.error("Error al obtener áreas", error);
            }
        };

        fetchAreas();
    }, []);

    const [formularioEmpleado, setFormularioEmpleado] = useState({
        id_empleado: "",
        nombre: "",
        apellido: "",
        direccion: "",
        correo: "",
        telefono: "",
        dni: "",
    });
    
    useEffect(() => {
        if (modalEditarEmpleadoAbierto && empleado) {
            setFormularioEmpleado({
            id_empleado: empleado.id_empleado.toString(),
            nombre: empleado.nombre || "",
            apellido: empleado.apellido || "",
            direccion: empleado.direccion || "",
            correo: empleado.correo || "",
            telefono: empleado.telefono || "",
            dni: empleado.dni || "",
            });
        }
    }, [modalEditarEmpleadoAbierto, empleado]);

    const [formularioUsuario, setFormularioUsuario] = useState({
        id_empleado: "",
        id_rol: "",
        id_area: "",
        estado: "",
    });

    useEffect(() => {
        if (modalEditarUsuarioAbierto && empleado) {
            setFormularioUsuario({
                id_empleado: empleado.id_empleado.toString(),
                id_rol: empleado.usuario?.id_rol != null ? empleado.usuario.id_rol.toString() : "",
                id_area: empleado.id_area?.id_area != null ? empleado.id_area.id_area.toString() : "",
                estado: empleado.usuario?.estado ? "1" : "0",
            });
        }
    }, [modalEditarUsuarioAbierto, empleado]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await obtenerRoles();
                console.log("Roles recibidos:", data);
                setRoles(data);
            } catch (error) {
                console.error("Error al obtener roles", error);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        console.log("ID desde useParams:", id);
        const fetchEmpleado = async () => {
            try {
            console.log("Cargando empleado...");
            const data = await getEmpleadoById(Number(id));
            console.log("Datos recibidos:", data);
            setEmpleado(data);
            } catch (error) {
            console.error("Error al cargar los detalles del empleado:", error);
            }
        };
        fetchEmpleado();
    }, [id]);

    useEffect(() => {
        const toggleButtons = document.querySelectorAll(".toggle-password");
        toggleButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const input = btn.previousElementSibling as HTMLInputElement;
                input.type = input.type === "password" ? "text" : "password";
                btn.classList.toggle("active");
            });
        });
    
        return () => {
            toggleButtons.forEach(btn => {
                btn.removeEventListener("click", () => {});
            });
        };
    }, [modalEditarContraseñaAbierto]);

    function formatearFecha(fechaTexto: string | number | Date) {
        const fecha = new Date(fechaTexto);
        const dia = String(fecha.getDate()).padStart(2, "0");
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    }

    const handleSubmitEditarEmpleado = async (e: React.FormEvent) => {
        e.preventDefault();

        const datosActualizados = {
            id_empleado: formularioEmpleado.id_empleado,
            direccion: formularioEmpleado.direccion.trim(),
            correo: formularioEmpleado.correo.trim(),
            telefono: formularioEmpleado.telefono.trim(),
        };

        try {
            const res = await actualizarEmpleado(datosActualizados);
            setModalEditarEmpleadoAbierto(false);
            const empleadoActualizado = await getEmpleadoById(Number(id));
            setEmpleado(empleadoActualizado);
            Swal.fire({
                icon: "success",
                title: "Empleado Actualizado",
                text: res.message || "Los datos fueron actualizados correctamente.",
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
                    : "Hubo un error al actualizar el empleado.",
            });
        }
    };

    const handleSubmitEditarUsuario = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar campos requeridos antes de enviar
        if (!formularioUsuario.id_rol || !formularioUsuario.id_area) {
            Swal.fire({
                icon: "error",
                title: "Campos faltantes",
                text: "Rol y área son campos requeridos.",
            });
            return;
        }

        const datosActualizados = {
            id_empleado: formularioUsuario.id_empleado,
            id_rol: parseInt(formularioUsuario.id_rol),
            id_area: parseInt(formularioUsuario.id_area),
            estado: parseInt(formularioUsuario.estado),
        };

        try {
            const res = await actualizarUsuario(datosActualizados);
            setModalEditarUsuarioAbierto(false);
            const empleadoActualizado = await getEmpleadoById(Number(formularioUsuario.id_empleado));
            setEmpleado(empleadoActualizado);
            Swal.fire({
                icon: "success",
                title: "Usuario Actualizado",
                text: res.message || "Los datos del usuario fueron actualizados correctamente.",
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
                        : "Hubo un error al actualizar el usuario.",
            });
        }
    };

    const handleSubmitEditarContraseña = async (e: React.FormEvent) => {
        e.preventDefault();
    
        const actual = (document.getElementById("passwordActual") as HTMLInputElement).value;
        const nueva = (document.getElementById("passwordNueva") as HTMLInputElement).value;
        const confirmar = (document.getElementById("passwordConfirmar") as HTMLInputElement).value;
    
        // Validar que todas estén llenas
        if (!actual || !nueva || !confirmar) {
            Swal.fire("Error", "Todos los campos son obligatorios", "error");
            return;
        }
    
        // Validar nueva contraseña con requisitos
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!regex.test(nueva)) {
            Swal.fire("Error", "La nueva contraseña no cumple con los requisitos de seguridad", "error");
            return;
        }
    
        // Validar coincidencia
        if (nueva !== confirmar) {
            Swal.fire("Error", "Las contraseñas no coinciden", "error");
            return;
        }
    
        try {
            const res = await cambiarContraseña({
                id_empleado: id,
                actual,
                nueva
            });
    
            Swal.fire("Éxito", res.message || "Contraseña actualizada correctamente", "success");
            setModalEditarContraseñaAbierto(false);
        } catch (error: unknown) {
            const errorMessage =
                typeof error === "object" && error !== null && "message" in error
                    ? (error as { message?: string }).message
                    : "No se pudo actualizar la contraseña";
            Swal.fire("Error", errorMessage, "error");
        }
    };
    

    if (!empleado) {
        return (
            <div className="loader-container">
                <img className="spin" src="/logo.png" alt="Cargando..." width={50} height={50} />
                <div className="loader-text">Cargando detalles del empleado...</div>
            </div>
        );
    }
    return (
        <div className="seguridad-detalles-contenedor">
            <div className="seguridad-detalles-tarjeta">
                <div className="seguridad-detalles-encabezado">
                    <div className="seguridad-detalles-avatar">
                        <img src="/perfil.png" alt="Foto de Perfil del Empleado" />
                    </div>

                    <div className="seguridad-detalles-informacion-basica">
                        <h2>{empleado.nombre} {empleado.apellido}</h2>
                        <p className="seguridad-detalles-rol">{empleado.usuario?.rol}</p>
                        <div className="seguridad-detalles-contacto">
                            <span><FontAwesomeIcon icon={faEnvelope} /> {empleado.correo}</span>
                            <span><FontAwesomeIcon icon={faPhone} /> {empleado.telefono}</span>
                        </div>
                    </div>
                </div>

                <div className="seguridad-detalles-contenido">
                    <div className="seguridad-detalles-seccion">
                        <h3>Información Personal</h3>
                        <div className="seguridad-detalles-grupo">
                            <div className="seguridad-detalles-item">
                                <label htmlFor="nombreCompletoEmpleado">Nombre Completo</label>
                                <p id="nombreCompletoEmpleado">{empleado.nombre} {empleado.apellido}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="fechaNacimientoEmpleado">Fecha de Nacimiento</label>
                                <p id="fechaNacimientoEmpleado">{formatearFecha(empleado.fecha_nacimiento)}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="direccionEmpleado">Dirección</label>
                                <p id="direccionEmpleado">{empleado.direccion}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="correoEmpleado">Correo Electrónico</label>
                                <p id="correoEmpleado">{empleado.correo}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="telefonoEmpleado">Teléfono</label>
                                <p id="telefonoEmpleado">{empleado.telefono}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="dniEmpleado">DNI</label>
                                <p id="dniEmpleado">{empleado.dni}</p>
                            </div>
                        </div>
                        <div className="fila fila-uno">
                            <button className="btn-actualizar informacion"
                            onClick={() => setModalEditarEmpleadoAbierto(true)}>
                            <FontAwesomeIcon icon={faPenToSquare} /> Actualizar Información
                            </button>
                        </div>
                    </div>

                    <div className="seguridad-detalles-seccion">
                        <h3>Seguridad de la Cuenta</h3>
                        <div className="seguridad-detalles-grupo">
                            <div className="seguridad-detalles-item">
                                <label htmlFor="nombreUsuario">Nombre de Usuario</label>
                                <p id="nombreUsuario">{empleado.usuario?.nombre_usuario}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="rolUsuario">Rol</label>
                                <p id="rolUsuario" className={empleado.usuario?.rol === "Sin Asignar" ? "rol-no-asignado" : ""}>
                                    {empleado.usuario?.rol}
                                </p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="areaUsuario">Área</label>
                                <p id="areaUsuario"> {empleado.id_area?.nombre ?? "Área no disponible"}</p>
                            </div>
                            <div className="seguridad-detalles-item">
                                <label htmlFor="estadoUsuario">Estado</label>
                                <p
                                id="estadoUsuario"
                                className={empleado.usuario!.estado ? "estado-activo" : "estado-inactivo"}
                                >
                                {empleado.usuario!.estado ? "Activo" : "Inactivo"}
                                </p>
                            </div>
                        </div>
                        <div className="fila fila-dos">
                            <button className="btn-actualizar cuenta" onClick={() => setModalEditarUsuarioAbierto(true)}>
                            <FontAwesomeIcon icon={faPenToSquare} /> Actualizar Cuenta
                            </button>
                            <button className="btn-actualizar contraseña" onClick={() => setModalEditarContraseñaAbierto(true)}>
                            <FontAwesomeIcon icon={faKey} /> Actualizar Contraseña
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {modalEditarEmpleadoAbierto && (
                <div className="modal-overlay-empleados active">
                    <div
                        className="modal-empleados modal-editar-empleado active" onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header-editar">
                            <div className="modal-icono"><FontAwesomeIcon icon={faPenToSquare} /></div>
                            <h2>Actualizar Información</h2>
                            <button
                                className="modal-cerrar-detalles"
                                onClick={() => setModalEditarEmpleadoAbierto(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="modal-cuerpo">
                            <form
                                id="formEditarEmpleado"
                                onSubmit={handleSubmitEditarEmpleado}
                            >
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="nombreEmpleado">Nombres</label>
                                        <input
                                            id="nombreEmpleado"
                                            type="text"
                                            maxLength={50}
                                            required
                                            disabled
                                            value={formularioEmpleado.nombre}
                                            onChange={(e) => setFormularioEmpleado({ ...formularioEmpleado, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="apellidoEmpleado">Apellidos</label>
                                        <input
                                            id="apellidoEmpleado"
                                            type="text"
                                            maxLength={50}
                                            required
                                            disabled
                                            value={formularioEmpleado.apellido}
                                            onChange={(e) => setFormularioEmpleado({...formularioEmpleado, apellido: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="direccionEmpleado">Dirección</label>
                                        <input
                                            id="direccionEmpleado"
                                            type="text"
                                            max={100}
                                            required
                                            value={formularioEmpleado.direccion}
                                            onChange={(e) => setFormularioEmpleado({...formularioEmpleado, direccion: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="correoEmpleado">Correo Electrónico</label>
                                        <input
                                            id="correoEmpleado"
                                            type="email"
                                            pattern="[a-zA-Z0-9._%+-]+@(gmail|hotmail)\.com"
                                            title="Solo correos @gmail.com o @hotmail.com"
                                            required
                                            value={formularioEmpleado.correo}
                                            onChange={(e) => setFormularioEmpleado({...formularioEmpleado, correo: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="form-fila">
                                    <div className="form-grupo">
                                        <label htmlFor="telefonoEmpleado">Teléfono</label>
                                        <input
                                            id="telefonoEmpleado"
                                            type="tel"
                                            inputMode="numeric"
                                            maxLength={9}
                                            pattern="9\d{8}"
                                            title="Debe de comenzar con 9 y tener 9 dígitos"
                                            required
                                            onInput={(e) => {
                                                const val = e.currentTarget.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 9);
                                                e.currentTarget.value =
                                                val.charAt(0) === "9" ? val : "";
                                            }}
                                            value={formularioEmpleado.telefono}
                                            onChange={(e) => setFormularioEmpleado({...formularioEmpleado, telefono: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-grupo">
                                        <label htmlFor="dniEmpleado">DNI</label>
                                        <input
                                            id="dniEmpleado"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={8}
                                            required
                                            disabled
                                            value={formularioEmpleado.dni}
                                            onChange={(e) => setFormularioEmpleado({...formularioEmpleado, dni: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="modal-pie-form">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setModalEditarEmpleadoAbierto(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button className="btn-confirmar" type="submit">Guardar Cambios</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {modalEditarUsuarioAbierto && (
                <div className="modal-overlay-empleados active">
                <div
                    className="modal-empleados modal-editar-empleado active" onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header-editar">
                        <div className="modal-icono"><FontAwesomeIcon icon={faPenToSquare} /></div>
                        <h2>Actualizar Usuario</h2>
                        <button
                            className="modal-cerrar-detalles"
                            onClick={() => setModalEditarUsuarioAbierto(false)}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>

                    <div className="modal-cuerpo">
                        <form
                                id="formEditarUsuario"
                                onSubmit={handleSubmitEditarUsuario}
                        >
                            <div className="form-grupo">
                                <label htmlFor="rolEmpleado">Rol</label>
                                <select
                                    id="rolEmpleado"
                                    required
                                    value={formularioUsuario.id_rol}
                                    onChange={(e) => setFormularioUsuario({ ...formularioUsuario, id_rol: e.target.value })}
                                >
                                    <option disabled value="">Sin asignar</option>
                                    {roles.map((rol) => (
                                        <option key={rol.id_rol} value={rol.id_rol.toString()}>
                                        {rol.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label htmlFor="areaEmpleado">Área</label>
                                <select
                                    id="areaEmpleado"
                                    required
                                    value={formularioUsuario.id_area}
                                    onChange={(e) => setFormularioUsuario({ ...formularioUsuario, id_area: e.target.value })}
                                >
                                    {areas.map((area) => (
                                        <option key={area.id_area} value={area.id_area.toString()}>
                                        {area.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-grupo">
                                <label htmlFor="estadoEmpleado">Estado</label>
                                <select
                                    id="estadoEmpleado"
                                    required
                                    value={formularioUsuario.estado}
                                    onChange={(e) => setFormularioUsuario({ ...formularioUsuario, estado: e.target.value })}
                                >
                                    <option value="1">Activo</option>
                                    <option value="0">Inactivo</option>
                                </select>
                            </div>
                            <div className="modal-pie-form">
                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={() => setModalEditarUsuarioAbierto(false)}
                                >
                                    Cancelar
                                </button>
                                <button className="btn-confirmar" type="submit">Actualizar Empleado</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            )}

            {modalEditarContraseñaAbierto && (
                <div className="modal-overlay-empleados active">
                    <div
                        className="modal-empleados modal-editar-empleado active" onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header-editar">
                            <div className="modal-icono"><FontAwesomeIcon icon={faKey} /></div>
                            <h2>Actualizar Contraseña</h2>
                            <button
                                className="modal-cerrar-detalles"
                                onClick={() => setModalEditarContraseñaAbierto(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>

                        <div className="modal-cuerpo">
                            <form
                                id="formEditarContraseña"
                                onSubmit={handleSubmitEditarContraseña}
                            >
                                <div className="form-grupo">
                                    <label htmlFor="contraseñaActual">Actual Contraseña</label>
                                    <div className="input-password">
                                        <input id="passwordActual" type="password" required />
                                        <button type="button" className="toggle-password">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-grupo">
                                    <label htmlFor="contraseñaNueva">Nueva Contraseña</label>
                                    <div className="input-password">
                                        <input id="passwordNueva" type="password" required />
                                        <button type="button" className="toggle-password">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div className="form-grupo">
                                    <label htmlFor="confirmarContraseñaNueva">Confirmar Contraseña</label>
                                    <div className="input-password">
                                        <input id="passwordConfirmar" type="password" required />
                                        <button type="button" className="toggle-password">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
                                </div>
                                <div className="requisitos-password">
                                    <p>La contraseña debe de cumplir con los siguientes requisitos:</p>
                                    <ul>
                                        <li>Mínimo 8 caracteres.</li>
                                        <li>Al menos una letra mayúscula.</li>
                                        <li>Al menos un número.</li>
                                        <li>Al menos un carácter especial.</li>
                                    </ul>
                                </div>
                                <div className="modal-pie-form">
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => setModalEditarContraseñaAbierto(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button className="btn-confirmar" type="submit">Cambiar Contraseña</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeguridadDetalles;
