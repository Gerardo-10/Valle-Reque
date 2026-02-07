from src.entities.seguridad import Seguridad
from src.database.connection import get_connection


class ModelSeguridad:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_seguridad_general()")
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            seguridad = [Seguridad(*row) for row in rows]
            return seguridad
        except Exception as e:
            print(f"[ERROR get_all Seguridad]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def get_empleado_por_id_general(cls, id_empleado):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_empleado_por_id_general(%s)", (id_empleado,))
            row = cursor.fetchone()
            while cursor.nextset(): pass
            if row:
                return {
                    "id_empleado": row[0],
                    "nombre": row[2],
                    "apellido": row[3],
                    "dni": row[4],
                    "direccion": row[5],
                    "telefono": row[6],
                    "correo": row[7],
                    "fecha_nacimiento": row[8],
                }
            return None
        except Exception as e:
            print(f"[ERROR get_empleado_por_id_general Seguridad]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass        

    @classmethod
    def insert(cls, seguridad):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # 1. Verificar si el DNI ya existe con estado activo (estado = 1)
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.dni = %s AND u.estado = 1
            """, (seguridad.dni,))
            if cursor.fetchone():
                return {"success": False, "message": "El DNI ya está registrado y activo."}

            # 2. Verificar si el DNI ya existe con estado eliminado (estado = 0)
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.dni = %s AND u.estado = 0
            """, (seguridad.dni,))
            if cursor.fetchone():
                return {"success": False, "message": "Este DNI pertenece a un empleado eliminado. Contacte con el administrador."}

            # 3. Verificar si el correo ya está registrado y activo
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.correo_electronico = %s AND u.estado = 1
            """, (seguridad.correo,))
            if cursor.fetchone():
                return {"success": False, "message": "El correo electrónico ya está registrado."}

            # 4. Verificar si el teléfono ya está registrado y activo
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.telefono = %s AND u.estado = 1
            """, (seguridad.telefono,))
            if cursor.fetchone():
                return {"success": False, "message": "El número de teléfono ya está registrado."}

            # 5. Verificar si el teléfono ya existe con estado eliminado
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.telefono = %s AND u.estado = 0
            """, (seguridad.telefono,))
            if cursor.fetchone():
                return {"success": False, "message": "Este número de teléfono pertenece a un empleado eliminado. Contacte con el administrador."}


            print(f"Tipo id_area: {type(seguridad.id_area)}, valor: {seguridad.id_area}")
            cursor.callproc("sp_insertar_seguridad_general", [
                seguridad.id_area,
                seguridad.nombre,
                seguridad.apellido,
                seguridad.dni,
                seguridad.direccion,
                seguridad.telefono,
                seguridad.correo,
                seguridad.fecha_nacimiento
            ])

            while cursor.nextset(): pass
            cursor.execute("SELECT LAST_INSERT_ID()")
            result = cursor.fetchone()
            id_empleado = result[0] if result else None
            conn.commit()
            return {"success": True, "message": "Seguridad registrado correctamente.", "id_empleado": id_empleado}
        except Exception as e:
            print(f"[ERROR insert Seguridad]: {e}")
            print(f"Parámetros: {[seguridad.id_area, seguridad.nombre, seguridad.apellido, seguridad.dni, seguridad.direccion, seguridad.telefono, seguridad.correo, seguridad.fecha_nacimiento]}")
            return {
                "success": False,
                "message": f"Error al registrar el empleado: {str(e)}" 
            }
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def actualizar_estados(cls, ids: list[int], nuevo_estado: int):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            for id_seguridad in ids:
                cursor.execute("CALL sp_actualizar_estados_empleados_general(%s, %s)", (id_seguridad, nuevo_estado))
            conn.commit()
            return {"success": True, "message": f"Estados actualizados para {len(ids)} seguridad(es)."}
        except Exception as e:
            print(f"[ERROR actualizar_estado_multiple Seguridad]: {e}")
            return {"success": False, "message": "Error al actualizar los estados."}
        finally:
            cursor.close()

    @classmethod
    def actualizar_empleado(cls, id_empleado, direccion, correo, telefono):
        try:
            connection = get_connection()
            cursor = connection.cursor()
            # Verificar si el correo ya está registrado y activo por otro empleado
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.correo_electronico = %s AND u.estado = 1 AND e.id_empleado != %s
            """, (correo, id_empleado))
            if cursor.fetchone():
                raise Exception("El correo electrónico ya está registrado por otro empleado.")
            
            # Verificar si el correo ya está registrado con estado eliminado
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.correo_electronico = %s AND u.estado = 0 AND e.id_empleado != %s
            """, (correo, id_empleado))
            if cursor.fetchone():
                raise Exception("El correo electrónico pertenece a un empleado eliminado. Contacte con el administrador.")

            # Verificar si el teléfono ya está registrado y activo por otro empleado
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.telefono = %s AND u.estado = 1 AND e.id_empleado != %s
            """, (telefono, id_empleado))
            if cursor.fetchone():
                raise Exception("El número de teléfono ya está registrado por otro empleado.")

            # Verificar si el teléfono ya existe con estado eliminado
            cursor.execute("""
                SELECT e.id_empleado 
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.telefono = %s AND u.estado = 0 AND e.id_empleado != %s
            """, (telefono, id_empleado))
            if cursor.fetchone():
                raise Exception("Este número de teléfono pertenece a un empleado eliminado. Contacte con el administrador.")
        
            cursor.callproc('sp_actualizar_empleado_general', [id_empleado, direccion, correo, telefono])
            connection.commit()
            return {"id_empleado": id_empleado}
        except Exception as e:
            raise Exception(f"Error al actualizar empleado: {str(e)}")

    @classmethod
    def actualizar_usuario(cls, id_empleado, id_rol, id_area, estado):
        try:
            connection = get_connection()
            cursor = connection.cursor()

            cursor.callproc("sp_actualizar_usuario_general", [id_empleado, id_rol, id_area, estado])
            connection.commit()
            return {"id_empleado": id_empleado}
        except Exception as e:
            raise Exception(f"Error al actualizar usuario: {str(e)}")
        
    @classmethod    
    def correo_existe(cls, email: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 1
                FROM empleado e
                INNER JOIN usuario u ON e.id_empleado = u.id_empleado
                WHERE e.correo_electronico = %s AND u.estado = 1
            """, (email,))
            existe = cursor.fetchone() is not None
            return existe
        except Exception as e:
            print(f"[ERROR correo_existe Empleado]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass

