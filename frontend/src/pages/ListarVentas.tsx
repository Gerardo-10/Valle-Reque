"use client"

import { useNavigate } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSearch, faEye, faPlus, faAngleDoubleLeft, faAngleLeft, faAngleRight, faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons"
import "../styles/listar-ventas.css"
import { useEffect, useState } from "react"
import { getVentas } from "../api/venta"
import type { VentaResponse } from "../types/Venta"
import Swal from "sweetalert2"

const RegistroVentas = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [filtro, setFiltro] = useState("")
  const [ventas, setVentas] = useState<VentaResponse[]>([])
  const [loading, setLoading] = useState(true)

  const [ventaSeleccionada, setVentaSeleccionada] = useState<VentaResponse | null>(null)

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [ventasPorPagina, setVentasPorPagina] = useState(5)

  useEffect(() => {
    getVentas()
      .then((data: VentaResponse[]) => setVentas(data))
      .catch((err: unknown) => console.error("Error cargando ventas:", err))
      .finally(() => setLoading(false))
  }, [])

  const ventasFiltradas = ventas.filter((venta) => {
    const terminoBusqueda = searchTerm.toLowerCase()
    if (searchTerm === "") return true

    switch (filtro) {
      case "estado":
        return venta.estado.toLowerCase().includes(terminoBusqueda)
      case "tipo":
        return venta.tipo.toLowerCase().includes(terminoBusqueda)
      case "dni":
        return venta.dni.includes(terminoBusqueda)
      default:
        return (
          venta.estado.toLowerCase().includes(terminoBusqueda) ||
          venta.tipo.toLowerCase().includes(terminoBusqueda) ||
          venta.dni.includes(terminoBusqueda)
        )
    }
  })

  // Paginación: calcular índices
  const totalPaginas = Math.ceil(ventasFiltradas.length / ventasPorPagina)
  const inicio = (currentPage - 1) * ventasPorPagina
  const fin = inicio + ventasPorPagina
  const ventasPaginadas = ventasFiltradas.slice(inicio, fin)

  const handlePrintContract = (rutaContrato: string) => {
    const filename = rutaContrato.split("/").pop()
    window.open(`http://localhost:5000/api/ventas/contrato/${filename}`, "_blank")
  }

  const handleSeleccionarVenta = (venta: VentaResponse) => {
    setVentaSeleccionada(venta)
  }

  const handleCambiarTitularidad = () => {
    if (!ventaSeleccionada) {
      Swal.fire("Seleccione una venta primero")
      return
    }
    navigate("/listar/cambiar-titular", {
      state: {
        ventaAntigua: ventaSeleccionada
      }
    })
  }

  const handleCancelar = () => {
    if (!ventaSeleccionada) {
      Swal.fire("Seleccione una venta primero")
      return
    }

    navigate("/listar/cancelar", {
      state: { id_venta: ventaSeleccionada.id_venta }
    })
  }

  const isVentaFinalizada = ventaSeleccionada?.estado === "Finalizada";


  return (
    <div className="contenedor-terrenos">
      <header className="header">
        <div className="header-content">
          <div className="header-icon">
            <i className="fa-solid fa-money-bill"></i>
          </div>
          <h1>Registros de Ventas</h1>
        </div>
      </header>

      {/* Barra de búsqueda y filtros */}
      <div className="barra-herramientas">
        <div className="busqueda-container">
          <input
            placeholder="Buscar cliente"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn-buscar">
            <FontAwesomeIcon icon={faSearch} />
          </button>
        </div>
        <div className="filtro-container">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Filtrar por...</option>
            <option value="estado">Estado</option>
            <option value="tipo">Tipo</option>
            <option value="dni">DNI</option>
          </select>
        </div>
        <button className="btn-generate" onClick={() => navigate("/ventas")}>
          Generar <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <p>Cargando ventas...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Nombres y Apellidos</th>
                <th>DNI</th>
                <th>Código</th>
                <th>Terreno</th>
                <th>Precio de Ventas</th>
                <th>Monto Financiado</th>
                <th>Monto Amortizado</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Contrato</th>
              </tr>
            </thead>
            <tbody>
              {ventasPaginadas.map((venta, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="checkbox"
                      checked={
                        ventaSeleccionada?.codigo_venta === venta.codigo_venta
                      }
                      onChange={() => handleSeleccionarVenta(venta)}
                    />
                  </td>
                  <td>
                    {venta.nombre_cliente} {venta.apellido_cliente}
                  </td>
                  <td>{venta.dni}</td>
                  <td>{venta.codigo_venta}</td>
                  <td>{venta.codigo_unidad}</td>
                  <td>S/ {parseFloat(venta.precio_venta).toFixed(2)}</td>
                  <td>S/ {parseFloat(venta.monto_financiar).toFixed(2)}</td>
                  <td>S/ {venta.total_amortizado}</td>
                  <td>
                    <span className={`status ${venta.estado.toLowerCase()}`}>
                      {venta.estado}
                    </span>
                  </td>
                  <td>{venta.tipo}</td>
                  <td>
                    {venta.documento_contrato ? (
                      <a
                        onClick={() =>
                          handlePrintContract(venta.documento_contrato)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-detalles"
                        title="Ver contrato"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </a>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      <div className="paginacion-wrapper">
        <div className="pagination-container pagination">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleDoubleLeft} />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => i + 1)
            .slice(0, 5)
            .map((page) => (
              <button
                key={page}
                className={currentPage === page ? "active" : ""}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPaginas))
            }
            disabled={currentPage === totalPaginas}
          >
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
          <button
            onClick={() => setCurrentPage(totalPaginas)}
            disabled={currentPage === totalPaginas}
          >
            <FontAwesomeIcon icon={faAngleDoubleRight} />
          </button>
        </div>

        <div className="pagination-info">
          <label htmlFor="ventasPorPagina">Ventas por página:</label>
          <select
            id="ventasPorPagina"
            value={ventasPorPagina}
            onChange={(e) => {
              setVentasPorPagina(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <br />
      <div className="action-buttons">
        <button
          className={`btn-action ${isVentaFinalizada ? "btn-disabled" : ""}`}
          onClick={handleCambiarTitularidad}
          disabled={isVentaFinalizada}
        >
          Cambiar Titularidad
        </button>

        <button
          className={`btn-action ${isVentaFinalizada ? "btn-disabled" : ""}`}
          onClick={handleCancelar}
          disabled={isVentaFinalizada}
        >
          Cancelar
        </button>
      </div>
      <br />
    </div>
  );
}

export default RegistroVentas
