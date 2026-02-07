from flask import Flask, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from src.routes import registrar_rutas
from config import config
from src.database.connection import init_app
from src.routes.clientes_routes import clientes_bp
from src.routes.auth_routes import auth_bp
import os

load_dotenv()

app = Flask(__name__)
app.config.from_object(config['development'])

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}}, supports_credentials=True)
init_app(app)
registrar_rutas(app)

if __name__ == '__main__':
    app.run(debug=True, port=5000, host="localhost")
