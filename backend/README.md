# RunaRed — Backend

API REST de intercambio de recursos educativos para Huancayo, construida con
**FastAPI**, **pyodbc** (SQL Server, sin ORM), **argon2-cffi** para contraseñas y
**PyJWT** para tokens.

## Requisitos

- Python 3.11+
- SQL Server con la base de datos `RunaRedBD`
- ODBC Driver 17 for SQL Server (o 18)
- [uv](https://docs.astral.sh/uv/)

## Configuración

1. Copia el archivo de ejemplo y ajusta los valores:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Variables disponibles en `.env`:

   | Variable | Descripción |
   | --- | --- |
   | `DB_DRIVER` | Driver ODBC; si no está instalado se usa automáticamente el 17 |
   | `DB_SERVER` | Instancia de SQL Server (`DESKTOP-K8VT9OI`) |
   | `DB_NAME` | Nombre de la base de datos (`RunaRedBD`) |
   | `DB_TRUSTED_CONNECTION` | Autenticación de Windows (`yes`) |
   | `DB_TRUST_SERVER_CERTIFICATE` | Confía en el certificado del servidor (`yes`) |
   | `JWT_SECRET_KEY` | Clave de firma del token (mínimo 32 bytes) |
   | `JWT_ALGORITHM` | Algoritmo de firma (`HS256`) |
   | `ACCESS_TOKEN_EXPIRE_MINUTES` | Vigencia del token en minutos (`1440`) |

## Instalación y ejecución

```powershell
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

Documentación interactiva: <http://127.0.0.1:8000/docs>

## Estructura

```
app/
├── database.py           # Conexión ODBC a SQL Server (get_db_connection)
├── main.py               # FastAPI, CORS y manejadores de excepciones
├── repositories/         # Acceso a datos con SQL parametrizado
├── schemas/              # Modelos Pydantic de entrada/salida
├── security/jwt.py       # Argon2id + JWT
├── services/             # Reglas de negocio y excepciones de dominio
└── routes/               # Endpoints HTTP
```

## Endpoints

| Método | Ruta | Estado | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/registro` | 201 | Registrar usuario |
| POST | `/auth/login` | 200 | Iniciar sesión y obtener JWT |
| GET | `/auth/me` | 200 | Perfil del usuario autenticado |
| GET | `/resources/` | 200 | Listar recursos (`?university=`) |
| POST | `/resources/` | 201 | Crear recurso |
| GET | `/resources/{id}` | 200 | Obtener recurso |
| PUT | `/resources/{id}` | 200 | Actualizar recurso |
| DELETE | `/resources/{id}` | 204 | Eliminar recurso |

## Tablas esperadas

- `dbo.users(id, full_name, email, password_hash, role, created_at)`
- `dbo.resources(id, title, description, university, category, file_url, created_at)`

Ambas tablas usan `id` con `IDENTITY` y `created_at` con `sysutcdatetime()`.
