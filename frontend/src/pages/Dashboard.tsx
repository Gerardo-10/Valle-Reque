import type React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faUsers,
  faFileInvoiceDollar,
  faMapMarkerAlt,
  faMoneyBillWave,
  faUserPlus,
  faFileSignature,
  faMoneyCheck,
} from "@fortawesome/free-solid-svg-icons"
import "../styles/dashboard.css"

const Dashboard: React.FC = () => {
  return (
    <>
      <div className="welcome-card">
        <div className="welcome-content">
          <h2>Bienvenido al Sistema Valle Reque</h2>
          <p>Seleccione una opción del menú para comenzar</p>
        </div>
        <div className="welcome-image">
          <img src="/logo.png" alt="Valle Reque" className="welcome-logo" />
        </div>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          icon={faUsers}
          title="Clientes"
          value="248"
          change="+12%"
          changeText="este mes"
          positive={true}
        />

        <DashboardCard
          icon={faFileInvoiceDollar}
          title="Ventas"
          value="S/ 125,400"
          change="+8%"
          changeText="este mes"
          positive={true}
        />

        <DashboardCard
          icon={faMapMarkerAlt}
          title="Terrenos"
          value="56"
          change="-3%"
          changeText="disponibles"
          positive={false}
        />

        <DashboardCard
          icon={faMoneyBillWave}
          title="Financiamientos"
          value="32"
          change="+5%"
          changeText="este mes"
          positive={true}
        />
      </div>

      <div className="recent-activity">
        <div className="section-header">
          <h2>Actividad Reciente</h2>
          <button className="btn-text">Ver todo</button>
        </div>

        <div className="activity-list">
          <ActivityItem
            icon={faUserPlus}
            text="Nuevo cliente registrado: <strong>María Rodríguez</strong>"
            time="Hace 2 horas"
          />

          <ActivityItem
            icon={faFileSignature}
            text="Contrato firmado: <strong>Terreno A-042</strong>"
            time="Hace 5 horas"
          />

          <ActivityItem
            icon={faMoneyCheck}
            text="Pago recibido: <strong>S/ 12,500</strong> de <strong>Juan Pérez</strong>"
            time="Hace 1 día"
          />
        </div>
      </div>
    </>
  )
}

interface DashboardCardProps {
  icon: import("@fortawesome/fontawesome-svg-core").IconDefinition
  title: string
  value: string
  change: string
  changeText: string
  positive: boolean
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, change, changeText, positive }) => {
  return (
    <div className="dashboard-card">
      <div className="card-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="card-content">
        <h3>{title}</h3>
        <p className="card-value">{value}</p>
        <p className={`card-change ${positive ? "positive" : "negative"}`}>
          {change} <span>{changeText}</span>
        </p>
      </div>
    </div>
  )
}

interface ActivityItemProps {
  icon: import("@fortawesome/fontawesome-svg-core").IconDefinition
  text: string
  time: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ icon, text, time }) => {
  return (
    <div className="activity-item">
      <div className="activity-icon">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="activity-content">
        <p className="activity-text" dangerouslySetInnerHTML={{ __html: text }} />
        <p className="activity-time">{time}</p>
      </div>
    </div>
  )
}

export default Dashboard
