class Rol:
    def __init__(self, id_rol, denominacion):
        self.id_rol = id_rol
        self.nombre = denominacion

    def to_dict(self):
        return {
            "id_rol": self.id_rol,
            "nombre": self.nombre
        }