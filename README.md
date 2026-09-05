# Squeeze - Optimizador de imágenes y fuentes web

Squeeze es una aplicación web que permite a los usuarios optimizar recursos web para mejorar el rendimiento de sus sitios. Similar a [Squoosh.app](https://squoosh.app) para imágenes, esta herramienta ayuda a reducir significativamente el tamaño de imágenes y fuentes sin comprometer la calidad visual.

## Características

### Optimización de imágenes
- Subida de imágenes mediante arrastrar y soltar (una o en lote)
- Conversión a formatos WebP y AVIF
- Control de calidad ajustable
- Comparación visual entre la imagen original y la optimizada
- Estadísticas de ahorro de tamaño
- Descarga directa de imágenes optimizadas
- Optimización en lote con ZIP (hasta 100 archivos)

### Optimización de fuentes
- Obtención directa de fuentes web desde Google Fonts
- Descarga de formatos optimizados (WOFF2, WOFF, TTF)
- Generación de CSS para incluir en proyectos web
- Soporte para diferentes pesos de fuente

## Tecnologías utilizadas

- [Next.js 16+](https://nextjs.org) — Framework de React con App Router
- [Tailwind CSS 4](https://tailwindcss.com) — Estilos y diseño
- [Sharp](https://sharp.pixelplumbing.com) — Procesamiento de imágenes en servidor
- [React 19](https://react.dev) — Biblioteca UI
- [React Dropzone](https://react-dropzone.js.org) — Subida de archivos
- [TypeScript](https://www.typescriptlang.org) — Tipado estático
- [JSZip](https://stuk.github.io/jszip/) — Empaquetado de lotes en ZIP

## Comenzando

### Requisitos previos

- Node.js 18.17 o superior
- npm, pnpm o yarn
- Navegador moderno con soporte para WebP y opcionalmente AVIF

### Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/Sergitxin22/squeeze.git
cd squeeze
```

2. Instala las dependencias:

```bash
npm install
# o
yarn install
# o
pnpm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

En Windows, si la instalación de `sharp` falla, asegúrate de tener las dependencias nativas (prebuilds o Visual Studio Build Tools). En la mayoría de casos `npm install` descarga binarios precompilados.

## Uso

### Optimización de imágenes

1. Ve a la página principal.
2. Arrastra y suelta una o varias imágenes, o haz clic para seleccionarlas.
3. Selecciona el formato de salida deseado (WebP, AVIF o ambos).
4. Ajusta el nivel de calidad con el control deslizante.
5. Haz clic en optimizar.
6. Compara la calidad y el tamaño entre la imagen original y la optimizada (o descarga el ZIP si es un lote).
7. Descarga el resultado con el botón correspondiente.

### Optimización de fuentes

1. Ve a la página de fuentes (`/fonts`).
2. Ingresa el nombre exacto de la fuente de Google Fonts que deseas optimizar.
3. Selecciona los grosores (weights) que necesites.
4. Haz clic en "Optimizar".
5. Descarga un formato concreto o el ZIP. El CSS se copia al portapapeles con el botón "Copiar CSS".

## Endpoints

- `POST /api/optimize`
  - Entrada: FormData `{ file, format: 'webp'|'avif'|'both', webpQuality, avifQuality }`
  - Salida: JSON con objetos `webp` y/o `avif` que contienen `data` (data URL base64), `size` y `savings`.
- `POST /api/optimize-batch`
  - Entrada: FormData `{ files, format, webpQuality, avifQuality }` (hasta 100 archivos)
  - Salida: ZIP con las imágenes convertidas.
- `POST /api/optimize-font`
  - Entrada: JSON `{ family, weights? }`
  - Salida: JSON `{ files: [{ name, type, data(base64), size }], css, summary }`

Por defecto no hay límite de tamaño de archivo (uso local). Si más adelante publicas la app, copia `.env.example` a `.env.local` y define `NEXT_PUBLIC_MAX_FILE_SIZE_MB`, `NEXT_PUBLIC_MAX_BATCH_SIZE_MB` y los `RATE_LIMIT_*`.

## Estructura de archivos

- `app/page.tsx` — página principal que carga el optimizador de imágenes.
- `app/images/page.tsx` — alias de la página de imágenes.
- `app/fonts/page.tsx` — página para optimizar y descargar fuentes desde Google Fonts.
- `app/layout.tsx` — layout raíz (fuentes, Footer).
- `app/components/Dropzone.tsx` — arrastrar y soltar (genera preview y devuelve `File`).
- `app/components/ImageOptimizer.tsx` — orquestador del flujo de optimización (estado, API).
- `app/components/OptimizationControls.tsx` — controles de formato/calidad y botón de optimizar.
- `app/components/ImageComparison.tsx` — muestra original + WebP + AVIF, descargas y código `<picture>`.
- `app/components/Header.tsx`, `app/components/Footer.tsx` — navegación y pie de página.
- `app/api/optimize/route.ts` — API que usa `sharp` para generar WebP/AVIF.
- `app/api/optimize-batch/route.ts` — API de lote; devuelve un ZIP.
- `app/api/optimize-font/route.ts` — API que usa `utils/fontOptimizer.ts` para descargar y empaquetar fuentes.
- `utils/fontOptimizer.ts` — construye la URL de Google Fonts, solicita CSS con distintos User-Agents, extrae URLs y descarga archivos en un directorio temporal.
- `utils/apiGuards.ts` — validación, límites opcionales y rate limit.

## Notas y consideraciones

- Las imágenes se procesan en servidor con `sharp` (`/api/optimize` y `/api/optimize-batch`). El cliente hace previsualización y descarga de los resultados.
- La ruta de fuentes descarga archivos y devuelve base64 para facilitar la descarga desde el navegador. El directorio temporal se elimina al terminar.
- `next.config.ts` habilita los formatos AVIF y WebP para `next/image`.
- Las descargas de fuentes solo se permiten desde `fonts.googleapis.com` y `fonts.gstatic.com`.

## Scripts

- `npm run dev` — inicia Next.js en modo desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — linter

## Próximos pasos / mejoras sugeridas

- Añadir tests unitarios para `utils/fontOptimizer.ts`.
- Permitir estilos italic además de los pesos en la UI de fuentes.

## Licencia

MIT
