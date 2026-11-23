import { Component, inject, signal } from "@angular/core";
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { apiError } from "../../core/api-error";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-registro",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./registro.html",
})
export class Registro {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  cargando = signal(false);
  error = signal("");
  form = this.fb.nonNullable.group(
    {
      full_name: ["", [Validators.required, Validators.maxLength(120)]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmar: ["", [Validators.required]],
      role: ["estudiante", [Validators.required]],
    },
    {
      validators: (group) =>
        group.get("password")?.value === group.get("confirmar")?.value
          ? null
          : { noCoincide: true },
    },
  );

  invalido(campo: "full_name" | "email" | "password" | "confirmar") {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  noCoincide() {
    return (
      this.form.hasError("noCoincide") &&
      (this.form.controls.password.touched ||
        this.form.controls.confirmar.touched)
    );
  }

  enviar() {
    if (this.cargando()) return;
    this.form.markAllAsTouched();
    this.error.set("");
    if (this.form.invalid) return;

    const { full_name, email, password, role } = this.form.getRawValue();
    this.cargando.set(true);
    this.auth
      .register({ full_name: full_name.trim(), email, password, role })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl("/recursos"),
        error: (e) => this.error.set(apiError(e)),
      });
  }
}
