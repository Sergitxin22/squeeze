import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const UA = {
    woff2: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    woff: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)",
    ttf: "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16",
};

// Helper simple para descargar URL
function fetchUrl(url: string, ua: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        https.get(new URL(url), { headers: { 'User-Agent': ua } }, res => {

            // Se vuelve a llamar con la url nueva
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                return resolve(fetchUrl(res.headers.location, ua));
            }

            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));

            // Recibir 
            const chunks: any[] = [];
            res.on('data', d => chunks.push(d));
            res.on('end', () => resolve(Buffer.concat(chunks)));
        }).on('error', reject);
    });
}

// Extraer URLs de CSS
function extractUrls(css: string) {
    const entries: { url: string; format: string; weight: string; style: string }[] = [];

    // El CSS viene con un montón de @font-face { ... } para diferentes grosores y subconjuntos.
    const blocks = css.split('@font-face');

    for (const block of blocks) {
        if (!block.trim()) continue;

        // Extraer peso y estilo del bloque (valores por defecto 400 y normal)
        const weightMatch = block.match(/font-weight:\s*(\d+)/);
        const weight = weightMatch ? weightMatch[1] : '400';

        const styleMatch = block.match(/font-style:\s*([a-z]+)/);
        const style = styleMatch ? styleMatch[1] : 'normal';

        // Extraer URLs y formatos de la propiedad src:
        const srcMatch = block.match(/src:\s*([^;]+)/);
        if (srcMatch) {
            const srcValue = srcMatch[1];
            for (const urlMatch of srcValue.matchAll(/url\(([^)]+)\)\s*format\(['"]?([^'")]+)['"]?\)/g)) {
                entries.push({
                    url: urlMatch[1].replace(/['"]/g, ""),
                    format: urlMatch[2].toLowerCase(),
                    weight,
                    style
                });
            }
        }
    }

    return entries;
}

// Construir URL CSS de Google Fonts
function buildCssUrl(family: string, weights: number[]) {
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;
}

// Función principal para descargar fuentes
export async function downloadGoogleFont(family: string, weights: number[], outDir: string) {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const cssUrl = buildCssUrl(family, weights);
    let totalFilesDownloaded = 0;

    for (const [format, ua] of Object.entries(UA)) {
        try {
            const css = await fetchUrl(cssUrl, ua).then(b => b.toString('utf8'));

            // Verificar si el CSS contiene URLs válidas
            if (!css || css.trim().length === 0 || !css.includes('@font-face')) {
                continue; // Intentar con el siguiente user agent
            }

            const urls = extractUrls(css);

            // Si no se encontraron URLs, la fuente probablemente no existe
            if (urls.length === 0) {
                continue; // Intentar con el siguiente user agent
            }

            for (const { url, format: fmt, weight, style } of urls) {
                try {
                    const buffer = await fetchUrl(url, ua);

                    // Construir nombre: familia-normal-400.woff2
                    const familySlug = family.toLowerCase().replace(/\s+/g, '-');
                    const ext = format; // Usar el formato de UA (woff2, woff, ttf)

                    const name = path.join(outDir, `${familySlug}-${style}-${weight}.${ext}`);
                    fs.writeFileSync(name, buffer);
                    console.log(`✅ Guardado: ${name}`);
                    totalFilesDownloaded++;
                } catch (err) {
                    console.error(`Error descargando ${url}:`, err);
                }
            }
        } catch (err) {
            console.error(`Error descargando CSS para UA ${format}:`, err);
        }
    }

    // Si no se descargó ningún archivo, la fuente no fue encontrada
    if (totalFilesDownloaded === 0) {
        throw new Error(`Font '${family}' not found or is not available in Google Fonts. Please verify the exact font name.`);
    }
}
