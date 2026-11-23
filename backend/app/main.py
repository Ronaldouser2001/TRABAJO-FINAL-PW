"""Aplicación FastAPI de RunaRed."""

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.auth import router as auth_router
from app.routes.resources import router as resources_router
from app.services.exceptions import (
    CredencialesInvalidasError,
    ResourceNotFoundError,
    TokenInvalidoError,
    UsuarioAlreadyExistsError,
)

app = FastAPI(
    title="RunaRed API",
    description=(
        "API de intercambio de recursos educativos para Huancayo, "
        "con FastAPI, SQL Server, pyodbc y argon2-cffi."
    ),
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(resources_router)


@app.exception_handler(UsuarioAlreadyExistsError)
async def usuario_ya_existe_handler(
    _request: Request,
    exc: UsuarioAlreadyExistsError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": str(exc)},
    )


@app.exception_handler(CredencialesInvalidasError)
async def credenciales_invalidas_handler(
    _request: Request,
    exc: CredencialesInvalidasError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        headers={"WWW-Authenticate": "Bearer"},
        content={"detail": str(exc)},
    )


@app.exception_handler(TokenInvalidoError)
async def token_invalido_handler(
    _request: Request,
    exc: TokenInvalidoError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        headers={"WWW-Authenticate": "Bearer"},
        content={"detail": str(exc)},
    )


@app.exception_handler(ResourceNotFoundError)
async def resource_not_found_handler(
    _request: Request,
    exc: ResourceNotFoundError,
) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": str(exc)},
    )


@app.get("/")
def root() -> dict[str, str]:
    return {
        "status": "ok",
        "message": "Backend de RunaRed activo",
    }
