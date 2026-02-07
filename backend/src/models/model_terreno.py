from src.database.connection import get_connection
from src.entities.terreno import Terreno


class ModelTerreno:
    @classmethod
    def get_all(cls):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.execute("CALL sp_listar_terrenos()")
            rows = cursor.fetchall()
            while cursor.nextset():
                pass
            terrenos = [Terreno(*row).to_dict() for row in rows]
            return terrenos
        except Exception as e:
            print(f"[ERROR get_all terreno]: {e}")
            return []
        
    @classmethod
    def actualizar_terreno(cls, data):
        try:
            conn = get_connection()
            cursor = conn.cursor()
            cursor.callproc("sp_actualizar_terreno", (
                data["id_terreno"],
                data["etapa"],
                data["tipo_terreno"],
                data["area"],
                data["precio_terreno"],
                data["estado_terreno"],
                data["manzana"],
                data["numero_lote"],
                data["codigo_unidad"]
            ))
            conn.commit()
            return True
        except Exception as e:
            print("[ERROR actualizar_terreno]:", e)
            return False
        
    @classmethod
    def insertar(cls, idProyecto, etapa, area, precio, estado, tipo, manzana, cantidad):
        try:
            conn = get_connection()
            cursor = conn.cursor()

            # 1. Obtener el último numero_lote para esa manzana y proyecto
            cursor.execute("""
                SELECT MAX(numero_lote)
                FROM terreno
                WHERE id_proyecto = %s AND manzana = %s
            """, (int(idProyecto), manzana))

            row = cursor.fetchone()
            ultimo_numero = row[0] if row and row[0] is not None else 0

            inserts_realizados = []

            # 2. Insertar 'cantidad' de terrenos de forma incremental
            for i in range(1, cantidad + 1):
                numero_lote = ultimo_numero + i
                codigoUnidad = f"{manzana} - {numero_lote}"

                # 3. Verificar que el código no exista (por seguridad extra)
                cursor.execute("""
                    SELECT id_terreno
                    FROM terreno
                    WHERE codigo_unidad = %s AND id_proyecto = %s
                """, (codigoUnidad, int(idProyecto)))
                if cursor.fetchone():
                    # Si ya existe, omitir este lote y continuar
                    continue

                # 4. Insertar el terreno usando tu SP
                cursor.execute("""
                    CALL sp_insertar_terreno(%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    idProyecto, etapa, area,
                    precio, estado, tipo, manzana, numero_lote, codigoUnidad
                ))

                inserts_realizados.append(codigoUnidad)

            conn.commit()

            if inserts_realizados:
                return {
                    "success": True,
                    "message": f"Terrenos registrados: {', '.join(inserts_realizados)}"
                }
            else:
                return {
                    "success": False,
                    "message": "No se insertaron terrenos nuevos (posibles códigos duplicados)."
                }

        except Exception as e:
            print(f"[ERROR insertar Terreno]: {e}")
            return {"success": False, "message": "Error al registrar el terreno."}
        finally:
            try:
                cursor.close()
            except:
                pass