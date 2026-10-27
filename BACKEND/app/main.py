from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models.user 
import app.models.resource  # Carga modelo de recursos
from app.routes import auth, resources

# Crear tablas en SQLite
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RunaRed API",
    description="API para la plataforma de intercambio de recursos educativos y tutorías en Huancayo",
    version="1.0.0"
)

origins = ["http://localhost:4200"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar Routers
app.include_router(auth.router)
app.include_router(resources.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "proyecto": "RunaRed API",
        "mensaje": "Servidor Backend corriendo correctamente"
    }