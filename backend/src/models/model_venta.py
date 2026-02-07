from src.database.connection import get_connection
from src.entities.venta import Venta
from src.entities.venta import VentaListado


class ModelVenta:
    @classmethod
    def insertar_venta_completa(
    cls,
        id_cliente,
        id_terreno,
        id_usuario,
        codigo_venta,
        fecha_venta,
        monto_bono,
        precio_venta,
        pago_inicial,
        monto_financiar,
        documento_contrato,
        documento_cronograma,
        tipo_venta,
        id_venta_origen,
        id_financiamiento,
        fecha_aprobacion,
        interes_real,
        monto_preaprobado,
        constancia,
        monto_total_aportado,
        fecha_inicio,
        fecha_final,
        numero_cuotas,
        cuotas 
    ):
        conn = None
        cursor = None

        try:
            conn = get_connection()
            cursor = conn.cursor()
            conn.begin()
            cursor.execute("CALL sp_insertar_venta(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)", (
                id_cliente,
                id_terreno,
                id_usuario,
                codigo_venta,
                fecha_venta,
                monto_bono,
                precio_venta,
                pago_inicial,
                monto_financiar,
                documento_contrato,
                'EnProceso', 
                tipo_venta,
                int(id_venta_origen) if str(id_venta_origen).isdigit() else None ,
                documento_cronograma
            ))

            while cursor.nextset():
                pass
            conn.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            row = cursor.fetchone()
            if not row:
                raise Exception("No se pudo obtener ID de venta")
            id_venta = row[0]
            cursor.execute("CALL sp_insertar_detalle_financiamiento(%s, %s, %s, %s, %s, %s)", (
                id_venta,
                id_financiamiento,
                fecha_aprobacion,
                interes_real,
                monto_preaprobado,
                constancia
            ))
            while cursor.nextset():
                pass
            conn.commit()
            cursor.execute("CALL sp_insertar_pago(%s, %s, %s, %s, %s, %s, %s)", (
                id_venta,
                monto_total_aportado,
                fecha_inicio,
                fecha_final,
                numero_cuotas,
                "Activo",     
                ""  
            ))
            while cursor.nextset():
                pass
            conn.commit()
            
            cursor.execute("SELECT LAST_INSERT_ID()")
            row_pago = cursor.fetchone()
            if not row_pago:
                raise Exception("No se pudo obtener ID del pago")
            id_pago = row_pago[0]
            cuotas_array = cuotas
            for i, cuota in enumerate(cuotas_array, start=1):
                referencia = f"CUO{id_pago}{i}{id_cliente}"
                cursor.execute("CALL sp_insertar_cuota(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s)", (
                    id_pago,                    
                    id_cliente,
                    id_usuario,
                    None,                        
                    float(cuota['monto']),
                    0,                         
                    referencia,                  
                    "Pago",                    
                    None,                  
                    0, 
                    cuota['fecha_pago']                  
                ))
            while cursor.nextset():
                pass
            conn.commit()
            cursor.execute("UPDATE terreno SET estado_terreno = 'EnProceso' WHERE id_terreno = %s", (id_terreno,))
            while cursor.nextset():
                pass
            conn.commit()
            cursor.execute("SELECT estado_cliente FROM cliente WHERE id_cliente = %s", (id_cliente,))
            estado_actual = cursor.fetchone()
            if estado_actual and estado_actual[0] == "Evaluado":
                cursor.execute("UPDATE cliente SET estado_cliente = 'Activo' WHERE id_cliente = %s", (id_cliente,))
                conn.commit()
            return True
        
        except Exception as e:
            print(f"[ERROR insertar_venta_completa]: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            try:
                if cursor: cursor.close()
            except: pass

    @classmethod
    def obtener_ultimo_id_cliente(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # Llamamos al procedimiento almacenado para obtener el último id_cliente
            cursor.execute("CALL sp_obtener_ultimo_idcliente_de_ultima_venta()")
            row = cursor.fetchone()
            
            if not row:
                raise Exception("No se pudo obtener el id_cliente de la última venta")
            
            # El id_cliente se encuentra en la primera columna de la fila
            id_cliente = row[0]
            return id_cliente

        except Exception as e:
            print(f"[ERROR obtener_ultimo_id_cliente]: {e}")
            return None
        
        finally:
            try:
                if cursor:
                    cursor.close()  # Cerrar el cursor
            except Exception as e:
                print(f"[ERROR al cerrar el cursor]: {e}")
                
    @classmethod
    def obtener_ventas(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Confirmar base de datos y debug
            cursor.execute("SELECT DATABASE()")
            db = cursor.fetchone()
            print(f"[DEBUG] Conectado a base: {db[0]}")

            cursor.execute("CALL sp_listar_ventas()")
            rows = cursor.fetchall()

            print(f"[DEBUG] Filas devueltas por sp_listar_ventas: {len(rows)}")
            ventas = []

            for row in rows:
                print("[DEBUG] Fila:", row)
                try:
                    venta = VentaListado(*row)
                    ventas.append(venta)
                except Exception as e:
                    print(f"[ERROR al construir VentaListado]: {e}")
                    print("[Fila con error]:", row)

            return ventas

        except Exception as e:
            print(f"[ERROR obtener_ventas]: {e}")
            return []
        finally:
            try:
                if cursor:
                    cursor.close()
            except:
                pass

    @classmethod
    def obtener_datos_de_venta_anterior_refinanciar(cls, id_venta):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Llamar al procedimiento almacenado que devuelve los datos necesarios
            cursor.execute("CALL sp_listar_refinanciamiento_venta(%s)", (id_venta,))
            row = cursor.fetchone()

            if not row:
                raise Exception("No se encontraron datos para la venta especificada.")

            # Mapear resultados a un diccionario legible
            datos_refinanciamiento = {
                "nombres": row[0],
                "apellidos": row[1],
                "documento_identidad": row[2],
                "ocupacion": row[3],
                "carga_familiar": row[4],

                "nombre_proyecto": row[5],
                "codigo_unidad": row[6],
                "etapa": row[7],
                "tipo_terreno": row[8],
                "area": row[9],

                "saldo": row[10],
                "monto_total_aportado": row[11],
                "numero_cuotas": row[12],
                "monto_cuota": row[13],
                "fecha_pago": row[14],

                "interes": row[15],
                "monto_preaprobado": row[16],
                "nombre_financiamiento": row[17],
            }

            return datos_refinanciamiento

        except Exception as e:
            print(f"[ERROR obtener_datos_de_venta_anterior_refinanciar]: {e}")
            return None
        finally:
            try:
                if cursor:
                    cursor.close()
            except:
                pass
            
    @classmethod
    def obtener_datos_de_cancelacion(cls, id_venta):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_cancelacion_venta(%s)", (id_venta,))
            row = cursor.fetchone()

            if not row:
                raise Exception("No se encontraron datos")

            return {
                "documento_identidad": row[0],
                "nombre": row[1],
                "apellidos": row[2],
                "carga_familiar": row[3],
                "nombre_financiamiento": row[4],
                "nombre_proyecto": row[5],
                "codigo_unidad": row[6],
                "etapa": row[7],
                "precio_terreno": row[8],
                "tipo_terreno": row[9],
                "area": row[10],
                "codigo_venta": row[11],
                "total_amortizado": row[12],
                "numero_cuotas": row[13],
                "cuotas_pagadas": row[14],
                "fecha_final": row[15],
                "tipo_financiamiento": row[16],
            }
        except Exception as e:
            print("[ERROR cancelacion]:", e)
            return None



    @classmethod
    def cancelar_venta(cls, p_id_venta, p_monto_total, p_numero_cuotas, p_fecha_inicio, p_fecha_final, p_porcentaje_penalizacion, p_monto_por_cuota, p_interes, p_motivo_cancelacion, p_numero_cuota, p_id_usuario):
        from src.models.model_cuota import ModelCuota
        try:
            conn = get_connection()
            cursor = conn.cursor()
            conn.begin()
            cursor.execute("CALL sp_cancelar_venta(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)", (
                p_id_venta,
                p_monto_total,
                p_numero_cuotas,
                p_fecha_inicio,
                p_fecha_final,
                p_porcentaje_penalizacion,
                p_monto_por_cuota,
                p_interes,
                p_motivo_cancelacion,
                p_numero_cuota,
                p_id_usuario
            ))
            conn.commit()
            cursor.execute("SELECT LAST_INSERT_ID()")
            return True
        except Exception as e:
            print(f"[ERROR cancelar_venta]: {e}")
            conn.rollback()
            return False
        finally:
            try:
                if cursor:
                    cursor.close()
            except Exception as e:
                print(f"[ERROR al cerrar el cursor]: {e}")
