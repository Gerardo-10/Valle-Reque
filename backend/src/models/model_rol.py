from src.entities.rol import Rol
from src.database.connection import get_connection

class ModelRol:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM rol")
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            roles = [Rol(*row) for row in rows]
            return roles
        except Exception as e:
            print(f"[ERROR get_all Roles]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass