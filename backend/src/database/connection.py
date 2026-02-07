from flask_mysqldb import MySQL

mysql = MySQL()

def init_app(app):
    """
    Inicializa MySQL con la configuración de la app Flask.
    Llamar a esta función en app.py después de configurar app.config.
    """
    mysql.init_app(app)

def get_connection():
    """
    Devuelve la conexión MySQL actual desde el contexto Flask.
    """
    return mysql.connection