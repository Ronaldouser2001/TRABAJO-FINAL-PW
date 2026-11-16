# RunaRed · Recursos educativos

Frontend Angular ajustado al backend FastAPI recibido. Incluye inicio, catálogo, detalle y creación, edición y eliminación de recursos. No incluye cuentas, tutorías, solicitudes, reseñas ni modo de demostración.

## Abrir el proyecto

Extrae esta entrega en `D:\RunaRed\frontend-recursos` y abre esa carpeta en VS Code. Conserva tus carpetas anteriores como respaldo. No copies encima del proyecto anterior: quedarían archivos de las funciones retiradas.

```powershell
npm ci
npm start
```

Abre http://localhost:4200. Si ese puerto está ocupado, detén el servidor anterior con Ctrl+C. Deja la terminal abierta.

Para consultar o guardar recursos debe estar encendido el backend de Jhon en `http://127.0.0.1:8000`. La aplicación no usa datos simulados. Si el servidor está apagado, muestra un mensaje y permite reintentar. El comando `start:local` se retiró.

## Qué puedes mostrar

1. Inicio y propósito del catálogo.
2. Recursos: búsqueda, filtro por universidad y categoría.
3. Publicar recurso: título, universidad, categoría, descripción y enlace opcional.
4. Ver detalle del recurso creado.
5. Editar un campo y comprobar que el cambio permanezca al recargar.
6. Eliminar con confirmación y comprobar que desaparezca del catálogo.

El enlace del material abre una dirección externa; no se suben archivos al servidor. No hay préstamos, solicitudes ni propietarios de publicaciones.

## Cómo se conecta

`resource.service.ts` envía peticiones HTTP a `/api/resources/`. En desarrollo, `proxy.conf.json` reenvía `/api` a FastAPI en el puerto 8000 y retira ese prefijo. No se modificó el backend adjunto.

| Acción | Método | Ruta FastAPI |
| --- | --- | --- |
| Listar | GET | `/resources/` |
| Consultar | GET | `/resources/{id}` |
| Crear | POST | `/resources/` |
| Editar | PUT | `/resources/{id}` |
| Eliminar | DELETE | `/resources/{id}` |

El filtro de universidad se envía al servidor con `?university=UNCP`. La búsqueda por texto, la categoría y la paginación se resuelven en el frontend sobre los resultados recibidos.

## Verificación

```powershell
npm run test:ci
npm run build
```

En esta entrega pasaron 20 pruebas en 6 archivos y la compilación de producción. Las pruebas comprueban operaciones HTTP, filtros, estados de carga/error, formularios, enlaces y confirmación de eliminación. Las pruebas usan respuestas controladas; no reemplazan el recorrido con el backend real. El código Python de `app/` del ZIP coincide con la versión del backend cuyo CRUD se comprobó previamente usando una base temporal. La revisión visual de esta simplificación debe realizarse en tu navegador.

## Alcance de acceso

El backend recibido no tiene autenticación ni permisos: cualquier persona con acceso a su API puede crear, editar y borrar cualquier recurso. Esta entrega respeta ese alcance compartido; no ofrece cuentas ni simula protección. Si van a publicarlo en Internet con restricciones por usuario, esas reglas deben implementarse en el servidor.

Para despliegue, `npm run build` genera `dist/frontend/browser`. El servidor web debe servir `index.html` para las rutas de Angular y reenviar `/api` a FastAPI. El proxy de Angular es solo para desarrollo.

## Para la exposición

Lee `docs/GUIA-EXPOSICION.md`: contiene el orden para explicar los archivos y un recorrido breve. Los archivos `.spec.ts` son pruebas, no pantallas. No es necesario memorizar cada línea: explica cómo una acción del usuario llega al servicio y vuelve como resultado.
