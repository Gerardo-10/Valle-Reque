from datetime import date, datetime
from flask import Blueprint, jsonify, request

from src.database.connection import get_connection
from src.entities.user import User
from src.entities.seguridad import Seguridad
from src.models.model_rol_usuario import ModelRolUsuario
from src.models.model_area import ModelArea
from src.models.model_seguridad import ModelSeguridad
from src.models.model_user import ModelUser


seguridad_bp = Blueprint('seguridad_bp', __name__, url_prefix='/api/seguridad')

@seguridad_bp.route('/', methods=['GET'])
def listar_seguridad():
    try:
        seguridad = ModelSeguridad.get_all()
        usuarios = ModelUser.get_all()
        areas = ModelArea.get_all()
        roles_usuario = ModelRolUsuario.get_all()
        
        for s in seguridad:
            # Asociar usuario
            match_user = next((u for u in usuarios if u.id_empleado == s.id_empleado), None)
            s.usuario = match_user

            # Asociar área
            match_area = next((a for a in areas if a.id_area == s.id_area), None)
            s.id_area = match_area  # reemplazamos el ID por el objeto Area

            # Asociar rol y área al usuario si existe
            if s.usuario:
                s.usuario.area = match_area.nombre if match_area else None
                match_rol = next((r for r in roles_usuario if r["id_usuario"] == s.usuario.id_usuario), None)
                s.usuario.rol = match_rol["rol"] if match_rol else "Sin Rol"

        return jsonify([s.to_dict() for s in seguridad])
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@seguridad_bp.route('/detalles/<int:id_empleado>', methods=['GET'])
def obtener_empleado_por_id(id_empleado):
    try:
        # Obtener empleado
        empleado_dict = ModelSeguridad.get_empleado_por_id_general(id_empleado)
        if not empleado_dict:
            return jsonify({"success": False, "message": "Empleado no encontrado"}), 404

        # Obtener y procesar relaciones
        usuario = ModelUser.get_usuario_por_id_empleado(id_empleado)
        if usuario:
            empleado_dict['usuario'] = usuario

        if 'usuario' in empleado_dict:
            estado_binario = empleado_dict['usuario'].get('estado', 0)
            empleado_dict['usuario']['estado'] = 'Activo' if estado_binario == 1 else 'Inactivo'

        area = ModelArea.get_area_por_id_empleado(id_empleado)
        if area:
            empleado_dict['area'] = area
            
            # Asegúrate que 'nombre' exista en el diccionario 'area' que devuelve tu modelo
            if 'usuario' in empleado_dict and 'nombre' in empleado_dict['area']:
                empleado_dict['usuario']['area_nombre'] = empleado_dict['area']['nombre']

        if 'usuario' in empleado_dict:
            rol = ModelRolUsuario.get_rol_por_id_empleado(id_empleado)
            if rol:
                empleado_dict['usuario']['rol'] = rol.get('denominacion', 'Sin rol')
                empleado_dict['usuario']['id_rol'] = rol.get('id_rol')
            else:
                empleado_dict['usuario']['rol'] = 'Sin Asignar'
                empleado_dict['usuario']['id_rol'] = None

        return jsonify({
            "success": True,
            "data": empleado_dict
        })

    except Exception as e:
        print(f"[ERROR obtener_empleado_por_id]: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Error interno del servidor"}), 500
        
