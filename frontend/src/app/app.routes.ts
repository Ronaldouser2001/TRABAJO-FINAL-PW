import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Login } from './pages/login/login';
import { Registro } from './pages/registro/registro';
import { Recursos } from './pages/recursos/recursos';

export const routes: Routes = [
  { path: '', component: Inicio, title: 'RunaRed | Inicio' },
  { path: 'login', component: Login, title: 'RunaRed | Iniciar sesión' },
  { path: 'registro', component: Registro, title: 'RunaRed | Registro' },
  { path: 'recursos', component: Recursos, title: 'RunaRed | Recursos' },
  { path: '**', redirectTo: '' }
];