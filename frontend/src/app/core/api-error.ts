import { HttpErrorResponse } from "@angular/common/http";
import { TimeoutError } from "rxjs";
function detailMessage(error: HttpErrorResponse): string | null {
  const detail = error.error?.detail;
  return typeof detail === "string" && detail.trim()
    ? detail.trim().slice(0, 300)
    : null;
}
export function apiError(error: unknown): string {
  if (error instanceof TimeoutError)
    return "El servidor tardó demasiado en responder. Comprueba la conexión y vuelve a intentar.";
  if (error instanceof HttpErrorResponse) {
    if (
      error.status === 0 ||
      error.status === 502 ||
      error.status === 503 ||
      error.status === 504
    )
      return "No pudimos conectar con el servicio. Comprueba que el backend esté disponible e inténtalo de nuevo.";
    if (error.status === 404)
      return "El recurso ya no existe o no está disponible.";
    if (error.status === 401)
      return (
        detailMessage(error) ??
        "El servidor requiere autorización para realizar esta acción."
      );
    if (error.status === 403)
      return "No tienes permiso para realizar esta acción.";
    if (error.status === 409)
      return (
        detailMessage(error) ??
        "Los datos cambiaron o ya existe este registro. Actualiza la página antes de continuar."
      );
    if (error.status === 422) {
      const detail = error.error?.detail;
      if (Array.isArray(detail)) {
        const campos = detail
          .map((d: { loc?: unknown[] }) => d.loc?.slice(1).join("."))
          .filter(Boolean);
        return (
          "Revisa los campos del formulario" +
          (campos.length ? ": " + campos.join(", ") : ".")
        );
      }
      return "Los datos enviados no son válidos. Revisa el formulario.";
    }
    if (error.status >= 500)
      return "El servidor no pudo completar la operación. Vuelve a intentar más tarde.";
  }
  return "No se pudo procesar la respuesta. Actualiza la página o vuelve a intentar.";
}
