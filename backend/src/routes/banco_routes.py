from email.mime import image
import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from src.models.model_banco import ModelBanco
from flask import Blueprint, request, jsonify

banco_bp = Blueprint('bancos', __name__, url_prefix='/api/bancos')

# Ruta para guardar la imagen del logo del banco
@banco_bp.route('/logo/<filename>', methods=['GET'])
def get_logo(filename):
    ruta_final = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'bancos'))
    print("[DEBUG ruta imagen]:", ruta_final)
    return send_from_directory(ruta_final, filename)

# Ruta para eliminar banco (actualiza el estado a inactivo)
@banco_bp.route('/eliminar', methods=['POST'])
def eliminar_banco_route():
    try:
        id_banco = request.form['id_banco']
        print(f"[DEBUG] id_banco recibido en backend: {id_banco}")
        result = ModelBanco.eliminar_banco(id_banco)
        return jsonify(result)
    except Exception as e:
        print(f"[ERROR eliminar_banco_route]: {e}")
        return jsonify({"success": False, "message": "Error al eliminar banco"}), 500


# === LISTAR ===
@banco_bp.route('/', methods=['GET'])
def listar_bancos():
    try:
        bancos = ModelBanco.get_all()
        return jsonify({'success': True, 'data': bancos}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al listar bancos: {str(e)}'}), 500

# === INSERTAR BANCO ===
@banco_bp.route('/insertar', methods=['POST'])
def insertar_banco():
    try:
        nombre = request.form['nombre']
        cuenta = request.form['cuenta']
        titular = request.form['titular']
        logo = request.files.get('logo')
        nombre_archivo = None

        if logo:
            # Obtener la extensión del archivo
            ext = os.path.splitext(logo.filename)[1]
            # Generar un nombre único para el archivo
            nombre_archivo = secure_filename(f"{uuid.uuid4().hex}{ext}")
            # Ruta de la carpeta donde se almacenarán los logos
            carpeta = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'bancos'))
            os.makedirs(carpeta, exist_ok=True)
            # Guardar el logo en la ruta indicada
            logo.save(os.path.join(carpeta, nombre_archivo))

        # Insertar los datos del banco en la base de datos (sin la imagen directamente)
        exito = ModelBanco.insertar(nombre, cuenta, titular, nombre_archivo)

        if exito:
            return jsonify({"success": True, "message": "Banco registrado correctamente"}), 200
        else:
            return jsonify({"success": False, "message": "Error al insertar en la base de datos"}), 500
    except Exception as e:
        print(f"[ERROR insertar_banco]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
# === ACTUALIZAR BANCO ===
@banco_bp.route('/actualizar', methods=['POST'])
def actualizar_banco():
    try:
        id_banco = request.form['id_banco']
        nombre = request.form['nombre']
        cuenta = request.form['cuenta']
        titular = request.form['titular']
        logo = request.files.get('logo')  # El archivo de la imagen
        nuevo_logo = None

        # Ruta donde guardaremos las imágenes del banco (en el frontend)
        carpeta = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'bancos'))
        os.makedirs(carpeta, exist_ok=True)

        # Obtener el logo anterior desde la base de datos o modelo
        logo_anterior = ModelBanco.get_logo_por_id(id_banco)
        print(f"[DEBUG logo anterior banco]: {logo_anterior}")

        if logo:
            # Si se sube un nuevo logo, se genera un nombre único para evitar sobrescribir
            ext = os.path.splitext(logo.filename)[1]
            nuevo_logo = secure_filename(f"{uuid.uuid4().hex}{ext}")
            # Guardar el nuevo logo en la carpeta indicada
            logo.save(os.path.join(carpeta, nuevo_logo))

            # Si existe un logo anterior, se elimina el archivo antiguo
            if logo_anterior:
                ruta_anterior = os.path.join(carpeta, logo_anterior)
                if os.path.isfile(ruta_anterior):
                    os.remove(ruta_anterior)

        # Si no se ha subido un nuevo logo, mantenemos el logo anterior (si existe)
        if not nuevo_logo and logo_anterior:
            nuevo_logo = logo_anterior

        # Actualizar los datos del banco en la base de datos
        exito = ModelBanco.actualizar(id_banco, nombre, cuenta, titular, nuevo_logo)

        if exito:
            return jsonify({"success": True, "message": "Banco actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al actualizar banco"}), 500
    except Exception as e:
        print(f"[ERROR actualizar_banco]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


# === CAMBIAR ESTADO ===
@banco_bp.route('/cambiar_estado', methods=['POST'])
def cambiar_estado_banco():
    try:
        id_banco = request.form['id_banco']
        nuevo_estado = request.form['nuevo_estado']

        # Cambiar el estado entre "Activo" e "Inactivo"
        if nuevo_estado == "Inactivo":
            exito = ModelBanco.actualizar_estado(id_banco, "Inactivo")  # Cambiar a inactivo
        else:
            exito = ModelBanco.actualizar_estado(id_banco, "Activo")  # Volver a "Activo"

        if exito:
            return jsonify({"success": True, "message": f"Estado actualizado a {nuevo_estado}"}), 200
        else:
            return jsonify({"success": False, "message": "Error al cambiar estado"}), 500
    except Exception as e:
        print(f"[ERROR cambiar_estado_banco]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@banco_bp.route('/activos', methods=['GET'])
def listar_bancos_activos():
    try:
        bancos = ModelBanco.listar_bancos_activos()
        return jsonify({
            'success': True,
            'data': bancos
        }), 200
    except Exception as e:
        print(f"[ERROR listar_bancos_activos]: {e}")
        return jsonify({
            'success': False,
            'message': f'Error al listar bancos activos: {str(e)}'
        }), 500