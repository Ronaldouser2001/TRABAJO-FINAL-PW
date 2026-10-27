from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    rol = Column(String, default="estudiante")  # roles: 'estudiante', 'donante', 'tutor'
    activo = Column(Boolean, default=True)
    creado_en = Column(DateTime, server_default=func.now())