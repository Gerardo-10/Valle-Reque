from flask import Blueprint, jsonify

from src.models.model_area import ModelArea


area_bp = Blueprint('area', __name__)

@area_bp.route('/api/areas', methods=['GET'])
def listar_areas():
    try:
        areas = ModelArea.get_all()
        return jsonify([area.to_dict() for area in areas])
    except Exception as e:
        print(f"[ERROR listar_areas]: {e}")
        return jsonify([]), 500