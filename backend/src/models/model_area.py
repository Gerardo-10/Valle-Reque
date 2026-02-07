from src.entities.area import Area
from src.database.connection import get_connection


class ModelArea:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM area")
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            areas = [Area(*row) for row in rows]
            return areas
        except Exception as e:
            print(f"[ERROR get_all Areas]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def get_area_por_id_empleado(cls, id_empleado):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_area_por_id_general(%s)", (id_empleado,))  # Corregir a CALL
            row = cursor.fetchone()
            while cursor.nextset(): pass
            if row:
                return {
                    "id_area": row[0],
                    "nombre": row[1],
                    "creado": row[2],
                    "actualizado": row[3],
                }
            return None
        except Exception as e:
            print(f"[ERROR get_area_por_id_empleado]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass
