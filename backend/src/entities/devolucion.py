class Devolucion:
    def __init__(self, id_devolucion, id_venta, monto_total, fecha_inicio, fecha_final, porcentaje_penalizacion, numero_cuota, motivo_cancelacion):
        self.id_devolucion = id_devolucion
        self.id_venta = id_venta
        self.monto_total = monto_total
        self.fecha_inicio = fecha_inicio
        self.fecha_final = fecha_final
        self.porcentaje_penalizacion = porcentaje_penalizacion
        self.numero_cuota = numero_cuota
        self.motivo_cancelacion = motivo_cancelacion

    def to_dict(self):
        return {
            'id_devolucion': self.id_devolucion,
            'id_venta': self.id_venta,
            'monto_total': self.monto_total,
            'fecha_inicio': self.fecha_inicio,
            'fecha_final': self.fecha_final,
            'porcentaje_penalizacion': self.porcentaje_penalizacion,
            'numero_cuota': self.numero_cuota,
            'motivo_cancelacion': self.motivo_cancelacion
        }
