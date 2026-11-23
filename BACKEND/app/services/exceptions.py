"""Excepciones de dominio del backend."""


class UsuarioAlreadyExistsError(Exception):
    """El correo electrónico ya está registrado."""

    def __init__(self, email: str) -> None:
        self.email = email
        super().__init__(
            f"El correo electrónico '{email}' ya está registrado."
        )


class CredencialesInvalidasError(Exception):
    """El correo o la contraseña no son válidos."""

    def __init__(
        self,
        mensaje: str = "Correo o contraseña incorrectos.",
    ) -> None:
        super().__init__(mensaje)


class TokenInvalidoError(Exception):
    """El token de acceso está ausente, es inválido o expiró."""

    def __init__(
        self,
        mensaje: str = "Token no válido o expirado.",
    ) -> None:
        super().__init__(mensaje)


class ResourceNotFoundError(Exception):
    """No existe un recurso educativo con el identificador solicitado."""

    def __init__(self, resource_id: int) -> None:
        self.resource_id = resource_id
        super().__init__(
            f"Recurso con ID {resource_id} no encontrado."
        )
