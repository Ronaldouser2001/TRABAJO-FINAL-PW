import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, UrlTree } from "@angular/router";
import { routes } from "../app.routes";
import { AuthService, AuthUser } from "../services/auth.service";
import { authGuard, guestGuard } from "./auth.guard";

const usuario: AuthUser = {
  id: 1,
  full_name: "Ronaldo Quispe",
  email: "ronaldo@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};

function configurar() {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient()],
  });
  return {
    auth: TestBed.inject(AuthService),
    router: TestBed.inject(Router),
  };
}

function guardarSesion(token = "token-de-prueba") {
  localStorage.setItem("runared_token", token);
  localStorage.setItem("runared_user", JSON.stringify(usuario));
}

describe("Guards de autenticación", () => {
  afterEach(() => localStorage.clear());

  it("authGuard redirige a /login cuando no hay sesión", () => {
    const { router } = configurar();
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe("/login");
  });

  it("authGuard permite el acceso con una sesión activa", () => {
    guardarSesion();
    configurar();
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(resultado).toBe(true);
  });

  it("authGuard descarta una sesión con token vencido", () => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }),
    )
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
    guardarSesion(`cabecera.${payload}.firma`);
    const { router } = configurar();
    const resultado = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(resultado).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(resultado as UrlTree)).toBe("/login");
    expect(localStorage.getItem("runared_token")).toBeNull();
  });

  it("guestGuard deja entrar sin sesión y evita el login con sesión", () => {
    const { router } = configurar();
    const sinSesion = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    );
    expect(sinSesion).toBe(true);

    guardarSesion();
    configurar();
    const conSesion = TestBed.runInInjectionContext(() =>
      guestGuard({} as never, {} as never),
    );
    expect(conSesion).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(conSesion as UrlTree)).toBe("/recursos");
  });

  it("las rutas declaran authGuard y guestGuard", () => {
    expect(
      routes.find((r) => r.path === "gestion-recursos/nuevo")?.canActivate,
    ).toContain(authGuard);
    expect(
      routes.find((r) => r.path === "gestion-recursos/editar/:id")
        ?.canActivate,
    ).toContain(authGuard);
    expect(routes.find((r) => r.path === "login")?.canActivate).toContain(
      guestGuard,
    );
    expect(routes.find((r) => r.path === "registro")?.canActivate).toContain(
      guestGuard,
    );
  });
});
