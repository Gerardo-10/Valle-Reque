import os
import uuid
from flask import Blueprint,request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from src.models.model_financiamiento import ModelFinanciamiento

financiamiento_bp = Blueprint('financiamientos', __name__, url_prefix='/api/financiamientos')


@financiamiento_bp.route('/imagen/<filename>', methods=['GET'])
def get_imagen(filename):
    ruta_final = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'financiamientos'))
    print("[DEBUG ruta imagen]:", ruta_final)
    return send_from_directory(ruta_final, filename)

# === LISTAR ===
@financiamiento_bp.route('/', methods=['GET'])
def listar_financiamientos():
    try:
        financiamientos = ModelFinanciamiento.get_all()
        return jsonify({'success': True, 'data': financiamientos}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error al obtener financiamientos: {str(e)}'}), 500

# === INSERTAR ===
@financiamiento_bp.route('/insertar', methods=['POST'])
def insertar_financiamiento():
    try:
        nombre = request.form['nombre']
        monto = float(request.form['monto'])
        interes = float(request.form['interes'])
        tipo = int(request.form['tipo'])
        estado = int(1)
        fecha = request.form['fecha']
        imagen = request.files.get('imagen')
        nombre_archivo = None

        if imagen:
            ext = os.path.splitext(imagen.filename)[1]
            nombre_archivo = secure_filename(f"{uuid.uuid4().hex}{ext}")
            carpeta = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'financiamientos'))
            os.makedirs(carpeta, exist_ok=True)
            imagen.save(os.path.join(carpeta, nombre_archivo))

        exito = ModelFinanciamiento.insertar(nombre, monto, interes, tipo, estado,fecha, nombre_archivo)
        if exito:
            return jsonify({"success": True, "message": "Financiamiento registrado correctamente"}), 200
        else:
            return jsonify({"success": False, "message": "Error al insertar en la base de datos"}), 500
    except Exception as e:
        print(f"[ERROR insertar_financiamiento]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

# === ACTUALIZAR ===
@financiamiento_bp.route('/actualizar', methods=['POST'])
def actualizar_financiamiento():
    try:
        id_financiamiento = request.form['id_financiamiento']
        nombre = request.form['nombre']
        monto = float(request.form['monto'])
        interes = float(request.form['interes'])
        tipo = int(request.form['tipo'])
        fecha = request.form['fecha']
        imagen = request.files.get('imagen', None)
        nombre_archivo = None

        # Ruta real
        carpeta = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'financiamientos'))
        os.makedirs(carpeta, exist_ok=True)

        # Obtener imagen anterior desde la BD (o entidad)
        imagen_anterior = ModelFinanciamiento.get_imagen_por_id(id_financiamiento)
        print(f"[DEBUG imagen anterior]: {imagen_anterior}")

        # Si sube nueva imagen, guardarla y eliminar anterior
        if imagen:
            ext = os.path.splitext(imagen.filename)[1]
            nombre_archivo = secure_filename(f"{uuid.uuid4().hex}{ext}")
            imagen.save(os.path.join(carpeta, nombre_archivo))

            # Eliminar imagen anterior si existe y no es None
            if imagen_anterior:
                ruta_antigua = os.path.join(carpeta, imagen_anterior)
                if os.path.isfile(ruta_antigua):
                    os.remove(ruta_antigua)

        exito = ModelFinanciamiento.actualizar(id_financiamiento, nombre, monto, interes, tipo, fecha, nombre_archivo)

        if exito:
            return jsonify({"success": True, "message": "Financiamiento actualizado correctamente"})
        else:
            return jsonify({"success": False, "message": "Error al actualizar en la base de datos"}), 500

    except Exception as e:
        print(f"[ERROR actualizar_financiamiento]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
    
# === CAMBIAR ESTADO ===
@financiamiento_bp.route('/cambiar_estado', methods=['POST'])
def cambiar_estado_financiamiento():
    try:
        id_financiamiento = request.form['id_financiamiento']
        nuevo_estado = request.form['nuevo_estado']
        exito = ModelFinanciamiento.actualizar_estado(id_financiamiento, nuevo_estado)
        if exito:
            return jsonify({"success": True, "message": f"Estado actualizado a {nuevo_estado}"}), 200
        else:
            return jsonify({"success": False, "message": "Error al actualizar estado"}), 500
    except Exception as e:
        print(f"[ERROR cambiar_estado_financiamiento]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    