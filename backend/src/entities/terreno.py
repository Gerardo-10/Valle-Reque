class Terreno:
    def __init__(self, id_terreno, id_proyecto, etapa, area, precio_terreno,
                 estado_terreno, tipo_terreno, manzana, numero_lote, codigo_unidad, nombre_proyecto=None):
        self.id_terreno = id_terreno
        self.id_proyecto = id_proyecto
        self.etapa = etapa
        self.area = area
        self.precio_terreno = precio_terreno
        self.estado_terreno = estado_terreno
        self.tipo_terreno = tipo_terreno
        self.manzana = manzana
        self.numero_lote = numero_lote
        self.codigo_unidad = codigo_unidad
        self.nombre_proyecto = nombre_proyecto 

    def to_dict(self):
        return {
            "id_terreno": self.id_terreno,
            "id_proyecto": self.id_proyecto,
            "etapa": self.etapa,
            "area": self.area,
            "precio_terreno": self.precio_terreno,
            "estado_terreno": self.estado_terreno,
            "tipo_terreno": self.tipo_terreno,
            "manzana": self.manzana,
            "numero_lote": self.numero_lote,
            "codigo_unidad": self.codigo_unidad,
            "nombre_proyecto": self.nombre_proyecto
        }