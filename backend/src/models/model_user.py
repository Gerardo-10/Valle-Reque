from src.entities.user import User
from werkzeug.security import check_password_hash, generate_password_hash
from src.database.connection import get_connection

class ModelUser:
    @classmethod
    def login(cls, username):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_login_validacion_general", [username])
            row = cursor.fetchone()
            while cursor.nextset():
                pass

            if row:
                return User(*row) 
            return None
        except Exception as e:
            print(f"[ERROR login usuario]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_usuarios_general()")
            rows = cursor.fetchall()
            while cursor.nextset(): pass
            usuarios = [User(*row) for row in rows]
            return usuarios
        except Exception as e:
            print(f"[ERROR get_all Usuarios]: {e}")
            return []
        finally:
            try:
                cursor.close()
            except:
                pass        

    @classmethod
    def get_usuario_por_id_empleado(cls, id_empleado):
        try:
            conn = get_connection()
            cursor = conn.cursor() 
            cursor.execute("CALL sp_obtener_usuario_por_id_general(%s)", (id_empleado,))
            row = cursor.fetchone()
            while cursor.nextset(): pass
            if row:
                return {
                    "id_usuario": row[0],
                    "id_empleado": row[1],
                    "nombre_usuario": row[2],
                    "estado": row[4]
                }
            return None
        except Exception as e:
            print(f"[ERROR get_usuario_por_id_empleado]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def insert(cls, user):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_insertar_usuario_general", [
                user.id_empleado,
                user.nombre_usuario,
                user.pwd,
                user.estado
            ])
            conn.commit()
            return {"success": True}
        except Exception as e:
            print(f"[ERROR insert usuario]: {e}")
            return {"success": False, "error": str(e)}
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def check_username_exists(cls, username):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("SELECT id_usuario FROM usuario WHERE nombre_usuario = %s", (username,))
            result = cursor.fetchone()
            return result is not None
        except Exception as e:
            print(f"[ERROR check_username_exists]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def cambiar_contraseña(cls,id_empleado, actual, nueva):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # Obtener usuario y contraseña actual
            cursor.execute("SELECT id_usuario, pwd FROM usuario WHERE id_empleado = %s", (id_empleado,))
            usuario = cursor.fetchone()

            if check_password_hash(usuario[1], "123456"):
                print("Este usuario sigue usando la contraseña por defecto.")

            if not usuario or not check_password_hash(usuario[1], actual):
                return {"success": False, "message": "La contraseña actual es incorrecta."}

            nueva_hash = generate_password_hash(nueva, method="scrypt")

            # Actualizar contraseña
            cursor.execute("UPDATE usuario SET pwd = %s WHERE id_usuario = %s", (nueva_hash, usuario[0]))
            conn.commit()

            return {"success": True, "message": "Contraseña actualizada correctamente."}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)}"}
        
    @classmethod
    def reset_contraseña_por_email(cls, email, nueva):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # 1) Obtener el id_empleado desde empleado.correo_electronico
            cursor.execute(
                "SELECT id_empleado FROM empleado WHERE correo_electronico = %s",
                (email,)
            )
            row = cursor.fetchone()
            if not row:
                return {"success": False, "message": "Email no registrado."}
            id_empleado = row[0]

            # 2) Hashear la nueva contraseña
            nueva_hash = generate_password_hash(nueva, method="scrypt")

            # 3) Actualizar la contraseña en usuario
            cursor.execute(
                "UPDATE usuario SET pwd = %s WHERE id_empleado = %s",
                (nueva_hash, id_empleado)
            )
            conn.commit()

            return {"success": True, "message": "Contraseña reseteada correctamente."}

        except Exception as e:
            return {"success": False, "message": f"Error interno: {e}"}