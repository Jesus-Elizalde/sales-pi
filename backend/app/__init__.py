import os
from flask import Flask
from .config import DevConfig, ProdConfig
from .extensions import db, cors, migrate
from .routes import ALL_BLUEPRINTS


def _select_config():
    """Decide which settings class to use."""
    cfg_name = os.getenv("APP_SETTINGS", "dev").lower()
    return {
        "dev": DevConfig,
        "prod": ProdConfig,
        "production": ProdConfig,
    }.get(cfg_name, DevConfig)


def create_app(config_class=None):
    app = Flask(__name__, instance_relative_config=True)

    # choose config automatically unless caller overrides
    app.config.from_object(config_class or _select_config())

    cors.init_app(app)
    db.init_app(app)
    migrate.init_app(app, db)

    for bp in ALL_BLUEPRINTS:
        app.register_blueprint(bp)

    # quick CLI helper
    @app.cli.command("create-db")
    def _create_db():
        db.create_all()
        print("Database tables created")

    return app
