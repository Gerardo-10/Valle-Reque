import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Layout from './components/Layout'
import type { ReactNode } from "react"
import Oculto from "./pages/Oculto";
import ListarClientes from './pages/ListarClientes'
import ClienteDetalles from './pages/ClienteDetalles'
import Proyecto from './pages/Proyecto'
import Terrenos from './pages/Terrenos'
import Cuotas from './pages/Cuotas'
import Devoluciones from './pages/Devoluciones';
import Bancos from './pages/Bancos'
import Ventas from './pages/Ventas'
import RegistroVentas from './pages/ListarVentas';
import CambiarTitular from './pages/CambiarTitular';
import Refinanciamiento from './pages/Refinanciamiento';
import CancelarVentas from './pages/Cancelar';
import Seguridad from './pages/Seguridad'
import Financiamientos from './pages/financiamiento'
import SeguridadDetalles from './pages/SeguridadDetalles'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem("usuario")
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirección inicial */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta pública */}
        <Route path="/login" element={<Login />} />

        <Route path="equipo/oreo" element={<Oculto />} />

        {/* Rutas protegidas con Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="logistica/clientes" element={<ListarClientes />} />
          <Route
            path="logistica/clientes/detalles/:id"
            element={<ClienteDetalles />}
          />
          <Route path="logistica/proyectos" element={<Proyecto />} />
          <Route path="logistica/terrenos" element={<Terrenos />} />
          <Route path="tesoreria/cuotas" element={<Cuotas />} />
          <Route path="tesoreria/devoluciones" element={<Devoluciones />} />
          <Route path="tesoreria/bancos" element={<Bancos />} />
          <Route
            path="tesoreria/financiamientos"
            element={<Financiamientos />}
          />
          <Route path="ventas" element={<Ventas />} />
          <Route path="seguridad" element={<Seguridad />} />
          <Route
            path="seguridad/detalles/:id"
            element={<SeguridadDetalles />}
          />

          {/* Estas rutas también deben ir dentro del Layout */}
          <Route path="listar" element={<RegistroVentas />} />
          <Route path="listar/cambiar-titular" element={<CambiarTitular />} />
          <Route path="listar/finalizar" element={<div>Finalizar</div>} />
          <Route path="listar/refinanciar" element={<Refinanciamiento />} />
          <Route path="listar/cancelar" element={<CancelarVentas />} />
        </Route>
      </Routes>
    </Router>
  );
}


export default App
