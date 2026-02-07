from flask import Blueprint, request, jsonify
from src.models.model_user import ModelUser
from src.entities.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'success': False, 'message': 'Campos incompletos'}), 400

        user = ModelUser.login(username)

        if user is None:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'}), 404

        if not user.verificar_password(password):
            return jsonify({'success': False, 'message': 'Contraseña incorrecta'}), 401

        if not user.estado:
            return jsonify({'success': False, 'message': 'Usuario inactivo'}), 403

        return jsonify({
            'success': True,
            'message': 'Inicio de sesión exitoso',
            'user': {
                'id_usuario': user.id_usuario,
                'nombre_usuario': user.nombre_usuario,
                'estado': user.estado,
                'rol': user.rol,
                'area': user.area
            }
        }), 200

    except Exception as e:
        print(f"[ERROR login]: {e}")
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500
