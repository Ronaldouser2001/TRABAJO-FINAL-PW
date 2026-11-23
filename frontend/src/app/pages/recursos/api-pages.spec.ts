import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  Router,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { Catalogo } from "./catalogo";
import { EditorRecurso } from "./editor-recurso";
import { DetalleRecurso } from "./detalle-recurso";
const recurso = {
  id: 1,
  title: "Cálculo diferencial",
  description: "Un material de prueba con ejercicios resueltos.",
  university: "UNCP",
  category: "Libro",
  file_url: null,
  created_at: "2026-11-15T00:00:00",
};
describe("Interfaz del CRUD conectado", () => {
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: params,
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap({}),
            },
          },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("distingue carga, error y vacío, y permite reintentar", async () => {
    const f = TestBed.createComponent(Catalogo);
    f.detectChanges();
    expect(f.nativeElement.textContent).toContain("Cargando recursos");
    http
      .expectOne("/api/resources/")
      .flush("Error", { status: 503, statusText: "Unavailable" });
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain("No pudimos cargar");
    f.componentInstance.cargar();
    http.expectOne("/api/resources/").flush([]);
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain("No hay recursos");
  });
  it("filtra tildes, pagina y cancela la consulta anterior", async () => {
    const f = TestBed.createComponent(Catalogo);
    const anterior = http.expectOne("/api/resources/");
    f.componentInstance.universidad.setValue("UNCP");
    f.componentInstance.cargar();
    expect(anterior.cancelled).toBe(true);
    http
      .expectOne("/api/resources/?university=UNCP")
      .flush(Array.from({ length: 12 }, (_, i) => ({ ...recurso, id: i + 1 })));
    await f.whenStable();
    expect(f.componentInstance.totalPaginas()).toBe(2);
    expect(f.componentInstance.visibles()).toHaveLength(9);
    f.componentInstance.buscar("calculo");
    expect(f.componentInstance.filtrados()).toHaveLength(12);
    f.componentInstance.buscar("biologia");
    expect(f.componentInstance.filtrados()).toHaveLength(0);
  });
  it("impide guardar datos inválidos y bloquea envíos dobles", async () => {
    const f = TestBed.createComponent(EditorRecurso);
    const c = f.componentInstance;
    const nav = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);
    c.guardar();
    http.expectNone("/api/resources/");
    c.form.setValue({
      title: recurso.title,
      description: recurso.description,
      university: "UNCP",
      category: "Libro",
      file_url: "javascript:alert(1)",
    });
    c.guardar();
    http.expectNone("/api/resources/");
    c.form.controls.file_url.setValue("");
    c.guardar();
    c.guardar();
    expect(c.guardando()).toBe(true);
    const req = http.expectOne("/api/resources/");
    req.flush(recurso, { status: 201, statusText: "Created" });
    await f.whenStable();
    expect(c.guardando()).toBe(false);
    expect(nav).toHaveBeenCalledWith(["/recursos", 1], {
      queryParams: { actualizado: "guardado" },
    });
  });
  it("conserva los campos después de un error de escritura", async () => {
    const f = TestBed.createComponent(EditorRecurso);
    f.componentInstance.form.setValue({
      title: recurso.title,
      description: recurso.description,
      university: "UNCP",
      category: "Libro",
      file_url: "",
    });
    f.componentInstance.guardar();
    http
      .expectOne("/api/resources/")
      .flush(
        { detail: [{ loc: ["body", "university"] }] },
        { status: 422, statusText: "Unprocessable Entity" },
      );
    await f.whenStable();
    expect(f.componentInstance.form.controls.title.value).toBe(recurso.title);
    expect(f.componentInstance.errorEnvio()).toContain("university");
    expect(f.componentInstance.guardando()).toBe(false);
  });
  it("carga enlaces profundos y no muestra enlaces peligrosos", async () => {
    params.next(convertToParamMap({ id: "1" }));
    const f = TestBed.createComponent(DetalleRecurso);
    http
      .expectOne("/api/resources/1")
      .flush({ ...recurso, file_url: "javascript:alert(1)" });
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain("Cálculo diferencial");
    expect(f.nativeElement.querySelector('a[target="_blank"]')).toBeNull();
    params.next(convertToParamMap({ id: "2" }));
    http
      .expectOne("/api/resources/2")
      .flush({}, { status: 404, statusText: "Not Found" });
    await f.whenStable();
    expect(f.nativeElement.textContent).toContain("ya no existe");
  });
  it("requiere confirmar antes de eliminar y conserva la vista si falla", async () => {
    params.next(convertToParamMap({ id: "1" }));
    const f = TestBed.createComponent(DetalleRecurso);
    http.expectOne("/api/resources/1").flush(recurso);
    f.componentInstance.eliminar();
    http.expectNone("/api/resources/1");
    f.componentInstance.confirmar.set(true);
    f.componentInstance.eliminar();
    http
      .expectOne("/api/resources/1")
      .flush("Error", { status: 500, statusText: "Error" });
    await f.whenStable();
    expect(f.componentInstance.estado().recurso?.id).toBe(1);
    expect(f.componentInstance.mensaje()).toContain("servidor");
    expect(f.componentInstance.eliminando()).toBe(false);
  });
});
