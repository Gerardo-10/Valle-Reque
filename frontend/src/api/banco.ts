import type { Banco } from "../types/Banco";
import type { BancoDetalleActivo } from "../types/Banco";

// === LISTAR TODOS ===
export async function getBancos(): Promise<Banco[]> {
  try {
    const response = await fetch("http://localhost:5000/api/bancos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.success) {
      console.error("[ERROR getBancos]:", result.message);
      return [];
    }

    return result.data;
  } catch (error) {
    console.error("[ERROR API getBancos]:", error);
    return [];
  }
}

// === INSERTAR ===
export async function insertarBanco(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("http://localhost:5000/api/bancos/insertar", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: result.success,
      message: result.message || "Respuesta inesperada del servidor"
    };
  } catch (error) {
    console.error("[ERROR API insertarBanco]:", error);
    return {
      success: false,
      message: "Error al conectar con el servidor"
    };
  }
}

// === ACTUALIZAR ===
export async function actualizarBanco(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("http://localhost:5000/api/bancos/actualizar", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("[ERROR API actualizarBanco]:", error);
    return {
      success: false,
      message: "Error al actualizar banco"
    };
  }
}

// === CAMBIAR ESTADO ===
export async function cambiarEstadoBanco(id: number, nuevoEstado: string): Promise<{ success: boolean; message: string }> {
  if (!["Activo", "Inactivo"].includes(nuevoEstado)) {
    return { success: false, message: "Estado inválido. Solo se permiten 'Activo' o 'Inactivo'." };
  }

  const formData = new FormData();
  formData.append("id_banco", id.toString());
  formData.append("nuevo_estado", nuevoEstado);

  try {
    const response = await fetch("http://localhost:5000/api/bancos/cambiar_estado", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("[ERROR API cambiarEstadoBanco]:", error);
    return {
      success: false,
      message: "Error al cambiar estado del banco"
    };
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function getBancosActivos(): Promise<BancoDetalleActivo[]> {
  try {
    const res = await fetch("http://localhost:5000/api/bancos/activos", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const json: ApiResponse<BancoDetalleActivo[]> = await res.json();

    if (!res.ok || !json.success) {
      console.error("[ERROR getBancosActivos]:", json.message);
      return [];
    }
    return json.data;
  } catch (e) {
    console.error("[ERROR API getBancosActivos]:", e);
    return [];
  }
}
