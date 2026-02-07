"use client";

import type React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faArrowRight,
  faKey,
  faTimes,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import RecuperarContraseña from "../components/RecuperarContraseña";
import "../styles/login.css";
import "../styles/globals.css";
import "../styles/seguridad-detalles.css"
import Swal from "sweetalert2";
import { cambiarContraseña, obtenerIdPorUsuario } from "../api/seguridad";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [empleadoId, setEmpleadoId] = useState<number | null>(null);
  const [modalRecuperarAbierto, setModalRecuperarAbierto] = useState(false);
  const [modalEditarContraseñaAbierto, setModalEditarContraseñaAbierto] =
    useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      console.log("Usuario autenticado:", user);

      // Guarda en localStorage si deseas
      localStorage.setItem("usuario", JSON.stringify(user));

      // Guarda id_empleado en el estado
      setEmpleadoId(user.id_empleado);

      if (password === "123456") {
        const id = await obtenerIdPorUsuario(username);
        setEmpleadoId(id);
        setModalEditarContraseñaAbierto(true);
      } else {
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Ocurrió un error desconocido");
      }
    }
  };

  const handleSubmitEditarContraseña = async (e: React.FormEvent) => {
    e.preventDefault();

    const actual = (
      document.getElementById("passwordActual") as HTMLInputElement
    ).value;
    const nueva = (document.getElementById("passwordNueva") as HTMLInputElement)
      .value;
    const confirmar = (
      document.getElementById("passwordConfirmar") as HTMLInputElement
    ).value;

    // Validar que todas estén llenas
    if (!actual || !nueva || !confirmar) {
      Swal.fire("Error", "Todos los campos son obligatorios", "error");
      return;
    }

    // Validar nueva contraseña con requisitos
    const regex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!regex.test(nueva)) {
      Swal.fire(
        "Error",
        "La nueva contraseña no cumple con los requisitos de seguridad",
        "error"
      );
      return;
    }

    // Validar coincidencia
    if (nueva !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    if (!empleadoId) {
      Swal.fire("Error", "No se encontró el ID del empleado", "error");
      return;
    }

    try {
      const res = await cambiarContraseña({
        id_empleado: empleadoId,
        actual,
        nueva,
      });

      Swal.fire(
        "Éxito",
        res.message || "Contraseña actualizada correctamente",
        "success"
      );
      setModalEditarContraseñaAbierto(false);

      // Luego de cambiar contraseña, navega al dashboard
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : "No se pudo actualizar la contraseña";
      Swal.fire("Error", errorMessage, "error");
    }
  };

  const handleForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setModalRecuperarAbierto(true);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-form">
          <div className="logo-small">
            <img src="/logo.png" alt="Logo Valle Reque" />
          </div>

          <h1>BIENVENIDO</h1>
          <p className="subtitle">Inicia sesión para continuar</p>

          <form id="loginForm" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Usuario</label>
              <div className="input-container">
                <FontAwesomeIcon icon={faEnvelope} />
                <input
                  type="text"
                  id="username"
                  placeholder="Ingresa tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-container">
                <FontAwesomeIcon icon={faLock} />
                <input
                  type="password"
                  id="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="forgot-password"
                onClick={handleForgotPassword}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <div className="remember-me">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <label htmlFor="remember">Recordar mi sesión</label>
            </div>

            <button type="submit" className="login-button">
              Iniciar Sesión
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </form>
        </div>

        <div className="brand-panel">
          <div className="logo-large">
            <img src="/logo.png" alt="Logo Valle Reque Grande" />
          </div>
          <h2>Valle Reque</h2>
          <p className="urbanizacion">URBANIZACIÓN</p>
          <p className="description">
            Sistema de gestión integral para
            <br />
            proyectos inmobiliarios
          </p>
        </div>
      </div>

      {/* Modal de Recuperar Contraseña */}
      <RecuperarContraseña
        isOpen={modalRecuperarAbierto}
        onClose={() => setModalRecuperarAbierto(false)}
      />

      {modalEditarContraseñaAbierto && (
        <div className="modal-overlay-empleados active">
          <div
            className="modal-empleados modal-editar-empleado active"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header-editar">
              <div className="modal-icono">
                <FontAwesomeIcon icon={faKey} />
              </div>
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
                  <label htmlFor="confirmarContraseñaNueva">
                    Confirmar Contraseña
                  </label>
                  <div className="input-password">
                    <input id="passwordConfirmar" type="password" required />
                    <button type="button" className="toggle-password">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </div>
                </div>
                <div className="requisitos-password">
                  <p>
                    La contraseña debe de cumplir con los siguientes requisitos:
                  </p>
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
                  <button className="btn-confirmar" type="submit">
                    Cambiar Contraseña
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

export default Login;
