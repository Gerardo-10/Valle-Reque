import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'clave-secreta')

class DevelopmentConfig(Config):
    DEBUG = True
    MYSQL_HOST = '152.70.216.117'
    MYSQL_USER = 'useremote'
    MYSQL_PASSWORD = '12345@Remote'
    MYSQL_DB = 'DBValleReque'

config = {
    'development': DevelopmentConfig
}
