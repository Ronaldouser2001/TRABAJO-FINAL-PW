import { provideHttpClient } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { App } from "./app";

const usuario = {
  id: 7,
  full_name: "Ronaldo Quispe",
  email: "ronaldo@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};

async function crearApp() {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter([]), provideHttpClient()],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture;
}

describe("App", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("muestra la navegación pública cuando no hay sesión", async () => {
    const f = await crearApp();
    const texto = f.nativeElement.textContent as string;
    expect(texto).toContain("RunaRed");
    expect(texto).toContain("Iniciar sesión");
    expect(texto).toContain("Registrarse");
    expect(texto).not.toContain("Publicar recurso");
    expect(texto).not.toContain("Cerrar sesión");
    expect(texto).not.toMatch(/demo|Tutorías|Solicitudes/);
  });

  it("muestra la sesión activa y las acciones de gestión", async () => {
    localStorage.setItem("runared_token", "token-de-prueba");
    localStorage.setItem("runared_user", JSON.stringify(usuario));
    const f = await crearApp();
    const texto = f.nativeElement.textContent as string;
    expect(texto).toContain("Hola, Ronaldo Quispe");
    expect(texto).toContain("Publicar recurso");
    expect(texto).toContain("Cerrar sesión");
    expect(texto).not.toContain("Iniciar sesión");
    expect(texto).not.toContain("Registrarse");
  });
});
