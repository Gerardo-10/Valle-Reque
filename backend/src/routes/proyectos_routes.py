import os
import uuid
from flask import Blueprint,request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from src.models.model_proyecto import ModelProyecto


proyectos_bp = Blueprint('proyectos', __name__, url_prefix='/api/proyectos')

@proyectos_bp.route('/', methods=['GET'])
def listar_proyectos():
    try:
        proyectos = ModelProyecto.get_all()
        return jsonify(proyectos)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    

@proyectos_bp.route('/buscar_terreno/', methods=['POST'])
def buscar_terreno():
    data = request.json
    try:
        id_proyecto = int(data.get('id_proyecto'))
        codigo_unidad = data.get('codigo_unidad')
        etapa = data.get('etapa')
        print (f"Datos recibidos: id_proyecto={id_proyecto}, codigo_unidad={codigo_unidad}, etapa={etapa}")
        if not all([id_proyecto, codigo_unidad, etapa]):
            return jsonify({"success": False, "message": "Parámetros incompletos"}), 400

        resultado = ModelProyecto.buscar_terreno(id_proyecto, codigo_unidad, etapa)
        print(f"Resultado de buscar_terreno: {resultado}")
        if resultado:
            return jsonify(resultado), 200
        else:
            return jsonify(None), 200 
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@proyectos_bp.route('/imagen/<filename>', methods=['GET'])
def get_imagen(filename):
    ruta_final = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'proyectos'))
    print("[DEBUG ruta imagen]:", ruta_final)
    return send_from_directory(ruta_final, filename)

@proyectos_bp.route('/insertar', methods=['POST'])
def insertar_proyecto():
    try:
        nombreProyecto = request.form['nombreProyecto']
        direccionProyecto = request.form['direccionProyecto']
        inversionProyecto = request.form['inversionProyecto']
        numeroLotesProyecto = request.form['numeroLotesProyecto']
        numeroEtapasProyecto = request.form['numeroEtapasProyecto']
        precioParque = request.form['precioParque']
        precioEsquina = request.form['precioEsquina']
        precioCalle = request.form['precioCalle']
        precioAvenida = request.form['precioAvenida']
        precioEsquinaParque = request.form['precioEsquinaParque']
        
        # Recupera el archivo de request.files
        fotoProyecto_file = request.files.get('fotoProyecto')
        
        if fotoProyecto_file and fotoProyecto_file.filename:
            allowed_extensions = {'png', 'jpg', 'jpeg'}
            if '.' in fotoProyecto_file.filename and \
                fotoProyecto_file.filename.rsplit('.', 1)[1].lower() in allowed_extensions:
                    ext = os.path.splitext(fotoProyecto_file.filename)[1]
                    nombre_archivo = secure_filename(f"{uuid.uuid4().hex}{ext}")
                    carpeta = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'proyectos'))
                    os.makedirs(carpeta, exist_ok=True)
                    
                    fotoProyecto_file.save(os.path.join(carpeta, nombre_archivo))
            else:
                return jsonify({"success": False, "message": "Tipo de archivo de imagen no permitido. Solo PNG o JPG."}), 400

        success  = ModelProyecto.insertar(nombreProyecto, direccionProyecto, inversionProyecto, numeroLotesProyecto, numeroEtapasProyecto, precioParque, precioEsquina, precioCalle, precioAvenida, precioEsquinaParque, nombre_archivo)

        if success :
            return jsonify({
                "success": True,
                "message": "Proyecto creado correctamente",
                "id_proyecto": success   # ahora si existe
            }), 200
        else:
            return jsonify({"success": False, "message": "Error al insertar en la base de datos"}), 500
    except Exception as e:
        print(f"[ERROR insertar_proyecto]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@proyectos_bp.route('/editar', methods=['POST'])
def editar_proyecto():
    try:
        idProyecto = request.form['idProyecto']
        nombreProyecto = request.form['nombreProyecto']
        direccionProyecto = request.form['direccionProyecto']

        success = ModelProyecto.editar(idProyecto, nombreProyecto, direccionProyecto)

        if success:
            return jsonify({"success": True, "message": "Proyecto actualizado correctamente"}), 200
        else:
            return jsonify({"success": False, "message": "Error al actualizar en la base de datos"}), 500
    except Exception as e:
        print(f"[ERROR editar_proyecto]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@proyectos_bp.route('/eliminar', methods=['POST'])
def eliminar_proyecto():
    try:
        data = request.get_json()
        
        idProyecto = data['idProyecto']

        success = ModelProyecto.eliminar(idProyecto)

        if success:
            return jsonify({"success": True, "message": "Proyecto eliminado lógicamente y terrenos actualizados."}), 200
        else:
            return jsonify({"success": False, "message": "Error al eliminar el proyecto en la base de datos."}), 500
    except Exception as e:
        print(f"[ERROR eliminar_proyecto]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    