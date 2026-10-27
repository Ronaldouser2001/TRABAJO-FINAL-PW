from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String, nullable=False, index=True)
    descripcion = Column(Text, nullable=False)
    categoria = Column(String, nullable=False)  # Ej: 'Libro', 'Guía Pre', 'Apunte'
    materia = Column(String, nullable=False)    # Ej: 'Matemática', 'Física', 'Lenguaje'
    formato = Column(String, default="digital") # 'digital' (PDF/Link) o 'fisico'
    url_recurso = Column(String, nullable=True) # Enlace al recurso en nube o PDF
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    creado_en = Column(DateTime, server_default=func.now())

    # Relación con la tabla User
    propietario = relationship("User")