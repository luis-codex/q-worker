# sw-worker

![npm](https://img.shields.io/npm/v/sw-worker)
![License](https://img.shields.io/github/license/luis-codex/sw-worker)
  
[🌐 Landing page](https://sw-worker.qbytes.dev)

`sw-worker` es una librería que facilita la comunicación entre un cliente y un trabajador (worker) en entornos de navegador o extensiones. Proporciona una arquitectura modular y flexible para manejar rutas, solicitudes y respuestas.

## Tabla de Contenido

- [sw-worker](#sw-worker)
  - [Tabla de Contenido](#tabla-de-contenido)
  - [Instalación](#instalación)
  - [Uso](#uso)
    - [Cliente](#cliente)
      - [Ejemplo de uso:](#ejemplo-de-uso)
    - [Trabajador](#trabajador)
      - [Ejemplo de uso:](#ejemplo-de-uso-1)
    - [Uso en Entorno de Extensión](#uso-en-entorno-de-extensión)
      - [Cliente en Extensión:](#cliente-en-extensión)
      - [Trabajador en Extensión:](#trabajador-en-extensión)
  - [Estructura del Proyecto](#estructura-del-proyecto)
  - [API](#api)
    - [SWWorkerClient](#swworkerclient)
      - [Métodos](#métodos)
    - [SWWorker](#swworker)
      - [Métodos](#métodos-1)
  - [Contribución](#contribución)
  - [Licencia](#licencia)

## Instalación

Usa el siguiente comando para instalar la dependencia:

```bash
npm install sw-worker
```

O si usas `pnpm`:

```bash
pnpm add sw-worker
```

## Uso

### Cliente

El cliente (`SWWorkerClient`) permite realizar solicitudes al trabajador. Puedes inicializarlo con diferentes configuraciones dependiendo del entorno.

#### Ejemplo de uso:

```typescript
import { SWWorkerClient } from 'sw-worker/client';

const client = new SWWorkerClient({
  runtime: 'browser',
  url: new URL('./worker.js', import.meta.url),
});

// Realizar una solicitud GET
client.get('/ruta')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error))
  .finally(() => console.log('Finalizado'));

// Realizar una solicitud POST
client.post('/ruta', { key: 'value' })
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error))
  .finally(() => console.log('Finalizado'));

// Terminar el worker cuando ya no sea necesario
client.terminate();
```

### Trabajador

El trabajador (`SWWorker`) permite definir rutas y manejar solicitudes desde el cliente.

#### Ejemplo de uso:

```typescript
import SWWorker from 'sw-worker/worker';

const worker = new SWWorker('browser');

// Definir rutas
worker.get('/ruta', (req, res) => {
  res.send({ mensaje: 'Hola desde el worker' });
});

worker.post('/ruta', (req, res) => {
  const { key } = req.body;
  res.send({ mensaje: `Recibido: ${key}` });
});

// Escuchar solicitudes
worker.listen();
```

### Uso en Entorno de Extensión

El cliente y el trabajador también pueden ser utilizados en un entorno de extensión. A continuación, se muestra un ejemplo con rutas CRUD para `/tabs` y `/bookmarks`:

#### Cliente en Extensión:

```typescript
import { SWWorkerClient } from 'sw-worker/client';

const client = new SWWorkerClient({
  runtime: 'extension',
});

// Obtener todas las pestañas
client.get('/tabs')
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error))
  .finally(() => console.log('Finalizado'));

// Crear un marcador
client.post('/bookmarks', { title: 'Nuevo Marcador', url: 'https://example.com' })
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error('Error:', error))
  .finally(() => console.log('Finalizado'));
```

#### Trabajador en Extensión:

```typescript
import SWWorker from 'sw-worker/worker';

const worker = new SWWorker('extension');

// Rutas para pestañas
worker.get('/tabs', async (req, res) => {
  const tabs = await chrome.tabs.query({});
  res.send({ tabs });
});

worker.post('/tabs', async (req, res) => {
  const { url } = req.body;
  const tab = await chrome.tabs.create({ url });
  res.send({ tab });
});

// Rutas para marcadores
worker.get('/bookmarks', async (req, res) => {
  const bookmarks = await chrome.bookmarks.getTree();
  res.send({ bookmarks });
});

worker.post('/bookmarks', async (req, res) => {
  const { title, url } = req.body;
  const bookmark = await chrome.bookmarks.create({ title, url });
  res.send({ bookmark });
});

// Escuchar solicitudes
worker.listen();
```

## Estructura del Proyecto

La librería sigue una arquitectura modular:

```
sw-worker/
├── src/
│   ├── client/
│   │   └── index.ts
│   ├── worker/
│   │   └── index.ts
│   ├── managers/
│   │   ├── RequestHandler.ts
│   │   ├── ResponseManager.ts
│   │   └── RouteManager.ts
│   ├── types/
│   │   └── types.d.ts
│   └── utils/
│       └── pathUtils.ts
├── tests/
│   ├── client.test.ts
│   └── worker.test.ts
├── package.json
├── tsconfig.json
├── LICENSE
└── README.md
```

## API

### SWWorkerClient

#### Métodos
- `get(route: string, headers?: HeadersInit): Promise<ClientResponse>`
- `post(route: string, body?: StructuredCloneable, headers?: HeadersInit): Promise<ClientResponse>`
- `put(route: string, body?: StructuredCloneable, headers?: HeadersInit): Promise<ClientResponse>`
- `delete(route: string, body?: StructuredCloneable, headers?: HeadersInit): Promise<ClientResponse>`
- `terminate(): void`

### SWWorker

#### Métodos
- `get(path: string, handler: Handler): void`
- `post(path: string, handler: Handler): void`
- `put(path: string, handler: Handler): void`
- `delete(path: string, handler: Handler): void`
- `route(path: string, app: SWWorker): void`
- `listen(): void`

## Contribución

¡Las contribuciones son bienvenidas! Si deseas colaborar, sigue estos pasos:

1. Haz un fork del repositorio.
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`). **No envíes tus cambios a la rama `master`, utiliza la rama `develop`.**
3. Realiza tus cambios y haz un commit (`git commit -m 'feat: agrega nueva funcionalidad'`).
4. Sube tus cambios a tu rama (`git push origin feature/nueva-funcionalidad`).
5. Abre un Pull Request en el repositorio principal.

**Nota:** El flujo de trabajo de GitHub Actions solo se ejecutará en la rama `master`.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

Repositorio: [sw-worker](https://github.com/luis-codex/sw-worker)