import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { App } from "./app";
describe("App", () => {
  it("muestra solo la navegación del catálogo", async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const f = TestBed.createComponent(App);
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain("RunaRed");
    expect(f.nativeElement.textContent).toContain("Publicar recurso");
    expect(f.nativeElement.textContent).not.toMatch(
      /demo|Iniciar sesión|Tutorías|Solicitudes/,
    );
  });
});
