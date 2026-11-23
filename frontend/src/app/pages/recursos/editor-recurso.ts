import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  ResourceService,
  safeResourceUrl,
} from "../../services/resource.service";
import { apiError } from "../../core/api-error";
const texto =
  (min: number, max: number): ValidatorFn =>
  (c) =>
    typeof c.value === "string" &&
    c.value.trim().length >= min &&
    c.value.trim().length <= max
      ? null
      : { texto: true };
const enlace: ValidatorFn = (c) =>
  !c.value?.trim() || safeResourceUrl(c.value) ? null : { url: true };
@Component({
  selector: "app-editor-recurso-api",
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: "./editor-recurso.html",
})
export class EditorRecurso {
  private api = inject(ResourceService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy = inject(DestroyRef);
  private parametroId = this.route.snapshot.paramMap.get("id");
  id = this.parametroId === null ? null : Number(this.parametroId);
  cargando = signal(false);
  guardando = signal(false);
  errorCarga = signal("");
  errorEnvio = signal("");
  guardado = false;
  form = this.fb.nonNullable.group({
    title: ["", [Validators.required, texto(4, 100)]],
    description: ["", [Validators.required, texto(20, 1500)]],
    university: ["", [Validators.required, texto(2, 120)]],
    category: ["Apunte", [Validators.required, texto(1, 80)]],
    file_url: ["", [enlace, Validators.maxLength(2048)]],
  });
  categorias = signal(["Libro", "Apunte", "Examen", "Parcial", "Otro"]);
  constructor() {
    if (
      this.parametroId !== null &&
      (!Number.isSafeInteger(this.id) || this.id! <= 0)
    ) {
      this.errorCarga.set("La dirección del recurso no es válida.");
    } else if (this.id) this.cargar();
  }
  cargar() {
    if (
      !this.id ||
      !Number.isSafeInteger(this.id) ||
      this.id <= 0 ||
      this.cargando()
    )
      return;
    this.cargando.set(true);
    this.errorCarga.set("");
    this.api
      .getResourceById(this.id)
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.form.patchValue({ ...r, file_url: r.file_url ?? "" });
          if (!this.categorias().includes(r.category))
            this.categorias.update((lista) => [...lista, r.category]);
          this.form.markAsPristine();
        },
        error: (e) => this.errorCarga.set(apiError(e)),
      });
  }
  invalido(n: string) {
    const c = this.form.get(n);
    return !!c?.touched && c.invalid;
  }
  guardar() {
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    this.form.markAllAsTouched();
    this.errorEnvio.set("");
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      title: v.title.trim(),
      description: v.description.trim(),
      university: v.university.trim(),
      category: v.category.trim(),
      file_url: v.file_url.trim() ? safeResourceUrl(v.file_url) : null,
    };
    this.guardando.set(true);
    const request = this.id
      ? this.api.updateResource(this.id, body)
      : this.api.createResource(body);
    request
      .pipe(
        takeUntilDestroyed(this.destroy),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (r) => {
          this.guardado = true;
          this.form.markAsPristine();
          this.router.navigate(["/recursos", r.id], {
            queryParams: { actualizado: "guardado" },
          });
        },
        error: (e) => this.errorEnvio.set(apiError(e)),
      });
  }
  @HostListener("window:beforeunload", ["$event"]) antesDeCerrar(
    event: BeforeUnloadEvent,
  ) {
    if (this.form.dirty && !this.guardado) {
      event.preventDefault();
      event.returnValue = "";
    }
  }
  puedeSalir() {
    return (
      this.guardado ||
      !this.form.dirty ||
      window.confirm(
        "Tienes cambios sin guardar. ¿Quieres salir y descartarlos?",
      )
    );
  }
}
