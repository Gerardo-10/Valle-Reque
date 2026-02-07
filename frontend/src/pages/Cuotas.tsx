import type React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect,useRef  } from "react";
import { getDetalleClienteVentas,buscarCuotasPorDni,buscarCuotasPorNombre } from "../api/cuotas"; // Importamos la función
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faEye} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faSearch, faPrint, faFileInvoice, faImage } from "@fortawesome/free-solid-svg-icons";
import ReporteCuotasPDF from "../components/ReporteCuotas";
import "../styles/cuotas.css";
import type {ClienteCuotasVentas} from "../types/Clientes";
import type { BancoDetalleActivo } from "../types/Banco";
import { getBancosActivos } from "../api/banco";
import {generarPDFVentaFinal} from "../components/generarPDFVentaFinal";
import { generarBoletaPDF } from "../components/generarBoletaPDF";

const Cuotas: React.FC = () => {
  const [cliente, setCliente] = useState<ClienteCuotasVentas | null>(null); 
  const [modalPagoActivo, setModalPagoActivo] = useState(false);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<{
    numero: number;
    fecha: string;  
    referencia: string;
    monto: string;
  } | null>(null);
  const [bancos, setBancos]= useState<BancoDetalleActivo[]>([]);
  const [selectedBancoId, setSelectedBancoId] = useState<number | "">("");
  const [modalReporteActivo, setModalReporteActivo] = useState(false);
  const [imagenComprobante, setImagenComprobante] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchMode, setSearchMode] = useState<"dni" | "nombre">("dni");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalFinalizarActivo, setModalFinalizarActivo] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<any | null>(null);
  const [montoRecaudado, setMontoRecaudado] = useState<string>(""); // vacío
  const navigate = useNavigate();

  const abrirModalFinalizar = (venta: any) => {
    setVentaSeleccionada(venta);
    setModalFinalizarActivo(true);
  };

  
  const onBuscarDni = async (dni: string) => {
    if (!dni) {
      toast.warn("Por favor ingresa un DNI");
      return;
    }
    const clienteData = await buscarCuotasPorDni(dni);
    if (clienteData) {
      setCliente(clienteData);
      toast.success("Cliente encontrado");
    } else {
      toast.error("Cliente no encontrado");
    }
  };

  const onBuscarNombre = async (nombres: string, apellidos: string) => {
    if (!nombres || !apellidos) {
      toast.warn("Por favor ingresa nombres y apellidos");
      return;
    }
    const clienteData = await buscarCuotasPorNombre(nombres, apellidos);
    if (clienteData) {
      setCliente(clienteData);
      toast.success("Cliente encontrado");
    } else {
      toast.error("Cliente no encontrado");
    }
  };

  useEffect(() => {
    getBancosActivos()
      .then((data) => {
        setBancos(data);
      })
  }, []);

  const bancoSeleccionado = bancos.find((b) => b.id === selectedBancoId);

  // Efecto para cargar los datos de la API cuando el componente se monta
  useEffect(() => {
    const fetchClienteData = async () => {
      const clienteData = await getDetalleClienteVentas();
      setCliente(clienteData);
    };
    fetchClienteData();
  }, []);

  function formatFechaUTC(fechaStr: string): string {
    const d = new Date(fechaStr);
    const day   = d.getUTCDate().toString().padStart(2, "0");
    const month = (d.getUTCMonth() + 1).toString().padStart(2, "0");
    const year  = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  const abrirModalPago = (cuota: number, fecha: string, referencia: string, monto: string) => {
    setCuotaSeleccionada({
      numero: cuota,
      fecha,
      referencia,
      monto,
    });
    setModalPagoActivo(true);
  };

  const cerrarModal = () => {
    setModalPagoActivo(false);
    setImagenComprobante(null);
  };

  const abrirModalReporte = () => {
    setModalReporteActivo(true);
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.match("image/(jpeg|jpg|png|gif|svg\\+xml)")) {
        alert("Por favor seleccione un archivo de imagen válido (SVG, PNG, JPG o GIF)");
        return;
      }
      if (file.size > 500000) {
        alert("La imagen es demasiado grande. El tamaño máximo es 800×400px");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagenComprobante(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const handlePrintContract = (rutaContrato: string) => {
    const filename = rutaContrato.split('/').pop();
    window.open(`http://localhost:5000/api/ventas/contrato/${filename}`, '_blank');
  };

  const getCuotaStatusClass = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "cuota-estado-pendiente";
      case "Pagada":
        return "cuota-estado-pagada";
      case "Con Retrazo":
      case "ConRetrazo":
        return "cuota-estado-con-retrazo";
      case "Cancelada":
        return "cuota-estado-cancelada";
      default:
        return "";
    }
  };

  const realizarPago = async () => {
    if (!cliente || !cuotaSeleccionada || !selectedBancoId || !bancoSeleccionado) {
      toast.error("Faltan datos para realizar el pago");
      return;
    }

    if (!fileInputRef.current?.files?.[0]) {
      toast.warn("Por favor, suba una imagen del comprobante de pago");
      return;
    }

    try {
      const comprobanteFile = fileInputRef.current.files[0];
      const fechaPago = new Date().toISOString(); // ISO para backend

      // 1. Generar el PDF
      const pdfBoleta = generarBoletaPDF({
        cliente,
        banco: bancoSeleccionado,
        cuota: {
          numero: cuotaSeleccionada.numero,
          fecha: fechaPago,
          referencia: cuotaSeleccionada.referencia,
          monto: cuotaSeleccionada.monto,
        },
      });

      // 2. Armar el FormData
      const formData = new FormData();
      formData.append("id_cuota", cuotaSeleccionada.numero.toString());
      formData.append("referencia", cuotaSeleccionada.referencia);
      formData.append("id_banco", selectedBancoId.toString());
      formData.append("fecha_pago", fechaPago);
      formData.append("documento_prueba", comprobanteFile); // imagen subida
      formData.append("documento_boleta", pdfBoleta);       // PDF generado

      const response = await fetch("http://localhost:5000/api/cuotas/pagar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Pago registrado exitosamente");
        cerrarModal();
        await recargarDatosCliente();
      } else {
        toast.error(result.message || "Error al registrar el pago");
      }
    } catch (error) {
      console.error("Error al pagar la cuota:", error);
      toast.error("Hubo un problema al realizar el pago");
    }
  };

  const recargarDatosCliente = async () => {
  if (searchMode === "dni") {
    await onBuscarDni(cliente?.dni || "");
  } else {
    const [nombres, ...rest] = searchQuery.trim().split(" ");
    const apellidos = rest.join(" ");
    await onBuscarNombre(nombres, apellidos);
  }
};

  const ventaEstaPagada = (venta: any): boolean => {
    return venta.cuotas.every((cuota: any) => cuota.estado_cuota_logica === "Pagada");
  };

  const finalizarVenta = async (
  cliente: any,
  venta: any,
  cuotasPagadas: any[],
  montoBono: string,
  imagenBono: File,
  idPago: number
) => {
  try {
    // Generar el PDF final
    const pdfBlob = generarPDFVentaFinal(cliente, venta, cuotasPagadas, montoBono);
    const nombreArchivo = `venta_finalizada_${venta.codigo_venta}.pdf`;
    const archivoPDF = new File([pdfBlob], nombreArchivo, { type: "application/pdf" });
    const url = URL.createObjectURL(archivoPDF);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Obtener la fecha actual en formato YYYY-MM-DD
    const fechaHoy = new Date().toISOString().split("T")[0];

    // Crear el formulario con los datos requeridos
    const formData = new FormData();
    formData.append("id_pago", idPago.toString());
    formData.append("monto_bono", montoBono);
    formData.append("fecha_cobro", fechaHoy);
    formData.append("documento_final", archivoPDF); // PDF generado
    formData.append("documento_bono", imagenBono);   // Imagen del bono (tipo File)

    const response = await fetch("http://localhost:5000/api/cuotas/finalizar-venta", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      toast.success("✅ Venta finalizada correctamente");
      setModalFinalizarActivo(false);
      await recargarDatosCliente();
    } else {
      toast.error("❌ Error: " + data.message);
    }
  } catch (error) {
    console.error("[Error al finalizar venta]:", error);
    toast.error("❌ Error al finalizar la venta");
  }
};

