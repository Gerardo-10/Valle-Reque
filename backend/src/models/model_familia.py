from src.entities.familia import Familia
from src.database.connection import get_connection
class ModelFamilia:
    @classmethod
    def get_by_cliente_id(cls, id_cliente):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_obtener_familia_por_cliente_id(%s)", (id_cliente,))
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            return [Familia(*row) for row in rows]
        except Exception as e:
            print(f"[ERROR get_by_cliente_id Familia]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def insert(cls, familia):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            cursor.execute("SELECT id_cliente FROM familia WHERE documento_identidad = %s", (familia.dni,))
            if cursor.fetchone():
                return {"success": False, "message": "El DNI ya está registrado."}
            
            cursor.callproc("sp_insertar_familiar_general", (
                familia.id_cliente,
                familia.nombre,
                familia.apellido,
                familia.dni
            ))
            while cursor.nextset(): pass
            cursor.execute("SELECT LAST_INSERT_ID()")
            result = cursor.fetchone()
            conn.commit()
            id_familia = result[0] if result else None
            return {
                "success": True,
                "message": "Familiar registrado correctamente.",
                "id_familia": id_familia
            }
        except Exception as e:
            print(f"[ERROR insert Familia]: {e}")
            return {"success": False, "message": "Error al registrar el familiar."}
        finally:
            try:
                cursor.close()
            except:
                pass
    
    @classmethod
    def check_dni_exists(cls, dni_familiar):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            
            # **MODIFICACIÓN AQUÍ:** Usando cursor.execute para llamar al SP
            # Para llamar un SP con OUT parameters usando execute, la sintaxis es:
            # CALL nombre_procedimiento(parámetro_in, @variable_para_out_param);
            # Y luego SELECT @variable_para_out_param;
            
            # Paso 1: Llamar al procedimiento almacenado, pasando el DNI y una variable de sesión para el OUT param
            call_sp_query = "CALL sp_validar_dni_familia_general(%s, @p_existe);"
            cursor.execute(call_sp_query, (dni_familiar,))
            
            # Paso 2: Recuperar el valor del parámetro OUT de la variable de sesión
            cursor.execute("SELECT @p_existe;") 
            result_out = cursor.fetchone()
            
            # Retorna True si el valor es 1 (que representa TRUE), de lo contrario False.
            return result_out[0] == 1 if result_out else False

        except Exception as e:
            print(f"[ERROR check_dni_exists Familia]: {e}")
            raise 
        finally:
            if cursor:
                try:
                    cursor.close()
                except Exception as e:
                    print(f"[ERROR closing cursor in check_dni_exists]: {e}")
