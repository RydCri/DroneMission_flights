from flask import Flask
from flask_cors import CORS

from .extensions import db, migrate
from .routes.auth import auth as auth_bp
from .routes.missions import missions as missions_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    app.config.update(
        SESSION_COOKIE_SAMESITE='None',
        SESSION_COOKIE_SECURE=True  # True for HTTPS
    )
    # Extensions
    CORS(app,
         supports_credentials=True,
         resources={
             r"/auth/*": {"origins": "http://localhost:5173"},
             r"/missions/*": {"origins": "http://localhost:5173"},
             r"/export/*": {"origins": "http://localhost:5173"},
         }
         )

    db.init_app(app)
    migrate.init_app(app, db)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(missions_bp, url_prefix='/missions')

    return app
