import { Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-cabecera",
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: "./cabecera.html",
  styleUrl: "./cabecera.css",
})
export class Cabecera {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  cerrarSesion() {
    this.auth.logout();
    void this.router.navigate(["/"]);
  }
}
