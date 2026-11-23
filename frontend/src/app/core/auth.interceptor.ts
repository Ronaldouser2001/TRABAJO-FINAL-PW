import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { AuthService } from "../services/auth.service";

function esRutaDeAutenticacion(url: string): boolean {
  return /\/auth\/(login|registro)(?:[?#]|$)/.test(url);
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const token = auth.token();
  const esAuth = esRutaDeAutenticacion(request.url);
  const peticion =
    token && !esAuth
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      // Un 401 en una ruta protegida invalida la sesión (token vencido o revocado).
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !esAuth &&
        token
      ) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
