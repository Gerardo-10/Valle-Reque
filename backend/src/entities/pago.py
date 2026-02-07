class Pago:
    def __init__(self, id_pago, id_venta, monto_total_aportado, fecha_inicio, fecha_final,
                 numero_cuotas, saldo, documento_finalizado, estado_pagos):
        self.id = id_pago
        self.id_venta = id_venta
        self.aporte = monto_total_aportado
        self.inicio = fecha_inicio
        self.final = fecha_final
        self.cuotas = numero_cuotas
        self.saldo = saldo
        self.doc_final = documento_finalizado
        self.estado = estado_pagos

    def to_dic(self):
        return self.__dict__