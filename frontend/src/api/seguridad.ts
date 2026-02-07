import type { SeguridadData } from "../types/Seguridad";
export async function getSeguridad(): Promise<SeguridadData[]> {
  const response = await fetch("http://localhost:5000/api/seguridad/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Error al obtener la configuración de seguridad");
  }

  return await response.json();
}

export async function getEmpleadoById(
  id_empleado: number
): Promise<SeguridadData> {
  const res = await fetch(`http://localhost:5000/api/seguridad/detalles/${id_empleado}`, { /*…*/ });
  const json = await res.json();

  const api = json.data;
  return {
    ...api,
    id_area: {
      id_area: api.area.id_area,
      nombre: api.area.nombre,
      creado: Boolean(api.area.creado),
      actualizado: Boolean(api.area.actualizado),
    },
    estado:
      api.usuario.estado === "Activo" ? 1 : 0,
    usuario: {
      id_usuario: api.usuario.id_usuario,
      id_empleado: api.usuario.id_empleado,
      id_rol: api.usuario.id_rol,
      nombre_usuario: api.usuario.nombre_usuario,
      rol: api.usuario.rol,
      area: api.usuario.area_nombre,
      estado: api.usuario.estado === "Activo"
    },
  };
}

export async function insertarEmpleado(data: any): Promise<any> {
  const response = await fetch("http://localhost:5000/api/seguridad/insertar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al registrar empleado.");
  }

  return result;
}

export async function actualizarEmpleado(data:any): Promise<any> {
  console.log("Datos a enviar:", data);
  const response = await fetch(
    "http://localhost:5000/api/seguridad/empleado/actualizar",
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
    throw new Error(result.message || "Error al actualizar empleado.");
  }

  return result;
}

export async function actualizarUsuario(data: any): Promise<any> {
  const response = await fetch(
    "http://localhost:5000/api/seguridad/usuario/actualizar",
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
    throw new Error(result.message || "Error al actualizar usuario.");
  }

  return result;
}

export async function cambiarContraseña(data: any): Promise<any> {
  const response = await fetch(
    "http://localhost:5000/api/seguridad/cambiar_contraseña",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al cambiar la contraseña.");
  }

  return result;
}

export async function obtenerIdPorUsuario(username: string): Promise<any> {
  const response = await fetch(
    "http://localhost:5000/api/seguridad/obtener_id_por_usuario",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al obtener id_empleado.");
  }

  return result.id_empleado;
}

export async function actualizarEstadoEmpleados(ids: number[], nuevoEstado: string): Promise<any> {
  const response = await fetch("http://localhost:5000/api/seguridad/actualizar_estados", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ ids, nuevo_estado: nuevoEstado }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Error al actualizar estado de empleados.");
  }

  return result;
}