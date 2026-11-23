import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AuthUser } from "../../services/auth.service";
import { Login } from "./login";
import { Registro } from "./registro";

const usuario: AuthUser = {
  id: 9,
  full_name: "María Flores",
  email: "maria@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};
const sesion = {
  access_token: "token-de-prueba",
  token_type: "bearer",
  user: usuario,
};

describe("Páginas de autenticación", () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  describe("Login", () => {
    let fixture: ComponentFixture<Login>;
    let navegar: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      fixture = TestBed.createComponent(Login);
      navegar = vi
        .spyOn(TestBed.inject(Router), "navigateByUrl")
        .mockResolvedValue(true);
    });

    it("no envía el formulario si faltan datos", () => {
      fixture.componentInstance.enviar();
      http.expectNone("/api/auth/login");
      expect(fixture.componentInstance.form.invalid).toBe(true);
      expect(fixture.componentInstance.cargando()).toBe(false);
    });

    it("bloquea el doble envío y navega al iniciar sesión", async () => {
      const c = fixture.componentInstance;
      c.form.setValue({ email: usuario.email, password: "secreta123" });
      c.enviar();
      c.enviar();
      expect(c.cargando()).toBe(true);

      const req = http.expectOne("/api/auth/login");
      expect(req.request.body).toEqual({
        email: usuario.email,
        password: "secreta123",
      });
      req.flush(sesion);
      await fixture.whenStable();

      expect(c.cargando()).toBe(false);
      expect(navegar).toHaveBeenCalledWith("/recursos");
    });

    it("muestra el mensaje del backend ante credenciales inválidas", async () => {
      const c = fixture.componentInstance;
      c.form.setValue({ email: usuario.email, password: "incorrecta" });
      c.enviar();
      http.expectOne("/api/auth/login").flush(
        { detail: "Correo o contraseña incorrectos" },
        { status: 401, statusText: "Unauthorized" },
      );
      await fixture.whenStable();

      expect(c.error()).toContain("Correo o contraseña incorrectos");
      expect(c.cargando()).toBe(false);
      expect(navegar).not.toHaveBeenCalled();
    });
  });

  describe("Registro", () => {
    let fixture: ComponentFixture<Registro>;
    let navegar: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      fixture = TestBed.createComponent(Registro);
      navegar = vi
        .spyOn(TestBed.inject(Router), "navigateByUrl")
        .mockResolvedValue(true);
    });

    it("detecta contraseñas distintas sin llamar a la API", () => {
      const c = fixture.componentInstance;
      c.form.setValue({
        full_name: usuario.full_name,
        email: usuario.email,
        password: "secreta123",
        confirmar: "otra-clave",
        role: "estudiante",
      });
      c.enviar();
      http.expectNone("/api/auth/registro");
      expect(c.noCoincide()).toBe(true);
    });

    it("registra la cuenta, inicia sesión y navega al catálogo", async () => {
      const c = fixture.componentInstance;
      c.form.setValue({
        full_name: usuario.full_name,
        email: usuario.email,
        password: "secreta123",
        confirmar: "secreta123",
        role: "estudiante",
      });
      c.enviar();
      const registro = http.expectOne("/api/auth/registro");
      expect(registro.request.body).toEqual({
        full_name: usuario.full_name,
        email: usuario.email,
        password: "secreta123",
        role: "estudiante",
      });
      registro.flush(usuario, { status: 201, statusText: "Created" });
      http.expectOne("/api/auth/login").flush(sesion);
      await fixture.whenStable();

      expect(navegar).toHaveBeenCalledWith("/recursos");
      expect(c.cargando()).toBe(false);
    });
  });
});
