import os
import uuid
from flask import Blueprint, request, jsonify,send_from_directory
from werkzeug.utils import secure_filename
from src.models.model_cuota import ModelCuota
import json

devolucion_bp = Blueprint('devolucion', __name__, url_prefix='/api/devolucion')

@devolucion_bp.route('/', methods=['GET'])
def listar_cliente_devolucion_df():
    try:
        # Obtener los datos del cliente y las cuotas de devolución
        resultados = ModelCuota.listar_cuotas_cliente_con_ultima_devolucion()

        if not resultados.get("success"):
            # Si hubo un error, devolver el mensaje de error
            return jsonify({"success": False, "message": resultados.get("message")}), 400
        
        # Si no hay errores, devolver los datos del cliente y las cuotas
        return jsonify({"success": True, "data": resultados.get("data")}), 200
    
    except Exception as e:
        # Si ocurre un error al obtener los datos
        print(f"[ERROR listar_cliente_devolucion_df]: {e}")
        return jsonify({"success": False, "message": "Error al listar las cuotas de devolución"}), 500