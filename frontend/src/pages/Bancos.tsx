import { useEffect, useState, useRef } from "react";
import { getBancos, insertarBanco, actualizarBanco, cambiarEstadoBanco } from "../api/banco";
import type { Banco } from "../types/Banco";
import "../styles/bancos.css";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversity, faPlus, faEdit, faToggleOn, faToggleOff, faTimes, faUpload, faTrash } from "@fortawesome/free-solid-svg-icons";

const Bancos: React.FC = () => {
  const [bancos, setBancos] = useState<Banco[]>([])
  const [modalAgregarBanco, setModalAgregarBanco] = useState(false)
  const [modalEditarBanco, setModalEditarBanco] = useState(false)
  const [bancoEditando, setBancoEditando] = useState<Banco | null>(null)
  const [previewImage, setPreviewImage] = useState("placeholder-bank.png")
  const [editPreviewImage, setEditPreviewImage] = useState("placeholder-bank.png")

  const logoFileRef = useRef<HTMLInputElement>(null)
  const editLogoFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const cargarBancos = async () => {
      const datos = await getBancos()
      setBancos(datos)
    }
    cargarBancos()
  }, [])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (isEdit) {
          setEditPreviewImage(result)
        } else {
          setPreviewImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAgregarBanco = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = e.target as HTMLFormElement;
    const formData = new FormData();
    const nombre = (form.elements.namedItem("nombreBanco") as HTMLInputElement).value;
    const cuenta = (form.elements.namedItem("numeroCuenta") as HTMLInputElement).value;
    const titular = (form.elements.namedItem("titular") as HTMLInputElement).value;
    const logo = logoFileRef.current?.files?.[0];

    if (!nombre || !cuenta || !titular || !logo) {
        await Swal.fire("Advertencia", "Todos los campos son obligatorios", "warning");
        return;
    }

    // Validación de tipo de archivo
    const allowedTypes = ["image/png", "image/jpeg"];
    if (!allowedTypes.includes(logo.type)) {
        await Swal.fire("Error", "Solo se permiten archivos .png o .jpeg", "error");
        return;
    }

    formData.append("nombre", nombre);
    formData.append("cuenta", cuenta);
    formData.append("titular", titular);
    formData.append("logo", logo); // Asegúrate de que esto esté correctamente configurado

    const res = await insertarBanco(formData);
    if (res.success) {
        await Swal.fire("Éxito", "Banco registrado correctamente", "success");
        const nuevos = await getBancos();
        setBancos(nuevos);
        setModalAgregarBanco(false);
        setPreviewImage("placeholder-bank.png");
    } else {
        await Swal.fire("Error", res.message, "error");
    }
};




  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bancoEditando) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData();

    const nombre = (form.elements.namedItem("editNombreBanco") as HTMLInputElement).value;
    const cuenta = (form.elements.namedItem("editNumeroCuenta") as HTMLInputElement).value;
    const titular = (form.elements.namedItem("editTitular") as HTMLInputElement).value;
    const logo = editLogoFileRef.current?.files?.[0];

    // Validación de tipo de archivo
    if (logo && !["image/png", "image/jpeg"].includes(logo.type)) {
        await Swal.fire("Error", "Solo se permiten archivos .png o .jpeg", "error");
        return;
    }

    formData.append("id_banco", bancoEditando.id.toString());
    formData.append("nombre", nombre);
    formData.append("cuenta", cuenta);
    formData.append("titular", titular);
    if (logo) formData.append("logo", logo);

    const res = await actualizarBanco(formData);
    if (res.success) {
        await Swal.fire("Actualizado", "Los datos del banco fueron actualizados", "success");
        const nuevos = await getBancos();
        setBancos(nuevos);
        setModalEditarBanco(false);
        setBancoEditando(null);
    } else {
        await Swal.fire("Error", res.message, "error");
    }
};



const toggleEstadoBanco = async (id: number, estadoActual: string) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";  // Cambiar entre Activo/Inactivo
    const confirmacion = await Swal.fire({
        title: `¿Deseas cambiar el estado a ${nuevoEstado}?`,
        text: "Esta acción actualizará el estado del banco.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
    });

  

    if (!confirmacion.isConfirmed) return;

    const res = await cambiarEstadoBanco(id, nuevoEstado);  // Asegúrate de pasar el nuevo estado
    if (res.success) {
        await Swal.fire("Actualizado", `El estado se cambió a ${nuevoEstado}`, "success");
        const nuevos = await getBancos();  // Vuelve a cargar los bancos después de actualizar el estado
        setBancos(nuevos);
    } else {
        await Swal.fire("Error", res.message, "error");
    }
};



  const handleEditarBanco = (id: number) => {
  const banco = bancos.find((b) => b.id === id)
  if (banco) {
    setBancoEditando(banco)
    setEditPreviewImage(`http://localhost:5000/upload/img/bancos/${banco.logo}`)
    setModalEditarBanco(true)
  }
}

  const handleEliminarBanco = async (id: number) => {
    const confirmacion = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción cambiará el estado del banco a inactivo y no se mostrará en la página.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (confirmacion.isConfirmed) {
      const formData = new FormData();
      formData.append("id_banco", id.toString());

      try {
        const res = await fetch("http://localhost:5000/api/bancos/eliminar", {
          method: "POST",
          body: formData
        });

        const result = await res.json();

        if (!result.success) {
          console.error("[ERROR eliminarBanco]:", result.message);
          Swal.fire("Error", result.message, "error");
        } else {
          console.log("Banco eliminado:", result.message);
          // Refresca la lista de bancos excluyendo el banco eliminado
          setBancos(prevBancos => prevBancos.filter(banco => banco.id !== id));
          Swal.fire("Eliminado", result.message, "success");
        }
      } catch (error) {
        console.error("[ERROR eliminarBanco fetch]:", error);
        Swal.fire("Error", "No se pudo eliminar el banco. Inténtalo de nuevo más tarde.", "error");
      }
    }
  };


  return (
    <div className="banco-container">
      <header className="banco-header">
        <div className="banco-header-content">
          <div className="banco-header-icon">
            <FontAwesomeIcon icon={faUniversity} />
          </div>
          <h1>Bancos</h1>
        </div>
      </header>

      <main className="banco-content">
        <div className="banco-content-header">
          <h2>Lista de Bancos</h2>
          <button className="banco-btn banco-btn-primary" onClick={() => setModalAgregarBanco(true)}>
            <FontAwesomeIcon icon={faPlus} /> Agregar
          </button>
        </div>

        <div className="banco-table-container">
          <table className="banco-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Banco</th>
                <th>N° de Cuenta</th>
                <th>Titular</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {bancos
                .filter(banco => Boolean(banco.id) === true)
                .map((banco, index) => (
                <tr key={banco.id}>
                  <td>{index + 1}</td>
                  <td className="banco-nombre">
                    <img src={`http://localhost:5000/api/bancos/logo/${banco.logo}`} alt={banco.nombre} className="banco-logo" />
                    {banco.nombre}
                  </td>
                  <td>{banco.numero_cuenta}</td>
                  <td>{banco.titular}</td>
                  <td>
                    <span className={`banco-estado ${banco.estado === "Activo" ? "banco-activo" : "banco-inactivo"}`}>
                      {banco.estado}
                    </span>
                  </td>
                  <td className="banco-acciones">
                    <button
                      className="banco-btn-icon banco-btn-edit"
                      onClick={() => handleEditarBanco(banco.id)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="banco-btn-icon banco-btn-toggle"
                      onClick={() => toggleEstadoBanco(banco.id, banco.estado)}
                    >
                      <FontAwesomeIcon icon={banco.estado === "Activo" ? faToggleOn : faToggleOff} />
                    </button>
                    <button
                      className="banco-btn-icon banco-btn-delete"
                      onClick={() => handleEliminarBanco(banco.id)}
                      title="Eliminar banco"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>

                </tr>
                
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal para agregar banco */}
      {modalAgregarBanco && (
        <div
          className="banco-modal banco-modal-agregar"
          onClick={(e) => {
            if ((e.target as HTMLElement).className === "banco-modal banco-modal-agregar") {
              setModalAgregarBanco(false)
            }
          }}
        >
          <div className="banco-modal-contenido">
            <div className="banco-modal-encabezado">
              <h2>Agregar un nuevo Banco</h2>
              <span className="banco-modal-cerrar" onClick={() => setModalAgregarBanco(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </div>
            <div className="banco-modal-cuerpo">
              <form id="agregarBancoForm" onSubmit={handleAgregarBanco}>
                <div className="banco-form-grupo">
                  <label htmlFor="nombreBanco">
                    Banco<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombreBanco"
                    name="nombreBanco"
                    required
                    maxLength={50}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '') // solo letras y espacios
                        .slice(0, 50); // máximo 50 caracteres
                    }}
                    title="Solo letras y espacios. Máximo 50 caracteres"
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="numeroCuenta">
                    N° de Cuenta<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="numeroCuenta"
                    name="numeroCuenta"
                    required
                    pattern="^\d{1,11}$"
                    title="Solo números. Máximo 11 dígitos"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 11)
                    }}
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="titular">
                    Titular<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="titular"
                    name="titular"
                    required
                    maxLength={50}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '') // solo letras y espacios
                        .slice(0, 50); // máximo 50 caracteres
                    }}
                    title="Solo letras y espacios. Máximo 50 caracteres"
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="logoBanco">
                    Logo del Banco<span className="banco-required">*</span>
                  </label>
                  <div className="banco-logo-upload-container">
                    <div className="banco-logo-preview">
                      <img src={previewImage || "/placeholder.svg"} alt="LOGO" />
                    </div>
                    <div className="banco-logo-upload">
                      <label htmlFor="logoFile" className="banco-upload-label">
                        <FontAwesomeIcon icon={faUpload} /> Subir Logo
                      </label>
                      <input
                        type="file"
                        id="logoFile"
                        name="logoFile"
                        accept="image/png, image/jpeg"
                        className="banco-file-input"
                        ref={logoFileRef}
                        required
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0]
                          const allowed = ["image/png", "image/jpeg"]
                          if (file && !allowed.includes(file.type)) {
                            alert("Solo se permiten archivos .jpg y .png")
                            e.currentTarget.value = ""
                            return
                          }
                          handleLogoChange(e)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="banco-form-acciones">
                  <button
                    type="button"
                    className="banco-btn banco-btn-secondary"
                    onClick={() => setModalAgregarBanco(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="banco-btn banco-btn-success">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar banco */}
      {modalEditarBanco && bancoEditando && (
        <div
          className="banco-modal banco-modal-editar"
          onClick={(e) => {
            if ((e.target as HTMLElement).className === "banco-modal banco-modal-editar") {
              setModalEditarBanco(false)
            }
          }}
        >
          <div className="banco-modal-contenido">
            <div className="banco-modal-encabezado">
              <h2>Editar los datos del Banco</h2>
              <span className="banco-modal-cerrar" onClick={() => setModalEditarBanco(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </div>
            <div className="banco-modal-cuerpo">
              <form id="editarBancoForm" onSubmit={handleGuardarEdicion}>
                <input type="hidden" id="editId" value={bancoEditando.id} />
                <div className="banco-form-grupo">
                  <label htmlFor="editNombreBanco">
                    Banco<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="editNombreBanco"
                    name="editNombreBanco"
                    defaultValue={bancoEditando.nombre}
                    required
                    maxLength={50}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '') // solo letras y espacios
                        .slice(0, 50); // máximo 50 caracteres
                    }}
                    title="Solo letras y espacios. Máximo 50 caracteres"
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="editNumeroCuenta">
                    N° de Cuenta<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="editNumeroCuenta"
                    name="editNumeroCuenta"
                    defaultValue={bancoEditando.numero_cuenta}
                    required
                    pattern="^\d{1,11}$"
                    title="Solo números. Máximo 11 dígitos"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "").slice(0, 11)
                    }}
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="editTitular">
                    Titular<span className="banco-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="editTitular"
                    name="editTitular"
                    defaultValue={bancoEditando.titular}
                    required
                    maxLength={50}
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value
                        .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '') // solo letras y espacios
                        .slice(0, 50); // máximo 50 caracteres
                    }}
                    title="Solo letras y espacios. Máximo 50 caracteres"
                  />
                </div>
                <div className="banco-form-grupo">
                  <label htmlFor="editLogoBanco">
                    Logo del Banco<span className="banco-required">*</span>
                  </label>
                  <div className="banco-logo-upload-container">
                    <div className="banco-logo-preview">
                      <img src={editPreviewImage || "/placeholder.svg"} alt="Vista previa del logo" />
                    </div>
                    <div className="banco-logo-upload">
                      <label htmlFor="editLogoFile" className="banco-upload-label">
                        <FontAwesomeIcon icon={faUpload} /> Cambiar Logo
                      </label>
                      <input
                        type="file"
                        id="editLogoFile"
                        name="editLogoFile"
                        accept="image/png, image/jpeg"
                        className="banco-file-input"
                        ref={editLogoFileRef}
                        onChange={(e) => {
                          const file = e.currentTarget.files?.[0]
                          const allowed = ["image/png", "image/jpeg"]
                          if (file && !allowed.includes(file.type)) {
                            alert("Solo se permiten archivos .jpg y .png")
                            e.currentTarget.value = ""
                            return
                          }
                          handleLogoChange(e, true)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="banco-form-acciones">
                  <button
                    type="button"
                    className="banco-btn banco-btn-secondary"
                    onClick={() => setModalEditarBanco(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="banco-btn banco-btn-success">
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
export default Bancos;
