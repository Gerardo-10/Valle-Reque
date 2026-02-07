from src.routes.terreno_routes import terrenos_bp
from src.routes.clientes_routes import clientes_bp
from src.routes.auth_routes import auth_bp
from src.routes.seguridad_routes import seguridad_bp
from src.routes.proyectos_routes import proyectos_bp
from src.routes.areas_routes import area_bp
from src.routes.roles_routes import rol_bp
from src.routes.financiamiento_routes import financiamiento_bp
from src.routes.banco_routes import banco_bp
from src.routes.email_verification_routes import email_verification_bp
from src.routes.routes_venta import venta_bp
from src.routes.cuotas_routes import cuotas_bp
from src.routes.devolucion_routes import devolucion_bp
from .password_recovery_routes import password_recovery_bp


def registrar_rutas(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(clientes_bp)
    app.register_blueprint(seguridad_bp)
    app.register_blueprint(proyectos_bp)
    app.register_blueprint(area_bp)
    app.register_blueprint(rol_bp)
    app.register_blueprint(financiamiento_bp)
    app.register_blueprint(email_verification_bp)
    app.register_blueprint(password_recovery_bp)
    app.register_blueprint(venta_bp)
    app.register_blueprint(terrenos_bp)
    app.register_blueprint(banco_bp)
    app.register_blueprint(cuotas_bp)
    app.register_blueprint(devolucion_bp)
