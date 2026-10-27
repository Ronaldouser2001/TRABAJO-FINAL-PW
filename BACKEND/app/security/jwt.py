from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configuración de seguridad JWT
SECRET_KEY = "clave_secreta_super_segura_runared_huancayo"  # Cámbiala en producción
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Duración de 24 horas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashing de contraseñas
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# Generación de Token JWT
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt