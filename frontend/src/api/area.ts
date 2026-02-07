import type { AreaData } from "../types/AreaData";

export async function obtenerAreas(): Promise<AreaData[]> {
  const response = await fetch("http://localhost:5000/api/areas");
  const data = await response.json();
  return data;
}
