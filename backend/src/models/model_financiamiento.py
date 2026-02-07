from src.entities.financiamiento import Financiamiento, DetalleFinanciamiento
from src.database.connection import get_connection

class ModelFinanciamiento:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_financiamientos()")
            rows = cursor.fetchall()
            while cursor.nextset(): pass

            return [
                Financiamiento(
                    id_financiamiento=row[0],
                    tipo_financiamiento=row[1],
                    nombre_financiamiento=row[2],
                    monto_financiamiento=row[3],
                    interes=row[4],
                    estado=row[5],
                    fecha_creacion=row[6],
                    foto_referencia=row[7]
                ).to_dic()
                for row in rows
            ]
        except Exception as e:
            print(f"[ERROR get_all Financiamiento]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def insertar(cls, nombre, monto, interes, tipo, estado, fecha, imagen):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_insertar_financiamiento(%s, %s, %s, %s, %s, %s, %s)",
                (tipo, nombre, monto, interes, estado, fecha, imagen)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR insertar Financiamiento]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass
    @classmethod
    def actualizar(cls, id_financiamiento, nombre, monto, interes, tipo, fecha, imagen):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_actualizar_financiamiento(%s, %s, %s, %s, %s, %s, %s)",
                (id_financiamiento, nombre, monto, interes, tipo, fecha, imagen)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR actualizar Financiamiento]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass
    @classmethod
    def actualizar_estado(cls, id_financiamiento, nuevo_estado):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_actualizar_estado_financiamiento(%s, %s)",
                (id_financiamiento, nuevo_estado)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR actualizar_estado Financiamiento]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass
    @classmethod
    def get_imagen_por_id(cls, id_financiamiento):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT imagen FROM financiamiento WHERE id_financiamiento = %s", (id_financiamiento,))
            row = cursor.fetchone()
            return row[0] if row else None
        except Exception as e:
            print(f"[ERROR get_imagen_por_id]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass

class ModelDetalleFinanciamiento:
    @classmethod
    def insertar(cls, detalle: DetalleFinanciamiento):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_insertar_detalle_financiamiento(%s, %s, %s, %s, %s, %s)", (
                detalle.id_venta,
                detalle.id_financiamiento,
                detalle.fecha_aprobado,
                detalle.interes,
                detalle.monto_preaprobado,
                detalle.constancia
            ))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR insertar detalle_financiamiento]: {e}")
            return False
        finally:
            try: cursor.close()
            except: pass