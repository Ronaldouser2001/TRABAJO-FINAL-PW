import { Component, computed, signal } from '@angular/core';

interface Recurso {
  id: number;
  titulo: string;
  tipo: 'Libro físico' | 'Apunte digital';
  categoria: string;
  descripcion: string;
  propietario: string;
  disponible: boolean;
}

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [],
  templateUrl: './recursos.html',
  styleUrl: './recursos.css'
})
export class Recursos {
  busqueda = signal('');
  tipo = signal('Todos');
  soloDisponibles = signal(false);

  tipos = ['Todos', 'Libro físico', 'Apunte digital'];

  // Datos temporales para desarrollar y probar la interfaz.
  recursos = signal<Recurso[]>([
    {
      id: 1,
      titulo: 'Cálculo de una variable',
      tipo: 'Libro físico',
      categoria: 'Matemática',
      descripcion:
        'Libro de consulta sobre límites, derivadas e integrales.',
      propietario: 'Estudiante de ejemplo A',
      disponible: true
    },
    {
      id: 2,
      titulo: 'Apuntes de programación web',
      tipo: 'Apunte digital',
      categoria: 'Informática',
      descripcion:
        'Resumen de HTML, CSS y fundamentos de Angular.',
      propietario: 'Estudiante de ejemplo B',
      disponible: true
    },
    {
      id: 3,
      titulo: 'Física universitaria',
      tipo: 'Libro físico',
      categoria: 'Física',
      descripcion:
        'Material de consulta sobre movimiento, fuerzas y energía.',
      propietario: 'Estudiante de ejemplo C',
      disponible: false
    },
    {
      id: 4,
      titulo: 'Guía de álgebra lineal',
      tipo: 'Apunte digital',
      categoria: 'Matemática',
      descripcion:
        'Ejercicios de matrices, determinantes y sistemas de ecuaciones.',
      propietario: 'Estudiante de ejemplo D',
      disponible: true
    }
  ]);

  // Combina la búsqueda con los filtros seleccionados.
  recursosFiltrados = computed(() => {
    const texto = this.normalizar(this.busqueda().trim());

    return this.recursos().filter((recurso) => {
      const contenido = this.normalizar(
        `${recurso.titulo} ${recurso.categoria} ${recurso.descripcion}`
      );

      const coincideTexto = contenido.includes(texto);
      const coincideTipo =
        this.tipo() === 'Todos' || recurso.tipo === this.tipo();
      const coincideDisponibilidad =
        !this.soloDisponibles() || recurso.disponible;

      return coincideTexto && coincideTipo && coincideDisponibilidad;
    });
  });

  limpiarFiltros(): void {
    this.busqueda.set('');
    this.tipo.set('Todos');
    this.soloDisponibles.set(false);
  }

  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}