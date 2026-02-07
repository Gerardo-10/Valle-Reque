import type { RolData } from "../types/RolData";

export async function obtenerRoles(): Promise<RolData[]> {
    const response = await fetch("http://localhost:5000/api/roles");
    const data = await response.json();
    return data
}