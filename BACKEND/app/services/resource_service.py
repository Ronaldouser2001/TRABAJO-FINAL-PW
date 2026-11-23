"""Servicio del CRUD de recursos educativos."""

from typing import Annotated, Any

from fastapi import Depends

from app.repositories.resource_repository import (
    ResourceRepository,
    resource_repository,
)
from app.schemas.resource import (
    ResourceCreate,
    ResourceResponse,
    ResourceUpdate,
)
from app.services.exceptions import ResourceNotFoundError


class ResourceService:
    """Reglas de negocio del catálogo de recursos."""

    def __init__(
        self,
        repository: ResourceRepository | None = None,
    ) -> None:
        self._repository = repository or resource_repository

    def listar(self, university: str | None = None) -> list[ResourceResponse]:
        return [
            self._to_response(row)
            for row in self._repository.list(university)
        ]

    def obtener(self, resource_id: int) -> ResourceResponse:
        row = self._repository.get(resource_id)
        if row is None:
            raise ResourceNotFoundError(resource_id)
        return self._to_response(row)

    def crear(self, datos: ResourceCreate) -> ResourceResponse:
        row = self._repository.create(**datos.model_dump())
        return self._to_response(row)

    def actualizar(
        self,
        resource_id: int,
        datos: ResourceUpdate,
    ) -> ResourceResponse:
        changes = datos.model_dump(exclude_unset=True)
        row = self._repository.update(resource_id, changes)
        if row is None:
            raise ResourceNotFoundError(resource_id)
        return self._to_response(row)

    def eliminar(self, resource_id: int) -> None:
        if not self._repository.delete(resource_id):
            raise ResourceNotFoundError(resource_id)

    @staticmethod
    def _to_response(row: dict[str, Any]) -> ResourceResponse:
        return ResourceResponse(
            id=int(row["id"]),
            title=str(row["title"]),
            description=str(row["description"]),
            university=str(row["university"]),
            category=str(row["category"]),
            file_url=row["file_url"],
            created_at=row["created_at"],
        )


resource_service = ResourceService()


def get_resource_service() -> ResourceService:
    return resource_service


ResourceServiceDep = Annotated[
    ResourceService,
    Depends(get_resource_service),
]
