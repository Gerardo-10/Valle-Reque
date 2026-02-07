import React, { useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldAlt, faTruck, faCoins,
  faShoppingCart, faList, faFolder, faMapMarkerAlt,
  faUsers, faReceipt, faMoneyBillWave, faUniversity,
  faExchangeAlt, faAngleDown,
  type IconDefinition
} from '@fortawesome/free-solid-svg-icons';
import '../styles/sidebar.css';

interface SidebarProps {
  active: boolean; // Indica si el sidebar está abierto o cerrado
  toggleSidebar: () => void; // Función para alternar el estado del sidebar
  isMobile: boolean; // Indica si la vista actual es móvil
}

// Interfaz para la estructura de los elementos de navegación
interface NavItem {
  title: string;
  icon: IconDefinition; // Tipo para los íconos de FontAwesome
  path: string;
  submenu?: NavItem[]; // Opcional: para elementos con submenú
}

const Sidebar: React.FC<SidebarProps> = ({ active, toggleSidebar, isMobile }) => {
  const location = useLocation(); // Hook para obtener la URL actual y determinar el enlace activo

  // Estado para controlar qué submenús están expandidos
  // Inicializamos todos los submenús como cerrados por defecto
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Definición de los elementos de navegación del sidebar (se mantiene igual)
  const navItems: NavItem[] = [
    {
      title: "Seguridad",
      icon: faShieldAlt,
      path: "/seguridad"
    },
    {
      title: "Logística",
      icon: faTruck,
      path: "#",
      submenu: [
        {
          title: "Proyectos",
          icon: faFolder,
          path: "/logistica/proyectos"
        },
        {
          title: "Terrenos",
          icon: faMapMarkerAlt,
          path: "/logistica/terrenos"
        },
        {
          title: "Clientes",
          icon: faUsers,
          path: "/logistica/clientes"
        }
      ]
    },
    {
      title: "Tesorería",
      icon: faCoins,
      path: "#",
      submenu: [
        {
          title: "Cuotas de Pago",
          icon: faReceipt,
          path: "/tesoreria/cuotas"
        },
        {
          title: "Financiamientos",
          icon: faMoneyBillWave,
          path: "/tesoreria/financiamientos"
        },
        {
          title: "Bancos",
          icon: faUniversity,
          path: "/tesoreria/bancos"
        },
        {
          title: "Devoluciones",
          icon: faExchangeAlt,
          path: "/tesoreria/devoluciones"
        }
      ]
    },
    {
      title: "Ventas",
      icon: faShoppingCart,
      path: "/ventas"
    },
    {
      title: "Listar Ventas",
      icon: faList,
      path: "/listar"
    }
  ];

  /**
   * Alterna el estado de expansión de un submenú.
   * @param key La clave (título en minúsculas) del submenú a alternar.
   */
  const toggleSubmenu = useCallback((key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  /**
   * Determina si un enlace de navegación está activo basándose en la URL actual.
   * @param path La ruta del enlace.
   * @returns `true` si el enlace está activo, `false` en caso contrario.
   */
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);

  // Si aún quieres que un submenú se "abra" visualmente si uno de sus hijos está activo,
  // pero no que el usuario interactúe con él para expandirlo si ya lo está.
  // Podríamos mantener una clase 'has-active-child' pero no modificar el `expandedItems` state aquí.
  // Para tu requerimiento, eliminaremos el useEffect que modificaba expandedItems por la ruta.

  // Opcional: Un useEffect para cerrar el sidebar en móvil cuando se navega.
  // Este ya lo tienes en los `onClick` de los Links, por lo que este useEffect adicional no es estrictamente necesario
  // para el objetivo principal de este cambio. Si lo quieres, asegúrate de que no entre en conflicto.
  // Por ahora, lo mantenemos como estaba en tu código original para los clics en subitems/items.

  return (
    <aside className={`sidebar ${active ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <Link to="/dashboard" className="logo-link">
            <img src="/logo.png" alt="Logo Valle Reque" className="logo-img" />
            <span>Valle <span className="text-accent">Reque</span></span>
          </Link>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, index) => (
          <div className="nav-section" key={index}>
            {item.submenu ? (
              <>
                <a
                  href={item.path}
                  // La clase 'has-active-child' puede mantenerse para estilizar visualmente si un subitem está activo,
                  // pero no afecta la expansión/colapso controlada por `expandedItems`.
                  className={`nav-item ${expandedItems[item.title.toLowerCase()] ? 'expanded' : ''} ${item.submenu.some(sub => location.pathname.startsWith(sub.path)) ? 'has-active-child' : ''}`}
                  onClick={(e) => {
                    e.preventDefault(); // Evita la navegación del '#'
                    toggleSubmenu(item.title.toLowerCase()); // Solo alterna el estado de expansión
                  }}
                  aria-expanded={expandedItems[item.title.toLowerCase()]}
                >
                  <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
                  <span>{item.title}</span>
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    className={`submenu-arrow ${expandedItems[item.title.toLowerCase()] ? 'rotate' : ''}`}
                    aria-hidden="true"
                  />
                </a>
                <div
                  className="nav-submenu"
                  style={{
                    maxHeight: expandedItems[item.title.toLowerCase()]
                      ? `${item.submenu.length * 45}px` // Altura calculada por número de subitems
                      : '0'
                  }}
                >
                  {item.submenu.map((subitem, subindex) => (
                    <Link
                      to={subitem.path}
                      className={`nav-subitem ${isActive(subitem.path) ? 'active' : ''}`}
                      key={subindex}
                      onClick={() => isMobile && toggleSidebar()} // Cerrar sidebar en móvil al seleccionar un subitem
                    >
                      <FontAwesomeIcon icon={subitem.icon} aria-hidden="true" />
                      <span>{subitem.title}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => isMobile && toggleSidebar()} // Cerrar sidebar en móvil al seleccionar un ítem
              >
                <FontAwesomeIcon icon={item.icon} aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;