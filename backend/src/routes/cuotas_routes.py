from flask import Blueprint,request, jsonify,send_from_directory
from src.models.model_cuota import ModelCuota
from src.models.model_cliente import ModelCliente
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import traceback

cuotas_bp = Blueprint('cuotas', __name__, url_prefix='/api/cuotas')
UPLOAD_FOLDER_CUOTAS = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'pdf', 'constancias_cuotas'))
UPLOAD_FOLDER_IMG_PRUEBA = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'bacher_pago'))
UPLOAD_FOLDER_IMG_CONSTANCIA_BONO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'constancia_bono'))
UPLOAD_FOLDER_FIN_VENTA = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'pdf', 'fin_ventas'))


@cuotas_bp.route('/', methods=['GET'])
def listas_cuotas_ultimo_cliente_con_la_ultima_venta():
    try:
        datos_cuotas = ModelCuota.listar_cuotas_del_ultimo_cliente_con_venta()
        return jsonify([datos_cuotas])
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
      
@cuotas_bp.route('/buscar/dni', methods=['POST'])
def buscar_cuotas_por_dni():
    data = request.get_json(force=True)
    dni  = data.get('dni')

    if not dni:
        return jsonify(success=False, message="El DNI es requerido"), 400

    id_cliente = ModelCliente.obtener_id_cliente_por_dni(dni)
    if id_cliente is None:
        return jsonify(success=False, message="Cliente no encontrado"), 404

    datos_cuotas = ModelCliente.obtener_datos_cliente_ventas(id_cliente)
    return jsonify(success=True, data=datos_cuotas), 200

@cuotas_bp.route('/buscar/nombre', methods=['POST'])
def buscar_cuotas_por_nombre():
    data     = request.get_json(force=True)
    nombres  = data.get('nombres')
    apellidos= data.get('apellidos')
    print(nombres, apellidos)
    if not nombres or not apellidos:
        return jsonify(success=False,
                       message="Tanto nombres como apellidos son requeridos"), 400
    id_cliente = ModelCliente.obtener_id_cliente_por_nombres(nombres, apellidos)
    if id_cliente is None:
        return jsonify(success=False, message="Cliente no encontrado"), 404

    datos_cuotas = ModelCliente.obtener_datos_cliente_ventas(id_cliente)
    return jsonify(success=True, data=datos_cuotas), 200

@cuotas_bp.route('/pagar', methods=['POST'])
def pagar_cuota():
    try:
        id_cuota    = request.form.get('id_cuota')
        referencia  = request.form.get('referencia')
        id_banco    = request.form.get('id_banco')
        documento_prueba = request.files.get('documento_prueba')
        archivo     = request.files.get('documento_boleta')
        fecha_iso = request.form.get('fecha_pago')
        fecha_pago_mysql = datetime.fromisoformat(fecha_iso.replace('Z', '')).strftime('%Y-%m-%d %H:%M:%S')

        # Validación de campos
        if not all([id_cuota, referencia, id_banco, documento_prueba, archivo]):
            return jsonify(success=False, message="Todos los campos son requeridos"), 400

        if not archivo or not archivo.filename.lower().endswith('.pdf'):
            return jsonify(success=False, message="El archivo debe ser un PDF"), 400
        
        fecha_actual = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
        nombre_base = f"constancia_{referencia}_cuota_{id_cuota}_{fecha_actual}.pdf"
        nombre_seguro = secure_filename(nombre_base)

        if not os.path.exists(UPLOAD_FOLDER_CUOTAS):
            os.makedirs(UPLOAD_FOLDER_CUOTAS)

        ruta_destino = os.path.join(UPLOAD_FOLDER_CUOTAS, nombre_seguro)
        archivo.save(ruta_destino) 

        extension = documento_prueba.filename.rsplit('.', 1)[-1]
        nombre_img = secure_filename(f"comprobante_{referencia}_cuota_{id_cuota}_{fecha_actual}.{extension}")
        if not os.path.exists(UPLOAD_FOLDER_IMG_PRUEBA):
            os.makedirs(UPLOAD_FOLDER_IMG_PRUEBA)
        ruta_img = os.path.join(UPLOAD_FOLDER_IMG_PRUEBA, nombre_img)
        documento_prueba.save(ruta_img)

        resultado = ModelCuota.pagar_cuota(
            id_cuota=int(id_cuota),
            ref=referencia,
            id_banco=int(id_banco),
            doc_prueba=nombre_img,         
            doc_boleta=nombre_seguro,                     
            fecha_pago=fecha_pago_mysql
        )

        if resultado is True:
            return jsonify(success=True, message="Cuota pagada y constancia guardada correctamente")
        else:
            return jsonify(success=False, message=str(resultado)), 400

    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500

