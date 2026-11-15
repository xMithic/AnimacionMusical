# Visor 3D musical

Visor 3D interactivo con música y letras sincronizadas, más un panel de administración para armar la escena y publicarla.

- **`admin.html`**: panel de administración (modelos, animaciones `.gma`, cámara, música y letras, publicar).
- **`index.html`**: el visor que ve el espectador. **Es un archivo generado**: lleva incrustados la configuración, los modelos y las animaciones, así que no se edita a mano.

## Estructura

```
visor3dmusical/
├── index.html                 Visor publicado (generado: código + datos incrustados)
├── admin.html                 Panel de administración (solo estructura HTML)
├── sw.js · manifest.webmanifest · icons/    PWA
├── music/                     Canciones
│
├── admin/                     Código del panel (se carga directo, sin compilar)
│   ├── css/admin.css
│   └── js/
│       ├── 00-viewer-template.js   GENERADO: plantilla del visor (no editar)
│       ├── 01-auth.js              acceso con contraseña
│       ├── 02-state.js             configuración por defecto y estado
│       ├── 03-model-import.js      .gltf/.zip → .glb
│       ├── 04-audio-tags.js        lector de ID3 / FLAC
│       ├── 05-lyrics-service.js    búsqueda de letras (LRCLIB)
│       ├── 06-audio-helpers.js     calibración de sincronía y utilidades de .lrc
│       ├── 07-music-tracks.js      canciones y carpeta music/
│       ├── 08-music-panel.js       bloque «Música & Letra» del panel
│       ├── 09-gma-reader.js        lector de .gma (Garry's Mod)
│       ├── 10-anim-library.js      biblioteca de animaciones
│       ├── 11-panel-render.js      créditos y render del panel
│       ├── 12-preview-sync.js      comunicación con la vista previa
│       ├── 13-folder-models.js     carpeta de trabajo y alta de modelos
│       ├── 14-events.js            eventos del panel
│       ├── 15-publish.js           generar, descargar y publicar index.html
│       └── 16-boot.js              arranque
│
├── viewer/                    Código fuente del visor (se ensambla con el build)
│   ├── template.html          Esqueleto con marcadores {{inline:…}}
│   ├── css/                   01-base · 02-lyrics · 03-start-overlay · 04-hud · 05-theme-editorial
│   └── js/
│       ├── lyrics.js          Motor de letras (window.LYR)
│       └── scene/             Escena 3D, en partes numeradas (00-imports … 11-main-loop)
│
└── tools/build.mjs            Ensamblador (Node 18+, sin dependencias)
```

## Cómo se usa

**Usar el panel o el visor:** abrí `admin.html` / `index.html` como siempre. No hace falta instalar nada. (three.js se carga desde un CDN, así que se necesita internet, igual que antes.)

**Editar el panel (`admin/`):** modificá el archivo que corresponda y recargá. Los archivos se cargan en orden numérico y comparten el mismo ámbito global, igual que cuando era un solo `<script>`: por eso el orden en `admin.html` importa.

**Editar el visor (`viewer/`):** modificá el archivo y ejecutá:

```
node tools/build.mjs
```

Eso actualiza dos cosas: la plantilla que usa el panel (`admin/js/00-viewer-template.js`) y el código de `index.html`, **conservando tal cual** la configuración, los modelos y las animaciones que ya tiene incrustados. Con `node tools/build.mjs --check` solo se comprueba que todo esté al día.

Las partes de `viewer/js/scene/` y `viewer/css/` se concatenan en orden alfabético dentro de un único módulo / una única hoja de estilos; por eso llevan prefijo numérico y no son módulos ES independientes. El orden de los CSS también importa (el tema editorial sobrescribe a los anteriores).

## Flujo de publicación

1. Abrir `admin.html`, elegir la carpeta del proyecto y armar la escena.
2. **Publicar** escribe `index.html` en esa carpeta (o lo descarga si no elegiste carpeta), usando la plantilla del visor.
