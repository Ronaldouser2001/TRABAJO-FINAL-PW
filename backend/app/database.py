"""Conexión a SQL Server mediante pyodbc, sin ORM."""

import os
from contextlib import contextmanager
from pathlib import Path
from typing import Generator

import pyodbc
from dotenv import load_dotenv

# Carga el .env del backend sin depender del directorio de ejecución
ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_FILE)

DEFAULT_DRIVER = "ODBC Driver 17 for SQL Server"
FALLBACK_DRIVERS = (
    "ODBC Driver 17 for SQL Server",
    "ODBC Driver 18 for SQL Server",
)


def resolve_driver(configured: str | None = None) -> str:
    """Devuelve el driver configurado o un respaldo disponible en el sistema."""
    requested = (
        configured or os.getenv("DB_DRIVER", DEFAULT_DRIVER)
    ).strip()
    installed = {driver.casefold(): driver for driver in pyodbc.drivers()}

    if requested and requested.casefold() in installed:
        return installed[requested.casefold()]

    for driver in FALLBACK_DRIVERS:
        if driver.casefold() in installed:
            return installed[driver.casefold()]

    return requested or DEFAULT_DRIVER


def get_connection_string() -> str:
    """Construye la cadena ODBC con autenticación de Windows."""
    driver = resolve_driver()
    server = os.getenv("DB_SERVER", "DESKTOP-K8VT9OI").strip()
    database = os.getenv("DB_NAME", "RunaRedBD").strip()
    trusted = os.getenv("DB_TRUSTED_CONNECTION", "yes").strip()
    trust_cert = os.getenv("DB_TRUST_SERVER_CERTIFICATE", "yes").strip()

    return (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"Trusted_Connection={trusted};"
        f"TrustServerCertificate={trust_cert};"
    )


@contextmanager
def get_db_connection() -> Generator[pyodbc.Connection, None, None]:
    """Abre una conexión a SQL Server y garantiza su cierre."""
    connection = pyodbc.connect(get_connection_string())
    try:
        yield connection
    finally:
        connection.close()


def test_connection() -> bool:
    """Comprueba que la base de datos responde a una consulta simple."""
    try:
        with get_db_connection() as connection:
            cursor = connection.cursor()
            cursor.execute("SELECT 1")
            row = cursor.fetchone()
            return row is not None and int(row[0]) == 1
    except Exception:
        return False
