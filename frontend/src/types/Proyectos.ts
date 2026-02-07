export interface Proyectos {
    id_proyecto: number;
    nombre_proyecto: string;
    direccion: string;
    inversion: number;
    cantidad_lotes: number;
    cantidad_etapas: number;
    precio_parque: number;
    precio_esquina: number;
    precio_calle: number;
    precio_avenida: number;
    precio_esquina_parque: number;
    foto_ref : string;
    estado: number;
}

export interface VentasProyectos {
    id_proyecto: number;
    nombre_proyecto: string;
    cantidad_etapas: number;
}

export interface DatosTerreno {
    disponible: boolean;
    precio: number;
    tipo: string;
    area: string;
    id_terreno: number;
}