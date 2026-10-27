from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Base de datos SQLite local
SQLALCHEMY_DATABASE_URL = "sqlite:///./runared.db"

# engine se encarga de la conexión
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# SessionLocal creará las sesiones para interactuar con la BD
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base de la cual heredarán todos los modelos ORM
Base = declarative_base()

# Dependencia para obtener la sesión de BD en cada request de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()