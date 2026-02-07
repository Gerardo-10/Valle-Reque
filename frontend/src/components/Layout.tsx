import React, { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Navbar from "./NavBar"
import "../styles/layout.css"

const Layout: React.FC = () => {
  // Estado para controlar la visibilidad del sidebar (activo/inactivo)
  const [sidebarActive, setSidebarActive] = useState(true)
  // Estado para detectar si la vista es móvil (usado para el comportamiento del sidebar)
  const [isMobile, setIsMobile] = useState(false)

  // Efecto para ajustar el estado del sidebar y detectar si es móvil en base al tamaño de la ventana
  useEffect(() => {
    const checkIfMobile = () => {
      // Definimos el breakpoint para móvil (coincide con el CSS)
      const mobileBreakpoint = 992
      const isMobileView = window.innerWidth < mobileBreakpoint
      
      setIsMobile(isMobileView)

      // Si la vista cambia de desktop a móvil o viceversa, ajusta el estado del sidebar.
      // En móvil, por defecto, el sidebar está oculto. En desktop, visible.
      if (isMobileView !== isMobile) {
        setSidebarActive(!isMobileView)
      }
    }

    // Ejecutar la verificación al montar el componente
    checkIfMobile()

    // Agregar un event listener para ajustar en cada cambio de tamaño de ventana
    window.addEventListener("resize", checkIfMobile)

    // Función de limpieza para remover el event listener al desmontar el componente
    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [isMobile]) // Dependencia: isMobile para reaccionar solo cuando cambia la categoría móvil/desktop

  /**
   * Alterna el estado de visibilidad del sidebar.
   */
  const toggleSidebar = () => {
    setSidebarActive(prev => !prev)
  }

  return (
    <div className="app-container">
      {/* Sidebar: Se le pasan los props para controlar su estado y el toggle */}
      <Sidebar active={sidebarActive} toggleSidebar={toggleSidebar} isMobile={isMobile} />

      {/* Overlay para móvil: Solo se muestra si es vista móvil Y el sidebar está activo */}
      {isMobile && sidebarActive && (
        <div 
          className="sidebar-overlay active" // La clase 'active' controla la visibilidad y opacidad
          onClick={() => setSidebarActive(false)} // Cierra el sidebar al hacer clic fuera
          aria-label="Cerrar menú lateral"
        />
      )}

      {/* Contenido principal: Su margen y ancho se ajustan dinámicamente según el estado del sidebar y si es móvil */}
      <main
        className="main-content"
        style={{
          // En móvil, el margen es 0. En desktop, si el sidebar está activo, margen igual al ancho del sidebar, sino 0.
          marginLeft: isMobile ? "0" : sidebarActive ? "var(--sidebar-width)" : "0",
          // En móvil, el ancho es 100%. En desktop, si el sidebar está activo, el ancho es el restante después del sidebar, sino 100%.
          width: isMobile ? "100%" : sidebarActive ? `calc(100% - var(--sidebar-width))` : "100%",
          transition: "margin-left var(--transition), width var(--transition)", // Transición suave para estos cambios
        }}
      >
        {/* Navbar: Se le pasa la función para alternar el sidebar y si es móvil */}
        <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile} />
        
        {/* Contenido de la página (rutas anidadas) */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default Layout