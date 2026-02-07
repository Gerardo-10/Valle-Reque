import type { FinanciamientoActivoTip, Financiamiento } from "../types/Financiamiento";

export async function getFinanciamientos(): Promise<FinanciamientoActivoTip[]> {
  try {
    const response = await fetch("http://localhost:5000/api/financiamientos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error("Error al obtener los financiamientos");
    }

    const result = await response.json();

    return result.success ? result.data : [];
  } catch (error) {
    console.error("[ERROR API]:", error);
    return [];
  }
}


export async function getFinanciamientosTotales(): Promise<Financiamiento[]> {
  try {
    const response = await fetch("http://localhost:5000/api/financiamientos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    const result = await response.json();

    if (result.success) {
      return result.data.map((f: any) => ({
        id: f.id,
        nombre: f.nombre,
        tipo: f.tipo,
        monto: f.monto,
        interes: f.interes,
        estado: f.estado,
        fecha: f.fecha,
        imagen: f.foto_ref
      }));
    } else {
      return [];
    }
  } catch (error) {
    console.error("[ERROR API]:", error);
    return [];
  }
}


export async function insertarFinanciamiento(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("http://localhost:5000/api/financiamientos/insertar", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    return {
      success: result.success,
      message: result.message || "Respuesta inesperada del servidor",
    };
  } catch (error) {
    console.error("[ERROR API insertarFinanciamiento]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor",
    };
  }
}


export async function actualizarFinanciamiento(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("http://localhost:5000/api/financiamientos/actualizar", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    // Puedes validar esto si tu backend devuelve bien
    if (!result.success) {
      console.error("[ERROR RESPUESTA BACKEND]:", result.message);
    }

    return result;
  } catch (error) {
    console.error("[ERROR API actualizar]:", error);
    return { success: false, message: "Error al actualizar financiamiento" };
  }
}


export const cambiarEstadoFinanciamiento = async (id: number, nuevoEstado: string) => {
  const formData = new FormData();
  formData.append("id_financiamiento", id.toString());
  formData.append("nuevo_estado", nuevoEstado);

  try {
    const response = await fetch("http://localhost:5000/api/financiamientos/cambiar_estado", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error en la API al cambiar estado:", error);
    throw error;
  }
};