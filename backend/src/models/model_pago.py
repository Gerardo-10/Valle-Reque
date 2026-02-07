from src.database.connection import get_connection
from src.entities.pago import Pago

class ModelPago:
    @classmethod
    def insertar(cls, pago: Pago):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_insertar_pago(%s, %s, %s, %s, %s, %s, %s)", (
                pago.id_venta,
                pago.total_aportado,
                pago.fecha_inicio,
                pago.fecha_final,
                pago.numero_cuotas,
                pago.saldo,
                pago.documento
            ))
            conn.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            result = cursor.fetchone()
            return result[0] if result else None
        except Exception as e:
            print(f"[ERROR insertar pago]: {e}")
            return None
        finally:
            try: cursor.close()
            except: pass
