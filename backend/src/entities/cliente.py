class Cliente:
    def __init__(self,id_cliente,nombre,apellidos,documento_identidad,direccion,correo,telefono,ocupacion,ingreso_neto,estado_cliente,
        carga_familiar,estado):
        self.id_cliente = id_cliente
        self.nombre = nombre
        self.apellidos = apellidos
        self.dni = documento_identidad
        self.direccion = direccion
        self.correo = correo
        self.telefono = telefono
        self.ocupacion = ocupacion
        self.ingreso_neto = float(ingreso_neto)
        self.estado_cliente = estado_cliente  
        self.carga_familiar = bool(carga_familiar)
        self.estado = bool(estado)  

    def to_dict(self):
        return {
            "id": self.id_cliente,
            "nombre": self.nombre,
            "apellidos": self.apellidos,
            "dni": self.dni,
            "direccion": self.direccion,
            "correo": self.correo,
            "telefono": self.telefono,
            "ocupacion": self.ocupacion,
            "ingreso_neto": self.ingreso_neto,
            "estado_cliente": self.estado_cliente,
            "carga_familiar": self.carga_familiar,
            "estado": self.estado 
        }
