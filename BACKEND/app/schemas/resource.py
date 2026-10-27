from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

# Esquema para crear un recurso
class ResourceCreate(BaseModel):
    titulo: str
    descripcion: str
    categoria: str
    materia: str
    formato: Optional[str] = "digital"
    url_recurso: Optional[str] = None

# Esquema para actualizar un recurso
class ResourceUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    materia: Optional[str] = None
    formato: Optional[str] = None
    url_recurso: Optional[str] = None

# Respuesta pública del recurso
class ResourceResponse(BaseModel):
    id: int
    titulo: str
    descripcion: str
    categoria: str
    materia: str
    formato: str
    url_recurso: Optional[str]
    usuario_id: int
    creado_en: datetime
    propietario: UserResponse

    class Config:
        from_attributes = True