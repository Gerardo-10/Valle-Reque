from flask import Blueprint, request, jsonify
import smtplib
import random
import time
import os
from werkzeug.exceptions import BadRequest
from src.models.model_user import ModelUser
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask_cors import cross_origin
from src.models.model_seguridad import ModelSeguridad

# Crear blueprint para las rutas de recuperación de contraseña
password_recovery_bp = Blueprint('password_recovery', __name__)

# Almacenamiento temporal de códigos
recovery_codes = {}


@password_recovery_bp.route('/api/send-recovery-code', methods=['POST'])
@cross_origin()
def send_recovery_code():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'message': 'Email es requerido'}), 400
        
        if not ModelSeguridad.correo_existe(email):
            return jsonify({'message': 'El no esta registrado dentro la bd de datos'}), 400
        
        # Verificar dominio permitido
        allowed_domains = ['gmail.com', 'hotmail.com', 'outlook.com']
        domain = email.split('@')[1].lower() if '@' in email else ''

        if domain not in allowed_domains:
            return jsonify({'message': 'Solo se permiten emails de Gmail, Hotmail o Outlook'}), 400

        # Generar código de 9 dígitos en formato XXX-XXX-XXX
        code_numbers = str(random.randint(100000000, 999999999))
        recovery_code = f"{code_numbers[:3]}-{code_numbers[3:6]}-{code_numbers[6:]}"

        # Guardar código con expiración de 15 minutos
        recovery_codes[email] = {
            'code': recovery_code,
            'expires': time.time() + 900  # 15 minutos
        }

        # Configurar SMTP
        smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
        smtp_server.starttls()
        smtp_server.login(os.getenv('EMAIL_USERNAME'), os.getenv('EMAIL_PASSWORD'))

        # Crear mensaje
        msg = MIMEMultipart()
        msg['From'] = os.getenv('EMAIL_USERNAME')
        msg['To'] = email
        msg['Subject'] = "Código de Verificación - Valle Reque"

        # HTML del email - Diseño RESPONSIVE optimizado para móviles
        html_body = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <meta name="x-apple-disable-message-reformatting">
    <title>Código de Verificación</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset y base */
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            margin: 0 !important; 
            padding: 0 !important; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0fdf4 100%) !important;
            min-height: 100vh;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }}

        /* Contenedor principal responsive */
        .email-container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 20px 10px;
        }}

        /* Tarjeta principal */
        .main-card {{
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            border: 1px solid rgba(229, 231, 235, 0.5);
        }}

        /* Header */
        .header {{
            background: linear-gradient(135deg, #10b981 0%, #059669 25%, #047857 50%, #065f46 75%, #064e3b 100%);
            padding: 30px 20px 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }}

        .header-decoration-1 {{
            position: absolute;
            top: -50%;
            right: -20%;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: rotate(45deg);
        }}

        .header-decoration-2 {{
            position: absolute;
            bottom: -30%;
            left: -10%;
            width: 100px;
            height: 100px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
        }}

        .logo-container {{
            margin-bottom: 15px;
            position: relative;
            z-index: 2;
        }}

        .logo-box {{
            display: inline-block;
            background: white;
            padding: 12px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }}

        .logo {{
            height: 40px;
            width: auto;
            display: block;
        }}

        .header-title {{
            color: white;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            letter-spacing: -0.5px;
            position: relative;
            z-index: 2;
        }}

        .header-subtitle {{
            color: rgba(255, 255, 255, 0.9);
            margin: 5px 0 0 0;
            font-size: 14px;
            font-weight: 500;
            position: relative;
            z-index: 2;
        }}

        /* Contenido principal */
        .main-content {{
            padding: 30px 20px;
        }}

        .content-header {{
            text-align: center;
            margin-bottom: 30px;
        }}

        .badge {{
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 15px;
        }}

        .content-title {{
            color: #1f2937;
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            line-height: 1.2;
        }}

        .greeting {{
            margin-bottom: 30px;
        }}

        .greeting-hello {{
            color: #374151;
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 12px 0;
            font-weight: 500;
        }}

        .greeting-text {{
            color: #6b7280;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
        }}

        /* Código de verificación */
        .code-section {{
            text-align: center;
            margin: 40px 0;
        }}

        .code-container {{
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 2px dashed #10b981;
            border-radius: 15px;
            padding: 25px 15px;
            position: relative;
            overflow: hidden;
        }}

        .code-decoration-1 {{
            position: absolute;
            top: -15px;
            right: -15px;
            width: 60px;
            height: 60px;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 50%;
        }}

        .code-decoration-2 {{
            position: absolute;
            bottom: -20px;
            left: -20px;
            width: 80px;
            height: 80px;
            background: rgba(16, 185, 129, 0.05);
            border-radius: 50%;
        }}

        .code-content {{
            position: relative;
            z-index: 2;
        }}

        .code-label {{
            color: #6b7280;
            font-size: 12px;
            margin: 0 0 12px 0;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }}

        .code-value {{
            font-size: 28px;
            font-weight: 800;
            color: #1f2937;
            letter-spacing: 2px;
            font-family: 'Courier New', monospace;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            margin: 15px 0;
            word-break: break-all;
        }}

        .code-timer {{
            margin-top: 15px;
        }}

        .timer-badge {{
            background: #fef3cd;
            color: #92400e;
            padding: 6px 12px;
            border-radius: 25px;
            font-size: 11px;
            font-weight: 600;
            border: 1px solid #fbbf24;
        }}

        /* Secciones informativas */
        .info-section {{
            border-radius: 12px;
            padding: 20px;
            margin: 25px 0;
        }}

        .info-success {{
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
        }}

        .info-warning {{
            background: #fef3cd;
            border: 1px solid #fbbf24;
        }}

        .info-content {{
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }}

        .info-icon {{
            background: #10b981;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
            margin-top: 1px;
        }}

        .info-text {{
            flex: 1;
        }}

        .info-title {{
            margin: 0 0 6px 0;
            font-size: 14px;
            font-weight: 600;
        }}

        .info-success .info-title {{ color: #065f46; }}
        .info-warning .info-title {{ color: #92400e; }}

        .info-list {{
            margin: 0;
            padding-left: 12px;
            font-size: 12px;
            line-height: 1.4;
        }}

        .info-success .info-list {{ color: #047857; }}
        .info-warning .info-list {{ color: #a16207; }}

        .info-description {{
            margin: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #a16207;
        }}

        .warning-emoji {{
            font-size: 16px;
            margin-top: 1px;
        }}

        /* Footer */
        .footer {{
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 25px 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }}

        .footer-logo {{
            margin-bottom: 12px;
        }}

        .footer-logo-box {{
            display: inline-block;
            background: white;
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }}

        .footer-logo-img {{
            height: 20px;
            width: auto;
            display: block;
        }}

        .footer-text {{
            color: #6b7280;
            font-size: 12px;
            margin: 0;
            font-weight: 500;
        }}

        .footer-brand {{
            color: #374151;
            font-weight: 600;
        }}

        .footer-divider {{
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
        }}

        .footer-disclaimer {{
            color: #9ca3af;
            font-size: 10px;
            margin: 0;
        }}

        .copyright {{
            text-align: center;
            margin-top: 20px;
        }}

        .copyright-text {{
            color: #9ca3af;
            font-size: 10px;
            margin: 0;
        }}

        /* Media queries para móviles */
        @media only screen and (max-width: 480px) {{
            .email-container {{
                padding: 10px 5px;
            }}

            .main-card {{
                border-radius: 15px;
            }}

            .header {{
                padding: 25px 15px 35px;
            }}

            .header-decoration-1 {{
                width: 100px;
                height: 100px;
            }}

            .header-decoration-2 {{
                width: 80px;
                height: 80px;
            }}

            .logo {{
                height: 35px;
            }}

            .header-title {{
                font-size: 20px;
            }}

            .header-subtitle {{
                font-size: 12px;
            }}

            .main-content {{
                padding: 25px 15px;
            }}

            .content-title {{
                font-size: 18px;
            }}

            .badge {{
                font-size: 10px;
                padding: 6px 12px;
            }}

            .greeting-hello {{
                font-size: 14px;
            }}

            .greeting-text {{
                font-size: 13px;
            }}

            .code-container {{
                padding: 20px 10px;
                border-radius: 12px;
            }}

            .code-value {{
                font-size: 24px;
                letter-spacing: 1px;
            }}

            .code-label {{
                font-size: 11px;
            }}

            .timer-badge {{
                font-size: 10px;
                padding: 5px 10px;
            }}

            .info-section {{
                padding: 15px;
                margin: 20px 0;
            }}

            .info-title {{
                font-size: 13px;
            }}

            .info-list {{
                font-size: 11px;
            }}

            .info-description {{
                font-size: 11px;
            }}

            .footer {{
                padding: 20px 15px;
            }}

            .footer-text {{
                font-size: 11px;
            }}

            .footer-disclaimer {{
                font-size: 9px;
            }}

            .copyright-text {{
                font-size: 9px;
            }}
        }}

        /* Media queries para pantallas muy pequeñas */
        @media only screen and (max-width: 320px) {{
            .code-value {{
                font-size: 20px;
                letter-spacing: 0px;
            }}

            .header-title {{
                font-size: 18px;
            }}

            .content-title {{
                font-size: 16px;
            }}
        }}
    </style>
</head>
<body>
    <!-- Container Principal -->
    <div class="email-container">

        <!-- Tarjeta Principal -->
        <div class="main-card">

            <!-- Header con gradiente -->
            <div class="header">
                <!-- Decoraciones de fondo -->
                <div class="header-decoration-1"></div>
                <div class="header-decoration-2"></div>

                <!-- Logo -->
                <div class="logo-container">
                    <div class="logo-box">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRilZ1eTprP8Fn0H2zodjI2hpRIXsnmTr4mDg&s" alt="Valle Reque" class="logo">
                    </div>
                </div>

                <!-- Título -->
                <h1 class="header-title">Valle Reque</h1>
                <p class="header-subtitle">Sistema de Gestión Integral</p>
            </div>

            <!-- Contenido Principal -->
            <div class="main-content">

                <!-- Título del contenido -->
                <div class="content-header">
                    <div class="badge">
                        🔐 Código de Verificación
                    </div>
                    <h2 class="content-title">Recuperación de Contraseña</h2>
                </div>

                <!-- Saludo y mensaje -->
                <div class="greeting">
                    <p class="greeting-hello">¡Hola!</p>
                    <p class="greeting-text">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                        Utiliza el siguiente código para continuar con el proceso de recuperación:
                    </p>
                </div>

                <!-- Código de verificación -->
                <div class="code-section">
                    <div class="code-container">
                        <!-- Decoraciones de fondo -->
                        <div class="code-decoration-1"></div>
                        <div class="code-decoration-2"></div>

                        <!-- Código -->
                        <div class="code-content">
                            <p class="code-label">Tu código de verificación es:</p>
                            <div class="code-value">
                                {recovery_code}
                            </div>
                            <div class="code-timer">
                                <span class="timer-badge">
                                    ⏰ Expira en 15 minutos
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Instrucciones -->
                <div class="info-section info-success">
                    <div class="info-content">
                        <div class="info-icon">i</div>
                        <div class="info-text">
                            <h3 class="info-title">Instrucciones:</h3>
                            <ul class="info-list">
                                <li>Copia el código exactamente como aparece</li>
                                <li>Pégalo en el formulario de recuperación</li>
                                <li>El código es válido por 15 minutos únicamente</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Aviso de seguridad -->
                <div class="info-section info-warning">
                    <div class="info-content">
                        <div class="warning-emoji">🔒</div>
                        <div class="info-text">
                            <h3 class="info-title">Aviso de Seguridad</h3>
                            <p class="info-description">
                                Si no solicitaste este código, puedes ignorar este email. Tu cuenta permanece segura y no se realizarán cambios.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer -->
            <div class="footer">
                <div class="footer-logo">
                    <div class="footer-logo-box">
                        <img src="https://via.placeholder.com/40x25/10b981/ffffff?text=VR" alt="Valle Reque" class="footer-logo-img">
                    </div>
                </div>
                <p class="footer-text">
                    <span class="footer-brand">Valle Reque</span><br>
                    Sistema de Gestión Integral para Proyectos Inmobiliarios
                </p>
                <div class="footer-divider">
                    <p class="footer-disclaimer">
                        Este email fue enviado automáticamente. Por favor no respondas a este mensaje.
                    </p>
                </div>
            </div>

        </div>

        <!-- Copyright -->
        <div class="copyright">
            <p class="copyright-text">
                © 2024 Valle Reque. Todos los derechos reservados.
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

        print(f"✅ Código enviado a {email}: {recovery_code}")  # Para debug

        return jsonify({'message': 'Código de recuperación enviado correctamente'}), 200

    except Exception as e:
        print(f"❌ Error enviando código de recuperación: {e}")
        return jsonify({'message': 'Error interno del servidor'}), 500


@password_recovery_bp.route('/api/verify-recovery-code', methods=['POST'])
@cross_origin()
def verify_recovery_code():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('code')

        if not email or not code:
            return jsonify({'message': 'Email y código son requeridos'}), 400

        # Verificar si existe el código para este email
        stored_data = recovery_codes.get(email)

        if not stored_data:
            return jsonify({'message': 'Código no encontrado. Solicita un nuevo código.'}), 400

        # Verificar si el código ha expirado
        if time.time() > stored_data['expires']:
            del recovery_codes[email]
            return jsonify({'message': 'El código ha expirado. Solicita un nuevo código.'}), 400

        # Verificar si el código es correcto
        if stored_data['code'] != code:
            return jsonify({'message': 'Código de verificación incorrecto'}), 400

        print(f"✅ Código verificado correctamente para {email}")

        return jsonify({
            'message': 'Código verificado correctamente',
            'verified': True
        }), 200

    except Exception as e:
        print(f"❌ Error verificando código: {e}")
        return jsonify({'message': 'Error interno del servidor'}), 500


@password_recovery_bp.route('/api/reset-password', methods=['POST'])
@cross_origin()
def reset_password():
    data = request.get_json() or {}
    email        = data.get('email')
    code         = data.get('code')
    new_password = data.get('newPassword')

    # Validaciones
    if not all([email, code, new_password]):
        return jsonify({'success': False, 'message': 'Faltan datos'}), 400
    if len(new_password) < 8:
        return jsonify({'success': False, 'message': 'La contraseña debe tener al menos 8 caracteres'}), 400

    # Verificar y consumir el código
    stored = recovery_codes.get(email)
    if not stored or stored['code'] != code or time.time() > stored['expires']:
        recovery_codes.pop(email, None)
        return jsonify({'success': False, 'message': 'Código inválido o expirado'}), 400
    recovery_codes.pop(email, None)

    # Llamada a tu método de modelo
    resultado = ModelUser.reset_contraseña_por_email(email, new_password)
    status = 200 if resultado['success'] else 400
    return jsonify(resultado), status
