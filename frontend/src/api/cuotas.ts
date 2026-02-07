// src/api/cuotas.ts

import type { ClienteCuotasVentas } from "../types/Clientes";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Formatea fechas a dd/MM/yyyy

// === 1. GET /api/cuotas/ ===
// (si de verdad existe este endpoint y devuelve un array con un solo cliente)
export async function getDetalleClienteVentas(): Promise<
  ClienteCuotasVentas | null
> {
  try {
    const res = await fetch("http://localhost:5000/api/cuotas/", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error al cargar cuotas");
    const arr = await res.json();
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error("No se encontraron datos de cliente");
    }
    const cliente = arr[0] as ClienteCuotasVentas;
    return cliente;
  } catch (e) {
    console.error("[API getDetalleClienteVentas]", e);
    return null;
  }
}

// === 2. POST /api/cuotas/buscar/dni ===
export async function buscarCuotasPorDni(
  dni: string
): Promise<ClienteCuotasVentas | null> {
  try {
    const res = await fetch("http://localhost:5000/api/cuotas/buscar/dni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ dni }),
    });
    const json: ApiResponse<ClienteCuotasVentas> = await res.json();
    if (!res.ok || !json.success) {
      console.error("[API buscarCuotasPorDni]", json.message);
      return null;
    }
    const cliente = json.data!;
    return cliente;
  } catch (e) {
    console.error("[API buscarCuotasPorDni] Error de conexión:", e);
    return null;
  }
}

// === 3. POST /api/cuotas/buscar/nombre ===
export async function buscarCuotasPorNombre(
  nombres: string,
  apellidos: string
): Promise<ClienteCuotasVentas | null> {
  try {
    const res = await fetch("http://localhost:5000/api/cuotas/buscar/nombre", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nombres, apellidos }),
    });
    const json: ApiResponse<ClienteCuotasVentas> = await res.json();
    if (!res.ok || !json.success) {
      console.error("[API buscarCuotasPorNombre]", json.message);
      return null;
    }
    const cliente = json.data!;
    return cliente;
  } catch (e) {
    console.error("[API buscarCuotasPorNombre] Error de conexión:", e);
    return null;
  }
}
