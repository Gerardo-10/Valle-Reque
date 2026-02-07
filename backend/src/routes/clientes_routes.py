import traceback
from flask import Blueprint,request, jsonify
from src.entities.cliente import Cliente
from src.entities.familia import Familia
from src.models.model_cliente import ModelCliente
from src.models.model_familia import ModelFamilia

clientes_bp = Blueprint('clientes', __name__, url_prefix='/api/clientes')

@clientes_bp.route('/', methods=['GET'])
def listar_clientes():
    try:
        clientes = ModelCliente.get_all()
        return jsonify([c.to_dict() for c in clientes])
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@clientes_bp.route('/detalles/<int:id_cliente>', methods=['GET'])
def obtener_cliente_por_id(id_cliente):
    try:
        # Obtener cliente
        cliente_dict = ModelCliente.get_cliente_por_id(id_cliente)
        if not cliente_dict:
            return jsonify({"success": False, "message": "Cliente no encontrado"}), 404
        
        # Obtener carga familiar si existe
        carga_familiar = ModelFamilia.get_by_cliente_id(id_cliente)
        if carga_familiar:
            cliente_dict['carga_familiar'] = [f.to_dict() for f in carga_familiar]
        else:
            cliente_dict['carga_familiar'] = []

        return jsonify({"success": True, "cliente": cliente_dict})
    except Exception as e:
        print(f"[ERROR obtener_cliente_por_id]: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": "Error interno del servidor"}), 500

@clientes_bp.route('/insertar', methods=['POST'])
def insertar_cliente():
    try:
        data = request.get_json()
        print(data) # Para debug

        carga_familiar_flag = int(data.get('carga_familiar', 0)) 
        if carga_familiar_flag == 1:
            dni_familiar = data.get('dni_familiar')
            if not dni_familiar:
                return jsonify({"success": False, "message": "Si el cliente tiene carga familiar, el DNI del familiar es obligatorio."}), 400
            try:
                if ModelFamilia.check_dni_exists(dni_familiar):
                    return jsonify({"success": False, "message": "El DNI del familiar ya está registrado. No se puede crear el cliente con esta carga familiar."}), 409 
            except Exception as e:
                print(f"[ERROR en la ruta al verificar DNI familiar]: {e}")
                return jsonify({"success": False, "message": "Error interno del servidor al verificar la carga familiar."}), 500
        cliente = Cliente(
            id_cliente=None,
            nombre=data['nombre'],
            apellidos=data['apellido'],
            documento_identidad=data['dni'],
            direccion=data['direccion'],
            correo=data['correo'],
            telefono=data['telefono'],
            ocupacion=data['ocupacion'],
            ingreso_neto=data['ingreso_neto'],
            estado_cliente=data['estado_cliente'],
            carga_familiar=carga_familiar_flag,
            estado=1
        )
    
        resultado_cliente = ModelCliente.insert(cliente)
        print("Resultado insert cliente:", resultado_cliente) # Para debug
        if resultado_cliente["success"] and carga_familiar_flag == 1:
            familiar = Familia(
                None,
                resultado_cliente.get("id_cliente"),
                data['nombre_familiar'],
                data['apellido_familiar'],
                data['dni_familiar'],
                0
            )
            resultado_familiar = ModelCliente.insertar_cliente_familiar(familiar)
            if not resultado_familiar["success"]:
                resultado_cliente["familiar_status"] = "failed"
                resultado_cliente["familiar_message"] = resultado_familiar["message"]
        return jsonify(resultado_cliente)

    except Exception as e:
        print(f"[ERROR ruta insertar_cliente]: {e}") 
        return jsonify({"success": False, "message": "Error inesperado al registrar cliente."}), 500


@clientes_bp.route('/actualizar_estado', methods=['POST'])
def actualizar_estado_clientes():
    try:
        data = request.get_json()
        print(data)
        ids = data.get('ids')
        nuevo_estado = data.get('estado')

        if not ids or not nuevo_estado:
            return jsonify({"success": False, "message": "Faltan datos para la actualización."}), 400

        resultado = ModelCliente.actualizar_estados(ids, nuevo_estado)
        return jsonify(resultado)
    except Exception as e:
        print(f"[ERROR ruta actualizar_estado_clientes]: {e}")
        return jsonify({"success": False, "message": "Error al actualizar el estado de clientes."}), 500
    
@clientes_bp.route('/eliminar', methods=['POST'])
def eliminar_clientes():
    try:
        data = request.get_json()
        print(data)
        ids = data.get('ids', [])
        if not ids:
            return jsonify({"success": False, "message": "No se recibieron IDs para eliminar."}), 400

        resultado = ModelCliente.eliminar(ids)
        return jsonify(resultado)
    except Exception as e:
        print(f"[ERROR eliminar clientes]: {e}")
        return jsonify({"success": False, "message": "Error al eliminar clientes."}), 500

@clientes_bp.route('/dni/<dni>', methods=['GET'])
def obtener_cliente_por_dni(dni):
    try:
        resultado = ModelCliente.get_by_dni(dni)

        if not resultado["success"]:
            return jsonify(resultado)

        cliente = resultado["cliente"]
        return jsonify({
            "success": True,
            "cliente": cliente.to_dict()
        })

    except Exception as e:
        print(f"[ERROR ruta obtener_cliente_por_dni]: {e}")
        return jsonify({"success": False, "message": "Error al obtener cliente por DNI."}), 500
    
