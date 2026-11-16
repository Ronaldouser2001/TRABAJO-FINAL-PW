import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
@Component({
  selector: "app-no-encontrado",
  standalone: true,
  imports: [RouterLink],
  template: `<section class="rr-empty">
    <span class="rr-kicker">404 · RunaRed</span>
    <h1>No encontramos esta página</h1>
    <p>Revisa la dirección o vuelve al inicio.</p>
    <a class="rr-btn" routerLink="/">Volver al inicio</a>
  </section>`,
})
export class NoEncontrado {}
