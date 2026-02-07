import { useState } from "react";
import "../styles/oculto.css"; // Ajusta si tu ruta es diferente

export default function Oculto() {
  const [autenticado, setAutenticado] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const imagenes = import.meta.env.VITE_IMAGENES?.split(",") || [];
  const videos = import.meta.env.VITE_VIDEOS?.split(",") || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Cambia por tus credenciales fuertes
    const validUsername = import.meta.env.VITE_USERNAME;
    const validPassword = import.meta.env.VITE_PASSWORD;

    if (username === validUsername && password === validPassword) {
      setAutenticado(true);
      setError("");
    } else {
      setError("Credenciales incorrectas");
    }
  };

  if (!autenticado) {
    return (
      <div className="oculto-page-container">
        <div className="oculto-login-box">
          <h2>Acceso Restringido</h2>
          <form onSubmit={handleSubmit} className="oculto-login-form">
            <div className="oculto-input-group">
              <label>Usuario</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="oculto-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="oculto-error">{error}</p>}
            <button type="submit">Ingresar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="oculto-page-container">
      <div className="oculto-content-box">
        <h1 className="titulo-wave">
          {"Equipo Oreo".split("").map((letra, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              {letra}
            </span>
          ))}
        </h1>
        <section className="oculto-media-section">
          <h2>Imágenes</h2>
          <div className="oculto-grid">
            {imagenes.map((url: string) => (
              <img
                key={url}
                src={url}
                alt="Imagen Oculta"
                className="oculto-img"
              />
            ))}
          </div>
        </section>

        <section className="oculto-media-section">
          <h2>Videos</h2>
          <div className="oculto-grid">
            {videos.map((url: string) => (
              <video key={url} controls className="oculto-video">
                <source src={url} type="video/mp4" />
                Tu navegador no soporta videos HTML5.
              </video>
            ))}
          </div>
        </section>

        <section className="oculto-mensajes-section">
          <h2>Mensajes de los desarrolladores</h2>
          <ul className="oculto-mensajes-lista">
            <li>Gracias por utilizar nuestra aplicación.</li>
            <li>
              Este módulo fue desarrollado con mucho esfuerzo por el Equipo
              Oreo.
            </li>
            <li>Versión 1.0 - Julio 2025</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
