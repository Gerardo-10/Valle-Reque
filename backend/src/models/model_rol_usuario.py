from src.entities.rol import Rol
from src.database.connection import get_connection


class ModelRolUsuario:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT ru.id_usuario, r.denominacion
                FROM Rol_Usuario ru
                JOIN rol r ON ru.id_rol = r.id_rol
            """)
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            return [{"id_usuario": r[0], "rol": r[1]} for r in rows]
        except Exception as e:
            print(f"[ERROR get_all Roles]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def get_rol_por_id_empleado(cls, id_empleado):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_rol_por_id_general(%s)", (id_empleado,))
            row = cursor.fetchone()
            while cursor.nextset(): pass
            if row:
                return {
                    "id_rol": row[0],
                    "denominacion": row[1]
                }
            return None
        except Exception as e:
            print(f"[ERROR get_rol_por_id_empleado]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass
