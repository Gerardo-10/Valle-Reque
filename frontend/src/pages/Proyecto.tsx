import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  editarProyecto,
  eliminarProyecto,
  getProyectosventas,
  insertarProyecto,
} from "../api/proyecto";
import type { Proyectos } from "../types/Proyectos";

import {
  faBuilding,
  faCalculator,
  faCircleInfo,
  faCircleMinus,
  faCirclePlus,
  faDollarSign,
  faFloppyDisk,
  faLocationDot,
  faPenToSquare,
  faRoad,
  faSearch,
  faSeedling,
  faTimes,
  faTree,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../styles/proyecto.css";
import Swal from "sweetalert2";
import type { Manzana } from "../types/Terreno";
import { insertarTerreno } from "../api/terreno";

const Proyecto: React.FC = () => {
  const [proyectos, setProyectos] = useState<Proyectos[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ultimoIdProyecto, setUltimoIdProyecto] = useState<number | null>(null);

  // Modales
  const [modalAgregarProyecto, setModalAgregarProyecto] = useState(false);
  const [modalEtapasProyecto, setModalEtapasProyecto] = useState(false);
  const [modalConfigurarPrecios, setModalConfigurarPrecios] = useState(false);
  const [modalEditarProyecto, setModalEditarProyecto] = useState(false);
  const [proyectoAEditar, setProyectoAEditar] = useState<Proyectos | null>(
    null
  );

  // Campos del Formulario modalAgregarProyecto
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [inversion, setInversion] = useState("");
  const [lotes, setLotes] = useState("");
  const [etapas, setEtapas] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [precioParque, setPrecioParque] = useState("");
  const [precioEsquinaParque, setPrecioEsquinaParque] = useState("");
  const [precioEsquina, setPrecioEsquina] = useState("");
  const [precioAvenida, setPrecioAvenida] = useState("");
  const [precioCalle, setPrecioCalle] = useState("");

  // Tomar datos del editar
  const [nombreEdit, setNombreEdit] = useState("");
  const [direccionEdit, setDireccionEdit] = useState("");

  // Carga los datos en el modal editar
  useEffect(() => {
    if (modalEditarProyecto && proyectoAEditar) {
      setNombreEdit(proyectoAEditar.nombre_proyecto);
      setDireccionEdit(proyectoAEditar.direccion);
    } else if (!modalEditarProyecto) {
      setNombreEdit("");
      setDireccionEdit("");
      setProyectoAEditar(null);
    }
  }, [modalEditarProyecto, proyectoAEditar]);

  // Carga datos para mostrar en la vista
  const fetchProyectos = useCallback(async () => {
    try {
      const data: Proyectos[] = await getProyectosventas();
      setProyectos(data);
    } catch (error) {
      console.error("Error fetching projects data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron obtener los datos de los proyectos.",
      });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchProyectos();
  }, [fetchProyectos]);

  // Limpiar formulario
  const limpiarFormulario = () => {
    setNombre("");
    setDireccion("");
    setInversion("");
    setLotes("");
    setEtapas("");
    setFoto(null);
    setPreview("");
  };

  // Manejo de inversión: máximo 10 dígitos en total y separador decimal "."
  const handleInversionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 1. Permitir solo números y un punto decimal
    value = value.replace(/[^\d.]/g, "");

    // 2. Si empieza con punto, anteponer un "0"
    if (value.startsWith(".")) {
      value = "0" + value;
    }

    // 3. Dividir en parte entera y decimal, asegurando solo un punto
    const parts = value.split(".");
    let intPart: string = parts[0];
    let decPart = parts[1] || "";

    // 4. Si hay más de un punto, unimos las partes adicionales al decimal
    if (parts.length > 2) {
      decPart = parts.slice(1).join("");
    }

    // 5. Limitar la parte entera a 8 dígitos
    if (intPart.length > 8) {
      intPart = intPart.slice(0, 8);
    }

    // 6. Limitar la parte decimal a 2 dígitos
    decPart = decPart.slice(0, 2);

    // 7. Reconstruir el valor
    // Si hay una parte decimal o el valor termina con un punto, reconstruimos con el punto
    if (value.includes(".")) {
      value = intPart + "." + decPart;
    } else {
      // Si no hay punto, solo usamos la parte entera
      value = intPart;
    }

    // 8. Opcional: Si el usuario borra la parte entera y queda solo ".XX", asegúrate de que sea "0.XX"
    if (value.startsWith(".") && value.length > 1) {
      value = "0" + value;
    }

    // 9. Actualizar el estado
    setInversion(value);
  };

  // Manejo lotes y etapas solo enteros positivos con límite de 10 dígitos
  const handleLotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setLotes(value.slice(0, 10));
  };

  const handleEtapasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setEtapas(value.slice(0, 10));
  };

  // Preview imagen y validación png/jpg
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const tipo = file.type;
      if (tipo === "image/png" || tipo === "image/jpeg") {
        setFoto(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === "string") {
            setPreview(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        Swal.fire("Archivo no permitido", "Solo PNG o JPG.", "warning");
        e.target.value = "";
        setFoto(null);
        setPreview("/logo.png");
      }
    }
  };

  const handlePrecioChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    let value = e.target.value;
    value = value.replace(/[^\d.]/g, ""); // Permitir solo números y punto

    if (value.startsWith(".")) {
      value = "0" + value;
    }

    const parts = value.split(".");// Limitar la parte entera a 8 dígitos
    const intPart = parts[0];
    let decPart = parts[1] || "";

    if (parts.length > 2) {
      decPart = parts.slice(1).join("");
    }

    decPart = decPart.slice(0, 2); // Limitar a 2 decimales

    value = decPart !== "" ? intPart + "." + decPart : intPart;

    setter(value);
  };

  // Botón siguiente: valida campos antes de abrir segundo modal
  const handleSiguiente = () => {
    if (!nombre) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, ingresa el nombre del proyecto.",
        "warning"
      );
      return;
    }
    if (!direccion) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, ingresa la dirección del proyecto.",
        "warning"
      );
      return;
    }
    if (!inversion) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, ingresa el monto de inversión.",
        "warning"
      );
      return;
    }
    if (!lotes) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, ingresa el número de lotes.",
        "warning"
      );
      return;
    }
    if (!etapas) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, ingresa el número de etapas.",
        "warning"
      );
      return;
    }
    if (!foto) {
      Swal.fire(
        "Campo incompleto",
        "Por favor, sube una foto del proyecto.",
        "warning"
      );
      return;
    }

    // Si todos los campos están completos, procede al siguiente modal
    setModalAgregarProyecto(false);
    setModalConfigurarPrecios(true);
  };

  // Cerrar modal agregar proyecto
  const cerrarModalAgregarProyecto = () => {
    setModalAgregarProyecto(false);
    limpiarFormulario();
  };

  
  const [totalLotesProyecto, setTotalLotesProyecto] = useState(0);
  const [etapasData, setEtapasData] = useState<{ [key: number]: Manzana[] }>({});

  const lotesUsados = Object.values(etapasData).reduce((acc, etapaManzanas) => {
    return acc + etapaManzanas.reduce((sum, m) => sum + m.numLotes, 0);
  }, 0);

  const lotesDisponibles = totalLotesProyecto - lotesUsados;
  

  // Función para insertar un proyecto
  const handleGuardarContinuar = async () => {
    // 1. Validar campos de precios
    if (
      !precioParque ||
      !precioEsquinaParque ||
      !precioEsquina ||
      !precioAvenida ||
      !precioCalle
    ) {
      Swal.fire(
        "Campos incompletos",
        "Por favor, ingresa todos los precios por m².",
        "warning"
      );
      return;
    }

    // Convertir los precios a número, limpiando el prefijo "S/" si lo hubiere
    const precios = {
      parque: parseFloat(precioParque.replace("S/", "")),
      esquinaParque: parseFloat(precioEsquinaParque.replace("S/", "")),
      esquina: parseFloat(precioEsquina.replace("S/", "")),
      avenida: parseFloat(precioAvenida.replace("S/", "")),
      calle: parseFloat(precioCalle.replace("S/", "")),
    };

    // Puedes añadir validaciones adicionales aquí, por ejemplo, que los precios sean > 0
    if (Object.values(precios).some((p) => isNaN(p) || p <= 0)) {
      Swal.fire(
        "Valores inválidos",
        "Asegúrate de que todos los precios sean números positivos.",
        "warning"
      );
      return;
    }

    // 2. Crear FormData
    const formData = new FormData();
    formData.append("nombreProyecto", nombre);
    formData.append("direccionProyecto", direccion);
    formData.append("inversionProyecto", inversion);
    formData.append("numeroLotesProyecto", lotes);
    formData.append("numeroEtapasProyecto", etapas);

    formData.append("precioParque", precios.parque.toString());
    formData.append("precioEsquinaParque", precios.esquinaParque.toString());
    formData.append("precioEsquina", precios.esquina.toString());
    formData.append("precioAvenida", precios.avenida.toString());
    formData.append("precioCalle", precios.calle.toString());

    // Adjuntar la foto si existe
    if (foto) {
      formData.append("fotoProyecto", foto);
    } else {
      formData.append("fotoProyecto", "");
    }

    // 3. Llamar a la función de la API
    try {
      const response = await insertarProyecto(formData);

      if (response.success) {
        Swal.fire("¡Éxito!", response.message, "success");

        setModalConfigurarPrecios(false);

        // ✅ Validación segura antes de setear el ID
        if (response.id_proyecto) {
          setUltimoIdProyecto(response.id_proyecto);
        }

        // Setear etapas totales y abrir modal de etapas
        setTotalEtapas(parseInt(etapas));
        setEtapaActual(1);
        setModalEtapasProyecto(true);
        setTotalLotesProyecto(parseInt(lotes)); // donde 'lotes' es el valor del input N° de Lotes


        await fetchProyectos();
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      console.error("Error al guardar el proyecto:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error inesperado al guardar el proyecto.",
        "error"
      );
    }
  };

  // Función para editar un proyecto
  const handleEditarProyecto = async () => {
    // Asegúrate de que haya un proyecto seleccionado para editar
    if (!proyectoAEditar) {
      Swal.fire(
        "Error",
        "No se ha seleccionado ningún proyecto para editar.",
        "error"
      );
      return;
    }

    // Validaciones básicas (puedes añadir más si es necesario)
    if (!nombreEdit.trim() || !direccionEdit.trim()) {
      Swal.fire(
        "Campos incompletos",
        "Por favor, ingresa el nombre y la dirección.",
        "warning"
      );
      return;
    }

    const formData = new FormData();
    formData.append("idProyecto", proyectoAEditar.id_proyecto.toString());
    formData.append("nombreProyecto", nombreEdit);
    formData.append("direccionProyecto", direccionEdit);

    try {
      const response = await editarProyecto(formData);

      if (response.success) {
        Swal.fire("¡Éxito!", response.message, "success");
        setModalEditarProyecto(false);

        setNombreEdit("");
        setDireccionEdit("");
        setProyectoAEditar(null);

        await fetchProyectos();
      } else {
        Swal.fire("Error", response.message, "error");
      }
    } catch (error) {
      console.error("Error al editar el proyecto:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error inesperado al editar el proyecto.",
        "error"
      );
    }
  };

  // Función para eliminar un proyecto
  const handleEliminarProyecto = async (
    idProyecto: number,
    nombreProyecto: string
  ) => {
    Swal.fire({
      title: `¿Estás seguro de eliminar el proyecto "${nombreProyecto}"?`,
      text: "¡No podrás revertir esto! Se marcará como inactivo y sus terrenos como 'Eliminado'.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminarlo",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await eliminarProyecto(idProyecto);

          if (response.success) {
            Swal.fire("¡Eliminado!", response.message, "success");
            await fetchProyectos();
          } else {
            Swal.fire("Error", response.message, "error");
          }
        } catch (error) {
          console.error("Error al eliminar el proyecto:", error);
          Swal.fire(
            "Error",
            "Ocurrió un error inesperado al intentar eliminar el proyecto.",
            "error"
          );
        }
      }
    });
  };

  const [manzanas, setManzanas] = useState<Manzana[]>([]);

  
  const agregarManzana = () => {
    const nuevaManzana: Manzana = {
      nombre: "",
      numLotes: 0,
      terrenos: [
        {
          tipo: "Calle",
          cantidad: 0,
        },
      ],
    };
    setManzanas([...manzanas, nuevaManzana]);
  };

  const tiposDisponibles = [
    "Calle",
    "Parque",
    "Esquina",
    "Avenida",
    "Esquina_Parque",
  ];

  const agregarTerreno = (indexManzana: number) => {
    setManzanas((prev) =>
      prev.map((m, i) => {
        if (i === indexManzana) {
          const tiposUsados = m.terrenos.map((t) => t.tipo);
          const tiposRestantes = tiposDisponibles.filter(
            (tipo) => !tiposUsados.includes(tipo)
          );

          if (m.terrenos.length < 5 && tiposRestantes.length > 0) {
            return {
              ...m,
              terrenos: [
                ...m.terrenos,
                {
                  tipo: tiposRestantes[0],
                  cantidad: 0,
                },
              ],
            };
          }
        }
        return m;
      })
    );
  };

  const eliminarTerreno = (indexManzana: number) => {
    setManzanas((prev) =>
      prev.map((m, i) => {
        if (i === indexManzana) {
          return {
            ...m,
            terrenos: m.terrenos.slice(0, -1), // elimina el último
          };
        }
        return m;
      })
    );
  };
  

  const handleNombreManzana = (indexManzana: number, valor: string) => {
    // Limpiar el valor para permitir solo letras (a-zA-Z)
    let nuevoValor = valor.replace(/[^a-zA-Z]/g, "");

    // Convertir a mayúsculas
    nuevoValor = nuevoValor.toUpperCase();

    // Limitar a máximo 2 caracteres
    if (nuevoValor.length > 2) {
      nuevoValor = nuevoValor.slice(0, 2);
    }

    setManzanas((prev) =>
      prev.map((m, i) =>
        i === indexManzana ? { ...m, nombre: nuevoValor } : m
      )
    );
  };

  const handleNumLotes = (indexManzana: number, valor: string) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const numero = soloNumeros ? parseInt(soloNumeros) : 0;

    setManzanas((prevManzanas) => {
      const nuevasManzanas = [...prevManzanas];
      const valorAnterior = nuevasManzanas[indexManzana].numLotes || 0;
      const diferencia = numero - valorAnterior;

      if (diferencia > lotesDisponibles) {
        Swal.fire(
          "Límite excedido",
          `No puedes asignar más lotes de los disponibles (${lotesDisponibles}).`,
          "warning"
        );
        return prevManzanas;
      }

      nuevasManzanas[indexManzana].numLotes = numero;

      //  ACTUALIZAR etapasData en tiempo real
      setEtapasData((prev) => {
        const copia = { ...prev };
        const etapaManzanas = copia[etapaActual] || [];

        etapaManzanas[indexManzana] = {
          ...etapaManzanas[indexManzana],
          ...nuevasManzanas[indexManzana], // asegura que numLotes y nombre se mantengan sincronizados
        };

        copia[etapaActual] = etapaManzanas;
        return copia;
      });

      return nuevasManzanas;
    });
  };
  
  
  

  const handleTipoTerreno = (
    indexManzana: number,
    indexTerreno: number,
    value: string
  ) => {
    setManzanas((prev) =>
      prev.map((m, i) => {
        if (i === indexManzana) {
          m.terrenos[indexTerreno].tipo = value;
        }
        return m;
      })
    );
  };

  const handleCantidadTerreno = (
    indexManzana: number,
    indexTerreno: number,
    valor: string
  ) => {
    const soloNumeros = valor.replace(/\D/g, "");
    const numero = soloNumeros ? parseInt(soloNumeros) : 0;

    setManzanas((prev) => {
      const nuevasManzanas = prev.map((m, i) => {
        if (i === indexManzana) {
          const sumaActual = m.terrenos.reduce(
            (acc, t, idx) => (idx === indexTerreno ? acc : acc + t.cantidad),
            0
          );
          const nuevoTotal = sumaActual + numero;

          if (nuevoTotal <= m.numLotes) {
            m.terrenos[indexTerreno].cantidad = numero;

            // ACTUALIZAR etapasData en tiempo real dentro de este if
            setEtapasData((prevEtapas) => {
              const copia = { ...prevEtapas };
              const etapaManzanas = copia[etapaActual] || [];
              const manzana = etapaManzanas[indexManzana];

              if (manzana) {
                const terrenos = [...manzana.terrenos];
                terrenos[indexTerreno] = {
                  ...terrenos[indexTerreno],
                  cantidad: numero,
                };

                etapaManzanas[indexManzana] = {
                  ...manzana,
                  terrenos,
                };

                copia[etapaActual] = etapaManzanas;
              }

              return copia;
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Cantidad excedida",
              text: `La suma de cantidades (${nuevoTotal}) excede el número de lotes (${m.numLotes}) para esta manzana.`,
              confirmButtonText: "Entendido",
            });
          }
        }
        return m;
      });
      return nuevasManzanas;
    });
  };
  
  

  const eliminarManzana = (index: number) => {
    setManzanas((prev) => prev.filter((_, i) => i !== index));
  };

  const generarResumen = () => {
    return manzanas.map((manzana) => {
      // Total de lotes por manzana: suma de todas las cantidades de terrenos
      const totalLotes = manzana.terrenos.reduce(
        (acc, terreno) => acc + terreno.cantidad,
        0
      );

      // Crear un objeto resumen por tipo de terreno
      const detalleTerrenos = tiposDisponibles.map((tipo) => {
        const cantidad = manzana.terrenos
          .filter((t) => t.tipo === tipo)
          .reduce((acc, t) => acc + t.cantidad, 0);

        return { tipo, cantidad };
      });

      return {
        nombre: manzana.nombre || "-",
        totalLotes,
        detalleTerrenos,
      };
    });
  };
  
  const confirmarCerrarModal = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Si cierras el modal se perderá la configuración de los terrenos del proyecto recién creado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setModalEtapasProyecto(false);
      }
    });
  };

  const [etapaActual, setEtapaActual] = useState(1);
  const [totalEtapas, setTotalEtapas] = useState(0);
  const esUltimaEtapa = etapaActual === totalEtapas;

  const handleSiguienteEtapa = () => {
    const etapaValida =
      manzanas.length > 0 &&
      manzanas.every(
        (m) => m.numLotes > 0 && m.terrenos.every((t) => t.cantidad > 0)
      );

    if (!etapaValida) {
      Swal.fire(
        "Datos incompletos",
        "Por favor, completa todas las manzanas y terrenos antes de continuar.",
        "warning"
      );
      return;
    }

    // Guardar la etapa actual antes de cambiar
    setEtapasData((prev) => ({
      ...prev,
      [etapaActual]: manzanas,
    }));

    if (etapaActual < totalEtapas) {
      handleCambiarEtapa(etapaActual + 1);
    } else {
      // Última etapa: enviar todo
      handleAgregarTerrenosProyecto();
    }
  };
  

  const handleCambiarEtapa = (nuevaEtapa: number) => {
    // Guardar la etapa actual antes de cambiar
    setEtapasData((prev) => ({
      ...prev,
      [etapaActual]: manzanas,
    }));

    // Cargar la etapa a la que se cambia
    const dataEtapa = etapasData[nuevaEtapa];
    if (dataEtapa) {
      setManzanas(dataEtapa);
    } else {
      setManzanas([]); // Nueva etapa sin datos aún
    }

    setEtapaActual(nuevaEtapa);
  };


  const handleAgregarTerrenosProyecto = async () => {
    if (lotesDisponibles > 0) {
      Swal.fire(
        "Lotes no distribuidos",
        `Aún quedan ${lotesDisponibles} lotes sin asignar. Por favor distribúyalos antes de guardar.`,
        "warning"
      );
      return;
    }

    try {
      // Validar idProyecto
      if (!ultimoIdProyecto) {
        Swal.fire(
          "Error",
          "No se pudo obtener el ID del proyecto. Intenta nuevamente.",
          "error"
        );
        return;
      }

      const areaDefault = 90;

      // Mostrar loader mientras se insertan los terrenos
      Swal.fire({
        title: "Creando terrenos...",
        text: "Por favor espera mientras se registran los terrenos en el proyecto.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Recorrer TODAS LAS ETAPAS GUARDADAS
      for (const [etapaNumero, manzanasEtapa] of Object.entries(etapasData)) {
        for (const manzana of manzanasEtapa) {
          const nombreManzana = manzana.nombre;

          for (const terreno of manzana.terrenos) {
            const tipoTerreno = terreno.tipo;
            const cantidad = terreno.cantidad;

            // Validación de cantidad
            if (isNaN(cantidad) || cantidad <= 0) continue;

            // Obtener precio m2 según tipo
            let precioM2 = 0;
            switch (tipoTerreno) {
              case "Parque":
                precioM2 = parseFloat(precioParque);
                break;
              case "Esquina":
                precioM2 = parseFloat(precioEsquina);
                break;
              case "Calle":
                precioM2 = parseFloat(precioCalle);
                break;
              case "Avenida":
                precioM2 = parseFloat(precioAvenida);
                break;
              case "Esquina_Parque":
                precioM2 = parseFloat(precioEsquinaParque);
                break;
              default:
                precioM2 = 0;
            }

            // Calcular precio terreno
            const precioTerreno = areaDefault * precioM2;
            
            const formData = new FormData();
            formData.append("idProyecto", ultimoIdProyecto.toString());
            formData.append("etapa", etapaNumero.toString()); // usar etapaNumero del loop
            formData.append("area", areaDefault.toString());
            formData.append("precio", precioTerreno.toFixed(2));
            formData.append("estado", "Disponible");
            formData.append("tipo", tipoTerreno);
            formData.append("manzana", nombreManzana);
            formData.append("cantidad", cantidad.toString());

            const response = await insertarTerreno(formData);

            if (!response.success) {
              console.error("[ERROR INSERTANDO TERRENO]:", response.message);
              Swal.fire(
                "Error",
                `Error al insertar terrenos en ${nombreManzana}: ${response.message}`,
                "error"
              );
              return; // detener el proceso si un insert falla
            }
          }
        }
      }

      // Si todo fue bien
      Swal.fire("¡Éxito!", "Todos los terrenos fueron registrados.", "success");

      // Cerrar modal y reiniciar
      setModalEtapasProyecto(false);
      setEtapaActual(1);
    } catch (error) {
      console.error("[ERROR handleAgregarTerrenosProyecto]:", error);
      Swal.fire(
        "Error",
        "Ocurrió un error inesperado al agregar los terrenos.",
        "error"
      );
    }
  };

  if (cargando) {
    return (
      <div className="proyecto-contenedor-principal">
        <div className="proyecto-header">
          <div className="proyecto-header-icon">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          <h2>Proyectos</h2>

          <div className="proyecto-busqueda-contenedor">
            <input
              placeholder="Buscar por Nombre"
              className="proyecto-buscar-input"
            />
            <FontAwesomeIcon className="proyecto-buscar-icon" icon={faSearch} />
          </div>
          <button className="proyecto-boton-nuevo-proyecto">Nuevo</button>
        </div>

        <div className="proyecto-contenedor">
          <div className="proyecto-tarjeta">
            {/* Mensaje de carga */}
            <div className="seguridad-cargando-datos">
              <p>Cargando datos de proyectos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="proyecto-contenedor-principal">
      <div className="proyecto-header">
        <div className="proyecto-header-icon">
          <FontAwesomeIcon icon={faBuilding} />
        </div>
        <h2>Proyectos</h2>

        <div className="proyecto-busqueda-contenedor">
          <input
            placeholder="Buscar por Nombre"
            className="proyecto-buscar-input"
          />
          <FontAwesomeIcon className="proyecto-buscar-icon" icon={faSearch} />
        </div>

        <button
          className="proyecto-boton-nuevo-proyecto"
          onClick={() => setModalAgregarProyecto(true)}
        >
          Nuevo
        </button>
      </div>

      <div className="proyecto-contenedor">
        <div className="proyecto-tarjeta"></div>
        {proyectos
          .filter((proyecto) => proyecto.estado === 1)
          .map((proyecto) => (
            <div key={proyecto.id_proyecto}>
              <div className="proyecto-titulo">{proyecto.nombre_proyecto}</div>
              <div className="proyecto-tarjeta-contenedor">
                <div className="proyecto-detalles">
                  <h3>Detalles</h3>
                  <div className="proyecto-detalle-grid">
                    <div className="proyecto-detalle-row">
                      <div className="proyecto-detalle-label">Dirección:</div>
                      <div className="proyecto-detalle-value">
                        {proyecto.direccion}
                      </div>
                    </div>
                    <div className="proyecto-detalle-row">
                      <div className="proyecto-detalle-label">Etapas:</div>
                      <div className="proyecto-detalle-value">
                        {proyecto.cantidad_etapas}
                      </div>
                    </div>
                    <div className="proyecto-detalle-row">
                      <div className="proyecto-detalle-label">N° lotes:</div>
                      <div className="proyecto-detalle-value">
                        {proyecto.cantidad_lotes}
                      </div>
                    </div>
                    <div className="proyecto-detalle-row">
                      <div className="proyecto-detalle-label">
                        Nombre Proyecto:
                      </div>
                      <div className="proyecto-detalle-value">
                        {proyecto.nombre_proyecto}
                      </div>
                    </div>
                    <div className="proyecto-detalle-row">
                      <div className="proyecto-detalle-label">Inversión:</div>
                      <div className="proyecto-detalle-value">
                        S/. {proyecto.inversion.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="proyecto-indicadores">
                  <h3>Indicadores</h3>
                  <div className="proyecto-indicadores-row">
                    <div className="proyecto-indicadores-label">
                      Monto Recaudado:
                    </div>
                    <div className="proyecto-indicadores-value">--</div>
                  </div>
                  <div className="proyecto-indicadores-row">
                    <div className="proyecto-indicadores-label">
                      N° de Ventas:
                    </div>
                    <div className="proyecto-indicadores-value">
                      <span>--</span>
                    </div>
                  </div>
                  <div className="proyecto-indicadores-row">
                    <div className="proyecto-indicadores-label">
                      N° de Reserva:
                    </div>
                    <div className="proyecto-indicadores-value">
                      <span>--</span>
                    </div>
                  </div>
                  <div className="proyecto-indicadores-row">
                    <div className="proyecto-indicadores-label">
                      N° de Devoluciones:
                    </div>
                    <div className="proyecto-indicadores-value">
                      <span>--</span>
                    </div>
                  </div>
                </div>

                <div className="proyecto-mapa">
                  <img
                    src={`http://localhost:5000/api/proyectos/imagen/${proyecto.foto_ref}`}
                    alt={`Mapa de ${proyecto.nombre_proyecto}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
              </div>

              <div className="proyecto-acciones">
                <button
                  className="proyecto-boton-eliminar-proyecto"
                  onClick={() =>
                    handleEliminarProyecto(
                      proyecto.id_proyecto,
                      proyecto.nombre_proyecto
                    )
                  }
                >
                  Eliminar
                </button>
                <button
                  className="proyecto-boton-editar-proyecto"
                  onClick={() => {
                    setProyectoAEditar(proyecto);
                    setModalEditarProyecto(true);
                  }}
                >
                  Editar
                </button>
              </div>
            </div>
          ))}
      </div>

      {modalAgregarProyecto && (
        <div className="modal-overlay-proyectos active">
          <div className="modal-proyectos modal-proyecto active">
            <div className="modal-header-proyecto">
              <div className="modal-header-izquierda">
                <div className="modal-icono">
                  <FontAwesomeIcon icon={faUserPlus} />
                </div>
                <h2>Nuevo Proyecto</h2>
              </div>
              <button
                className="modal-cerrar"
                onClick={cerrarModalAgregarProyecto}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-subtitulo-proyecto">
              <span>
                Bienvenido administrador! Recuerda siempre revisar los datos que
                estás añadiendo...
              </span>
            </div>

            <div className="modal-cuerpo-proyecto">
              <form>
                <div className="form-grupo">
                  <label htmlFor="nombreProyecto">Nombre del Proyecto</label>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={nombre}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setNombre(value);
                    }}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="direccionProyecto">Dirección</label>
                  <input
                    type="text"
                    placeholder="Dirección"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="inversionProyecto">Inversión</label>
                  <input
                    type="text"
                    placeholder="Inversión"
                    value={inversion}
                    onChange={handleInversionChange}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="numeroLotesProyecto">N° de Lotes</label>
                  <input
                    type="text"
                    placeholder="N° de lotes"
                    value={lotes}
                    onChange={handleLotesChange}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="numeroEtapasProyecto">N° de Etapas</label>
                  <input
                    type="text"
                    placeholder="N° de etapas"
                    value={etapas}
                    onChange={handleEtapasChange}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="fotoReferencialProyecto">
                    Foto Referencial
                  </label>
                  <div className="file-input-minimal-container">
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleFotoChange}
                      id="fotoProyecto"
                      className="hidden-input"
                    />
                    {/* Botón minimalista para activar la subida */}
                    <label
                      htmlFor="fotoProyecto"
                      className="upload-button-minimal"
                    >
                      Subir Foto
                    </label>
                    {/* Muestra el nombre del archivo si hay uno seleccionado */}
                    {foto && (
                      <span className="file-name-minimal">{foto.name}</span>
                    )}
                  </div>
                </div>
                {preview && (
                  <div className="preview-mapa">
                    <img src={preview} alt="Vista previa de la imagen" />
                  </div>
                )}
              </form>
            </div>
            <div className="modal-pie-form">
              <button
                type="button"
                className="btn-cancelar"
                onClick={cerrarModalAgregarProyecto}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar"
                onClick={handleSiguiente}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {modalConfigurarPrecios && (
        <div className="modal-overlay-proyectos active">
          <div className="modal-proyectos modal-precios active">
            <div className="modal-header-precios">
              <div className="modal-header-izquierda">
                <div className="modal-icono">
                  <FontAwesomeIcon icon={faDollarSign} />
                </div>
                <h2>Configuración de Precios</h2>
              </div>
              <button
                className="modal-cerrar"
                onClick={() => setModalConfigurarPrecios(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-subtitulo-proyecto">
              <span>
                Configura los precios base para cada tipo de terreno. Estos
                precios se aplicarán como referencia para todos los terrenos del
                proyecto.
              </span>
            </div>

            <div className="modal-cuerpo-proyecto">
              <div className="modal-alerta modal-alerta-proyecto">
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>
                  Los precios se actualizarán para todos los terrenos del tipo
                  seleccionado.
                </span>
              </div>

              <form>
                <div className="modal-precios-grid">
                  {/* Precio Parque */}
                  <div className="precio-card precio-parque">
                    <div className="precio-header">
                      <div className="precio-icon">
                        <FontAwesomeIcon icon={faTree} />
                      </div>
                      <h4>Parque</h4>
                    </div>
                    <div className="form-grupo">
                      <label className="precioMetro" htmlFor="precioParque">
                        Precio por m²
                      </label>
                      <div className="input-precio">
                        <span className="precio-simbolo">S/</span>
                        <input
                          id="precioParque"
                          type="text"
                          required
                          value={precioParque}
                          onChange={(e) =>
                            handlePrecioChange(e, setPrecioParque)
                          }
                        />
                      </div>
                    </div>
                    <div className="precio-descripcion">
                      Terrenos con vista o acceso directo a parques y áreas
                      verdes.
                    </div>
                  </div>

                  {/* Precio Esquina-Parque */}
                  <div className="precio-card precio-esquina-parque">
                    <div className="precio-header">
                      <div className="precio-icon">
                        <FontAwesomeIcon icon={faSeedling} />
                      </div>
                      <h4>Esquina - Parque</h4>
                    </div>
                    <div className="form-grupo">
                      <label
                        className="precioMetro"
                        htmlFor="precioEsquinaParque"
                      >
                        Precio por m²
                      </label>
                      <div className="input-precio">
                        <span className="precio-simbolo">S/</span>
                        <input
                          id="precioEsquinaParque"
                          type="text"
                          required
                          value={precioEsquinaParque}
                          onChange={(e) =>
                            handlePrecioChange(e, setPrecioEsquinaParque)
                          }
                        />
                      </div>
                    </div>
                    <div className="precio-descripcion">
                      Terrenos ubicados en esquinas con vista directa a parques
                      (ubicación premium).
                    </div>
                  </div>

                  {/* Precio Esquina */}
                  <div className="precio-card precio-esquina">
                    <div className="precio-header">
                      <div className="precio-icon">
                        <FontAwesomeIcon icon={faSeedling} />{" "}
                        {/*Falta cambiar icono */}
                      </div>
                      <h4>Esquina</h4>
                    </div>
                    <div className="form-grupo">
                      <label className="precioMetro" htmlFor="precioEsquina">
                        Precio por m²
                      </label>
                      <div className="input-precio">
                        <span className="precio-simbolo">S/</span>
                        <input
                          id="precioEsquina"
                          type="text"
                          required
                          value={precioEsquina}
                          onChange={(e) =>
                            handlePrecioChange(e, setPrecioEsquina)
                          }
                        />
                      </div>
                    </div>
                    <div className="precio-descripcion">
                      Terrenos ubicados en esquinas con doble frente.
                    </div>
                  </div>

                  {/* Precio Avenida */}
                  <div className="precio-card precio-avenida">
                    <div className="precio-header">
                      <div className="precio-icon">
                        <FontAwesomeIcon icon={faRoad} />
                      </div>
                      <h4>Avenida</h4>
                    </div>
                    <div className="form-grupo">
                      <label className="precioMetro" htmlFor="precioAvenida">
                        Precio por m²
                      </label>
                      <div className="input-precio">
                        <span className="precio-simbolo">S/</span>
                        <input
                          id="precioAvenida"
                          type="text"
                          required
                          value={precioAvenida}
                          onChange={(e) =>
                            handlePrecioChange(e, setPrecioAvenida)
                          }
                        />
                      </div>
                    </div>
                    <div className="precio-descripcion">
                      Terrenos con frente a avenidas principales.
                    </div>
                  </div>

                  {/* Precio Calle */}
                  <div className="precio-card precio-calle">
                    <div className="precio-header">
                      <div className="precio-icon">
                        <FontAwesomeIcon icon={faRoad} />
                      </div>
                      <h4>Calle</h4>
                    </div>
                    <div className="form-grupo">
                      <label className="precioMetro" htmlFor="precioCalle">
                        Precio por m²
                      </label>
                      <div className="input-precio">
                        <span className="precio-simbolo">S/</span>
                        <input
                          id="precioCalle"
                          type="text"
                          required
                          value={precioCalle}
                          onChange={(e) =>
                            handlePrecioChange(e, setPrecioCalle)
                          }
                        />
                      </div>
                    </div>
                    <div className="precio-descripcion">
                      Terrenos estándar con frente a calles internas.
                    </div>
                  </div>
                </div>

                {/* Resumen de Precios */}
                <div className="precio-resumen">
                  <h4>
                    <FontAwesomeIcon icon={faCalculator} /> Resumen de Precios
                  </h4>
                  <div className="resumen-grid">
                    <div className="resumen-item">
                      <span className="resumen-label">Parque:</span>
                      <span className="resumen-value" id="resumenParque">
                        S/ {parseFloat(precioParque || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Esquina-Parque:</span>
                      <span className="resumen-value" id="resumenEsquinaParque">
                        S/ {parseFloat(precioEsquinaParque || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Esquina:</span>
                      <span className="resumen-value" id="resumenEsquina">
                        S/ {parseFloat(precioEsquina || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Avenida:</span>
                      <span className="resumen-value" id="resumenAvenida">
                        S/ {parseFloat(precioAvenida || "0").toFixed(2)}
                      </span>
                    </div>
                    <div className="resumen-item">
                      <span className="resumen-label">Calle:</span>
                      <span className="resumen-value" id="resumenCalle">
                        S/ {parseFloat(precioCalle || "0").toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-pie-form">
              <button
                type="button"
                className="btn-atras"
                onClick={() => {
                  setModalConfigurarPrecios(false);
                  setModalAgregarProyecto(true);
                }}
              >
                Atrás
              </button>
              <button
                type="button"
                className="btn-confirmar"
                onClick={handleGuardarContinuar}
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Guardar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEditarProyecto && (
        <div className="modal-overlay-proyectos active">
          <div className="modal-proyectos modal-proyecto active">
            <div className="modal-header-proyecto">
              <div className="modal-header-izquierda">
                <div className="modal-icono">
                  <FontAwesomeIcon icon={faPenToSquare} />
                </div>
                <h2>Editar Proyecto</h2>
              </div>
              <button
                className="modal-cerrar"
                onClick={() => setModalEditarProyecto(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-cuerpo-proyecto">
              <div className="modal-subtitulo-proyecto">
                <span>
                  Ojo si quieres editar o cambiar las propiedades de las{" "}
                  <strong>Etapas</strong>, <strong>Manzanas</strong> y los{" "}
                  <strong>Terrenos</strong>. Tiene que eliminar el proyecto y
                  realizar uno nuevo.
                </span>
              </div>

              <form>
                <div className="form-grupo">
                  <label htmlFor="nombreProyecto">Nombre del Proyecto</label>
                  <input
                    type="text"
                    value={nombreEdit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      setNombreEdit(value);
                    }}
                  />
                </div>
                <div className="form-grupo">
                  <label htmlFor="direccionProyecto">Dirección</label>
                  <input
                    type="text"
                    value={direccionEdit}
                    onChange={(e) => setDireccionEdit(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="modal-pie-form">
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setModalEditarProyecto(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirmar"
                onClick={handleEditarProyecto}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {modalEtapasProyecto && (
        <div className="modal-overlay-proyectos active">
          <div className="modal-proyectos modal-proyecto active">
            <div className="modal-header-proyecto">
              <div className="modal-header-izquierda">
                <div className="modal-icono">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <h2>
                  Bienvenido a la Etapa{" "}
                  <span className="numero-etapa">{etapaActual}</span>
                </h2>
              </div>
              <button className="modal-cerrar" onClick={confirmarCerrarModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="modal-subtitulo-proyecto">
              <span>
                Es hora de configurar esta primera parte del proyecto. Recuerda
                que los terrenos por defecto el estado será{" "}
                <strong>Disponible</strong> y el tipo de terreno será{" "}
                <strong>Calle</strong>.
              </span>
            </div>

            <div className="modal-cuerpo-proyecto">
              <div className="modal-alerta modal-alerta-proyecto">
                <FontAwesomeIcon icon={faCircleInfo} />
                <span>
                  El total de terrenos por etapas y manzanas debe de coincidir
                  con el número total de terrenos del proyecto. Distribúyalos de
                  forma equilibrada.
                </span>
              </div>

              <div className="botones-eliminar-agregar-manzana">
                <button
                  type="button"
                  className="btn-eliminar-fila-manzana btn-red"
                  disabled={manzanas.length === 0}
                  onClick={() => eliminarManzana(manzanas.length - 1)}
                >
                  <FontAwesomeIcon icon={faCircleMinus} /> Eliminar Manzana
                </button>
                <button
                  type="button"
                  className="btn-agregar-fila-manzana btn-green"
                  onClick={agregarManzana}
                >
                  <FontAwesomeIcon icon={faCirclePlus} /> Agregar Manzana
                </button>
              </div>

              <div className="lotes-disponible">
                Lotes Disponibles:{" "}
                <span className="cantidad-disponible">{lotesDisponibles}</span>{" "}
                / <span className="cantidad-total">{totalLotesProyecto}</span>
              </div>

              <form>
                {manzanas.map((manzana, indexManzana) => (
                  <div className="fila-manzana" key={indexManzana}>
                    <div className="inputs-manzana">
                      <div className="form-group-manzana">
                        <label>Manzana</label>
                        <input
                          type="text"
                          value={manzana.nombre}
                          maxLength={2}
                          onChange={(e) =>
                            handleNombreManzana(indexManzana, e.target.value)
                          }
                        />
                      </div>
                      <div className="form-group-manzana">
                        <label>N° de Lotes</label>
                        <input
                          type="text"
                          onChange={(e) =>
                            handleNumLotes(indexManzana, e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (
                              !(
                                (e.key >= "0" && e.key <= "9") || // números
                                e.key === "Backspace" ||
                                e.key === "Delete" ||
                                e.key === "ArrowLeft" ||
                                e.key === "ArrowRight" ||
                                e.key === "Tab"
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </div>

                    {manzana.terrenos.map((terreno, indexTerreno) => (
                      <div className="inputs-manzana" key={indexTerreno}>
                        <div className="form-group-manzana">
                          <label>Tipo de Terreno</label>
                          <select
                            value={terreno.tipo}
                            onChange={(e) =>
                              handleTipoTerreno(
                                indexManzana,
                                indexTerreno,
                                e.target.value
                              )
                            }
                          >
                            {tiposDisponibles
                              .filter(
                                (tipo) =>
                                  tipo === terreno.tipo ||
                                  !manzana.terrenos.some((t) => t.tipo === tipo)
                              )
                              .map((tipo) => (
                                <option key={tipo} value={tipo}>
                                  {tipo}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="form-group-manzana">
                          <label>Cantidad</label>
                          <input
                            type="text"
                            onChange={(e) =>
                              handleCantidadTerreno(
                                indexManzana,
                                indexTerreno,
                                e.target.value
                              )
                            }
                            onKeyDown={(e) => {
                              if (
                                !(
                                  (e.key >= "0" && e.key <= "9") ||
                                  e.key === "Backspace" ||
                                  e.key === "Delete" ||
                                  e.key === "ArrowLeft" ||
                                  e.key === "ArrowRight" ||
                                  e.key === "Tab"
                                )
                              ) {
                                e.preventDefault();
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="botones-eliminar-agregar">
                      <button
                        type="button"
                        className="btn-eliminar-fila btn-icon-red"
                        disabled={manzana.terrenos.length <= 1}
                        onClick={() => eliminarTerreno(indexManzana)}
                      >
                        <FontAwesomeIcon icon={faCircleMinus} />
                      </button>
                      <button
                        type="button"
                        className="btn-agregar-fila btn-icon-green"
                        disabled={manzana.terrenos.length >= 5}
                        onClick={() => agregarTerreno(indexManzana)}
                      >
                        <FontAwesomeIcon icon={faCirclePlus} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="manzana-resumen">
                  <h4>Resumen:</h4>
                  {generarResumen().map((res, index) => (
                    <div className="resumen" key={index}>
                      <p>
                        <strong>Manzana {res.nombre}:</strong> {res.totalLotes}{" "}
                        Lotes
                      </p>
                      <ul>
                        {res.detalleTerrenos
                          .filter((det) => det.cantidad > 0)
                          .map((det) => (
                            <li key={det.tipo}>
                              {det.tipo}: {det.cantidad}
                            </li>
                          ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="modal-pie-form">
                  <button
                    type="button"
                    className="btn-atras"
                    onClick={() => {
                      if (etapaActual > 1) {
                        handleCambiarEtapa(etapaActual - 1);
                      }
                    }}
                    disabled={etapaActual === 1}
                  >
                    Atrás
                  </button>
                  <button
                    type="button"
                    className="btn-confirmar"
                    onClick={handleSiguienteEtapa}
                  >
                    {esUltimaEtapa ? "Guardar" : "Siguiente"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proyecto;
