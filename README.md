# OptiWeb - Optimizador de imágenes y fuentes web

OptiWeb es una aplicación web que permite a los usuarios optimizar recursos web para mejorar el rendimiento de sus sitios. Similar a [Squoosh.app](https://squoosh.app) para imágenes, esta herramienta ayuda a reducir significativamente el tamaño de imágenes y fuentes sin comprometer la calidad visual.

## Características

### Optimización de imágenes
- Subida de imágenes mediante arrastrar y soltar
- Conversión a formatos WebP y AVIF
- Control de calidad ajustable
- Comparación visual entre la imagen original y la optimizada
- Estadísticas de ahorro de tamaño
- Descarga directa de imágenes optimizadas
- Optimización en el navegador (client-side) o en el servidor

### Optimización de fuentes
- Obtención directa de fuentes web desde Google Fonts
- Descarga de formatos optimizados (WOFF2, WOFF)
- Generación de CSS para incluir en proyectos web
- Soporte para diferentes pesos y estilos de fuente

## Tecnologías utilizadas

- [Next.js 15.5+](https://nextjs.org) - Framework de React con App Router
- [Tailwind CSS 4](https://tailwindcss.com) - Estilos y diseño
- [Sharp](https://sharp.pixelplumbing.com) - Procesamiento de imágenes en servidor
- [React 19](https://react.dev) - Biblioteca UI con hooks avanzados
- [React Dropzone](https://react-dropzone.js.org) - Subida de archivos
- [TypeScript](https://www.typescriptlang.org) - Tipado estático
- [Web APIs](https://developer.mozilla.org/es/docs/Web/API/Canvas_API) - Para procesamiento de imágenes en cliente

## Comenzando

### Requisitos previos

- Node.js 18.17 o superior
- npm o yarn
- Navegador moderno con soporte para WebP y opcionalmente AVIF

### Instalación

1. Clona este repositorio:
```bash
git clone https://github.com/tuusuario/image-optimizer.git
cd image-optimizer
```

2. Instala las dependencias:
```bash
npm install
# o
yarn install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Uso

### Optimización de imágenes
1. Ve a la página principal.
2. Arrastra y suelta una imagen o haz clic para seleccionar una.
3. Selecciona el formato de salida deseado (WebP o AVIF).
4. Ajusta el nivel de calidad con el control deslizante.
5. Elige entre optimización en cliente o servidor según tus necesidades.
6. Haz clic en "Optimizar Imagen".
7. Compara la calidad y el tamaño entre la imagen original y la optimizada.
8. Descarga la imagen optimizada con el botón "Descargar".

### Optimización de fuentes
1. Ve a la página de fuentes (/fonts).
2. Ingresa el nombre exacto de la fuente de Google Fonts que deseas optimizar.
3. Haz clic en "Optimizar y Descargar".
4. Descarga los archivos de fuente optimizados en diferentes formatos.
# OptiWeb — Optimizador de imágenes y fuentes web

Aplicación Next.js que permite optimizar imágenes (WebP / AVIF) y descargar fuentes optimizadas desde Google Fonts.

Este repositorio contiene una pequeña UI (arrastrar y soltar) para subir imágenes, controles de calidad, comparación visual y dos endpoints API:

- `/api/optimize` — recibe un FormData con `file`, `format`, `webpQuality` y `avifQuality`. Devuelve versiones en WebP y/o AVIF (base64) y estadísticas.
- `/api/optimize-font` — recibe JSON con `{ family, weights }`, descarga las fuentes desde Google Fonts (probando distintos User-Agents) y devuelve los archivos en base64 + CSS.

## Tecnologías

- Next.js (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Sharp (procesamiento de imágenes en servidor)
- React Dropzone (subida)

## Requisitos

- Node.js 18+ (recomendado)
- npm o yarn
- En Windows, si la instalación de `sharp` falla, asegúrate de tener las dependencias nativas (prebuilds o Visual Studio Build Tools). En la mayoría de casos `npm install` descarga binarios precompilados.

## Instalación rápida

1. Instala dependencias:

```bash
npm install
```

2. Ejecuta en modo desarrollo:

```bash
npm run dev
```

Abre http://localhost:3000

## Endpoints importantes

- POST /api/optimize
   - Entrada: FormData { file: File, format: 'webp'|'avif'|'both', webpQuality: string (10-100), avifQuality: string (10-100) }
   - Salida: JSON con objetos `webp` y/o `avif` que contienen `data` (data URL base64), `size` y `savings`.

- POST /api/optimize-font
   - Entrada: JSON { family: string, weights?: number[] }
   - Salida: JSON { files: [{ name, type, data(base64), size }], css: string, summary }

## Estructura de archivos (resumen rápido)

- `app/page.tsx` — página principal que carga el optimizador de imágenes.
- `app/fonts/page.tsx` — página para optimizar y descargar fuentes desde Google Fonts.
- `app/layout.tsx` — layout raíz (fuentes Google importadas, Footer).
- `app/components/Dropzone.tsx` — componente de arrastrar y soltar (genera preview y devuelve File).
- `app/components/ImageOptimizer.tsx` — orquestador principal del flujo de optimización (estado, interacción con API).
- `app/components/OptimizationControls.tsx` — controles de formato/quality y botón de optimizar.
- `app/components/ImageComparison.tsx` — muestra original + WebP + AVIF y ofrece descargas y código <picture>.
- `app/components/Header.tsx`, `app/components/Footer.tsx` — navegación y pie de página.
- `app/api/optimize/route.ts` — API route que usa `sharp` para generar WebP/AVIF desde el buffer subido.
- `app/api/optimize-font/route.ts` — API route que usa `utils/fontOptimizer.ts` para descargar y empaquetar fuentes.
- `utils/fontOptimizer.ts` — lógica para construir la URL de Google Fonts, solicitar CSS con distintos User-Agents, extraer URLs y descargar archivos (devuelve y guarda archivos en disco temporal).

## Notas y consideraciones

- Las imágenes se procesan en servidor con `sharp` (API `/api/optimize`). El cliente hace previsualización y descarga de los resultados devueltos por la API.
- La ruta de fuentes descarga archivos y devuelve base64 para facilitar la descarga desde el navegador. El código intenta limpiar el directorio temporal al terminar.
- `next.config.ts` permite servir imágenes AVIF/WebP y permite SVGs.

## Scripts

- `npm run dev` — inicia Next.js en modo desarrollo
- `npm run build` — build de producción
- `npm run start` — servidor de producción
- `npm run lint` — linter

## Próximos pasos / mejoras sugeridas

- Añadir manejo de tamaños máximos y validaciones más estrictas en las APIs.
- Añadir tests unitarios para `utils/fontOptimizer.ts`.
- Permitir selección de múltiples pesos y estilos desde la UI de fuentes.

---

Si quieres, puedo generar un apartado de troubleshooting para instalar `sharp` en Windows o añadir tests básicos para `fontOptimizer`.
