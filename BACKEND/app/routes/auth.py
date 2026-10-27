from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.security.jwt import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Autenticación"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(user: UserCreate, db: Session = Depends(get_db)):
    # 1. Verificar si el correo ya existe
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya está registrado en RunaRed."
        )
    
    # 2. Hashear contraseña y guardar nuevo usuario
    hashed_pwd = hash_password(user.password)
    nuevo_usuario = User(
        nombre_completo=user.nombre_completo,
        email=user.email,
        password_hash=hashed_pwd,
        rol=user.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.post("/login", response_model=Token)
def iniciar_sesion(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # 1. Buscar usuario por email
    user = db.query(User).filter(User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas."
        )
    
    # 2. Generar Token JWT de acceso
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email, "rol": user.rol})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": user
    }