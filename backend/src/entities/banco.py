class Banco:
    def __init__(self, id_banco, nombre_banco, numero_cuenta, titular, estado_banco, logo, ver_banco):
        self.id = id_banco
        self.nombre = nombre_banco
        self.numero_cuenta = numero_cuenta
        self.titular = titular
        self.estado = estado_banco
        self.logo = logo  # Esto podría ser una ruta de imagen o un archivo binario
        self.ver_banco = ver_banco

    def to_dic(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'numero_cuenta': self.numero_cuenta,
            'titular': self.titular,
            'estado': self.estado,
            'logo': self.logo,  # Si logo es la ruta del archivo, aquí se devuelve esa ruta
            'ver_banco': self.ver_banco
        }

    # Método para actualizar banco (ejemplo práctico)
    def actualizar(self, nombre_banco, numero_cuenta, titular, estado_banco, logo):
        self.nombre = nombre_banco
        self.numero_cuenta = numero_cuenta
        self.titular = titular
        self.estado = estado_banco
        self.logo = logo

    # Método para convertirlo a una cadena para SQL si es necesario para operaciones
    def to_sql_insert(self):
        return (self.nombre, self.numero_cuenta, self.titular, self.estado, self.logo, self.ver_banco)

    def to_sql_update(self):
        return (self.nombre, self.numero_cuenta, self.titular, self.estado, self.logo, self.ver_banco, self.id)
