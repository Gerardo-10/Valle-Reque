from flask import request, jsonify, Blueprint
from flask import Blueprint, jsonify

from src.models.model_proyecto import ModelProyecto
from src.models.model_terreno import ModelTerreno


terrenos_bp = Blueprint("terrenos", __name__, url_prefix="/api/terrenos")

@terrenos_bp.route("/", methods=["GET"])
def listar_terrenos():
    try:
        terrenos = ModelTerreno.get_all()
        proyectos = ModelProyecto.get_all()
        
        proyectos_dict = {p['id_proyecto']: p['nombre_proyecto'] for p in proyectos}

        for t in terrenos:
            t['nombre_proyecto'] = proyectos_dict.get(t['id_proyecto'], "Sin Proyecto")

        return jsonify({
            "success": True,
            "terrenos": terrenos
        })  
    except Exception as e:
        print("[ERROR listar_terrenos]:", e)
        return jsonify({"success": False, "message": "Error al listar terrenos"}), 500
    
@terrenos_bp.route('/insertar', methods=["POST"])
def insertar_terreno():
    try:
        idProyecto = request.form['idProyecto']
        etapa = request.form['etapa']
        area = int(request.form['area'])
        precio = float(request.form['precio'])
        estado = request.form['estado']
        tipo = request.form['tipo']
        manzana = request.form['manzana']
        cantidad = int(request.form['cantidad'])

        print(f"DEBUG - idProyecto: {idProyecto}, manzana: {manzana}, cantidad: {cantidad}")

        result = ModelTerreno.insertar(idProyecto, etapa, area, precio, estado, tipo, manzana, cantidad)

        if result.get("success"):
            return jsonify({"success": True, "message": "Terreno registrado correctamente"}), 200
        else:
            return jsonify({"success": False, "message": result.get("message", "Error desconocido al registrar el terreno")}), 500
    except Exception as e:
        print(f"[ERROR insertar_terreno]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

    
@terrenos_bp.route('/actualizar', methods=["POST"])
def actualizar_terreno():
    try:
        data = request.get_json()
        result = ModelTerreno.actualizar_terreno(data)
        if result:
            return jsonify({"success": True, "message": "Terreno actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "No se pudo actualizar el terreno"}), 400
    except Exception as e:
        print("[ERROR actualizar_terreno]:", e)
        return jsonify({"success": False, "message": "Error al actualizar terreno"}), 500

