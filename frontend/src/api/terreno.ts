import type { Terreno } from "../types/Terreno";


// Obtener todos los terrenos
export async function getTerrenos(): Promise<Terreno[]> {
  const response = await fetch("http://localhost:5000/api/terrenos/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener los clientes activos");
  }

  const data = await response.json();
  return data.terrenos;
}

export async function insertarTerreno(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(
      "http://localhost:5000/api/terrenos/insertar",
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
    console.error("[ERROR API insertarTerreno]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}

export async function editarTerreno(terreno: Terreno): Promise<{ success: boolean; message: string }> {
  const response = await fetch("http://localhost:5000/api/terrenos/actualizar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(terreno),
  });

  return await response.json();
}
