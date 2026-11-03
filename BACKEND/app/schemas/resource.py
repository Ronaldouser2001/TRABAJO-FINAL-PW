from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ResourceBase(BaseModel):
    title: str
    description: str
    university: str  # Ej: UNCP, UPLA, UC, Roosevelt
    category: str    # Ej: Libro, Apunte, Examen, Parcial
    file_url: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    university: Optional[str] = None
    category: Optional[str] = None
    file_url: Optional[str] = None

class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True