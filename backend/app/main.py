from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routes import resources  # <--- Importante

# Crear las tablas en la base de datos
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RunaRed API",
    description="API de intercambio de recursos educativos para Huancayo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar las rutas del CRUD
app.include_router(resources.router)  # <--- Importante

@app.get("/")
def root():
    return {"status": "ok", "message": "Backend de RunaRed con uv activo"}