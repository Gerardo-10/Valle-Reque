import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBars, faSearch, faBell, faUser,
  faCog, faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'
import { useNavigate } from "react-router-dom"
import '../styles/navbar.css'

interface NavbarProps {
  toggleSidebar: () => void
  isMobile: boolean
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isMobile }) => {
  // Estado para controlar la visibilidad del menú desplegable del usuario
  const [userDropdownActive, setUserDropdownActive] = useState(false)
  // Referencia para detectar clics fuera del dropdown y cerrarlo
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Hook para la navegación programática
  const navigate = useNavigate()
  // Estados para mostrar la información del usuario
  const [areaUsuario, setRolUsuario] = useState<string>("")
  const [nombreUsuario, setNombreUsuario] = useState<string>("")

  // Efecto para cargar la información del usuario desde localStorage al montar el componente
  useEffect(() => {
    const storedUser = localStorage.getItem("usuario")
    if (storedUser) {
      try {
        const usuario = JSON.parse(storedUser)
        setNombreUsuario(usuario.nombre_usuario || "Usuario")
        setRolUsuario(usuario.area || "Área Desconocida")
      } catch (e) {
        console.error("Error al parsear datos de usuario de localStorage:", e)
        // Opcional: limpiar localStorage si los datos son inválidos
        localStorage.removeItem("usuario")
      }
    }
  }, [])

  /**
   * Maneja el cierre de sesión del usuario.
   * Elimina la información del usuario de localStorage y redirige a la página de login.
   */
  const handleLogout = useCallback(() => {
    localStorage.removeItem("usuario")
    navigate("/login")
  }, [navigate])

  /**
   * Alterna la visibilidad del menú desplegable del usuario.
   * Detiene la propagación del evento para evitar que el `handleClickOutside` lo cierre inmediatamente.
   * @param e Evento de clic.
   */
  const toggleUserDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    setUserDropdownActive(prev => !prev)
  }, [])

  // Efecto para cerrar el menú desplegable del usuario al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownActive(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="top-header">
      <div className="header-left">
        {/* Botón de alternar sidebar para móvil, visible solo en isMobile */}
        {isMobile && (
          <button className="menu-toggle-mobile" onClick={toggleSidebar} aria-label="Abrir/cerrar menú lateral">
            <FontAwesomeIcon icon={faBars} />
          </button>
        )}
      </div>

      <div className="header-right">
        {/* Caja de búsqueda */}
        <div className="search-box">
          <FontAwesomeIcon icon={faSearch} aria-hidden="true" />
          <input type="text" placeholder="Buscar..." aria-label="Campo de búsqueda" />
        </div>

        {/* Notificaciones */}
        <div className="notifications">
          <button className="icon-btn" aria-label="Ver notificaciones">
            <FontAwesomeIcon icon={faBell} />
            <span className="badge">3</span> {/* Número de notificaciones */}
          </button>
        </div>

        {/* Perfil de usuario y menú desplegable */}
        <div className={`user-profile ${userDropdownActive ? 'active' : ''}`} ref={dropdownRef}>
          <div className="user-info" onClick={toggleUserDropdown}>
            <span className="user-name">{nombreUsuario}</span>
          </div>
          <img
            src="/perfil.png"
            alt="Avatar del usuario"
            className="avatar"
            onClick={toggleUserDropdown}
            role="button" // Indica que la imagen es clickeable
            aria-haspopup="true" // Indica que es un elemento que abre un popup
            aria-expanded={userDropdownActive} // Indica si el popup está abierto o cerrado
          />

          {/* Menú desplegable del usuario, visible solo si userDropdownActive es true */}
          <div className="user-dropdown">
            <div className="dropdown-header">
              <img
                src="/perfil.png"
                alt="Avatar grande del usuario"
                className="avatar-large"
              />
              <div className="user-details">
                <h4>{nombreUsuario}</h4>
                <p>{areaUsuario}</p>
              </div>
            </div>
            <div className="dropdown-body">
              <a href="#" className="dropdown-item" role="menuitem">
                <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                <span>Mi Perfil</span>
              </a>
              <a href="#" className="dropdown-item" role="menuitem">
                <FontAwesomeIcon icon={faCog} aria-hidden="true" />
                <span>Configuración</span>
              </a>
              <a
                href="#"
                className="dropdown-item"
                onClick={(e) => { e.preventDefault(); handleLogout(); }}
                role="menuitem"
              >
                <FontAwesomeIcon icon={faSignOutAlt} aria-hidden="true" />
                <span>Cerrar Sesión</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar