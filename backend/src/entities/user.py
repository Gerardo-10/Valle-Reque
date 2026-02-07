from werkzeug.security import check_password_hash

class User:
    def __init__(self, id_usuario, id_empleado, nombre_usuario, pwd, estado, rol=None, area=None):
        self.id_usuario = id_usuario
        self.id_empleado = id_empleado
        self.nombre_usuario = nombre_usuario
        self.pwd = pwd
        self.estado = estado
        self.rol = rol
        self.area = area

    def verificar_password(self, password):
        return check_password_hash(self.pwd, password)
    
    def to_dict(self):
        return {
            "id_usuario": self.id_usuario,
            "id_empleado": self.id_empleado,
            "nombre_usuario": self.nombre_usuario,
            "estado": bool(self.estado),
            "rol": self.rol,
            "area": self.area
        }
