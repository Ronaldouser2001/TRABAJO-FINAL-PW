"""Rutas HTTP del CRUD de recursos educativos."""

from fastapi import APIRouter, status

from app.schemas.resource import (
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)
from app.services.resource_service import ResourceServiceDep

router = APIRouter(prefix="/resources", tags=["Recursos Educativos"])


@router.get(
    "/",
    response_model=list[ResourceResponse],
    status_code=status.HTTP_200_OK,
)
def listar_recursos(
    service: ResourceServiceDep,
    university: str | None = None,
) -> list[ResourceResponse]:
    return service.listar(university)


@router.post(
    "/",
    response_model=ResourceResponse,
    status_code=status.HTTP_201_CREATED,
)
def crear_recurso(
    datos: ResourceCreate,
    service: ResourceServiceDep,
) -> ResourceResponse:
    return service.crear(datos)


@router.get(
    "/{resource_id}",
    response_model=ResourceResponse,
    status_code=status.HTTP_200_OK,
)
def obtener_recurso(
    resource_id: int,
    service: ResourceServiceDep,
) -> ResourceResponse:
    return service.obtener(resource_id)


@router.put(
    "/{resource_id}",
    response_model=ResourceResponse,
    status_code=status.HTTP_200_OK,
)
def actualizar_recurso(
    resource_id: int,
    datos: ResourceUpdate,
    service: ResourceServiceDep,
) -> ResourceResponse:
    return service.actualizar(resource_id, datos)


@router.delete(
    "/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def eliminar_recurso(
    resource_id: int,
    service: ResourceServiceDep,
) -> None:
    service.eliminar(resource_id)
