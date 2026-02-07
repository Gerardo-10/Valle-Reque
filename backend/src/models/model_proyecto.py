from src.entities.proyecto import Proyecto
from src.database.connection import get_connection

class ModelProyecto:
    @classmethod
    def get_all(cls):
            try:
                conn = get_connection()
                cursor = conn.cursor()
                cursor.execute("CALL sp_listar_proyectos_activos()")
                rows = cursor.fetchall()
                while cursor.nextset(): pass

                proyectos = [Proyecto(*row).to_dic() for row in rows]
                return proyectos
            except Exception as e:
                print(f"[ERROR get_all Proyecto]: {e}")
                return []
            finally:
                try:
                    cursor.close()
                except:
                    pass
    
    @staticmethod
    def buscar_terreno(id_proyecto, codigo_unidad, etapa):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_buscar_terreno", (id_proyecto, codigo_unidad, etapa))
            resultado = cursor.fetchone()
            if resultado:
                keys = [desc[0] for desc in cursor.description]
                data = dict(zip(keys, resultado))

                # Filtramos solo los campos relevantes
                return {
                    "id_terreno": data.get("id_terreno"),
                    "disponible": data.get("estado_terreno", "").lower() == "disponible",
                    "precio": float(data.get("precio_terreno", 0)),
                    "tipo": data.get("tipo_terreno", ""),
                    "area": str(data.get("area", ""))
                }
            return None
        except Exception as e:
            print(f"[ERROR buscar_terreno]: {e}")
            return None
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def insertar(cls, nombreProyecto, direccionProyecto, inversionProyecto, numeroLotesProyecto, numeroEtapasProyecto, precioParque, precioEsquina, precioCalle, precioAvenida, precioEsquinaParque, fotoProyecto):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_insertar_proyecto(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (nombreProyecto, direccionProyecto, inversionProyecto, 
                numeroLotesProyecto, numeroEtapasProyecto, 
                precioParque, precioEsquina, precioCalle, 
                precioAvenida, precioEsquinaParque, fotoProyecto, 1)
            )

            # 🔥 Lee el primer resultset (id_proyecto)
            result = cursor.fetchone()
            nuevo_id = result[0] if result else None

            # 🔥 Consumir cualquier otro resultset si existiera
            while cursor.nextset():
                pass
            
            conn.commit()
            return nuevo_id 
        except Exception as e:
            print(f"[ERROR insertar Proyecto]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def editar(cls, idProyecto, nombreProyecto, direccionProyecto):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_actualizar_proyecto(%s, %s, %s)", (idProyecto, nombreProyecto, direccionProyecto)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR editar Proyecto]: {e}")
            return False
        finally:
            try:
                cursor.close()
            except:
                pass

    @classmethod
    def eliminar(cls, idProyecto):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute(
                "CALL sp_eliminar_proyecto(%s)", (idProyecto,)
            )
            conn.commit()
            return True
        except Exception as e:
            print(f"[ERROR eliminar Proyecto]: {e}")
        finally:
            try:
                cursor.close()
            except:
                pass