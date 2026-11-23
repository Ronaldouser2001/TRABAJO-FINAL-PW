"""Repositorio de usuarios sobre SQL Server con pyodbc."""

from typing import Any

from app.database import get_db_connection


def _user_from_row(row: Any, include_password: bool = False) -> dict[str, Any]:
    user = {
        "id": int(row.id),
        "full_name": str(row.full_name).strip(),
        "email": str(row.email).strip(),
        "role": str(row.role).strip(),
        "created_at": row.created_at,
    }
    if include_password:
        user["password_hash"] = str(row.password_hash).strip()
    return user


class UserRepository:
    """Acceso parametrizado a la tabla users."""

    def get_by_email(self, email: str) -> dict[str, Any] | None:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, full_name, email, password_hash, role, created_at
                FROM users
                WHERE LOWER(email) = LOWER(?)
                """,
                (email.strip(),),
            )
            row = cursor.fetchone()
            return _user_from_row(row, include_password=True) if row else None

    def get_by_id(self, usuario_id: int) -> dict[str, Any] | None:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, full_name, email, password_hash, role, created_at
                FROM users
                WHERE id = ?
                """,
                (usuario_id,),
            )
            row = cursor.fetchone()
            return _user_from_row(row, include_password=True) if row else None

    def exists_email(self, email: str) -> bool:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT 1 FROM users WHERE LOWER(email) = LOWER(?)",
                (email.strip(),),
            )
            return cursor.fetchone() is not None

    def create(
        self,
        full_name: str,
        email: str,
        password_hash: str,
        role: str,
    ) -> dict[str, Any]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO users (full_name, email, password_hash, role)
                OUTPUT INSERTED.id, INSERTED.full_name, INSERTED.email,
                       INSERTED.role, INSERTED.created_at
                VALUES (?, ?, ?, ?)
                """,
                (
                    full_name.strip(),
                    email.strip().lower(),
                    password_hash,
                    role.strip() or "estudiante",
                ),
            )
            row = cursor.fetchone()
            conn.commit()
            if row is None:
                raise RuntimeError("SQL Server no devolvió el usuario insertado.")
            return _user_from_row(row)


user_repository = UserRepository()
