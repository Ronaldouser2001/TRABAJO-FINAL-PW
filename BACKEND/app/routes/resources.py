from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.resource import Resource
from app.schemas.resource import ResourceCreate, ResourceUpdate, ResourceResponse

router = APIRouter(prefix="/resources", tags=["Recursos Educativos"])

# 1. CREAR un recurso (Create)
@router.post("/", response_model=ResourceResponse, status_code=status.HTTP_201_CREATED)
def crear_recurso(recurso: ResourceCreate, usuario_id: int, db: Session = Depends(get_db)):
    nuevo_recurso = Resource(**recurso.dict(), usuario_id=usuario_id)
    db.add(nuevo_recurso)
    db.commit()
    db.refresh(nuevo_recurso)
    return nuevo_recurso

# 2. OBTENER todos los recursos (Read List)
@router.get("/", response_model=List[ResourceResponse])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(Resource).all()

# 3. OBTENER un recurso por ID (Read One)
@router.get("/{recurso_id}", response_model=ResourceResponse)
def obtener_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Resource).filter(Resource.id == recurso_id).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso educativo no encontrado")
    return recurso

# 4. ACTUALIZAR un recurso (Update)
@router.put("/{recurso_id}", response_model=ResourceResponse)
def actualizar_recurso(recurso_id: int, datos: ResourceUpdate, db: Session = Depends(get_db)):
    recurso_query = db.query(Resource).filter(Resource.id == recurso_id)
    recurso = recurso_query.first()
    
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso educativo no encontrado")
    
    # Actualizar solo los campos enviados
    datos_actualizar = datos.dict(exclude_unset=True)
    recurso_query.update(datos_actualizar, synchronize_session=False)
    db.commit()
    return recurso_query.first()

# 5. ELIMINAR un recurso (Delete)
@router.delete("/{recurso_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso_query = db.query(Resource).filter(Resource.id == recurso_id)
    recurso = recurso_query.first()
    
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso educativo no encontrado")
    
    recurso_query.delete(synchronize_session=False)
    db.commit()
    return None