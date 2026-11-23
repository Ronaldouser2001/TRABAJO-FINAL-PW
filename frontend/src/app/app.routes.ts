import { Routes } from "@angular/router";
import { authGuard, guestGuard } from "./core/auth.guard";
import { Inicio } from "./pages/inicio/inicio";
import { Login } from "./pages/auth/login";
import { Registro } from "./pages/auth/registro";
import { Catalogo } from "./pages/recursos/catalogo";
import { DetalleRecurso } from "./pages/recursos/detalle-recurso";
import { EditorRecurso } from "./pages/recursos/editor-recurso";
import { NoEncontrado } from "./pages/no-encontrado";

export const routes: Routes = [
  { path: "", component: Inicio, title: "RunaRed | Inicio" },
  { path: "recursos", component: Catalogo, title: "RunaRed | Recursos" },
  {
    path: "login",
    component: Login,
    canActivate: [guestGuard],
    title: "RunaRed | Iniciar sesión",
  },
  {
    path: "registro",
    component: Registro,
    canActivate: [guestGuard],
    title: "RunaRed | Crear cuenta",
  },
  {
    path: "gestion-recursos/nuevo",
    component: EditorRecurso,
    canActivate: [authGuard],
    canDeactivate: [(c: EditorRecurso) => c.puedeSalir()],
    title: "RunaRed | Publicar recurso",
  },
  {
    path: "gestion-recursos/editar/:id",
    component: EditorRecurso,
    canActivate: [authGuard],
    canDeactivate: [(c: EditorRecurso) => c.puedeSalir()],
    title: "RunaRed | Editar recurso",
  },
  {
    path: "recursos/:id",
    component: DetalleRecurso,
    title: "RunaRed | Detalle",
  },
  {
    path: "**",
    component: NoEncontrado,
    title: "RunaRed | Página no encontrada",
  },
];
