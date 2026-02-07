import type React from "react"
import { useState, useRef, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faSearch,
  faChevronDown,
  faPrint,
  faFileInvoice,
  faImage,
} from "@fortawesome/free-solid-svg-icons"
import "../styles/cuotas.css"

interface Cuota {
  numero: number
  fecha: string
  referencia: string
  monto: string
  estado: "Pendiente" | "Pagado" | "Atrasado"
  interes: string
}

interface Contrato {
  codigo: string
  tipo: string
  estado: string
  cuotas: Cuota[]
}

const Cuotas: React.FC = () => {
  // Estados para el modal
  const [modalPagoActivo, setModalPagoActivo] = useState(false)
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<{
    numero: number
    fecha: string
    referencia: string
    monto: string
  } | null>(null)

  // Estado para la imagen de comprobante
  const [imagenComprobante, setImagenComprobante] = useState<string | null>(null)

  // Referencia para el input de archivo
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Datos de ejemplo
  const contratos: Contrato[] = [
    {
      codigo: "001-VR",
      tipo: "Terreno",
      estado: "Activo",
      cuotas: [
        { numero: 1, fecha: "26/02/2023", referencia: "ASDF-1", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 2, fecha: "26/03/2023", referencia: "ASDF-2", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 3, fecha: "26/04/2023", referencia: "ASDF-3", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 4, fecha: "26/05/2023", referencia: "ASDF-4", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
      ],
    },
    {
      codigo: "002-SJ",
      tipo: "Terreno",
      estado: "Activo",
      cuotas: [
        { numero: 1, fecha: "I", referencia: "AFAF-1", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 2, fecha: "I", referencia: "AFAF-2", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 3, fecha: "II", referencia: "AFAF-3", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
        { numero: 4, fecha: "III", referencia: "AFAF-4", monto: "10.000", estado: "Pendiente", interes: "1.2%" },
      ],
    },
  ]

  // Función para abrir el modal de pago
  const abrirModalPago = (cuota: number, fecha: string, referencia: string, monto: string) => {
    setCuotaSeleccionada({
      numero: cuota,
      fecha,
      referencia,
      monto,
    })
    setModalPagoActivo(true)
  }

  // Función para cerrar el modal
  const cerrarModal = () => {
    setModalPagoActivo(false)
    setImagenComprobante(null)
  }

  // Función para manejar la carga de archivos
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.match("image/(jpeg|jpg|png|gif|svg\\+xml)")) {
        alert("Por favor seleccione un archivo de imagen válido (SVG, PNG, JPG o GIF)")
        return
      }

      // Validar tamaño
      if (file.size > 500000) {
        alert("La imagen es demasiado grande. El tamaño máximo es 800×400px")
        return
      }

      // Crear URL para vista previa
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagenComprobante(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Función para manejar clic en el contenedor de carga
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  // Función para realizar el pago
  const realizarPago = () => {
    if (!imagenComprobante) {
      alert("Por favor, suba una imagen del comprobante de pago")
      return
    }

    // Aquí iría la lógica para enviar el pago al servidor
    alert("Pago realizado con éxito")
    cerrarModal()
  }

  // Efecto para bloquear el scroll cuando el modal está activo
  useEffect(() => {
    if (modalPagoActivo) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [modalPagoActivo])

  return (
    <div className="contenedor-principal">
      <div className="search-filter-container">
        <div className="buscar-cuotas">
          <input placeholder="Busca al cliente" className="search-input" />
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </div>
        <div className="filter-container">
          <button className="filter-button">
            <span>Filtrar por...</span>
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
        </div>
      </div>

      <div className="client-card">
        <h2>Datos del Cliente</h2>
        <div className="client-info">
          <div className="client-details">
            <p><strong>Nombres y Apellidos:</strong> Billy Emmanuel Reaño Davila</p>
            <p><strong>N° de Contratos Vigentes:</strong> 2</p>
            <p><strong>Cuotas Devueltas:</strong> 2</p>
            <p><strong>Cuotas a Devolver:</strong> 5</p>
          </div>
          <div className="client-actions">
            <button className="btn-cuotas">Devolucion</button>
            <button className="btn-historial">Historial</button>
          </div>
        </div>
      </div>

      {contratos.map((contrato, index) => (
        <div className="contract-section" key={index}>
          <div className="contract-header">
            <div className="contract-info">
              <span className="contract-type">Tipo: {contrato.tipo}</span>
              <span className="contract-status">Estado: {contrato.estado}</span>
            </div>
            <h3>CÓDIGO DE DEVOLUCION: {contrato.codigo}</h3>
            <button className="btn-print">
              <FontAwesomeIcon icon={faPrint} />
            </button>
          </div>
          <div className="contract-table-container">
            <table className="contract-table">
              <thead>
                <tr>
                  <th>Cuota</th>
                  <th>Fecha de Vencimiento</th>
                  <th>Referencia</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Interés</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {contrato.cuotas.map((cuota) => (
                  <tr key={cuota.referencia}>
                    <td>{cuota.numero}</td>
                    <td>{cuota.fecha}</td>
                    <td>{cuota.referencia}</td>
                    <td>S/{cuota.monto}</td>
                    <td>
                      <span className={`status-badge ${cuota.estado.toLowerCase()}`}>{cuota.estado}</span>
                    </td>
                    <td>{cuota.interes}</td>
                    <td>
                      <button
                        className="btn-realizar-pago"
                        onClick={() => abrirModalPago(cuota.numero, cuota.fecha, cuota.referencia, cuota.monto)}
                      >
                        Realizar Pago
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

     {/* Modal de Detalles de Cuota */}
      <div id="modal-pago" className="modalpago" style={{ display: modalPagoActivo ? 'block' : 'none' }}>
{modalPagoActivo && <div className="modalpago-backdrop" />}

        <div className="modalpago-content">
    <div className="modalpago-header">
      <div className="modalpago-title">
        <FontAwesomeIcon icon={faFileInvoice} />
        <h3>Detalles de Cuota</h3>
      </div>
      <span className="close-modalpago" onClick={cerrarModal}>
        &times;
      </span>
    </div>
    <div className="modalpago-body">
            <div className="payment-info-grid">
              <div className="payment-info-item">
                <div className="payment-label">Fecha de vencimiento:</div>
                <div className="payment-value" id="modal-fecha">
                  {cuotaSeleccionada?.fecha}
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-label">Estado:</div>
                <div className="payment-value" id="modal-estado">
                  Pendiente
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-label">Monto:</div>
                <div className="payment-value" id="modal-monto">
                  S/{cuotaSeleccionada?.monto}
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-label">Referencia:</div>
                <div className="payment-value" id="modal-referencia">
                  {cuotaSeleccionada?.referencia}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="banco-select">Seleccione banco:</label>
              <div className="select-wrapper">
                <select id="banco-select">
                  <option value="bbva">BBVA: 12223-1212333-32324</option>
                  <option value="bcp">BCP: 191-7654321-0-23</option>
                  <option value="interbank">Interbank: 200-3042873025</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Foto de comprobante*</label>
              <div className="upload-container" onClick={handleUploadClick}>
                {!imagenComprobante ? (
                  <>
                    <div className="upload-preview">
                      <FontAwesomeIcon icon={faImage} />
                    </div>
                    <div className="upload-info">
                      <p className="upload-text">Click to upload</p>
                      <p className="upload-desc">
                        Insertar imagen de comprobante<br />SVG, PNG, JPG o GIF (max. 800×400px)
                      </p>
                    </div>
                  </>
                ) : (
                  <img src={imagenComprobante || "/placeholder.svg"} alt="Vista previa del comprobante" className="image-preview" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg,image/png,image/gif,image/svg+xml"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>
    <div className="modalpago-footer">
      <button className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
      <button className="btn-realizar" onClick={realizarPago}>Realizar Pago</button>
    </div>
  </div>
</div>

      {/* Modal backdrop */}
      <div
        className="modal-backdrop"
        style={{ display: modalPagoActivo ? 'block' : 'none' }}
        onClick={cerrarModal}
      ></div>
    </div>
  )
}

export default Cuotas
