from urllib import request
from src.entities.banco import Banco
from src.database.connection import get_connection
from flask import jsonify

class ModelBanco:

    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_bancos()")
            rows = cursor.fetchall()

            if not rows:
                print("[ERROR get_all Banco]: No hay bancos registrados")
                return []
            
            return [
                Banco(
                    id_banco=row[0] if len(row) > 0 else None,
                    nombre_banco=row[1] if len(row) > 1 else None,
                    numero_cuenta=row[2] if len(row) > 2 else None,
                    titular=row[3] if len(row) > 3 else None,
                    estado_banco=row[4] if len(row) > 4 else None,
                    logo=row[5] if len(row) > 5 else None, 
                    ver_banco=row[6] if len(row) > 6 else None 
                ).to_dic()
                for row in rows if len(row) >= 6  
            ]
        except Exception as e:
            print(f"[ERROR get_all Banco]: {e}")
            return []


    @classmethod
    def insertar(cls, nombre, cuenta, titular, imagen):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Verificar si ya existe un banco con el mismo número de cuenta y ver_banco = 1
            cursor.execute("SELECT id_banco FROM banco WHERE numero_cuenta = %s AND ver_banco = 1", (cuenta,))
            if cursor.fetchone():
                return {"success": False, "message": "Ya existe un banco activo con ese número de cuenta."}

            # Insertar nuevo banco
            cursor.execute("CALL sp_insertar_banco(%s, %s, %s, %s)", (nombre, cuenta, titular, imagen))
            conn.commit()

            # Obtener el último ID insertado
            cursor.execute("SELECT LAST_INSERT_ID()")
            id_banco = cursor.fetchone()[0]

            # Activar el banco insertado
            cursor.execute("UPDATE banco SET ver_banco = 1 WHERE id_banco = %s", (id_banco,))
            conn.commit()

            return {"success": True, "message": "Banco registrado correctamente."}
        except Exception as e:
            print(f"[ERROR insertar Banco]: {e}")
            return {"success": False, "message": "Error al insertar banco."}
        finally:
            cursor.close()

    @classmethod
    def actualizar(cls, id_banco, nombre, cuenta, titular, imagen):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_actualizar_banco(%s, %s, %s, %s, %s)", (id_banco, nombre, cuenta, titular, imagen))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR actualizar Banco]: {e}")
            return False
        finally:
            cursor.close()

    @classmethod
    def actualizar_estado(cls, id_banco, nuevo_estado):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_actualizar_estado_banco(%s, %s)", (id_banco, nuevo_estado))
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR actualizar_estado banco]: {e}")
            return False
        finally:
            cursor.close()

    @classmethod
    def get_logo_por_id(cls, id_banco):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT logo FROM banco WHERE id_banco = %s", (id_banco,))
            row = cursor.fetchone()
            return row[0] if row else None
        except Exception as e:
            print(f"[ERROR get_logo_por_id]: {e}")
            return None
        finally:
            cursor.close()
            

    @classmethod
    def eliminar_banco(cls, id_banco):
        try:
            # Conexión a la base de datos
            conn = get_connection()
            cursor = conn.cursor()

            # Ejecuta el procedimiento almacenado de eliminación
            cursor.execute("CALL sp_eliminar_banco(%s)", (id_banco,))
            conn.commit()

            return {"success": True, "message": "Banco eliminado correctamente."}
        except Exception as e:
            print(f"[ERROR eliminar_banco]: {e}")
            return {"success": False, "message": str(e)}
    
    @classmethod
    def listar_bancos_activos(cls):
        conn = None
        cursor = None
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_bancos_activos()")
            rows = cursor.fetchall()

            if not rows:
                print("[ERROR listar_bancos_activos]: No hay bancos activos registrados")
                return []

            bancos = []
            for row in rows:
                banco = Banco(
                    id_banco      = row[0],
                    nombre_banco  = row[1],
                    numero_cuenta = row[2],
                    titular       = row[3],
                    estado_banco  = row[4],
                    logo          = row[6],
                    ver_banco     = row[5],
                )
                bancos.append(banco.to_dic())

            return bancos

        except Exception as e:
            print(f"[ERROR listar_bancos_activos]: {e}")
            return []

        finally:
            if cursor:
                cursor.close()