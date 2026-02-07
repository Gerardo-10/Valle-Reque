import os
import uuid
from flask import Blueprint, request, jsonify,send_from_directory
from werkzeug.utils import secure_filename
from src.models.model_venta import ModelVenta
import json

venta_bp = Blueprint('ventas', __name__, url_prefix='/api/ventas')

@venta_bp.route('/contrato/<filename>', methods=['GET'])
def get_contrato(filename):
    ruta_contratos = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            '..', '..', '..', 
            'upload', 'pdf', 'ventas'
        )
    )
    print("[DEBUG ruta contratos]:", ruta_contratos)
    return send_from_directory(ruta_contratos, filename)

@venta_bp.route('/registrar', methods=['POST'])
def registrar_venta():
    try:
        # === DATOS PRINCIPALES ===
        id_cliente = int(request.form['id_cliente'])
        id_terreno = int(request.form['id_terreno'])
        id_usuario = int(request.form['id_usuario'])
        codigo_venta = request.form['codigo_venta']
        fecha_venta = request.form['fecha_venta']
        monto_bono = None
        precio_venta = float(request.form['precio_venta'])
        pago_inicial = float(request.form['pago_inicial'])
        monto_financiar = float(request.form['monto_financiar'])
        tipo_venta = request.form['tipo_venta']

        # ✅ ESTA PARTE ES LA CORREGIDA
        id_venta_origen_raw = request.form.get('id_venta_origen', '').strip()
        id_venta_origen = int(id_venta_origen_raw) if id_venta_origen_raw.isdigit() and int(id_venta_origen_raw) > 0 else None

        # === PDFs ===
        contrato = request.files['contrato']
        cronograma = request.files['cronograma']

        pdf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'pdf', 'ventas'))
        cron_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'pdf', 'cronogramas'))
        os.makedirs(pdf_dir, exist_ok=True)
        os.makedirs(cron_dir, exist_ok=True)
        contrato_nombre = secure_filename(f"{uuid.uuid4().hex}_contrato.pdf")
        cronograma_nombre = secure_filename(f"{uuid.uuid4().hex}_cronograma.pdf")
        contrato.save(os.path.join(pdf_dir, contrato_nombre))
        cronograma.save(os.path.join(cron_dir, cronograma_nombre))

        # === DETALLE FINANCIAMIENTO ===
        id_financiamiento = int(request.form['id_financiamiento'])
        fecha_aprobacion = request.form['fecha_aprobacion']
        interes_real = float(request.form['interes_real'])
        monto_preaprobado = float(request.form['monto_preaprobado'])
        constancia = request.files['constancia']

        constancia_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', 'upload', 'img', 'evaluacion_cliente'))
        os.makedirs(constancia_dir, exist_ok=True)
        constancia_nombre = secure_filename(f"{uuid.uuid4().hex}_constancia.png")
        constancia.save(os.path.join(constancia_dir, constancia_nombre))

        # === PLAN DE PAGO ===
        monto_total_aportado = float(request.form['monto_total_aportado'])
        fecha_inicio = request.form['fecha_inicio']
        fecha_final = request.form['fecha_final']
        numero_cuotas = int(request.form['numero_cuotas'])

        # === CUOTAS ===
        cuotas = json.loads(request.form['cuotas'])

        # === LLAMAR MODELO ===
        resultado = ModelVenta.insertar_venta_completa(
            id_cliente=id_cliente,
            id_terreno=id_terreno,
            id_usuario=id_usuario,
            codigo_venta=codigo_venta,
            fecha_venta=fecha_venta,
            monto_bono=monto_bono,
            precio_venta=precio_venta,
            pago_inicial=pago_inicial,
            monto_financiar=monto_financiar,
            documento_contrato=f"ventas/{contrato_nombre}",
            documento_cronograma=f"cronogramas/{cronograma_nombre}",
            tipo_venta=tipo_venta,
            id_venta_origen=id_venta_origen,
            id_financiamiento=id_financiamiento,
            fecha_aprobacion=fecha_aprobacion,
            interes_real=interes_real,
            monto_preaprobado=monto_preaprobado,
            constancia=f"evaluacion_cliente/{constancia_nombre}",
            monto_total_aportado=monto_total_aportado,
            fecha_inicio=fecha_inicio,
            fecha_final=fecha_final,
            numero_cuotas=numero_cuotas,
            cuotas=cuotas
        )

        return jsonify({"success": resultado}), 200 if resultado else 500

    except Exception as e:
        print(f"[ERROR registrar_venta]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@venta_bp.route('', methods=['GET'])
def listar_ventas():
    try:
        ventas = ModelVenta.obtener_ventas()
        return jsonify([venta.to_dic() for venta in ventas]) 
    except Exception as e:
        print(f"[ERROR listar_ventas]: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@venta_bp.route('/refinanciamiento', methods=['GET'])
def obtener_datos_venta_anterior_refinanciar():
    try:
        # Obtener el ID de la venta desde query params
        id_venta = request.args.get('id_venta', type=int)

        if not id_venta:
            return jsonify({
                "success": False,
                "message": "El parámetro 'id_venta' es requerido y debe ser numérico."
            }), 400

        print(f"[DEBUG] ID de venta recibido para refinanciamiento: {id_venta}")

        # Llamar al modelo
        datos = ModelVenta.obtener_datos_de_venta_anterior_refinanciar(id_venta)

        if not datos:
            return jsonify({
                "success": False,
                "message": f"No se encontraron datos para la venta con ID {id_venta}"
            }), 404

        return jsonify({
            "success": True,
            "data": datos
        }), 200

    except Exception as e:
        print(f"[ERROR /refinanciamiento]: {e}")
        return jsonify({
            "success": False,
            "message": "Error interno del servidor",
            "error": str(e)
        }), 500
        
@venta_bp.route("/cancelacion", methods=["GET"])
def obtener_datos_cancelacion():
    id_venta = request.args.get("id_venta", type=int)
    if not id_venta:
        return jsonify({"success": False, "message": "id_venta requerido"}), 400

    datos = ModelVenta.obtener_datos_de_cancelacion(id_venta)
    if not datos:
        return jsonify({"success": False, "message": "No se encontraron datos"}), 404

    return jsonify({"success": True, "data": datos}), 200




@venta_bp.route('/cancelar_venta', methods=['POST'])
def cancelar_venta():
    try:
        data = request.get_json()
        p_id_venta = data.get('id_venta')
        p_monto_total = data.get('monto_total')
        p_numero_cuotas = data.get('numero_cuotas')
        p_fecha_inicio = data.get('fecha_inicio')
        p_fecha_final = data.get('fecha_final')
        p_porcentaje_penalizacion = data.get('porcentaje_penalizacion')
        p_monto_por_cuota = data.get('monto_por_cuota')
        p_interes = data.get('interes')
        p_motivo_cancelacion = data.get('motivo_cancelacion')
        p_numero_cuota = data.get('numero_cuota')
        p_id_usuario = data.get('id_usuario')
        
        print(f"[DEBUG] Datos recibidos: id_venta={p_id_venta}, monto_total={p_monto_total}, "
              f"numero_cuotas={p_numero_cuotas}, fecha_inicio={p_fecha_inicio}, fecha_final={p_fecha_final}, "
              f"porcentaje_penalizacion={p_porcentaje_penalizacion}, monto_por_cuota={p_monto_por_cuota}, "
              f"interes={p_interes}, motivo_cancelacion={p_motivo_cancelacion}, numero_cuota={p_numero_cuota}, "
              f"id_usuario={p_id_usuario}")
        
        resultado = ModelVenta.cancelar_venta(
            p_id_venta,
            p_monto_total,
            p_numero_cuotas,
            p_fecha_inicio,
            p_fecha_final,
            p_porcentaje_penalizacion,
            p_monto_por_cuota,
            p_interes,
            p_motivo_cancelacion,
            p_numero_cuota,
            p_id_usuario
        )

        if resultado:
            return jsonify({"success": True, "message": "Venta cancelada y cuotas generadas exitosamente"}), 200
        else:
            return jsonify({"success": False, "message": "Hubo un error al cancelar la venta"}), 500

    except Exception as e:
        print(f"[ERROR cancelar_venta]: {e}")
        return jsonify({"message": "Error interno del servidor"}), 500