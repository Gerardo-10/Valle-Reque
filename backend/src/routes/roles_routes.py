from flask import Blueprint, jsonify

from src.models.model_rol import ModelRol


rol_bp = Blueprint('rol', __name__)

@rol_bp.route('/api/roles', methods=['GET'])
def listar_roles():
    try:
        roles = ModelRol.get_all()
        return jsonify([rol.to_dict() for rol in roles])
    except Exception as e:
        print(f"[ERROR listar_roles]: {e}")
        return jsonify([]), 500