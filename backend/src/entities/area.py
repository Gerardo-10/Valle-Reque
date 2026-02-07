class Area:
    def __init__(self, id_area, nombre, creado, actualizado):
        self.id_area = id_area
        self.nombre = nombre
        self.creado = creado
        self.actualizado = actualizado

    def to_dict(self):
        return {
            "id_area": self.id_area,
            "nombre": self.nombre,
            "creado": self.creado,
            "actualizado": self.actualizado
        }
