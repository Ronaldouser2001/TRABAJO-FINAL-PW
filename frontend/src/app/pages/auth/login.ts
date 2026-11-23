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
  selector: "app-login",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./login.html",
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  cargando = signal(false);
  error = signal("");
  form = this.fb.nonNullable.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required]],
  });

  invalido(campo: "email" | "password") {
    const control = this.form.controls[campo];
    return control.touched && control.invalid;
  }

  enviar() {
    if (this.cargando()) return;
    this.form.markAllAsTouched();
    this.error.set("");
    if (this.form.invalid) return;

    this.cargando.set(true);
    this.auth
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl("/recursos"),
        error: (e) => this.error.set(apiError(e)),
      });
  }
}
