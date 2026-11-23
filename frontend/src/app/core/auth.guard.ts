import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.tokenVencido()) return true;

  auth.limpiarSesion();
  return router.createUrlTree(["/login"]);
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated() || auth.tokenVencido()) {
    if (auth.tokenVencido()) auth.limpiarSesion();
    return true;
  }

  return router.createUrlTree(["/recursos"]);
};
