"""Servicio de autenticación y autorización con Argon2 y JWT."""

from typing import Annotated, Any

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.repositories.user_repository import (
    UserRepository,
    user_repository,
)
from app.schemas.user import (
    Token,
    UserCreate,
    UserLogin,
    UserResponse,
)
from app.security.jwt import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.services.exceptions import (
    CredencialesInvalidasError,
    TokenInvalidoError,
    UsuarioAlreadyExistsError,
)

security_scheme = HTTPBearer(auto_error=False)


class AuthService:
    """Reglas de negocio para registro, login y usuario actual."""

    def __init__(self, repository: UserRepository | None = None) -> None:
        self._repository = repository or user_repository

    def registrar(self, datos: UserCreate) -> UserResponse:
        email = datos.email.lower().strip()
        if self._repository.exists_email(email):
            raise UsuarioAlreadyExistsError(email)

        created = self._repository.create(
            full_name=datos.full_name.strip(),
            email=email,
            password_hash=hash_password(datos.password),
            role=datos.role.strip() or "estudiante",
        )
        return self._to_response(created)

    def autenticar(self, datos: UserLogin) -> Token:
        email = datos.email.lower().strip()
        user = self._repository.get_by_email(email)
        if user is None or not verify_password(
            datos.password,
            user["password_hash"],
        ):
            raise CredencialesInvalidasError()

        access_token = create_access_token(
            data={
                "sub": str(user["id"]),
                "email": user["email"],
            }
        )
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=self._to_response(user),
        )

    def obtener_usuario_actual(self, token: str) -> UserResponse:
        try:
            payload = decode_access_token(token)
            subject = payload.get("sub")
            if subject is None:
                raise TokenInvalidoError(
                    "Token inválido: identificador ausente."
                )
            user_id = int(subject)
        except (jwt.PyJWTError, TypeError, ValueError) as exc:
            raise TokenInvalidoError(
                "Token no válido o expirado."
            ) from exc

        user = self._repository.get_by_id(user_id)
        if user is None:
            raise TokenInvalidoError(
                "El usuario asociado al token ya no existe."
            )
        return self._to_response(user)

    @staticmethod
    def _to_response(user: dict[str, Any]) -> UserResponse:
        return UserResponse(
            id=int(user["id"]),
            full_name=str(user["full_name"]),
            email=str(user["email"]),
            role=str(user["role"]),
            created_at=user["created_at"],
        )


auth_service = AuthService()


def get_auth_service() -> AuthService:
    return auth_service


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]


def get_current_user(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Depends(security_scheme),
    ],
    service: AuthServiceDep,
) -> UserResponse:
    if credentials is None or not credentials.credentials:
        raise TokenInvalidoError(
            "Cabecera de autenticación Bearer requerida."
        )
    return service.obtener_usuario_actual(credentials.credentials)


CurrentUserDep = Annotated[UserResponse, Depends(get_current_user)]
