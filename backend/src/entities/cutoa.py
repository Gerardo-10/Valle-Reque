class Cuota:
    def __init__(self, id_cuota, id_pago, id_cliente, id_usuario, id_devolucion, id_banco,
                 monto, estado, referencia, tipo, doc_prueba, refinanciada,fecha_pago,estadi_cuota_logica):
        self.id = id_cuota
        self.id_pago = id_pago
        self.id_cliente = id_cliente
        self.id_usuario = id_usuario
        self.id_devolucion = id_devolucion
        self.id_banco = id_banco
        self.monto = monto
        self.estado = estado
        self.referencia = referencia
        self.tipo = tipo
        self.doc_prueba = doc_prueba
        self.refinanciada = refinanciada
        self.fecha_pago = fecha_pago
        self.estadi_cuota_logica = estadi_cuota_logica

    def to_dic(self):
        return self.__dict__