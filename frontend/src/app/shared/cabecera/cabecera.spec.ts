import { provideHttpClient } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Cabecera } from "./cabecera";

const usuario = {
  id: 1,
  full_name: "Ronaldo Quispe",
  email: "ronaldo@uncp.edu.pe",
  role: "estudiante",
  created_at: "2026-11-15T10:00:00",
};

async function crearCabecera(): Promise<ComponentFixture<Cabecera>> {
  await TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient()],
    imports: [Cabecera],
  }).compileComponents();
  const fixture = TestBed.createComponent(Cabecera);
  await fixture.whenStable();
  return fixture;
}

describe("Cabecera", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("invita a iniciar sesión cuando no hay sesión", async () => {
    const f = await crearCabecera();
    const texto = f.nativeElement.textContent as string;
    expect(texto).toContain("Iniciar sesión");
    expect(texto).toContain("Registrarse");
    expect(texto).not.toContain("Publicar recurso");
  });

  it("muestra el usuario y permite cerrar sesión", async () => {
    localStorage.setItem("runared_token", "token-de-prueba");
    localStorage.setItem("runared_user", JSON.stringify(usuario));
    const f = await crearCabecera();
    expect(f.nativeElement.textContent).toContain("Ronaldo Quispe");
    expect(f.nativeElement.textContent).toContain("Publicar recurso");

    const boton = f.nativeElement.querySelector(
      "button.boton-sesion",
    ) as HTMLButtonElement;
    boton.click();
    f.detectChanges();

    expect(f.nativeElement.textContent).toContain("Iniciar sesión");
    expect(localStorage.getItem("runared_token")).toBeNull();
    expect(localStorage.getItem("runared_user")).toBeNull();
  });
});
