export interface Banco {
  id: number;
  nombre: string;
  numero_cuenta: string;
  titular: string;
  estado: "Activo" | "Inactivo"; 
  logo?: string; 
  ver_banco: "1" | "0"; 
}

export interface BancoActivo {
  id: number;
  nombre: string;
}

export interface BancoDetalleActivo {
  id: number;
  nombre: string;
  numero_cuenta: string;
  titular: string;
  estado: string;
  logo: string;
  ver_banco: number;
}
