class Financiamiento ():
    def __init__(self,id_financiamiento, tipo_financiamiento,nombre_financiamiento,
                 monto_financiamiento,interes,estado,fecha_creacion,foto_referencia):
        self.id = id_financiamiento
        self.tipo = tipo_financiamiento
        self.nombre = nombre_financiamiento
        self.monto = float(monto_financiamiento)
        self.interes = float(interes)
        self.estado = estado
        self.fecha = fecha_creacion
        self.foto = foto_referencia
        
    def to_dic (self): 
        return  {
            'id' : self.id,
            'tipo': self.tipo,
            'nombre': self.nombre,
            'monto': self.monto,
            'interes' : self.interes,
            'estado' : self.estado,
            'fecha': self.fecha,
            'foto_ref': self.foto
        }
        
class DetalleFinanciamiento:
    def __init__(self, id_financiamiento, id_venta, fecha_aprobado, interes_real, monto_preaprobado, constancia):
        self.id_financiamiento = id_financiamiento
        self.id_venta = id_venta
        self.fecha_aprobado = fecha_aprobado
        self.interes_real = interes_real
        self.monto_preaprobado = monto_preaprobado
        self.constancia = constancia

    def to_dic(self):
        return self.__dict__