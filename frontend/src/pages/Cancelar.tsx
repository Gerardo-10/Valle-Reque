import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDatosCancelacion } from "../api/cancelar";
import type { DatosCancelacion } from "../types/Cancelar";
import {
  faArrowLeft,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/cancelar.css";

export default function CancelarVentas() {
  const navigate = useNavigate();
  const location = useLocation();

  const [datos, setDatos] = useState<DatosCancelacion | null>(null);
  const [penalizacion, setPenalizacion] = useState(0);
  const [montoADevolver, setMontoADevolver] = useState(0);
  const [montoPorCuota, setMontoPorCuota] = useState(0);
  const [numeroCuotas, setNumeroCuotas] = useState(0);
  const [fechaInicio, setFechaInicio] = useState<string>("");
  const [fechaFinal, setFechaFinal] = useState<string>("");

  // Cálculo de penalización, monto a devolver y monto por cuota
  const calcularMontoDevolucion = (
    newPenalizacion = penalizacion,
    newNumeroCuotas = numeroCuotas
  ) => {
    if (!datos) return;

    const valorAmortizado = parseFloat(datos.total_amortizado || "0");

    const interesPenalizacion =
      newPenalizacion > 0
        ? parseFloat((valorAmortizado * (newPenalizacion / 100)).toFixed(2))
        : 0;

    const totalDevolver = Math.max(valorAmortizado - interesPenalizacion, 0);

    setMontoADevolver(totalDevolver);

    if (newNumeroCuotas > 0) {
      setMontoPorCuota(totalDevolver / newNumeroCuotas);
    } else {
      setMontoPorCuota(0);
    }
  };

  // Calcular la fecha final basándonos en la fecha de inicio y el número de cuotas
  const calcularFechaFinal = (
    newFechaInicio = fechaInicio,
    newNumeroCuotas = numeroCuotas
  ) => {
    if (newFechaInicio && newNumeroCuotas > 0) {
      const [year, month, day] = newFechaInicio.split("-").map(Number);

      // Crear fecha temporal sumando los meses
      const tempDate = new Date(year, month - 1 + newNumeroCuotas, 1);

      // Obtener el último día del mes resultante
      const ultimoDiaDelMes = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth() + 1,
        0
      ).getDate();

      // Si el día original es mayor que el último día del mes, usa el último día
      const finalDay = Math.min(day, ultimoDiaDelMes);

      // Establecer la fecha final
      const finalDate = new Date(
        tempDate.getFullYear(),
        tempDate.getMonth(),
        finalDay
      );

      setFechaFinal(finalDate.toISOString().split("T")[0]);
    } else {
      setFechaFinal("");
    }
  };

  // Manejo de la entrada de fecha de inicio
  const handleFechaInicioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nuevaFecha = e.target.value;
    setFechaInicio(nuevaFecha);
    calcularFechaFinal(nuevaFecha, numeroCuotas);
  };

  // Manejo de la entrada de número de cuotas
  const handleNumeroCuotasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    const newNumeroCuotas = parseInt(value, 10);

    if (!isNaN(newNumeroCuotas) && newNumeroCuotas > 0) {
      setNumeroCuotas(newNumeroCuotas);
      calcularMontoDevolucion(penalizacion, newNumeroCuotas);
      calcularFechaFinal(fechaInicio, newNumeroCuotas);
    } else {
      setNumeroCuotas(0);
      setFechaFinal("");
      setMontoPorCuota(0);
    }
  };

  // Manejo del cambio de penalización
  const handlePenalizacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value === "") {
      setPenalizacion(0); // o "" si manejas como string
      return;
    }

    let newValue = parseInt(value, 10);

    if (newValue > 100) newValue = 100;

    setPenalizacion(newValue);
    calcularMontoDevolucion(newValue, numeroCuotas);
  };

  useEffect(() => {
    const id_venta = location.state?.id_venta;
    if (!id_venta) return;
    getDatosCancelacion(id_venta)
      .then(setDatos)
      .catch(() => console.error("Error al obtener datos de cancelación"));
  }, [location.state]);

  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="contenedor-principal">
      <div className="venta-card">
        <div className="venta-card-header">
          <div className="venta-header-left">
            <button onClick={() => navigate(-1)} className="back-button">
              <FontAwesomeIcon icon={faArrowLeft} className="icon-back" />
            </button>
            <div>
              <h2>Datos del Cliente</h2>
              <p className="venta-subtitle">
                Verifica que los datos del cliente estén correctos
              </p>
            </div>
          </div>
          <div className="venta-header-right">
            <p>
              <span>Fecha: {fechaActual}</span>
            </p>
          </div>
        </div>

        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="dni">DNI</label>
              <input
                id="dni"
                value={datos?.documento_identidad || ""}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                value={datos?.nombre || ""}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                value={datos?.apellidos || ""}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="modalidad">Modalidad Actual</label>
              <input
                id="modalidad"
                value={datos?.nombre_financiamiento || ""}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="carga">Carga Familiar</label>
              <input
                id="carga"
                value={datos?.carga_familiar === 1 ? "Sí" : "No"}
                className="form-input"
                readOnly
              />
            </div>
            <div className="form-group motivo-group">
              <label htmlFor="motivo">Motivo de la Cancelación</label>
              <textarea
                id="motivo"
                rows={3}
                className="form-textarea"
                required
              ></textarea>
            </div>
          </div>
        </div>

        <div className="resumen-section">
          <div className="resumen-cancelacion">
            <h2>Resumen</h2>
            <p className="text-cancelacion">
              Debes comunicar al cliente toda la información que se detalla a
              continuación y verificar cuidadosamente cada dato.
            </p>
            <p className="warning">
              <FontAwesomeIcon icon={faExclamationTriangle} /> Recuerda: Todo el
              proceso está sujeto a auditoría.
            </p>
          </div>

          <div className="info-cards-container">
            <div className="info-card">
              <h3>Datos del Terreno:</h3>
              <div className="info-item">
                <strong>Proyecto:</strong>
                <span className="info-value">
                  {datos?.nombre_proyecto || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Código de Unidad:</strong>
                <span className="info-value">
                  {datos?.codigo_unidad || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Etapa:</strong>
                <span className="info-value">{datos?.etapa || "*****"}</span>
              </div>
              <div className="info-item">
                <strong>Precio:</strong>
                <span className="info-value">
                  {datos?.precio_terreno || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Tipo:</strong>
                <span className="info-value">
                  {datos?.tipo_terreno || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Área:</strong>
                <span className="info-value">{datos?.area || "*****"}</span>
              </div>
            </div>

            <div className="info-card">
              <h3>Datos de la Venta:</h3>
              <div className="info-item">
                <strong>Código de Venta:</strong>
                <span className="info-value">
                  {datos?.codigo_venta || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Valor Amortizado:</strong>
                <span className="info-value">
                  {datos?.total_amortizado || "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Número de Cuotas Totales:</strong>
                <span className="info-value">
                  {datos?.numero_cuotas ?? "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Cuotas Pagadas:</strong>
                <span className="info-value">
                  {datos?.cuotas_pagadas ?? "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Fecha de Fin:</strong>
                <span className="info-value">
                  {datos?.fecha_final
                    ? new Date(datos.fecha_final).toLocaleDateString("es-PE")
                    : "*****"}
                </span>
              </div>
              <div className="info-item">
                <strong>Tipo de Financiamiento:</strong>
                <span className="info-value">
                  {datos?.tipo_financiamiento || "*****"}
                </span>
              </div>
            </div>
          </div>

          <div className="devolucion-grid">
            <div className="form-group">
              <label htmlFor="penalización">Penalización - Interés (%)</label>
              <input
                id="penalización"
                className="form-input"
                type="text"
                inputMode="numeric"
                placeholder="0%"
                value={penalizacion}
                onChange={handlePenalizacionChange}
                onBlur={() => {
                  if (!penalizacion || penalizacion < 1) {
                    setPenalizacion(1);
                    calcularMontoDevolucion(1, numeroCuotas);
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="monto-a-devolver">Monto Total a Devolver</label>
              <input
                id="monto-a-devolver"
                className="form-input"
                value={montoADevolver.toFixed(2)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="cantidad-de-cuotas-para-devolucion">
                Número de Cuotas a Devolver
              </label>
              <input
                id="cantidad-de-cuotas-para-devolucion"
                className="form-input"
                type="text"
                inputMode="numeric"
                value={numeroCuotas}
                onChange={handleNumeroCuotasChange}
                onBlur={() => {
                  if (!numeroCuotas || numeroCuotas < 1) {
                    setNumeroCuotas(1);
                    calcularMontoDevolucion(penalizacion, 1);
                    calcularFechaFinal(fechaInicio, 1);
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="monto-por-cuotas-a-devolución">
                Monto X Cuotas
              </label>
              <input
                id="monto-por-cuotas-a-devolución"
                className="form-input"
                value={montoPorCuota.toFixed(2)}
                readOnly
              />
            </div>
            <div className="form-group">
              <label htmlFor="venta-fecha-pagos">Fecha de Pago Inicial</label>
              <input
                type="date"
                id="venta-fecha-pagos"
                className="venta-form-input"
                min={new Date().toISOString().split("T")[0]}
                onChange={handleFechaInicioChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="venta-fecha-final">Fecha de Fin</label>
              <input
                type="date"
                id="venta-fecha-final"
                className="venta-form-input"
                value={fechaFinal}
                readOnly
              />
            </div>
          </div>

          <div className="cancelacion-section">
            <div className="button-container">
              <button className="btn-confirmar">Confirmar</button>
              <button className="btn-cancelar">Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
