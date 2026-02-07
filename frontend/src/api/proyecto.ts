import type { Proyectos } from "../types/Proyectos";
import type { DatosTerreno } from "../types/Proyectos";

export async function getProyectosventas(): Promise<[Proyectos]> {
  const response = await fetch("http://localhost:5000/api/proyectos/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Error al obtener los proyectos");
  return await response.json();
}

export async function buscarTerrenoPorProyecto(
  id_proyecto: string,
  codigo_unidad: string,
  etapa: string
): Promise<DatosTerreno | null> {
  const response = await fetch(
    "http://localhost:5000/api/proyectos/buscar_terreno/",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_proyecto: parseInt(id_proyecto),
        codigo_unidad,
        etapa,
      }),
    }
  );

  if (!response.ok) return null;
  return await response.json();
}

export async function insertarProyecto(
  formData: FormData
): Promise<{ success: boolean; message: string; id_proyecto?: number }> {
  try {
    const response = await fetch(
      "http://localhost:5000/api/proyectos/insertar",
      {
        method: "POST",
        body: formData,
      }
    );
    const result = await response.json();
    return {
      success: result.success,
      message: result.message || "Respuesta inesperada del servidor",
      id_proyecto: result.id_proyecto, // importante para usar en el handle
    };
  } catch (error) {
    console.error("[ERROR API insertarProyecto]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}

export async function editarProyecto(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      "http://localhost:5000/api/proyectos/editar",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    return {
      success: result.success,
      message: result.message || "Respuesta inesperada del servidor",
    };
  } catch (error) {
    console.error("[ERROR API editarProyecto]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}

export async function eliminarProyecto(
  idProyecto: number
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      "http://localhost:5000/api/proyectos/eliminar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json", 
        },
        body: JSON.stringify({ idProyecto: idProyecto }), 
      }
    );

    const result = await response.json();

    return {
      success: result.success,
      message: result.message || "Respuesta inesperada del servidor",
    };
  } catch (error) {
    console.error("[ERROR API eliminarProyecto]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}
