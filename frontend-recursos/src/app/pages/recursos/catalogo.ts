import { Component, computed, inject, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { toSignal } from "@angular/core/rxjs-interop";
import { catchError, map, of, startWith, Subject, switchMap } from "rxjs";
import {
  ResourceResponse,
  ResourceService,
} from "../../services/resource.service";
import { apiError } from "../../core/api-error";
interface Estado {
  cargando: boolean;
  error: string;
  recursos: ResourceResponse[];
}
@Component({
  selector: "app-catalogo-api",
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: "./catalogo.html",
})
export class Catalogo {
  eliminado =
    inject(ActivatedRoute).snapshot.queryParamMap.get("actualizado") ===
    "eliminado";
  private api = inject(ResourceService);
  private recargar = new Subject<void>();
  busqueda = signal("");
  categoria = signal("Todas");
  pagina = signal(1);
  universidad = new FormControl("", { nonNullable: true });
  estado = toSignal(
    this.recargar.pipe(
      startWith(undefined),
      switchMap(() =>
        this.api.getResources(this.universidad.value).pipe(
          map((recursos) => ({ cargando: false, error: "", recursos })),
          catchError((e) =>
            of({ cargando: false, error: apiError(e), recursos: [] }),
          ),
          startWith({ cargando: true, error: "", recursos: [] } as Estado),
        ),
      ),
    ),
    { initialValue: { cargando: true, error: "", recursos: [] } as Estado },
  );
  categorias = computed(() => [
    "Todas",
    ...new Set(this.estado().recursos.map((r) => r.category)),
  ]);
  filtrados = computed(() =>
    this.estado().recursos.filter(
      (r) =>
        this.normalizar(
          r.title + " " + r.description + " " + r.university,
        ).includes(this.normalizar(this.busqueda())) &&
        (this.categoria() === "Todas" || r.category === this.categoria()),
    ),
  );
  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.filtrados().length / 9)),
  );
  visibles = computed(() =>
    this.filtrados().slice((this.pagina() - 1) * 9, this.pagina() * 9),
  );
  normalizar(s: string) {
    return s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }
  cargar() {
    this.pagina.set(1);
    this.categoria.set("Todas");
    this.recargar.next();
  }
  buscar(s: string) {
    this.busqueda.set(s);
    this.pagina.set(1);
  }
  tipo(s: string) {
    this.categoria.set(s);
    this.pagina.set(1);
  }
  limpiar() {
    this.busqueda.set("");
    this.universidad.setValue("");
    this.cargar();
  }
}
