import type { Cliente,ListarCliente } from "../types/Clientes";

export async function getClientesActivos(): Promise<ListarCliente[]> {
  const resp = await fetch("http://localhost:5000/api/clientes/", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!resp.ok) {
    throw new Error("Error al obtener los clientes activos");
  }

  // El JSON ya viene con "id" y el resto de campos
  const raw = await resp.json() as ListarCliente[];
  return raw;
}

export async function getClienteById(
  id_cliente: number
): Promise<Cliente> {
  const response = await fetch(
    `http://localhost:5000/api/clientes/detalles/${id_cliente}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Error al obtener el cliente");
  }

  const data = await response.json();
  return data.cliente; // Asume que la respuesta es {success: true, data: {...}}
}

export async function insertarCliente(data: any): Promise<any> {
  const response = await fetch("http://localhost:5000/api/clientes/insertar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al registrar cliente.");
  }

  return result;
}


export async function actualizarEstadoClientes(ids: number[], nuevoEstado: string): Promise<any> {
  const response = await fetch("http://localhost:5000/api/clientes/actualizar_estado", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({ ids, estado: nuevoEstado })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al actualizar estado de clientes.");
  }

  return result;
}

export async function eliminarClientes(ids: number[]): Promise<any> {
  const response = await fetch("http://localhost:5000/api/clientes/eliminar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ ids })
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al eliminar clientes.");
  }

  return result;
}


export async function getClientePorDni(dni: string): Promise<ListarCliente | null> {
  const response = await fetch(`http://localhost:5000/api/clientes/dni/${dni}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include"
  });

  if (!response.ok) return null;

  const data = await response.json();

  if (data.success && data.cliente) {
    return data.cliente;
  }
  return null;
}

interface ActualizarClienteResponse {
  success: boolean;
  message?: string;
  cliente?: Cliente;
}

export async function actualizarCliente(data: Cliente): Promise<ActualizarClienteResponse> {
  console.log("Datos a enviar:", data);
  const response = await fetch(
    "http://localhost:5000/api/clientes/detalles/actualizar",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result: ActualizarClienteResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al actualizar cliente.");
  }

  return result;
}

export async function actualizarClienteFamiliar(data: any): Promise<any> {
  console.log("Datos familiar a enviar:", data);
  const response = await fetch(
    "http://localhost:5000/api/clientes/familiar/actualizar",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al actualizar familiar.");
  }

  return result;
}

export async function insertarClienteFamiliar(data: any): Promise<any> {
  const response = await fetch(
    `http://localhost:5000/api/clientes/familiar/insertar`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}