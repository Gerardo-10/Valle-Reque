from src.database.connection import get_connection
from src.entities.devolucion import Devolucion

class ModelDevolucion:
    @classmethod
    def insertar_devolucion(cls, p_id_venta, p_monto_total, p_fecha_inicio, p_fecha_final, p_porcentaje_penalizacion, p_numero_cuota, p_motivo_cancelacion):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            cursor.execute("CALL sp_insertar_devolucion(%s, %s, %s, %s, %s, %s, %s)", (
                p_id_venta,
                p_monto_total,
                p_fecha_inicio,
                p_fecha_final,
                p_porcentaje_penalizacion,
                p_numero_cuota,
                p_motivo_cancelacion
            ))
            conn.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            id_devolucion = cursor.fetchone()[0]
            devolucion = Devolucion(id_devolucion, p_id_venta, p_monto_total, p_fecha_inicio, p_fecha_final, p_porcentaje_penalizacion, p_numero_cuota, p_motivo_cancelacion)

            return devolucion

        except Exception as e:
            print(f"[ERROR insertar_devolucion]: {e}")
            conn.rollback()
            return None
        finally:
            try:
                if cursor:
                    cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar el cursor]: {e}")

    @classmethod
    def obtener_ultimo_cliente_devolucion(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_ultimo_cliente_devolucion()")
            ultimo_cliente = cursor.fetchone()
            
            if not ultimo_cliente:
                return None  
            return ultimo_cliente[0]  
        except Exception as e:
            print(f"[ERROR obtener_ultimo_cliente_devolucion]: {e}")
            return None
        finally:
            try:
                if cursor:
                    cursor.close()
            except:
                pass