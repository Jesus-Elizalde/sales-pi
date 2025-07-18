from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH  = BASE_DIR / "instance" / "sales.db"


class Config:
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{DB_PATH}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False


class DevConfig(Config):
    DEBUG = True      # enables debugger + autoreload


class ProdConfig(Config):
    DEBUG = False     # safety first
    # Example of things you might override later:
    # SQLALCHEMY_DATABASE_URI = "postgresql://user:pass@host/db"