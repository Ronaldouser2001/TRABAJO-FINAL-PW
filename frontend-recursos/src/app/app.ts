import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Cabecera } from "./shared/cabecera/cabecera";
import { Pie } from "./shared/pie/pie";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, Cabecera, Pie],
  templateUrl: "./app.html",
  styleUrl: "./app.css",
})
export class App {}
