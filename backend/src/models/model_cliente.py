from src.entities.familia import Familia
from src.entities.cliente import Cliente
from src.database.connection import get_connection


class ModelCliente:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_clientes_activos()")
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            clientes = [Cliente(*row) for row in rows]
            return clientes
        except Exception as e:
            print(f"[ERROR get_all Cliente]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def get_cliente_por_id(cls, id_cliente):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_cliente_por_id_general(%s)", (id_cliente,))
            row = cursor.fetchone()
            while cursor.nextset(): pass
            if row:
                return {
                    "id_cliente": row[0],
                    "nombre": row[1],
                    "apellidos": row[2],
                    "dni": row[3],
                    "direccion": row[4],
                    "correo": row[5],
                    "telefono": row[6],
                    "ocupacion": row[7],
                    "ingreso_neto": row[8],
                    "estado_cliente": row[9],
                    "carga_familiar": row[10] if row[10] is not None else None,
                    "estado": row[11]
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
    def insert (cls,cliente):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            # 1. Verificar si el DNI ya existe con estado = 1 (activo)
            cursor.execute("SELECT id_cliente FROM cliente WHERE documento_identidad = %s AND estado = 1", (cliente.dni,))
            if cursor.fetchone():
                return {"success": False, "message": "El DNI ya está registrado y activo."}

            # 2. Verificar si el DNI ya existe con estado = 0 (eliminado lógicamente)
            cursor.execute("SELECT id_cliente FROM cliente WHERE documento_identidad = %s AND estado = 0", (cliente.dni,))
            if cursor.fetchone():
                return {"success": False, "message": "El cliente con este DNI ha sido eliminado anteriormente. Por favor, contacte con el administrador para restaurarlo o use un DNI diferente."}

            # 3. Verificar si el correo electrónico ya está registrado y activo
            cursor.execute("SELECT id_cliente FROM cliente WHERE correo = %s AND estado = 1", (cliente.correo,))
            if cursor.fetchone():
                return {"success": False, "message": "El correo electrónico ya está registrado."}

            # 4. Verificar si el número de teléfono ya está registrado y activo
            cursor.execute("SELECT id_cliente FROM cliente WHERE telefono = %s AND estado = 1", (cliente.telefono,))
            if cursor.fetchone():
                return {"success": False, "message": "El número de teléfono ya está registrado."}
            
            cursor.execute("SELECT id_cliente FROM cliente WHERE telefono = %s AND estado = 0", (cliente.telefono,))
            if cursor.fetchone():
                return {"success": False, "message": "El número de teléfono esta asociado a un cliente eliminado. Por favor, contacte con el administrador."}
            
            cursor.callproc("sp_insertar_cliente_general", (
                cliente.nombre,
                cliente.apellidos,
                cliente.dni,
                cliente.direccion,
                cliente.correo,
                cliente.telefono,
                cliente.ocupacion,
                cliente.ingreso_neto,
                cliente.estado_cliente
            ))
            while cursor.nextset(): pass
            cursor.execute("SELECT LAST_INSERT_ID()")  
            result = cursor.fetchone()
            id_cliente = result[0] if result else None
            if cliente.carga_familiar:
                cursor.execute("UPDATE cliente SET carga_familiar = 1 WHERE id_cliente = %s", (id_cliente,))
            conn.commit()
            return {"success": True, "message": "Cliente registrado correctamente.","id_cliente": id_cliente}
        except Exception as e:
            print(f"[ERROR insert Cliente]: {e}")
            return {"success": False, "message": str(e)}
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod           
    def actualizar_estados(cls, ids: list[int], nuevo_estado: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            for id_cliente in ids:
                cursor.execute("CALL sp_actualizar_estados_general(%s, %s)", (id_cliente, nuevo_estado))
            conn.commit()
            return {"success": True, "message": f"Estados actualizados para {len(ids)} cliente(s)."}
        except Exception as e:
            print(f"[ERROR actualizar_estado_multiple]: {e}")
            return {"success": False, "message": "Error al actualizar los estados."}
        finally:
            cursor.close()    

    @classmethod
    def eliminar(cls, ids):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            for id_cliente in ids:
                # Verificar si el cliente tiene una venta con estado 'En Proceso'
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM venta 
                    WHERE id_cliente = %s AND estado_venta = 'EnProceso'
                """, (id_cliente,))
                venta_en_proceso = cursor.fetchone()[0]
                
                if venta_en_proceso > 0:
                    return {"success": False, "message": f"El cliente con ID {id_cliente} tiene una venta en proceso. No se puede eliminar."}
                
                # Proceder con la eliminación lógica si no tiene venta activa
                cursor.execute("UPDATE cliente SET estado = 0 WHERE id_cliente = %s", (id_cliente,))
            
            conn.commit()
            return {"success": True, "message": "Clientes eliminados lógicamente."}
        
        except Exception as e:
            print(f"[ERROR eliminar_lógico Cliente]: {e}")
            return {"success": False, "message": "Error al eliminar clientes."}
        
        finally:
            try:
                cursor.close()
            except:
                pass

    
    @classmethod
    def get_by_dni(cls, dni: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            print (f"[INFO get_by_dni Cliente]: Buscando cliente con DNI {dni}")
            cursor.execute("SELECT 1 FROM cliente WHERE documento_identidad = %s AND estado = 0", (dni,))
            if cursor.fetchone():
                return {
                    "success": False,
                    "message": "El cliente fue eliminado anteriormente de la base de datos. Contacte al administrador si desea restaurarlo."
                }

            cursor.execute("CALL ps_obtener_clientes_por_dni(%s)", (dni,))
            row = cursor.fetchone()
            while cursor.nextset(): pass

            if row:
                return {"success": True, "cliente": Cliente(*row)}
            
            print(f"[INFO get_by_dni Cliente]: Cliente con DNI {Cliente} no encontrado.")
            
            return {
                "success": False,
                "message": "Cliente no encontrado."
            }

        except Exception as e:
            print(f"[ERROR get_by_dni Cliente]: {e}")
            return {
                "success": False,
                "message": "Error al buscar cliente por DNI."
            }
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def obtener_datos_cliente_ventas(cls, id_cliente: int):
        from src.models.model_cuota import ModelCuota
        try:
            ModelCuota.actualizar_estado_logico_cuota(id_cliente)
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_datos_cliente_ventas(%s)", (id_cliente,))
            # Primer resultado: datos del cliente
            cliente_data = cursor.fetchone()
            if not cliente_data:
                raise Exception("No se encontraron datos para el cliente.")
            datos_cliente = {
                "nombres": cliente_data[0],
                "apellidos": cliente_data[1],
                "dni": cliente_data[2],
                "id_cliente": cliente_data [3],
                "num_contratos_vigentes": cliente_data[4],
                "cuotas_pendientes": cliente_data[5],
                "total_cuotas": cliente_data[6],
                "ventas": []
            }
            # Avanzar al siguiente conjunto de resultados
            cursor.nextset()
            # Segundo resultado: ventas y cuotas
            ventas_data = cursor.fetchall()
            # Agrupar cuotas por venta
            ventas_dict = {}
            for row in ventas_data:
                id_venta = row[0]
                if id_venta not in ventas_dict:
                    ventas_dict[id_venta] = {
                        "id_venta": id_venta,
                        "codigo_venta": row[1],
                        "tipo_venta": row[2],
                        "id_venta_origen": row[3],
                        "documento_contrato": row[4],
                        "estado_venta": row[5],
                        "id_proyecto": row[6],
                        "proyecto": row[7],
                        "codigo_unidad": row[8],
                        "estado_terreno": row[9],
                        "cuotas": []
                    }
                cuota = {
                    "id_pago": row[10],
                    "id_cuota": row[11],
                    "monto": row[12],
                    "interes": row[13],
                    "estado": row[14],
                    "referencia": row[15],
                    "tipo_cuota": row[16],
                    "fecha_vencimiento": row[17],
                    "estado_cuota_logica": row[18]
                }
                ventas_dict[id_venta]["cuotas"].append(cuota)
            datos_cliente["ventas"] = list(ventas_dict.values())
            return datos_cliente
        except Exception as e:
            print(f"[ERROR obtener_datos_cliente_ventas]: {e}")
            return None
        finally:
            try:
                if cursor:
                    cursor.close()
            except:
                pass

    @classmethod
    def obtener_id_cliente_por_dni(cls, dni: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_busqueda_id_cliente_x_dni(%s)", (dni,))
            row = cursor.fetchone()
            return row[0] if row else None
        except Exception as e:
            print(f"[ERROR obtener_id_cliente_por_dni]: {e}")
            return None
        finally:
            cursor.close()

    @classmethod
    def obtener_id_cliente_por_nombres(cls, nombres: str, apellidos: str):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_obtener_id_cliente_por_nombres(%s, %s)",
                (nombres, apellidos)
            )
            while cursor.nextset():
                break
            row = cursor.fetchone()
            return row[0] if row else None
        except Exception as e:
            print(f"[ERROR obtener_id_cliente_por_nombres]: {e}")
            return None
        finally:
            cursor.close()

    @classmethod
    def actualizar_cliente(cls, cliente: Cliente):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_actualizar_cliente_general", (
                cliente.id_cliente,
                cliente.nombre,
                cliente.apellidos,
                cliente.dni,
                cliente.direccion,
                cliente.correo,
                cliente.telefono,
                cliente.ocupacion,
                cliente.ingreso_neto,
                cliente.estado_cliente,
                cliente.carga_familiar
            ))
            while cursor.nextset(): pass
            conn.commit()
            return {"success": True, "message": "Cliente actualizado correctamente."}
        except Exception as e:
            print(f"[ERROR actualizar_cliente]: {e}")
            return {"success": False, "message": "Error al actualizar el cliente."}
        
    @classmethod
    def actualizar_cliente_familiar(cls, familiar: Familia):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_actualizar_cliente_familiar", (
                familiar.id_familia,
                familiar.id_cliente,
                familiar.nombre,
                familiar.apellido,
                familiar.dni,
                int(familiar.cotitular)
            ))
            while cursor.nextset(): pass
            conn.commit()
            return {"success": True, "message": "Familiar actualizado correctamente."}
        except Exception as e:
            print(f"[ERROR actualizar_cliente_familiar]: {e}")
            return {"success": False, "message": "Error al actualizar el familiar."}
        
    @classmethod
    def insertar_cliente_familiar(cls, familiar: Familia):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_insertar_cliente_familiar", (
                familiar.id_cliente,
                familiar.nombre,
                familiar.apellido,
                familiar.dni,
                int(familiar.cotitular)
            ))
            while cursor.nextset(): pass
            conn.commit()
            return {"success": True, "message": "Familiar insertado correctamente."}
        except Exception as e:
            print(f"[ERROR insertar_cliente_familiar]: {e}")
            return {"success": False, "message": "Error al insertar el familiar."}

    @classmethod
    def cambiar_titularidad(cls, id_cliente_antiguo, id_cliente_nuevo):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Ejecutar el stored procedure
            cursor.callproc('sp_cambiar_titularidad_general', [id_cliente_antiguo, id_cliente_nuevo])

            conn.commit()
            return {"success": True, "message": "Cambio de titularidad ejecutado correctamente."}
        except Exception as e:
            print(f"[ERROR cambiar_titularidad]: {e}")
            return {"success": False, "message": str(e)}
        
    @classmethod
    def insertar_historial_titularidad(cls, id_venta, id_cliente_antiguo, id_cliente_nuevo):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            sql = "CALL sp_insertar_historial_titularidad(%s, %s, %s, CURDATE(), %s)"
            params = (id_venta, id_cliente_antiguo, id_cliente_nuevo, None)

            cursor.execute(sql, params)
            conn.commit()

            return {"success": True, "message": "Historial de titularidad registrado correctamente."}
        except Exception as e:
            print(f"[ERROR insertar_historial_titularidad]: {e}")
            return {"success": False, "message": str(e)}

    @classmethod
    def obtener_ids_por_codigo_venta(cls, codigo_venta):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id_venta, id_cliente FROM venta WHERE codigo_venta = %s", (codigo_venta,))
            row = cursor.fetchone()
            if row:
                return {
                    "id_venta": row[0],
                    "id_cliente": row[1]
                }
            return None
        except Exception as e:
            print(f"[ERROR obtener_ids_por_codigo_venta]: {e}")
            return None
        finally:
            cursor.close()

    @classmethod
    def listar_cuotas_devolucion(cls, id_cliente: int):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            # Llamar al procedimiento almacenado
            cursor.execute("CALL sp_listar_cuotas_devolucion(%s)", (id_cliente,))
            
            # Primer resultado: datos del cliente
            cliente_data = cursor.fetchone()
            if not cliente_data:
                raise Exception("No se encontraron datos para el cliente.")
                
            # Crear un diccionario con los datos del cliente
            datos_cliente = {
                "nombres": cliente_data[0],
                "apellidos": cliente_data[1],
                "dni": cliente_data[2],
                "id_cliente": cliente_data[3],
                "num_contratos_vigentes": cliente_data[4],
                "cuotas_pendientes": cliente_data[5],
                "total_cuotas": cliente_data[6],
                "ventas": []
            }
            
            # Avanzar al siguiente conjunto de resultados
            cursor.nextset()
            
            # Segundo resultado: ventas y cuotas de devolución
            ventas_data = cursor.fetchall()
            
            if not ventas_data:
                return datos_cliente

            # Agrupar cuotas de devolución por venta
            ventas_dict = {}
            for row in ventas_data:
                id_venta = row[0]
                if id_venta not in ventas_dict:
                    ventas_dict[id_venta] = {
                        "id_venta": id_venta,
                        "codigo_venta": row[1],
                        "tipo_venta": row[2],
                        "id_venta_origen": row[3],
                        "documento_contrato": row[4],
                        "estado_venta": row[5],
                        "id_proyecto": row[6],
                        "proyecto": row[7],
                        "codigo_unidad": row[8],
                        "estado_terreno": row[9],
                        "cuotas": []
                    }
                
                # Crear un diccionario para cada cuota
                cuota = {
                    "id_pago": row[10],
                    "id_cuota": row[11],
                    "monto": row[12],
                    "interes": row[13],
                    "estado": row[14],
                    "referencia": row[15],
                    "tipo_cuota": row[16],
                    "fecha_vencimiento": row[17],
                    "estado_cuota_logica": row[18]
                }
                
                # Añadir la cuota al diccionario de ventas
                ventas_dict[id_venta]["cuotas"].append(cuota)
            # Agregar las ventas al diccionario de cliente
            datos_cliente["ventas"] = list(ventas_dict.values())
            return datos_cliente
        except Exception as e:
            print(f"[ERROR listar_cuotas_devolucion]: {e}")
            return None
        finally:
            try:
                if cursor:
                    cursor.close()
            except:
                pass