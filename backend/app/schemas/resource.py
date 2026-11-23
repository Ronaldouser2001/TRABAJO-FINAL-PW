"""Esquemas Pydantic para los recursos educativos."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResourceBase(BaseModel):
    title: str
    description: str
    university: str
    category: str
    file_url: str | None = None


class ResourceCreate(ResourceBase):
    pass


class ResourceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    university: str | None = None
    category: str | None = None
    file_url: str | None = None


class ResourceResponse(ResourceBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
