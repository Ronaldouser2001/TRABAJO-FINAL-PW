import { Component, DestroyRef, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { toSignal, takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  catchError,
  combineLatest,
  finalize,
  map,
  of,
  startWith,
  Subject,
  switchMap,
} from "rxjs";
import {
  ResourceResponse,
  ResourceService,
  safeResourceUrl,
} from "../../services/resource.service";
import { apiError } from "../../core/api-error";
interface Estado {
  cargando: boolean;
  error: string;
  recurso: ResourceResponse | null;
}
@Component({
  selector: "app-detalle-recurso-api",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./detalle-recurso.html",
})
export class DetalleRecurso {
  private destroy = inject(DestroyRef);
  private api = inject(ResourceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private refrescar = new Subject<void>();
  confirmar = signal(false);
  eliminando = signal(false);
  mensaje = signal("");
  urlSegura = safeResourceUrl;
  guardado =
    this.route.snapshot.queryParamMap.get("actualizado") === "guardado";
  estado = toSignal(
    combineLatest([
      this.route.paramMap,
      this.refrescar.pipe(startWith(undefined)),
    ]).pipe(
      switchMap(([p]) => {
        this.confirmar.set(false);
        this.mensaje.set("");
        const id = Number(p.get("id"));
        return Number.isSafeInteger(id) && id > 0
          ? this.api.getResourceById(id).pipe(
              map((recurso) => ({ cargando: false, error: "", recurso })),
              catchError((e) =>
                of({ cargando: false, error: apiError(e), recurso: null }),
              ),
              startWith({ cargando: true, error: "", recurso: null } as Estado),
            )
          : of({
              cargando: false,
              error: "La dirección del recurso no es válida.",
              recurso: null,
            });
      }),
    ),
    { initialValue: { cargando: true, error: "", recurso: null } as Estado },
  );
  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.confirmar.set(false));
  }
  reintentar() {
    this.refrescar.next();
  }
  eliminar() {
    const r = this.estado().recurso;
    if (!r || this.eliminando() || !this.confirmar()) return;
    this.eliminando.set(true);
    this.mensaje.set("");
    this.api
      .deleteResource(r.id)
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => this.eliminando.set(false)),
      )
      .subscribe({
        next: () =>
          this.router.navigate(["/recursos"], {
            queryParams: { actualizado: "eliminado" },
          }),
        error: (e) => this.mensaje.set(apiError(e)),
      });
  }
}
