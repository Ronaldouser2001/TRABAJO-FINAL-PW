from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional  # <--- Agregado Optional aquí
from app.database import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse

router = APIRouter(prefix="/resources", tags=["Recursos Educativos"])

# 1. CREATE: Crear un nuevo recurso
@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def create_resource(resource: ResourceCreate, db: Session = Depends(get_db)):
    new_resource = Resource(**resource.model_dump())
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return new_resource

# 2. READ ALL: Obtener todos los recursos
@router.get("/", response_model=List[ResourceResponse])
def get_resources(university: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Resource)
    if university:
        query = query.filter(Resource.university == university)
    return query.all()

# 3. READ ONE: Obtener un solo recurso por ID
@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Recurso con ID {resource_id} no encontrado"
        )
    return resource

# 4. UPDATE: Actualizar un recurso por ID
@router.put("/{resource_id}", response_model=ResourceResponse)
def update_resource(resource_id: int, updated_data: ResourceUpdate, db: Session = Depends(get_db)):
    query = db.query(Resource).filter(Resource.id == resource_id)
    resource = query.first()
    
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Recurso con ID {resource_id} no encontrado"
        )
    
    update_dict = updated_data.model_dump(exclude_unset=True)
    query.update(update_dict, synchronize_session=False)
    db.commit()
    db.refresh(resource)
    return resource

# 5. DELETE: Eliminar un recurso por ID
@router.delete("/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Recurso con ID {resource_id} no encontrado"
        )
    
    db.delete(resource)
    db.commit()
    return None