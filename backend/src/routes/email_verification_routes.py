from flask import Blueprint, request, jsonify
import smtplib
import random
import time
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import cross_origin

# Crear blueprint para las rutas de verificación
email_verification_bp = Blueprint('email_verification', __name__)

# Almacenamiento temporal de códigos (en producción usar Redis o base de datos)
verification_codes = {}


@email_verification_bp.route('/api/send-verification', methods=['POST'])
@cross_origin()
def send_verification():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'message': 'Email es requerido'}), 400

        # Verificar dominio permitido
        allowed_domains = ['gmail.com', 'hotmail.com', 'outlook.com']
        domain = email.split('@')[1].lower() if '@' in email else ''

        if domain not in allowed_domains:
            return jsonify({'message': 'Solo se permiten emails de Gmail, Hotmail o Outlook'}), 400

        # Generar código de 6 dígitos
        verification_code = str(random.randint(100000, 999999))

        # Guardar código con expiración de 10 minutos
        verification_codes[email] = {
            'code': verification_code,
            'expires': time.time() + 600  # 10 minutos
        }

        # Configurar SMTP
        smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
        smtp_server.starttls()
        smtp_server.login(os.getenv('EMAIL_USERNAME'), os.getenv('EMAIL_PASSWORD'))

        # Crear mensaje
        msg = MIMEMultipart()
        msg['From'] = os.getenv('EMAIL_USERNAME')
        msg['To'] = email
        msg['Subject'] = "Código de Verificación - ValleReque"

        # HTML del email actualizado con el nuevo estilo
        html_body = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verificación de Email - Valle Reque</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f5f5f0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #f5f5f0; padding: 40px 20px;">

                <!-- Header Verde -->
                <div style="background-color: #4CAF50; padding: 25px 30px; border-radius: 8px; text-align: left; margin-bottom: 30px;">
                    <div style="display: flex; align-items: center; color: white;">
                        <div style="margin-right: 12px; font-size: 24px;">🛡️</div>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: white;">Sistema Valle Reque</h1>
                    </div>
                </div>

                <!-- Contenido Principal -->
                <div style="background-color: white; padding: 40px 35px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

                    <!-- Saludo -->
                    <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333; font-weight: 600;">
                        Hola,
                    </h2>

                    <!-- Descripción -->
                    <p style="margin: 0 0 25px 0; color: #555; font-size: 15px; line-height: 1.6;">
                        Has solicitado verificar tu dirección de correo electrónico.
                    </p>

                    <!-- Código de Verificación -->
                    <p style="margin: 0 0 15px 0; color: #333; font-size: 15px; font-weight: 600;">
                        Tu código de verificación es:
                    </p>

                    <div style="text-align: center; margin: 25px 0 30px 0;">
                        <div style="display: inline-block; padding: 20px 30px; border: 2px dotted #4CAF50; border-radius: 8px; background-color: #f9f9f9;">
                            <span style="font-size: 28px; font-weight: bold; color: #4CAF50; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                {verification_code}
                            </span>
                        </div>
                    </div>

                    <!-- Sección Importante -->
                    <div style="margin: 30px 0;">
                        <div style="display: flex; align-items: center; margin-bottom: 12px;">
                            <span style="color: #FF9800; font-size: 16px; margin-right: 8px;">⚠️</span>
                            <strong style="color: #333; font-size: 15px;">Importante:</strong>
                        </div>

                        <ul style="margin: 0; padding-left: 20px; color: #555; font-size: 14px; line-height: 1.8;">
                            <li>Este código expira en <strong>10 minutos</strong></li>
                            <li>Solo tienes <strong>3 intentos</strong> para verificarlo</li>
                            <li>No compartas este código con nadie</li>
                            <li>Si no solicitaste este código, ignora este mensaje</li>
                        </ul>
                    </div>

                    <!-- Instrucciones -->
                    <p style="margin: 25px 0 0 0; color: #555; font-size: 14px; line-height: 1.6;">
                        Ingresa este código en la ventana de verificación para continuar.
                    </p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding: 20px;">
                    <p style="margin: 0 0 10px 0; color: #888; font-size: 13px;">
                        Este es un mensaje automático, no responder a este email.
                    </p>
                    <p style="margin: 0; color: #888; font-size: 12px;">
                        © 2024 Sistema Valle Reque. Todos los derechos reservados.
                    </p>
                </div>

            </div>
        </body>
        </html>
        """

        msg.attach(MIMEText(html_body, 'html'))

        # Enviar email
        smtp_server.send_message(msg)
        smtp_server.quit()

        return jsonify({'message': 'Código de verificación enviado correctamente'}), 200

    except Exception as e:
        print(f"Error enviando email: {e}")
        return jsonify({'message': 'Error interno del servidor'}), 500


@email_verification_bp.route('/api/verify-code', methods=['POST'])
@cross_origin()
def verify_code():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        if not email or not code:
            return jsonify({'message': 'Email y código son requeridos'}), 400

        # Verificar si existe el código para este email
        stored_data = verification_codes.get(email)

        if not stored_data:
            return jsonify({'message': 'Código no encontrado. Solicita un nuevo código.'}), 400

        # Verificar si el código ha expirado
        if time.time() > stored_data['expires']:
            del verification_codes[email]
            return jsonify({'message': 'El código ha expirado. Solicita un nuevo código.'}), 400

        # Verificar si el código es correcto
        if stored_data['code'] != code:
            return jsonify({'message': 'Código de verificación incorrecto'}), 400

        # Código correcto - eliminar de almacenamiento temporal
        del verification_codes[email]

        # Aquí puedes agregar lógica adicional como:
        # - Marcar el email como verificado en tu base de datos
        # - Crear una sesión de usuario
        # - Etc.

        return jsonify({
            'message': 'Email verificado correctamente',
            'verified': True,
            'email': email
        }), 200

    except Exception as e:
        print(f"Error verificando código: {e}")
        return jsonify({'message': 'Error interno del servidor'}), 500