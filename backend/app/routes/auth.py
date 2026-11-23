"""Rutas HTTP de autenticación."""

from fastapi import APIRouter, status

from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.services.auth_service import (
    AuthServiceDep,
    CurrentUserDep,
)

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/registro",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_usuario(
    datos: UserCreate,
    service: AuthServiceDep,
) -> UserResponse:
    return service.registrar(datos)


@router.post(
    "/login",
    response_model=Token,
    status_code=status.HTTP_200_OK,
)
def iniciar_sesion(datos: UserLogin, service: AuthServiceDep) -> Token:
    return service.autenticar(datos)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
)
def obtener_perfil(current_user: CurrentUserDep) -> UserResponse:
    return current_user
