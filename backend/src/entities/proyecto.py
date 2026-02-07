class Proyecto:
    def __init__(self, id_proyecto, nombre_proyecto, direccion, inversion, cantidad_lotes,
                 cantidad_etapas, precio_parque, precio_esquina, precio_calle,
                 precio_avenida, precio_esquina_parque, foto_ref, estado):
        self.id_proyecto = id_proyecto
        self.nombre_proyecto = nombre_proyecto
        self.direccion = direccion
        self.inversion = inversion
        self.cantidad_lotes = cantidad_lotes
        self.cantidad_etapas = cantidad_etapas
        self.precio_parque = precio_parque
        self.precio_esquina = precio_esquina
        self.precio_calle = precio_calle
        self.precio_avenida = precio_avenida
        self.precio_esquina_parque = precio_esquina_parque
        self.foto_ref = foto_ref
        self.estado = estado

    def to_dic(self):
        return {
            "id_proyecto": self.id_proyecto,
            "nombre_proyecto": self.nombre_proyecto,
            "direccion": self.direccion,
            "inversion": self.inversion,
            "cantidad_lotes": self.cantidad_lotes,
            "cantidad_etapas": self.cantidad_etapas,
            "precio_parque": self.precio_parque,
            "precio_esquina": self.precio_esquina,
            "precio_calle": self.precio_calle,
            "precio_avenida": self.precio_avenida,
            "precio_esquina_parque": self.precio_esquina_parque,
            "foto_ref": self.foto_ref,
            "estado": self.estado
        }