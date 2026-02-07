import { useState, useEffect} from "react"
import { useLocation } from "react-router-dom"
import { getDatosRefinanciamiento } from "../api/refinanciamiento"
import type { DatosRefinanciamiento } from "../types/Refinanciamiento"
import Swal from "sweetalert2"
import { useNavigate } from "react-router-dom"
import "../styles/ventas.css"
import {
  faArrowLeft,
  faCalendarAlt,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"


export default function Refinanciamiento() {
  const location = useLocation()
  const navigate = useNavigate()
  const [datos, setDatos] = useState<DatosRefinanciamiento | null>(null)
  const [mostrarDetalles, setMostrarDetalles] = useState(false)

  useEffect(() => {
    const id_venta = location.state?.id_venta
    if (!id_venta) {
      Swal.fire("No se proporcionó el ID de venta")
      return
    }
    getDatosRefinanciamiento(id_venta)
      .then(res => setDatos(res))
      .catch(() => Swal.fire("Error al obtener datos de refinanciamiento"))
  }, [location.state])

  if (!datos) return <p className="cargando">Cargando datos de refinanciamiento...</p>

  const handleConfirmar = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Se procederá con el refinanciamiento.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, confirmar"
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Confirmado", "El refinanciamiento ha sido registrado.", "success")
      }
    })
  }

  const handleCancelar = () => {
    Swal.fire({
      title: "¿Cancelar proceso?",
      text: "Los cambios no serán guardados.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver"
    }).then(result => {
      if (result.isConfirmed) navigate("/listar/ventas")
    })
  }

  const continuarVenta = () => {
    setMostrarDetalles(true)
    setTimeout(() => {
      const detallesSection = document.getElementById('venta-detalles-section')
      if (detallesSection) {
        detallesSection.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

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
              <p className="venta-subtitle">Verifica que los datos del cliente estén correctos</p>
            </div>
          </div>
          <div className="venta-header-right">
            <p>
              <span>Fecha: {new Date().toLocaleDateString("es-ES", { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
              <span className="venta-separator">|</span>
              <span>Asesor: Benito</span>
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
                value={datos.documento_identidad}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-nombres">Nombres</label>
              <input

                id="venta-nombres"
                className="venta-form-input"
                value={datos.nombres}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-apellidos">Apellidos</label>
              <input

                id="venta-apellidos"
                className="venta-form-input"
                value={datos.apellidos}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-estado">Modalidad Actual</label>
              <input

                id="venta-estado"
                className="venta-form-input"
                value={datos.ocupacion}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-carga">Carga Familiar</label>
              <input

                id="venta-carga"
                className="venta-form-input"
                value={datos.carga_familiar}
              />
            </div>
          </div>
        </div>

        {/* Sección de selección de vivienda */}
        <div className="venta-form-section">
          <h3 className="venta-section-title">Informacion de la Vivienda</h3>
          <p className="venta-subtitle">Solo podrás seleccionar aquellos terrenos que estén disponibles. Verifica en Logística &gt; Terrenos</p>

          <div className="venta-form-grid">
            <div className="venta-form-group">
              <label htmlFor="venta-proyecto">Seleccione el proyecto</label>
              <input

                id="venta-proyecto"
                className="venta-form-input"
                value={datos.nombre_proyecto}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-codigo">Código de Unidad</label>
              <input

                id="venta-codigo"
                className="venta-form-input"
                value={datos.codigo_unidad}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-etapa">Etapa</label>
              <input

                id="venta-etapa"
                className="venta-form-input"
                value={datos.etapa}
              />
            </div>

           <div className="venta-form-group">
              <label htmlFor="venta-tipo">Tipo</label>
              <select
                id="venta-tipo"
                className="venta-form-input"
                value={datos.tipo_terreno}
              >
                <option value="PARQUE">PARQUE</option>
                <option value="AVENIDA">AVENIDA</option>
                <option value="CALLE">CALLE</option>
                <option value="ESQUINA">ESQUINA</option>
                <option value="ESQUINA/PARQUE">ESQUINA/PARQUE</option>
              </select>
            </div>

            <div className="venta-form-group">
              <label htmlFor="venta-area">Área</label>
              <input

                id="venta-area"
                className="venta-form-input"
                value={datos.area}
              />
            </div>
          </div>
        </div>

        {/* Sección de operaciones */}
        <div className="venta-form-section">
          <h3 className="venta-section-title">Concepto del Refinanciamiento</h3>
          <p className="venta-subtitle">Verifica si los financiamientos actuales están disponibles para realizar una venta</p>

          <div className="venta-form-grid">
            <div className="venta-form-group">
              <label htmlFor="venta-financiamiento">Saldo Actual</label>
              <input
                id="saldo-actual"
                className="venta-form-input"
                value={datos.saldo}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-monto-bono">Monto total aportado</label>
              <input
                id="monto-aportado"
                className="venta-form-input"
                value={datos.monto_total_aportado}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-interes">Seleccione el financiamiento</label>
              <select
                id="tipo-financiamiento"
                className="venta-form-input"
                value={datos.tipo_terreno}
              >
                <option >Techo Propio</option>
                <option >Bono Familiar</option>
                <option >Valle Reque</option>
              </select>
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-monto-cuota">Número de Cuotas</label>
              <input

                id="venta-monto-cuota"
                className="venta-form-input"
                value={datos.numero_cuotas}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-monto-cuota">Monto por Cuota</label>
              <input

                id="venta-monto-cuota"
                className="venta-form-input"
                value={datos.monto_cuota}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-inicial">Interes</label>
              <input

                id="venta-inicial"
                className="venta-form-input"
                value={datos.interes}
              />
            </div>
            <div className="venta-form-group">
              <label htmlFor="venta-fecha-pagos">Fecha de Pagos</label>
              <div className="venta-date-input-container">
                <input

                  id="venta-fecha-pagos"
                  className="venta-form-input"
                  value={datos.fecha_pago}
                  readOnly
                />
                <button
                  type="button"
                  className="venta-calendar-button"
                  //onClick={toggleCalendario} - Falta implementar toggleCalendario
                >
                  <FontAwesomeIcon icon={faCalendarAlt} />
                </button>
              </div>
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

        <br /><hr />

        {/* Sección de detalles de la venta */}
        <div
          id="venta-detalles-section"
          className={`venta-detalles-section ${mostrarDetalles ? '' : 'venta-hidden'}`}
        >
          <div className="venta-section-header">
            <h3 className="venta-section-title">Detalles de la Cotización</h3>
            <p className="venta-subtitle">Es obligatorio brindar al cliente toda la información relacionada con la cotización del proceso. Verifica que los datos sean correctos y confirma que el cliente comprenda cada punto antes de proceder.</p>
          </div>

          <div className="venta-table-container">
            <table className="venta-detalles-table">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th>Monto Refinanciar</th>
                  <th>Nuevo monto de Pago</th>
                  <th>Interés</th>
                  <th>Cuotas</th>
                  <th>Fechas de pago</th>
                  <th>Cronogramas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{`${datos.nombre_proyecto} - ETAPA ${datos.etapa}`}</td>
                  <td>s/{datos.saldo}</td>
                  <td>xx</td>
                  <td>xx</td>
                  <td>xx</td>
                  <td>xx</td>
                  <td className="venta-constancia-cell">
                    <button
                      className="venta-pdf-button"
                      //onClick={() => setModalPdfPreview(true)}
                    >
                      <FontAwesomeIcon icon={faFilePdf} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="refinanciamiento-acciones">
            <button className="btn-confirmar" onClick={handleConfirmar}>Confirmar</button>
            <button className="btn-cancelar" onClick={handleCancelar}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  )
}