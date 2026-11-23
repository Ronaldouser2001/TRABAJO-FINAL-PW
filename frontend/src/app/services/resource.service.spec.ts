import { TestBed } from "@angular/core/testing";
import { provideHttpClient, HttpErrorResponse } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import {
  ResourceService,
  ResourceResponse,
  safeResourceUrl,
} from "./resource.service";
import { apiError } from "../core/api-error";
const recurso: ResourceResponse = {
  id: 10,
  title: "Cálculo diferencial",
  description: "Material de estudio con ejercicios resueltos.",
  university: "UNCP",
  category: "Libro",
  file_url: null,
  created_at: "2026-11-15T10:00:00",
};
describe("Contrato HTTP de recursos FastAPI", () => {
  let api: ResourceService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(ResourceService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it("lista usando la barra final y codifica el filtro de universidad", async () => {
    const p = firstValueFrom(api.getResources("UC & UNCP"));
    const r = http.expectOne("/api/resources/?university=UC%20%26%20UNCP");
    expect(r.request.method).toBe("GET");
    r.flush([recurso]);
    expect(await p).toEqual([recurso]);
  });
  it("consulta un ID sin barra final", async () => {
    const p = firstValueFrom(api.getResourceById(10));
    http.expectOne("/api/resources/10").flush(recurso);
    expect((await p).title).toBe(recurso.title);
  });
  it("crea con los campos exactos del contrato, sin inventar propietario", async () => {
    const body = {
      title: recurso.title,
      description: recurso.description,
      university: "UNCP",
      category: "Libro",
      file_url: null,
    };
    const p = firstValueFrom(api.createResource(body));
    const r = http.expectOne("/api/resources/");
    expect(r.request.method).toBe("POST");
    expect(r.request.body).toEqual(body);
    expect(r.request.body.propietario).toBeUndefined();
    r.flush(recurso, { status: 201, statusText: "Created" });
    expect((await p).id).toBe(10);
  });
  it("actualiza por PUT y permite vaciar el enlace mediante null", async () => {
    const p = firstValueFrom(
      api.updateResource(10, { file_url: null, title: "Nuevo título" }),
    );
    const r = http.expectOne("/api/resources/10");
    expect(r.request.method).toBe("PUT");
    expect(r.request.body).toEqual({ file_url: null, title: "Nuevo título" });
    r.flush({ ...recurso, title: "Nuevo título" });
    expect((await p).title).toBe("Nuevo título");
  });
  it("elimina y acepta un 204 sin contenido", async () => {
    const p = firstValueFrom(api.deleteResource(10));
    const r = http.expectOne("/api/resources/10");
    expect(r.request.method).toBe("DELETE");
    r.flush(null, { status: 204, statusText: "No Content" });
    expect(await p).toBeNull();
  });
  it("rechaza respuestas que no cumplen el contrato", async () => {
    const p = firstValueFrom(api.getResources());
    const assertion = expect(p).rejects.toThrow();
    http.expectOne("/api/resources/").flush([{ id: 1, title: "Incompleto" }]);
    await assertion;
  });
  it("no reemplaza errores de la API con datos ficticios", async () => {
    const p = firstValueFrom(api.getResources());
    const assertion = expect(p).rejects.toBeInstanceOf(HttpErrorResponse);
    http
      .expectOne("/api/resources/")
      .flush("Error", { status: 500, statusText: "Server Error" });
    await assertion;
  });
  it("no reintenta automáticamente escrituras fallidas", async () => {
    const p = firstValueFrom(api.deleteResource(10));
    const assertion = expect(p).rejects.toBeInstanceOf(HttpErrorResponse);
    http.expectOne("/api/resources/10").error(new ProgressEvent("error"));
    await assertion;
    http.expectNone("/api/resources/10");
  });
});
describe("Enlaces y errores", () => {
  it("permite únicamente http(s) sin credenciales", () => {
    expect(safeResourceUrl("javascript:alert(1)")).toBeNull();
    expect(safeResourceUrl("data:text/html,x")).toBeNull();
    expect(safeResourceUrl("https://usuario:clave@ejemplo.com")).toBeNull();
    expect(safeResourceUrl("/relativa")).toBeNull();
    expect(safeResourceUrl("https://example.com/apuntes.pdf")).toBe(
      "https://example.com/apuntes.pdf",
    );
  });
  it("presenta errores útiles sin mostrar trazas internas", () => {
    expect(
      apiError(
        new HttpErrorResponse({ status: 500, error: "secreto interno" }),
      ),
    ).not.toContain("secreto");
    expect(apiError(new HttpErrorResponse({ status: 404 }))).toContain(
      "ya no existe",
    );
    expect(
      apiError(
        new HttpErrorResponse({
          status: 422,
          error: { detail: [{ loc: ["body", "university"] }] },
        }),
      ),
    ).toContain("university");
  });
});
