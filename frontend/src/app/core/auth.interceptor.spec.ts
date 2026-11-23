import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { firstValueFrom } from "rxjs";
import { AuthService, AuthUser } from "../services/auth.service";
import { authInterceptor } from "./auth.interceptor";

const usuario: AuthUser = {
  id: 1,
  full_name: "Ronaldo Quispe",
  email: "ronaldo@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};
const token = "token-interceptor";
const sesion = {
  access_token: token,
  token_type: "bearer",
  user: usuario,
};

describe("authInterceptor", () => {
  let http: HttpTestingController;
  let auth: AuthService;
  let cliente: HttpClient;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    cliente = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  async function iniciarSesion() {
    const peticion = firstValueFrom(
      auth.login({ email: usuario.email, password: "secreta123" }),
    );
    const login = http.expectOne("/api/auth/login");
    expect(login.request.headers.has("Authorization")).toBe(false);
    login.flush(sesion);
    await peticion;
  }

  it("no adjunta cabecera cuando no hay sesión", async () => {
    const peticion = firstValueFrom(cliente.get("/api/resources/"));
    const req = http.expectOne("/api/resources/");
    expect(req.request.headers.has("Authorization")).toBe(false);
    req.flush([]);
    await peticion;
  });

  it("adjunta el token Bearer a las peticiones protegidas", async () => {
    await iniciarSesion();
    const peticion = firstValueFrom(cliente.get("/api/resources/"));
    const req = http.expectOne("/api/resources/");
    expect(req.request.headers.get("Authorization")).toBe(
      `Bearer ${token}`,
    );
    req.flush([]);
    await peticion;
  });

  it("no adjunta el token a las rutas de autenticación", async () => {
    await iniciarSesion();
    const peticion = firstValueFrom(
      auth.login({ email: usuario.email, password: "otra-clave" }),
    );
    const req = http.expectOne("/api/auth/login");
    expect(req.request.headers.has("Authorization")).toBe(false);
    req.flush(
      { detail: "Correo o contraseña incorrectos" },
      { status: 401, statusText: "Unauthorized" },
    );
    await expect(peticion).rejects.toBeTruthy();
    expect(auth.isAuthenticated()).toBe(true);
  });

  it("limpia la sesión cuando una petición protegida responde 401", async () => {
    await iniciarSesion();
    const peticion = firstValueFrom(cliente.get("/api/resources/"));
    http
      .expectOne("/api/resources/")
      .flush("No autorizado", { status: 401, statusText: "Unauthorized" });
    await expect(peticion).rejects.toBeTruthy();

    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.token()).toBeNull();
    expect(localStorage.getItem("runared_token")).toBeNull();
  });
});
