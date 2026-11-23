"""Repositorio de recursos educativos sobre SQL Server con pyodbc."""

from typing import Any

from app.database import get_db_connection

UPDATABLE_FIELDS = (
    "title",
    "description",
    "university",
    "category",
    "file_url",
)


def _row_to_dict(cursor: Any, row: Any) -> dict[str, Any]:
    columns = [
        str(column[0]).lower() for column in (cursor.description or [])
    ]
    return dict(zip(columns, row))


class ResourceRepository:
    """Acceso parametrizado a la tabla resources."""

    def list(self, university: str | None = None) -> list[dict[str, Any]]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if university and university.strip():
                cursor.execute(
                    """
                    SELECT id, title, description, university, category,
                           file_url, created_at
                    FROM resources
                    WHERE university = ?
                    ORDER BY created_at DESC, id DESC
                    """,
                    (university.strip(),),
                )
            else:
                cursor.execute(
                    """
                    SELECT id, title, description, university, category,
                           file_url, created_at
                    FROM resources
                    ORDER BY created_at DESC, id DESC
                    """
                )
            return [_row_to_dict(cursor, row) for row in cursor.fetchall()]

    def get(self, resource_id: int) -> dict[str, Any] | None:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, title, description, university, category,
                       file_url, created_at
                FROM resources
                WHERE id = ?
                """,
                (resource_id,),
            )
            row = cursor.fetchone()
            return _row_to_dict(cursor, row) if row else None

    def create(
        self,
        title: str,
        description: str,
        university: str,
        category: str,
        file_url: str | None = None,
    ) -> dict[str, Any]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO resources
                    (title, description, university, category, file_url)
                OUTPUT INSERTED.*
                VALUES (?, ?, ?, ?, ?)
                """,
                (title, description, university, category, file_url),
            )
            row = cursor.fetchone()
            conn.commit()
            if row is None:
                raise RuntimeError("SQL Server no devolvió el recurso insertado.")
            return _row_to_dict(cursor, row)

    def update(
        self,
        resource_id: int,
        fields: dict[str, Any],
    ) -> dict[str, Any] | None:
        valid_fields = [
            field for field in UPDATABLE_FIELDS if field in fields
        ]
        if not valid_fields:
            return self.get(resource_id)

        assignments = ", ".join(f"{field} = ?" for field in valid_fields)
        values = [fields[field] for field in valid_fields]
        values.append(resource_id)

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                f"""
                UPDATE resources
                SET {assignments}
                OUTPUT INSERTED.*
                WHERE id = ?
                """,
                values,
            )
            row = cursor.fetchone()
            conn.commit()
            return _row_to_dict(cursor, row) if row else None

    def delete(self, resource_id: int) -> bool:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM resources WHERE id = ?",
                (resource_id,),
            )
            deleted = cursor.rowcount > 0
            conn.commit()
            return deleted


resource_repository = ResourceRepository()