@clientes_bp.route('detalles/actualizar', methods=['POST'])
def actualizar_cliente():
    try:
        data = request.get_json()
        print(data)

        carga_familiar_flag = 1 if data.get('carga_familiar') else 0

        cliente = Cliente(
            id_cliente=data['id_cliente'],
            nombre=data['nombre'],
            apellidos=data['apellidos'],
            documento_identidad=data['dni'],
            direccion=data['direccion'],
            correo=data['correo'],
            telefono=data['telefono'],
            ocupacion=data['ocupacion'],
            ingreso_neto=data['ingreso_neto'],
            estado_cliente=data['estado_cliente'],
            carga_familiar=carga_familiar_flag,
            estado=int(data.get('estado', 1))
        )

        resultado = ModelCliente.actualizar_cliente(cliente)
        return jsonify(resultado)

    except Exception as e:
        print(f"[ERROR ruta actualizar_cliente]: {e}")
        return jsonify({"success": False, "message": "Error al actualizar cliente."}), 500
    
@clientes_bp.route('/familiar/actualizar', methods=['POST'])
def actualizar_familiar():
    try:
        data = request.get_json()
        print(data)

        familiar = Familia(
            id_familia=data['id_familia'],
            id_cliente=data['id_cliente'],
            nombre_familiar=data['nombre'],
            apellido_familiar=data['apellido'],
            documento_identidad=data['dni'],
            es_cotitular=bool(int(data['cotitular']))
        )

        resultado = ModelCliente.actualizar_cliente_familiar(familiar)
        return jsonify(resultado)

    except Exception as e:
        print(f"[ERROR ruta actualizar_familiar]: {e}")
        return jsonify({"success": False, "message": "Error al actualizar familiar."}), 500
    
@clientes_bp.route('/familiar/insertar', methods=['POST'])
def insertar_familiar():
    try:
        data = request.get_json()
        familiar = Familia(
            id_familia=None,
            id_cliente=data['id_cliente'],
            nombre_familiar=data['nombre'],
            apellido_familiar=data['apellido'],
            documento_identidad=data['dni'],
            es_cotitular=bool(int(data['cotitular']))
        )
        resultado = ModelCliente.insertar_cliente_familiar(familiar)
        return jsonify(resultado)
    except Exception as e:
        print(f"[ERROR ruta insertar_familiar]: {e}")
        return jsonify({"success": False, "message": "Error al insertar familiar."}), 500
    
@clientes_bp.route('/cambiar_titularidad', methods=['POST'])
def cambiar_titularidad():
    try:
        data = request.get_json()
        print("[CAMBIO TITULARIDAD DATA]", data)

        # Inserta el nuevo cliente usando la función existente
        carga_familiar_flag = int(data.get('carga_familiar', 0))
        if carga_familiar_flag == 1:
            dni_familiar = data.get('dni_familiar')
            if not dni_familiar:
                return jsonify({"success": False, "message": "El DNI del familiar es obligatorio."}), 400
            if ModelFamilia.check_dni_exists(dni_familiar):
                return jsonify({"success": False, "message": "El DNI del familiar ya existe."}), 409

        nuevo_cliente = Cliente(
            id_cliente=None,
            nombre=data['nombre'],
            apellidos=data['apellido'],
            documento_identidad=data['dni'],
            direccion=data['direccion'],
            correo=data['correo'],
            telefono=data['telefono'],
            ocupacion=data['ocupacion'],
            ingreso_neto=data['ingreso_neto'],
            estado_cliente=data['estado_cliente'],
            carga_familiar=carga_familiar_flag,
            estado=1
        )
        print("✅ Insertando cliente...")
        resultado_cliente = ModelCliente.insert(nuevo_cliente)
        print("✅ Resultado cliente:", resultado_cliente)

        if not resultado_cliente["success"]:
            return jsonify({"success": False, "message": resultado_cliente["message"]}), 400

        # Inserta familiar si corresponde
        if carga_familiar_flag == 1:
            print("✅ Insertando familiar...")
            familiar = Familia(
                None,
                resultado_cliente.get("id_cliente"),
                data['nombre_familiar'],
                data['apellido_familiar'],
                data['dni_familiar'],
                0
            )
            resultado_familiar = ModelCliente.insertar_cliente_familiar(familiar)
            print("✅ Resultado familiar:", resultado_familiar)
            if not resultado_familiar["success"]:
                return jsonify({"success": False, "message": "No se pudo insertar el familiar."}), 500

        # Cambio de titularidad (invoca SP)
        print("✅ Obteniendo ids por codigo venta...")
        codigo_venta = data.get("codigo_venta")
        ids = ModelCliente.obtener_ids_por_codigo_venta(codigo_venta)
        print("✅ IDs obtenidos:", ids)

        if not ids:
            return jsonify({"success": False, "message": "No se encontró la venta."}), 404

        id_venta = ids['id_venta']
        id_cliente_antiguo = ids['id_cliente']
        id_cliente_nuevo = resultado_cliente.get("id_cliente")

        print("✅ Cambiando titularidad...")
        resultado_cambio = ModelCliente.cambiar_titularidad(id_cliente_antiguo, id_cliente_nuevo)
        print("✅ Resultado cambio titularidad:", resultado_cambio)

        if not resultado_cambio["success"]:
            return jsonify({"success": False, "message": resultado_cambio["message"]}), 500

        # Insertar en historial de titularidad
        print("✅ Insertando historial titularidad...")
        resultado_historial = ModelCliente.insertar_historial_titularidad(
            id_venta,
            id_cliente_antiguo,
            id_cliente_nuevo
        )
        print("✅ Resultado historial:", resultado_historial)

        if not resultado_historial["success"]:
            return jsonify({"success": False, "message": resultado_historial["message"]}), 500

        return jsonify({"success": True, "message": "Titularidad cambiada correctamente."})

    except Exception as e:
        print(f"[ERROR CAMBIAR TITULARIDAD]: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "message": "Error inesperado en el servidor."}), 500
    
