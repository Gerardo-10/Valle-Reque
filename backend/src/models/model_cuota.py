from src.database.connection import get_connection
from src.entities.cutoa import Cuota
from src.models.model_venta import ModelVenta
from src.models.model_cliente import ModelCliente
from src.models.model_devolucion import ModelDevolucion


class ModelCuota:
    @classmethod
    def insertar_varias(cls, cuotas: list[Cuota]):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            for c in cuotas:
                cursor.execute("CALL sp_insertar_cuota(%s, %s, %s, %s, %s, %s, %s, %s, %s)", (
                    c.id_pago,
                    c.id_cliente,
                    c.id_usuario,
                    c.id_banco,
                    c.monto,
                    c.estado,
                    c.referencia,
                    c.tipo,
                    c.documento
                ))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR insertar cuotas]: {e}")
            return False
        finally:
            try: cursor.close()
            except: pass

    @classmethod
    def actualizar_estado_logico_cuota(cls, id_cliente: int):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_actualizar_estado_cuota_logica(%s)", (id_cliente,))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR actualizar_estado_logico_cuota]: {e}")
            return False 

        finally:
            try:
                if cursor:
                    cursor.close()  # Cerrar el cursor
            except Exception as e:
                print(f"[ERROR al cerrar el cursor]: {e}")

    @classmethod
    def listar_cuotas_del_ultimo_cliente_con_venta(cls):
        try:
            id_cliente = ModelVenta.obtener_ultimo_id_cliente()

            if not id_cliente:
                return ["No se encontró cliente con ventas recientes"]
            
            datos_cliente = ModelCliente.obtener_datos_cliente_ventas(id_cliente)

            if not datos_cliente:
                return ["No se encontraron datos para el cliente."]

            return datos_cliente

        except Exception as e:
            # Manejo de errores más detallado
            print(f"[ERROR listar cuotas del último cliente con venta]: {e}")
            return ["Error al listar cuotas"]

    @classmethod
    def listar_cuotas_cliente_con_ultima_devolucion(cls):
        try:
            # Obtiene el ID del cliente con la última devolución
            id_cliente = ModelDevolucion.obtener_ultimo_cliente_devolucion()
            print(f"ID Cliente con última devolución: {id_cliente}")
            
            if not id_cliente:
                # Si no se encuentra el ID del cliente, devolver error
                return {"success": False, "message": "No se encontró el ID del cliente con devolución"}
            
            # Obtiene los datos de las cuotas de devolución del cliente
            datos_clientes = ModelCliente.listar_cuotas_devolucion(id_cliente)
            
            if not datos_clientes:
                # Si no se encuentran datos para el cliente, devolver error
                return {"success": False, "message": "No se encontraron datos para el cliente."}
            
            # Devolver los datos obtenidos si no hay error
            return {"success": True, "data": datos_clientes}
        
        except Exception as e:
            # Si ocurre un error inesperado, captura la excepción y muestra el mensaje
            print(f"[ERROR listar cuotas de devolución del último cliente]: {e}")
            return {"success": False, "message": "Error al listar cuotas de devolución"}


    @classmethod
    def pagar_cuota(cls, id_cuota: int, ref: str, id_banco: int, doc_prueba: str ,doc_boleta:str, fecha_pago: str):
        try:
            if not ref:
                return f'[Error: no se obtiene el número de referencia: {ref}]'
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_pagar_cuota_pago(%s, %s, %s, %s , %s, %s)", (id_cuota, ref, id_banco, doc_prueba, doc_boleta, fecha_pago))
            conn.commit()
            return True
        except Exception as e:
            return print(f"[ERROR al momento de pagar la cuota]: {e}")
        finally:
            try:
                if cursor:
                    cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar el cursor]: {e}")

    @classmethod
    def verpdf(cls, id_cuota: int, referencia: str):
        try:
            if not referencia:
                return "[Error: no se obtiene el número de referencia]"

            conn = get_connection()
            cursor = conn.cursor()

            # Ejecutar el procedimiento almacenado que devuelve un único SELECT
            cursor.execute("CALL sp_obtener_boleta_por_cuota(%s, %s)", (id_cuota, referencia))

            # Obtener el resultado directamente
            fila = cursor.fetchone()
            if fila and fila[0]:
                print("Archivo devuelto por SP:", fila[0])
                return fila[0]
            else:
                print("[WARN] No se encontró ningún registro.")
                return None

        except Exception as e:
            print(f"[ERROR al obtener el PDF de la cuota]: {e}")
            return None

        finally:
            try:
                if cursor:
                    cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar conexión o cursor]: {e}")

    @classmethod
    def finalizar_venta(cls, id_pago: int, monto_bono: float, nombre_pdf_fin: str, nombre_pdf_bono: str, fecha_cobro: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_finalizar_venta(%s, %s, %s, %s, %s)", (
                id_pago,
                monto_bono,
                nombre_pdf_fin,
                nombre_pdf_bono,
                fecha_cobro
            ))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR finalizar venta]: {e}")
            return False
        finally:
            try:
                if cursor: cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar cursor]: {e}")

    @classmethod
    def obtener_documento_final_por_codigo_venta(cls, codigo_venta):
        try:
            conn = get_connection()
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT p.documento_pago_finalizado
                    FROM pago p
                    INNER JOIN venta v ON v.id_venta = p.id_venta
                    WHERE v.codigo_venta = %s AND p.estado_pagos = 'Finalizado'
                    ORDER BY p.id_pago DESC
                    LIMIT 1;
                """, (codigo_venta,))
                row = cursor.fetchone()
                return row[0] if row else None
        except Exception as e:
            print(f"[ERROR al obtener documento final]: {e}")
            return None
        finally:
            try:
                if cursor: cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar cursor]: {e}")