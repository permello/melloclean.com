"""Flask application factory.

Creates and configures the Flask app with CORS, blueprints, and a
health endpoint.
"""

from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.blueprints.auth import auth_bp
from app.blueprints.admin import admin_bp


def create_app():
    """Create a Flask application using Config.

    Returns:
        A configured Flask application instance.
    """
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        origins=Config.CORS_ORIGINS,
        supports_credentials=True,
        methods=["GET", "POST", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type"],
    )

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/health")
    def health():
        return jsonify({"status": "ok"})

    return app