@seguridad_bp.route('insertar', methods=['POST'])
def insertar_seguridad():
    try:
        data = request.get_json()
        print("Datos recibidos:", data)

        # Validar que los campos esenciales existen
        required_fields = ['nombres', 'apellidos', 'dni', 'fecha_nacimiento', 'direccion', 'telefono', 'correo', 'id_area']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "success": False,
                    "message": f"Falta el campo requerido: {field}"
                }), 400

        # Validación de al menos dos apellidos
        apellidos_str = data['apellidos'].strip()
        apellidos_parts = apellidos_str.split()
        if len(apellidos_parts) < 2:
            return jsonify({
                "success": False,
                "message": "Debe ingresar al menos dos apellidos."
            }), 400

        # Validar la edad mínima (18 años)
        fecha_nacimiento_str = data['fecha_nacimiento']
        fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%Y-%m-%d').date()
        
        fecha_actual = date.today()
        edad_minima_fecha = fecha_actual.replace(year=fecha_actual.year - 18)

        if fecha_nacimiento > edad_minima_fecha:
            return jsonify({
                "success": False,
                "message": "El empleado debe tener al menos 18 años."
            }), 400

        # 1. Insertar al empleado
        nuevo_empleado = Seguridad(
            id_empleado=None,
            id_area=data['id_area'],
            nombre_empleado=data['nombres'].upper(),
            apellido_empleado=apellidos_str.upper(),
            dni=data['dni'],
            direccion=data['direccion'].upper(),
            telefono=data['telefono'],
            correo_electronico=data['correo'],
            fecha_nacimiento=fecha_nacimiento_str
        )
        resultado_empleado = ModelSeguridad.insert(nuevo_empleado)

        print("Resultado insert seguridad:", resultado_empleado) 

        if not resultado_empleado['success']:
            return jsonify({
                "success": False,
                "message": resultado_empleado.get("message", "Error al registrar empleado.")
            }), 400

        id_nuevo_empleado = resultado_empleado['id_empleado']

        # 2. Generar nombre de usuario inicial
        nombres = data['nombres'].strip().split()
        primer_nombre_inicial = nombres[0][0].lower()
        primer_apellido = apellidos_parts[0].lower()
        segundo_apellido = apellidos_parts[1].lower()

        # 3. Validar y generar nombre de usuario único
        nombre_usuario_final = generar_nombre_usuario_unico(primer_nombre_inicial, primer_apellido, segundo_apellido)

        # 4. Contraseña por defecto hasheada: "123456"
        from werkzeug.security import generate_password_hash
        contraseña_hash = generate_password_hash("123456", method="scrypt")

        # 5. Insertar en tabla usuario
        nuevo_usuario = User(
            id_usuario=None,
            id_empleado=id_nuevo_empleado,
            nombre_usuario=nombre_usuario_final,
            pwd=contraseña_hash,
            estado=True
        )

        resultado_usuario = ModelUser.insert(nuevo_usuario)

        if not resultado_usuario["success"]:
            return jsonify({"success": False, "message": "Empleado registrado, pero falló al crear usuario."}), 500
        return jsonify({"success": True, "message": "Empleado y usuario registrados correctamente."}), 201
    except Exception as e:
        print(f"[ERROR insertar_seguridad]: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@seguridad_bp.route('/actualizar_estados', methods=['POST'])
def actualizar_estados():
    try:
        data = request.get_json()
        ids = data.get('ids')
        nuevo_estado = data.get('nuevo_estado')
        print("DEBUG:", ids, nuevo_estado)

        # Validación explícita
        if not ids or nuevo_estado not in ["0", "1"]:
            return jsonify({"success": False, "message": "Faltan datos para la actualización."}), 400

        # Conversión a entero si tu procedimiento lo requiere como int
        estado_entero = 1 if nuevo_estado == "1" else 0

        resultado = ModelSeguridad.actualizar_estados(ids, estado_entero)
        return jsonify(resultado)
    except Exception as e:
        print(f"[ERROR ruta actualizar_estados_empleados]: {e}")
        return jsonify({"success": False, "error": str(e)}), 500
    
def generar_nombre_usuario_unico(primer_nombre_inicial, primer_apellido, segundo_apellido_completo):
    # Intentamos la forma base (g + primer_apellido + primera_letra_segundo_apellido)
    base_username = f"{primer_nombre_inicial}{primer_apellido}{segundo_apellido_completo[0]}"

    if not ModelUser.check_username_exists(base_username):
        return base_username
    
    # Si el nombre de usuario base ya existe, intentamos agregar más letras del segundo apellido
    # hasta que sea único o se agoten las letras
    for i in range(1, len(segundo_apellido_completo)):
        try_username = f"{primer_nombre_inicial}{primer_apellido}{segundo_apellido_completo[:i+1]}"
        if not ModelUser.check_username_exists(try_username):
            return try_username
            
    # Si aún después de agotar las letras del segundo apellido sigue existiendo,
    # añadimos un número consecutivo al final de la última versión intentada.
    final_attempt_base = f"{primer_nombre_inicial}{primer_apellido}{segundo_apellido_completo}"
    
    counter = 1
    while True:
        numbered_username = f"{final_attempt_base}{counter}"
        if not ModelUser.check_username_exists(numbered_username):
            return numbered_username
        counter += 1

@seguridad_bp.route('empleado/actualizar', methods=['POST'])
def actualizar_empleado():
    data = request.get_json()

    
    id_empleado = int(data.get("id_empleado"))
    direccion = data.get("direccion")
    correo = data.get("correo")
    telefono = data.get("telefono")

    if not all([id_empleado, direccion, correo, telefono]):
        return jsonify({"success": False, "message": "Faltan campos requeridos"}), 400

    try:
        resultado = ModelSeguridad.actualizar_empleado(id_empleado, direccion, correo, telefono)
        return jsonify({"success": True, "message": "Empleado actualizado correctamente", "data": resultado})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@seguridad_bp.route("usuario/actualizar", methods=["POST"])
def actualizar_usuario():
    data = request.get_json()
    print("DATA RECIBIDA:", data)

    id_empleado = data.get("id_empleado")
    id_rol = data.get("id_rol")
    id_area = data.get("id_area")
    estado = data.get("estado")

    if any(value is None for value in [id_empleado, id_rol, id_area, estado]):
        return jsonify({"success": False, "message": "Faltan campos requeridos."}), 400

    try:
        resultado = ModelSeguridad.actualizar_usuario(id_empleado, id_rol, id_area, estado)
        return jsonify({"success": True, "message": "Usuario actualizado correctamente", "data": resultado})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
    
@seguridad_bp.route("/cambiar_contraseña", methods=["POST"])
def cambiar_contraseña():
    data = request.get_json()
    print("DATA RECIBIDA:", data)

    id_empleado = data.get("id_empleado")
    actual = data.get("actual")
    nueva = data.get("nueva")

    if not all([id_empleado, actual, nueva]):
        return jsonify({"success": False, "message": "Faltan datos requeridos."}), 400

    resultado = ModelUser.cambiar_contraseña(id_empleado, actual, nueva)

    return jsonify(resultado), (200 if resultado["success"] else 400)

@seguridad_bp.route("/obtener_id_por_usuario", methods=["POST"])
def obtener_id_por_usuario():
    data = request.get_json()
    username = data.get("username")
    
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id_empleado FROM usuario WHERE nombre_usuario = %s", (username,))
    resultado = cursor.fetchone()

    if resultado:
        return jsonify({"success": True, "id_empleado": resultado[0]})
    else:
        return jsonify({"success": False, "message": "Usuario no encontrado"}), 404