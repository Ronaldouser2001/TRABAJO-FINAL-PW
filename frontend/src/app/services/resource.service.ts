import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable, timeout } from "rxjs";
import { environment } from "../../environments/environment";
export interface ResourceCreate {
  title: string;
  description: string;
  university: string;
  category: string;
  file_url: string | null;
}
export interface ResourceResponse extends ResourceCreate {
  id: number;
  created_at: string;
}
export type ResourceUpdate = Partial<ResourceCreate>;
export function safeResourceUrl(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const url = new URL(raw.trim());
    return ["https:", "http:"].includes(url.protocol) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function resource(value: unknown): ResourceResponse {
  if (!value || typeof value !== "object")
    throw new Error("Respuesta de recurso inválida.");
  const r = value as Record<string, unknown>;
  if (
    !Number.isInteger(r["id"]) ||
    Number(r["id"]) <= 0 ||
    ["title", "description", "university", "category", "created_at"].some(
      (k) => typeof r[k] !== "string",
    ) ||
    (r["file_url"] != null && typeof r["file_url"] !== "string")
  )
    throw new Error(
      "La respuesta de la API no coincide con el contrato de recursos.",
    );
  return {
    id: Number(r["id"]),
    title: r["title"] as string,
    description: r["description"] as string,
    university: r["university"] as string,
    category: r["category"] as string,
    file_url: (r["file_url"] as string | null) ?? null,
    created_at: r["created_at"] as string,
  };
}
@Injectable({ providedIn: "root" })
export class ResourceService {
  private http = inject(HttpClient);
  private readonly url =
    environment.apiBaseUrl.replace(/\/$/, "") + "/resources";
  getResources(university?: string): Observable<ResourceResponse[]> {
    let params = new HttpParams();
    if (university?.trim())
      params = params.set("university", university.trim());
    return this.http.get<unknown>(this.url + "/", { params }).pipe(
      timeout(15000),
      map((data) => {
        if (!Array.isArray(data))
          throw new Error("Se esperaba una lista de recursos.");
        return data.map(resource);
      }),
    );
  }
  getResourceById(id: number): Observable<ResourceResponse> {
    return this.http
      .get<unknown>(this.url + "/" + id)
      .pipe(timeout(15000), map(resource));
  }
  createResource(body: ResourceCreate): Observable<ResourceResponse> {
    return this.http
      .post<unknown>(this.url + "/", body)
      .pipe(timeout(15000), map(resource));
  }
  updateResource(
    id: number,
    body: ResourceUpdate,
  ): Observable<ResourceResponse> {
    return this.http
      .put<unknown>(this.url + "/" + id, body)
      .pipe(timeout(15000), map(resource));
  }
  deleteResource(id: number): Observable<void> {
    return this.http.delete<void>(this.url + "/" + id).pipe(timeout(15000));
  }
}
