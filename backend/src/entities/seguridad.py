class Seguridad:
    def __init__(self, id_empleado, id_area, nombre_empleado, apellido_empleado, dni, direccion, telefono, correo_electronico, fecha_nacimiento):
        self.id_empleado = id_empleado
        self.id_area = id_area
        self.nombre = nombre_empleado
        self.apellido = apellido_empleado
        self.dni = dni
        self.direccion = direccion
        self.telefono = telefono
        self.correo = correo_electronico
        self.fecha_nacimiento = fecha_nacimiento

    def to_dict(self):
        return {
            "id_empleado": self.id_empleado,
            "id_area": self.id_area.to_dict() if hasattr(self, 'id_area') and self.id_area else None,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni": self.dni,
            "direccion": self.direccion,
            "telefono": self.telefono,
            "correo": self.correo,
            "fecha_nacimiento": self.fecha_nacimiento,
            "usuario": self.usuario.to_dict() if hasattr(self, 'usuario') and self.usuario else None
        }