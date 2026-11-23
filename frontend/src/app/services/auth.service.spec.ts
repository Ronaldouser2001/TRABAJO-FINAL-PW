import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { AuthService, AuthUser } from "./auth.service";

const usuario: AuthUser = {
  id: 3,
  full_name: "Ana Torres",
  email: "ana@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};
const token = "token-de-prueba";
const sesion = {
  access_token: token,
  token_type: "bearer",
  user: usuario,
};

function configurar(): {
  api: AuthService;
  http: HttpTestingController;
} {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  return {
    api: TestBed.inject(AuthService),
    http: TestBed.inject(HttpTestingController),
  };
}

function jwtVencido(): string {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }),
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return `cabecera.${payload}.firma`;
}

describe("AuthService", () => {
  afterEach(() => localStorage.clear());

  it("inicia sesión y persiste el token y el usuario", async () => {
    const { api, http } = configurar();
    const peticion = firstValueFrom(
      api.login({ email: usuario.email, password: "secreta123" }),
    );
    const req = http.expectOne("/api/auth/login");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual({
      email: usuario.email,
      password: "secreta123",
    });
    req.flush(sesion);
    const resultado = await peticion;

    expect(resultado.user).toEqual(usuario);
    expect(api.isAuthenticated()).toBe(true);
    expect(api.token()).toBe(token);
    expect(api.currentUser()).toEqual(usuario);
    expect(localStorage.getItem("runared_token")).toBe(token);
    expect(JSON.parse(localStorage.getItem("runared_user")!)).toEqual(
      usuario,
    );
    http.verify();
  });

  it("no inicia sesión si la respuesta no cumple el contrato", async () => {
    const { api, http } = configurar();
    const peticion = firstValueFrom(
      api.login({ email: usuario.email, password: "secreta123" }),
    );
    const assertion = expect(peticion).rejects.toThrow();
    http.expectOne("/api/auth/login").flush({ access_token: token });
    await assertion;
    expect(api.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("runared_token")).toBeNull();
    http.verify();
  });

  it("registra la cuenta y luego inicia sesión automáticamente", async () => {
    const { api, http } = configurar();
    const peticion = firstValueFrom(
      api.register({
        full_name: usuario.full_name,
        email: usuario.email,
        password: "secreta123",
        role: usuario.role,
      }),
    );
    const registro = http.expectOne("/api/auth/registro");
    expect(registro.request.method).toBe("POST");
    expect(registro.request.body).toEqual({
      full_name: usuario.full_name,
      email: usuario.email,
      password: "secreta123",
      role: usuario.role,
    });
    registro.flush(usuario, { status: 201, statusText: "Created" });

    http.expectOne("/api/auth/login").flush(sesion);
    await expect(peticion).resolves.toEqual(sesion);
    expect(api.isAuthenticated()).toBe(true);
    http.verify();
  });

  it("cierra sesión y limpia el almacenamiento", async () => {
    const { api, http } = configurar();
    const peticion = firstValueFrom(
      api.login({ email: usuario.email, password: "secreta123" }),
    );
    http.expectOne("/api/auth/login").flush(sesion);
    await peticion;
    expect(api.isAuthenticated()).toBe(true);

    api.logout();
    expect(api.isAuthenticated()).toBe(false);
    expect(api.token()).toBeNull();
    expect(api.currentUser()).toBeNull();
    expect(localStorage.getItem("runared_token")).toBeNull();
    expect(localStorage.getItem("runared_user")).toBeNull();
    http.verify();
  });

  it("restaura una sesión guardada al construirse", () => {
    localStorage.setItem("runared_token", token);
    localStorage.setItem("runared_user", JSON.stringify(usuario));
    const { api, http } = configurar();
    expect(api.isAuthenticated()).toBe(true);
    expect(api.currentUser()?.full_name).toBe(usuario.full_name);
    http.verify();
  });

  it("descarta una sesión con token vencido", () => {
    localStorage.setItem("runared_token", jwtVencido());
    localStorage.setItem("runared_user", JSON.stringify(usuario));
    const { api, http } = configurar();
    expect(api.tokenVencido()).toBe(false);
    expect(api.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("runared_token")).toBeNull();
    http.verify();
  });
});
