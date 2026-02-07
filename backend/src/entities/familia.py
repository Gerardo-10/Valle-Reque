class Familia ():
    def __init__(self,id_familia,id_cliente,nombre_familiar,apellido_familiar,documento_identidad,es_cotitular):
        self.id_familia = id_familia
        self.id_cliente = id_cliente
        self.nombre = nombre_familiar
        self.apellido = apellido_familiar
        self.dni = documento_identidad
        self.cotitular = bool(es_cotitular)

    def  to_dict (self):
        return {
            "id_familia": self.id_familia,
            "id_cliente": self.id_cliente,
            "nombre": self.nombre,
            "apellido": self.apellido,
            "dni" : self.dni,
            "cotitular"  : self.cotitular,
        }