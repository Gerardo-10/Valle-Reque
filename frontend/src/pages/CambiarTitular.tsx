import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "../styles/cambiar-titular.css";
import { useState } from "react";
import Swal from "sweetalert2";
import VerificarEmail from "../components/VerificarEmail";

export default function CambioTitularidad() {
  const navigate = useNavigate();
  const location = useLocation();
  const ventaAntigua = location.state?.ventaAntigua;
  const [cargaFamiliar, setCargaFamiliar] = useState<string>("");

  const [correoNuevo, setCorreoNuevo] = useState("");
  const [emailVerificado, setEmailVerificado] = useState(false);


  const hoy = new Date();
  const dia = String(hoy.getDate()).padStart(2, "0");
  const mes = String(hoy.getMonth() + 1).padStart(2, "0"); // Meses comienzan en 0
  const año = hoy.getFullYear();
  const fechaFormateada = `${dia}/${mes}/${año}`;

  const handleGuardar = async () => {
    console.log(ventaAntigua);

    const nuevoCliente = {
      nombre: (
        document.getElementById("nombres-nuevo") as HTMLInputElement
      ).value
        .trim()
        .toUpperCase(),
      apellido: (
        document.getElementById("apellidos-nuevo") as HTMLInputElement
      ).value
        .trim()
        .toUpperCase(),
      dni: (
        document.getElementById("dni-nuevo") as HTMLInputElement
      ).value.trim(),
      direccion: (
        document.getElementById("direccion-nuevo") as HTMLInputElement
      ).value.trim(),
      correo: correoNuevo.trim(),
      telefono: (
        document.getElementById("telefono-nuevo") as HTMLInputElement
      ).value.trim(),
      ocupacion: (
        document.getElementById("ocupacion-nuevo") as HTMLInputElement
      ).value.trim(),
      ingreso_neto: (
        document.getElementById("ingreso-neto-nuevo") as HTMLInputElement
      ).value.trim(),
      estado_cliente: 1,
      carga_familiar: cargaFamiliar,
      nombre_familiar:
        cargaFamiliar === "1"
          ? (
              document.getElementById(
                "nombres-familiar-nuevo"
              ) as HTMLInputElement
            ).value
              .trim()
              .toUpperCase()
          : null,
      apellido_familiar:
        cargaFamiliar === "1"
          ? (
              document.getElementById(
                "apellidos-familiar-nuevo"
              ) as HTMLInputElement
            ).value
              .trim()
              .toUpperCase()
          : null,
      dni_familiar:
        cargaFamiliar === "1"
          ? (
              document.getElementById("dni-familiar-nuevo") as HTMLInputElement
            ).value.trim()
          : null,
      codigo_venta: ventaAntigua.codigo_venta,
    };

    // Validar campos obligatorios
    const camposObligatorios = [
      nuevoCliente.nombre,
      nuevoCliente.apellido,
      nuevoCliente.dni,
      nuevoCliente.direccion,
      nuevoCliente.correo,
      nuevoCliente.telefono,
      nuevoCliente.ocupacion,
      nuevoCliente.ingreso_neto,
    ];

    if (cargaFamiliar === "1") {
      camposObligatorios.push(
        nuevoCliente.nombre_familiar!,
        nuevoCliente.apellido_familiar!,
        nuevoCliente.dni_familiar!
      );
    }

    const camposVacios = camposObligatorios.some(
      (campo) => !campo || campo.trim() === ""
    );

    if (camposVacios) {
      Swal.fire("Error", "Todos los campos son obligatorios.", "warning");
      return;
    }

    if (!emailVerificado) {
      Swal.fire(
        "Error",
        "Debe verificar el correo electrónico antes de continuar.",
        "warning"
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/clientes/cambiar_titularidad",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoCliente),
        }
      );

      const result = await response.json();

      if (result.success) {
        Swal.fire("Éxito", "Se cambió la titularidad correctamente", "success");
        navigate("/listar");
      } else {
        Swal.fire(
          "Error",
          result.message || "No se pudo cambiar la titularidad",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  // Validación si no se envió una venta
  if (!ventaAntigua) {
    return (
      <div className="contenedor-principal">
        <div className="card">
          <div className="venta-card-header">
            <h2>Error</h2>
          </div>
          <p>No se han proporcionado datos de una venta anterior.</p>
          <button className="btn-cancelar" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contenedor-principal">
      <div className="card">
        <div className="venta-card-header">
          <div className="venta-header-left">
            <button onClick={() => navigate(-1)} className="back-button">
              <FontAwesomeIcon icon={faArrowLeft} className="icon-back" />
            </button>
            <div>
              <h2>
                Cambio de Titularidad en la Venta:{" "}
                <span style={{ fontWeight: "bold" }}>
                  {ventaAntigua
                    ? ventaAntigua.codigo_venta
                    : "No se seleccionó ninguna venta"}
                </span>
              </h2>
            </div>
          </div>
          <div className="header-right">
            <p>
              <span>Fecha: {fechaFormateada}</span>
            </p>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Datos del Antiguo Cliente</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="dni-antiguo">DNI</label>
              <input
                id="dni-antiguo"
                defaultValue={ventaAntigua.dni || ""}
                className="form-input"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="nombres-antiguo">Nombres</label>
              <input
                id="nombres-antiguo"
                defaultValue={ventaAntigua.nombre_cliente || ""}
                className="form-input"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellidos-antiguo">Apellidos</label>
              <input
                id="apellidos-antiguo"
                defaultValue={ventaAntigua.apellido_cliente || ""}
                className="form-input"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="modalidad-antiguo">Modalidad Actual</label>
              <input
                id="modalidad-antiguo"
                defaultValue={ventaAntigua.tipo || ""}
                className="form-input"
                disabled
              />
            </div>
            <div className="form-group">
              <label htmlFor="carga-antiguo">Carga Familiar</label>
              <input
                id="carga-antiguo"
                defaultValue={ventaAntigua.carga_familiar === "1" ? "Sí" : "No"}
                className="form-input"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3 className="section-title">Datos del Nuevo Cliente</h3>
          <p className="subtitle">
            Verifica que los datos del cliente estén correctos
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombres-nuevo">Nombres</label>
              <input
                id="nombres-nuevo"
                className="form-input"
                maxLength={50}
                required
                pattern="[A-Za-z\s]+"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^A-Za-z\s]/g,
                    ""
                  );
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellidos-nuevo">Apellidos</label>
              <input
                id="apellidos-nuevo"
                className="form-input"
                maxLength={50}
                required
                pattern="[A-Za-z\s]+"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^A-Za-z\s]/g,
                    ""
                  );
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dni-nuevo">DNI</label>
              <input
                id="dni-nuevo"
                className="form-input"
                maxLength={8}
                required
                inputMode="numeric"
                pattern="\d{8}"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /\D/g,
                    ""
                  );
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="direccion-nuevo">Dirección</label>
              <input
                id="direccion-nuevo"
                className="form-input"
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="correo-nuevo">Correo</label>
              <VerificarEmail
                email={correoNuevo}
                onEmailChange={(email) => setCorreoNuevo(email)}
                onEmailVerified={(email, isVerified) => {
                  setEmailVerificado(isVerified);
                  console.log(`Email ${email} verificado: ${isVerified}`);
                }}
                required={true}
                showLabel={false}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono-nuevo">Teléfono</label>
              <input
                id="telefono-nuevo"
                type="tel"
                className="form-input"
                maxLength={9}
                inputMode="numeric"
                required
                onInput={(e) => {
                  let value = e.currentTarget.value.replace(/\D/g, "");

                  // Si no comienza con 9, eliminar lo ingresado
                  if (value.length === 1 && value[0] !== "9") {
                    value = "";
                  }

                  // Limitar a 9 dígitos
                  if (value.length > 9) {
                    value = value.slice(0, 9);
                  }

                  e.currentTarget.value = value;
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="ocupacion-nuevo">Ocupación</label>
              <input
                id="ocupacion-nuevo"
                className="form-input"
                maxLength={50}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="ingreso-neto-nuevo">Ingreso Neto</label>
              <input
                id="ingreso-neto-nuevo"
                className="form-input"
                required
                inputMode="decimal"
                pattern="^\d{1,8}(\.\d{1,2})?$"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(
                    /[^0-9.]/g,
                    ""
                  );
                  const partes = e.currentTarget.value.split(".");
                  if (partes.length > 2) {
                    e.currentTarget.value = partes[0] + "." + partes[1];
                  }
                  if (partes[0].length > 8) {
                    e.currentTarget.value =
                      partes[0].slice(0, 8) +
                      (partes[1] ? "." + partes[1] : "");
                  }
                  if (partes[1]?.length > 2) {
                    e.currentTarget.value =
                      partes[0] + "." + partes[1].slice(0, 2);
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="carga-nuevo">Carga Familiar</label>
              <select
                id="carga-nuevo"
                className="form-input"
                required
                value={cargaFamiliar}
                onChange={(e) => setCargaFamiliar(e.target.value)}
              >
                <option value="" disabled>
                  Seleccione una opción
                </option>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>
            {cargaFamiliar === "1" && (
              <>
                <div className="form-group">
                  <label htmlFor="nombres-familiar-nuevo">
                    Nombre del Familiar
                  </label>
                  <input
                    id="nombres-familiar-nuevo"
                    type="text"
                    className="form-input"
                    maxLength={50}
                    required
                    pattern="[A-Za-z\s]+"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^A-Za-z\s]/g,
                        ""
                      );
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellidos-familiar-nuevo">
                    Apellidos del Familiar
                  </label>
                  <input
                    id="apellidos-familiar-nuevo"
                    type="text"
                    className="form-input"
                    maxLength={50}
                    required
                    pattern="[A-Za-z\s]+"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^A-Za-z\s]/g,
                        ""
                      );
                    }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dni-familiar-nuevo">DNI del Familiar</label>
                  <input
                    id="dni-familiar-nuevo"
                    type="text"
                    className="form-input"
                    maxLength={8}
                    required
                    inputMode="numeric"
                    pattern="\d{8}"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /\D/g,
                        ""
                      );
                    }}
                  />
                </div>
              </>
            )}
            <div className="form-group motivo-group">
              <label htmlFor="motivo">Motivo de Refinanciamientos</label>
              <textarea
                id="motivo"
                rows={2}
                className="form-textarea"
                defaultValue="Cambio de Titularidad"
              />
            </div>
          </div>
        </div>

        <div className="button-container">
          <button className="btn-guardar" onClick={handleGuardar}>
            Guardar
          </button>
          <button className="btn-cancelar" onClick={() => navigate(-1)}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
