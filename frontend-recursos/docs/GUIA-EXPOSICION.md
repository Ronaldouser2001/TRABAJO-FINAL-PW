# Guía breve para explicar RunaRed

## Alcance

RunaRed permite compartir y consultar recursos educativos de Huancayo. Esta entrega se concentra en el CRUD de recursos que implementa el backend de Jhon. No incluye cuentas, tutorías ni solicitudes.

CRUD significa crear, leer, actualizar y eliminar.

## Explica estos seis puntos en orden

| Archivo o carpeta | Qué explicar |
| --- | --- |
| `src/app/app.routes.ts` | Decide qué pantalla abrir según la dirección. |
| `src/app/shared/` | Cabecera y pie que se reutilizan en las pantallas. |
| `src/app/pages/recursos/catalogo.ts` y `.html` | Cargan y muestran los recursos; permiten buscar y filtrar. |
| `src/app/pages/recursos/editor-recurso.ts` y `.html` | Un mismo formulario crea o edita. Valida los campos antes de enviar. |
| `src/app/pages/recursos/detalle-recurso.ts` y `.html` | Muestran el material y permiten editar o confirmar su eliminación. |
| `src/app/services/resource.service.ts` | Contiene las cinco operaciones HTTP que llaman al FastAPI. |

`src/app/pages/inicio/` presenta el proyecto. `src/styles.css` define estilos compartidos y adaptación a pantallas pequeñas. `core/api-error.ts` transforma errores del servidor en mensajes para el usuario. `environments/environment.ts` guarda la dirección base de la API.

## Un ejemplo para explicar el flujo

Cuando pulso Guardar recurso, Angular revisa el formulario. Si está incompleto, muestra los campos que debo corregir. Si es válido, el componente llama al servicio. El servicio envía un POST a FastAPI con título, descripción, universidad, categoría y enlace. FastAPI guarda el recurso y devuelve su identificador. Con ese identificador Angular abre la pantalla de detalle. Si ocurre un error, se muestra un mensaje y se conservan los campos.

Para editar se utiliza el mismo formulario, pero primero se carga el recurso y al guardar se envía PUT. Para eliminar se solicita confirmación y luego se envía DELETE.

## Conceptos que conviene entender

- Componente: controla una pantalla o una parte reutilizable de la interfaz.
- HTML: define lo que ve y pulsa el usuario.
- CSS: define colores, tamaños y distribución.
- Signal: mantiene un valor y actualiza la vista cuando cambia.
- Formulario reactivo: agrupa campos y sus validaciones.
- Servicio HTTP: centraliza la comunicación con el backend.
- Observable: recibe el resultado de una petición; puede terminar correctamente o con error.

## Guion corto

“Mi parte del proyecto es el frontend de RunaRed, desarrollado en Angular. Lo adapté a las funciones que ofrece nuestro backend FastAPI. El usuario puede consultar el catálogo, buscar materiales, publicar un recurso, ver su detalle, editarlo y eliminarlo con confirmación. El formulario de creación y edición se reutiliza para evitar duplicar código. La comunicación está centralizada en un servicio HTTP. También se muestran estados de carga, errores y resultados vacíos. Los datos se guardan en la base del backend, no en el navegador.”

## Recorrido de exposición

Publica un recurso de prueba, búscalo, abre el detalle, cambia su descripción, recarga para comprobar la persistencia y elimínalo. Usa material ficticio para no borrar recursos reales.

Si preguntan por usuarios: “El alcance de esta versión es un catálogo compartido sin autenticación. Los permisos por usuario no forman parte del backend entregado.”
