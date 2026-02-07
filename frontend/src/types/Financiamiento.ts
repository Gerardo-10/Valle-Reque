export interface Financiamiento {
    id_financiamiento: number,
    nombre: string,
    tipo: number,
    estado: string,
    interes: number,
    monto : number,
    imagen ?: string,
    fecha: string
}

export interface FinanciamientoActivoTip {
    id: number,
    nombre: string,
    tipo: number,
    estado: string,
    interes: number,
    monto : number
}