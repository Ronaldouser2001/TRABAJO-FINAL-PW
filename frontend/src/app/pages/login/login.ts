import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private fb = inject(FormBuilder);

  mostrarClave = signal(false);
  mensaje = signal('');

  formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email]],
    clave: ['', Validators.required]
  });

  get correo() {
    return this.formulario.controls.correo;
  }

  get clave() {
    return this.formulario.controls.clave;
  }

  ingresar(): void {
    this.mensaje.set('');
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      return;
    }

    // Aquí conectaremos el servicio de autenticación del backend.
    this.mensaje.set(
      'El inicio de sesión todavía no está disponible. Prueba más adelante.'
    );
  }
}