@cuotas_bp.route('/ver-boleta', methods=['GET'])
def ver_boleta_por_cuota():
    try:
        id_cuota = request.args.get('id_cuota', type=int)
        referencia = request.args.get('referencia')

        if not id_cuota or not referencia:
            return jsonify(success=False, message="id_cuota y referencia son requeridos"), 400

        nombre_pdf = ModelCuota.verpdf(id_cuota, referencia)

        if not nombre_pdf:
            return jsonify(success=False, message="No se encontró la boleta"), 404

        print("Sirviendo archivo:", nombre_pdf)
        return send_from_directory(UPLOAD_FOLDER_CUOTAS, nombre_pdf)

    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500

@cuotas_bp.route('/finalizar-venta', methods=['POST'])
def finalizar_venta():
    try:
        id_pago = request.form.get('id_pago')
        monto_bono = request.form.get('monto_bono')
        fecha_cobro = request.form.get('fecha_cobro')
        doc_final = request.files.get('documento_final')
        doc_bono = request.files.get('documento_bono')

        if not all([id_pago, monto_bono, fecha_cobro, doc_final, doc_bono]):
            return jsonify(success=False, message="Faltan campos obligatorios"), 400

        fecha_actual = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')

        # Guardar documento_final (PDF)
        nombre_final = secure_filename(f"final_venta_{id_pago}_{fecha_actual}.pdf")
        ruta_final = os.path.join(UPLOAD_FOLDER_FIN_VENTA, nombre_final)
        if not os.path.exists(UPLOAD_FOLDER_FIN_VENTA):
            os.makedirs(UPLOAD_FOLDER_FIN_VENTA)
        doc_final.save(ruta_final)

        # Guardar documento_bono (imagen)
        extension = doc_bono.filename.rsplit('.', 1)[-1]
        nombre_bono = secure_filename(f"constancia_bono_{id_pago}_{fecha_actual}.{extension}")
        ruta_bono = os.path.join(UPLOAD_FOLDER_IMG_CONSTANCIA_BONO, nombre_bono)
        if not os.path.exists(UPLOAD_FOLDER_IMG_CONSTANCIA_BONO):
            os.makedirs(UPLOAD_FOLDER_IMG_CONSTANCIA_BONO)
        doc_bono.save(ruta_bono)

        # Llamar al modelo para ejecutar el SP
        resultado = ModelCuota.finalizar_venta(
            id_pago=int(id_pago),
            monto_bono=float(monto_bono),
            nombre_pdf_fin=nombre_final,
            nombre_pdf_bono=nombre_bono,
            fecha_cobro=fecha_cobro
        )

        if resultado:
            return jsonify(success=True, message="Venta finalizada correctamente")
        else:
            return jsonify(success=False, message="No se pudo finalizar la venta")

    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500
    

@cuotas_bp.route('/ver-venta-final/<codigo_venta>', methods=['GET'])
def ver_venta_final(codigo_venta):
    try:
        # Buscar el nombre exacto del archivo desde el modelo
        nombre_pdf = ModelCuota.obtener_documento_final_por_codigo_venta(codigo_venta)
        
        if not nombre_pdf:
            return jsonify(success=False, message="Archivo no encontrado"), 404

        return send_from_directory(UPLOAD_FOLDER_FIN_VENTA, nombre_pdf)

    except Exception as e:
        traceback.print_exc()
        return jsonify(success=False, error=str(e)), 500