const onFinalizarVenta = () => {
  if (!cliente || !ventaSeleccionada) {
    toast.error("Faltan datos del cliente o la venta");
    return;
  }

  const cuotasPagadas = ventaSeleccionada.cuotas.filter(
    (cuota: any) => cuota.estado_cuota_logica === "Pagada"
  );

  if (cuotasPagadas.length === 0) {
    toast.warn("No hay cuotas pagadas para esta venta");
    return;
  }

  const idPago = cuotasPagadas[0]?.id_pago;

  if (!idPago) {
    toast.error("No se encontró el ID de pago en las cuotas pagadas");
    return;
  }

  if (!montoRecaudado) {
    toast.warn("Ingrese el monto del bono");
    return;
  }

  if (!fileInputRef.current?.files?.[0]) {
    toast.warn("Debe subir la imagen del bono");
    return;
  }

  const imagenBono = fileInputRef.current.files[0];

  finalizarVenta(
    cliente,
    ventaSeleccionada,
    cuotasPagadas,
    montoRecaudado,
    imagenBono,
    idPago
  );
};

  return (
    <div className="contenedor-principal">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="search-filter-container">
        <div className="buscar-cuotas">
          <input
            placeholder={
              searchMode === "dni"
                ? "Ingresa DNI y presiona Enter"
                : "Ingresa Nombre Apellido y presiona Enter"
            }
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (searchMode === "dni") {
                  onBuscarDni(searchQuery);
                } else {
                  // Partimos la cadena en nombre/apellido
                  const [nombres, ...rest] = searchQuery.trim().split(" ");
                  const apellidos = rest.join(" ");
                  onBuscarNombre(nombres, apellidos);
                }
              }
            }}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="search-icon"
            onClick={() => {
              if (searchMode === "dni") {
                onBuscarDni(searchQuery);
              } else {
                const [nombres, ...rest] = searchQuery.trim().split(" ");
                const apellidos = rest.join(" ");
                onBuscarNombre(nombres, apellidos);
              }
            }}
          />
        </div>

        <div className="filter-container">
          <select
            className="search-mode-select"
            value={searchMode}
            onChange={(e) => setSearchMode(e.target.value as "dni" | "nombre")}
          >
            <option value="dni">Buscar por DNI</option>
            <option value="nombre">Buscar por Nombre</option>
          </select>
        </div>
      </div>

      {/* Información del cliente */}

      {cliente && (
        <div className="client-card">
          <h2>Datos del Cliente</h2>
          <div className="client-info">
            <div className="client-details">
              <p>
                <strong>Nombres y Apellidos:</strong> {cliente.nombres}{" "}
                {cliente.apellidos}
              </p>
              <p>
                <strong>DNI:</strong> {cliente.dni}
              </p>
              <p>
                <strong>N° de Contratos Vigentes:</strong>{" "}
                {cliente.num_contratos_vigentes}
              </p>
              <p>
                <strong>Cuotas Pendientes:</strong> {cliente.cuotas_pendientes}
              </p>
              <p>
                <strong>Total de cuotas:</strong> {cliente.total_cuotas}
              </p>
            </div>
            <div className="client-actions">
              <button
                className="btn-cuotas"
                onClick={() => navigate("/tesoreria/devoluciones")}
              >
                Devoluciones
              </button>
              <button className="btn-historial" onClick={abrirModalReporte}>
                Reporte
              </button>
            </div>
          </div>
        </div>
      )}

      {cliente?.ventas.map((venta) => (
        <div className="contract-section" key={venta.id_venta}>
          <div className="contract-header">
            <div className="contract-info">
              <span className="contract-type">Proyecto: {venta.proyecto} </span>
              <span className="contract-type">
                CodigoUnidad: {venta.codigo_unidad}{" "}
              </span>
              <span className="contract-status">
                Terreno Estado: {venta.estado_terreno}
              </span>
            </div>
            <div className="contract-info">
              <span className="contract-type">
                Estado Venta: {venta.estado_venta}{" "}
              </span>
              <span className="contract-type">
                Tipo de Venta: {venta.tipo_venta}{" "}
              </span>
              <span className="contract-type">
                Venta Origen:{" "}
                {venta.id_venta_origen === null
                  ? "No tiene"
                  : venta.id_venta_origen}{" "}
              </span>
            </div>
            <h3>CÓDIGO DE VENTA: {venta.codigo_venta}</h3>
            {venta.estado_venta !== "Finalizada" ? (
              <button
                type="button"
                className="btn-historial"
                style={{ marginRight: "10px" }}
                disabled={!ventaEstaPagada(venta)}
                onClick={() => abrirModalFinalizar(venta)}
              >
                Finalizar
              </button>
            ) : (
              <button
                type="button"
                className="btn-ver-constancia"
                style={{ marginRight: "10px" }}
                onClick={() =>
                  window.open(
                    `http://localhost:5000/api/cuotas/ver-venta-final/${venta.codigo_venta}`,
                    "_blank"
                  )
                }
              >
                Ver Constancia Final
              </button>
            )}
            <button
              className="btn-print"
              onClick={() => handlePrintContract(venta.documento_contrato)}
            >
              <FontAwesomeIcon icon={faPrint} style={{ marginRight: "6px" }} />
              Ver Contrato
            </button>
          </div>
          <div className="contract-table-container">
            <table className="contract-table">
              <thead>
                <tr>
                  <th>Cuota</th>
                  <th>Fecha de Vencimiento</th>
                  <th>Referencia</th>
                  <th>Interes</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {venta.cuotas.map((cuota) => (
                  <tr key={cuota.referencia}>
                    <td>{cuota.id_cuota}</td>
                    <td>{formatFechaUTC(cuota.fecha_vencimiento)}</td>
                    <td>{cuota.referencia}</td>
                    <td>{cuota.interes}</td>
                    <td>S/{cuota.monto}</td>
                    <td>
                      <span
                        className={`cuota-estado ${getCuotaStatusClass(
                          cuota.estado_cuota_logica
                        )}`}
                      >
                        {cuota.estado_cuota_logica.replace(
                          /([a-z])([A-Z])/g,
                          "$1 $2"
                        )}
                      </span>
                    </td>
                    <td>{cuota.tipo_cuota}</td>
                    <td>
                      {cuota.estado_cuota_logica !== "Pagada" && (
                        <button
                          className={`btn-realizar-pago ${
                            cuota.estado_cuota_logica === "Cancelada"
                              ? "btn-cancelada"
                              : ""
                          }`}
                          onClick={() =>
                            abrirModalPago(
                              cuota.id_cuota,
                              cuota.fecha_vencimiento,
                              cuota.referencia,
                              cuota.monto
                            )
                          }
                          disabled={cuota.estado_cuota_logica === "Cancelada"}
                        >
                          Pagar
                        </button>
                      )}
                      {cuota.estado_cuota_logica === "Pagada" && (
                        <button
                          className="btn-ojito"
                          onClick={() =>
                            window.open(
                              `http://localhost:5000/api/cuotas/ver-boleta?id_cuota=${cuota.id_cuota}&referencia=${cuota.referencia}`,
                              "_blank"
                            )
                          }
                          title="Ver boleta"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Modal de Detalles de Cuota */}
      <div
        id="modal-pago"
        className="modalpago"
        style={{ display: modalPagoActivo ? "block" : "none" }}
      >
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
                <select
                  id="banco-select"
                  value={selectedBancoId}
                  onChange={(e) => setSelectedBancoId(Number(e.target.value))}
                >
                  <option value="">-- Elige un banco --</option>
                  {bancos.map((banco) => (
                    <option key={banco.id} value={banco.id}>
                      {`${banco.nombre}: ${banco.numero_cuenta}`}
                    </option>
                  ))}
                </select>
                <div className="payment-label">
                  Titular:{bancoSeleccionado?.titular}
                </div>
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
                        Insertar imagen de comprobante
                        <br />
                        SVG, PNG, JPG o GIF (max. 800×400px)
                      </p>
                    </div>
                  </>
                ) : (
                  <img
                    src={imagenComprobante || "/placeholder.svg"}
                    alt="Vista previa del comprobante"
                    className="image-preview"
                  />
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
            <button className="btn-cancelar" onClick={cerrarModal}>
              Cancelar
            </button>
            <button className="btn-realizar" onClick={realizarPago}>
              Realizar Pago
            </button>
          </div>
        </div>
      </div>

      <div
        id="modal-finalizar"
        className="modalpago"
        style={{ display: modalFinalizarActivo ? "block" : "none" }}
      >
        {modalFinalizarActivo && <div className="modalpago-backdrop" />}
        <div className="modalpago-content">
          <div className="modalpago-header">
            <div className="modalpago-title">
              <FontAwesomeIcon icon={faFileInvoice} />
              <h3>Finalizar Venta</h3>
            </div>
            <span
              className="close-modalpago"
              onClick={() => setModalFinalizarActivo(false)}
            >
              &times;
            </span>
          </div>
          <div className="modalpago-body">
            <div className="payment-info-grid">
              <div className="payment-info-item">
                <div className="payment-label">Fecha actual:</div>
                <div className="payment-value">
                  {new Date().toLocaleDateString("es-PE")}
                </div>
              </div>
              <div className="payment-info-item">
                <div className="payment-label">Código de venta:</div>
                <div className="payment-value">
                  {ventaSeleccionada?.codigo_venta || "No definido"}
                </div>
              </div>
              <div className="payment-info-item">
                <label className="payment-label">
                  Monto del bono recaudado (S/):
                </label>
                <input
                  type="number"
                  placeholder="Ingrese monto del bono"
                  className="payment-input"
                  step="0.01"
                  value={montoRecaudado}
                  onChange={(e) => setMontoRecaudado(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                    width: "100%",
                    fontWeight: "bold",
                  }}
                />
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
                      <p className="upload-text">Click para subir</p>
                      <p className="upload-desc">
                        Insertar imagen del comprobante final
                        <br />
                        SVG, PNG, JPG o GIF (máx. 800×400px)
                      </p>
                    </div>
                  </>
                ) : (
                  <img
                    src={imagenComprobante}
                    alt="Vista previa del comprobante"
                    className="image-preview"
                  />
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
            <button
              className="btn-cancelar"
              onClick={() => setModalFinalizarActivo(false)}
            >
              Cancelar
            </button>
            <button className="btn-realizar" onClick={onFinalizarVenta}>
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>

      {/* Modal backdrop */}
      <div
        className="modal-backdrop"
        style={{ display: modalPagoActivo ? "block" : "none" }}
        onClick={cerrarModal}
      ></div>
      <ReporteCuotasPDF
        dni={cliente?.dni || ""}
        isOpen={modalReporteActivo}
        onClose={() => setModalReporteActivo(false)}
      />
    </div>
  );
};

export default Cuotas;
