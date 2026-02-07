class Venta:
    def __init__(self, id_venta, id_cliente, id_terreno, id_usuario, codigo_venta, fecha_venta,
                 monto_bono, precio_venta, pago_inicial, monto_financiar,
                 documento_contrato, estado, tipo, id_origen, documento_cronograma):
        self.id = id_venta
        self.id_cliente = id_cliente
        self.id_terreno = id_terreno
        self.id_usuario = id_usuario
        self.codigo = codigo_venta
        self.fecha = fecha_venta
        self.bono = monto_bono
        self.precio = precio_venta
        self.inicial = pago_inicial
        self.financiar = monto_financiar
        self.contrato = documento_contrato
        self.estado = estado
        self.tipo = tipo
        self.origen = id_origen
        self.cronograma = documento_cronograma

    def to_dic(self):
        return self.__dict__
    
class VentaListado:
    def __init__(self, id_venta, codigo_venta, nombre_cliente, apellido_cliente, dni,
                 codigo_unidad, estado_terreno, precio_de_venta, monto_financiar,
                 total_amortizado, estado, tipo, documento_contrato):
        self.id_venta = id_venta
        self.codigo_venta = codigo_venta
        self.nombre_cliente = nombre_cliente
        self.apellido_cliente = apellido_cliente
        self.dni = dni
        self.codigo_unidad = codigo_unidad
        self.estado_terreno = estado_terreno
        self.precio_venta = precio_de_venta
        self.monto_financiar = monto_financiar
        self.total_amortizado = total_amortizado
        self.estado = estado
        self.tipo = tipo
        self.documento_contrato = documento_contrato

    def to_dic(self):
        return self.__dict__
