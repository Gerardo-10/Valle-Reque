export interface Terreno {
  id_terreno: number;
  id_proyecto: number;
  nombre_proyecto?: string;
  etapa: number;
  area: number;
  precio_terreno: number;
  estado_terreno:
    | "Disponible"
    | "EnProceso"
    | "Reservado"
    | "Vendido"
    | "NoDisponible"
    | "Eliminado";
  tipo_terreno: "Parque" | "Esquina" | "Calle" | "Avenida" | "Esquina_Parque";
  manzana: string;
  numero_lote: number;
  codigo_unidad: string;
}

export interface TerrenoInput {
  tipo: string;
  cantidad: number;
}

export interface Manzana {
  nombre: string;
  numLotes: number;
  terrenos: TerrenoInput[];
}