from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# Datos que envía el usuario para registrarse
class UserCreate(BaseModel):
    nombre_completo: str
    email: EmailStr
    password: str
    rol: Optional[str] = "estudiante"

# Datos que envía el usuario para iniciar sesión
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Respuesta pública del usuario (SIN mostrar la contraseña)
class UserResponse(BaseModel):
    id: int
    nombre_completo: str
    email: EmailStr
    rol: str
    activo: bool
    creado_en: datetime

    class Config:
        from_attributes = True

# Esquema para la respuesta del Token JWT
class Token(BaseModel):
    access_token: str
    token_type: str
    usuario: UserResponse