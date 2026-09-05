import https from 'https';
import { URL } from 'url';
import fs from 'fs';
import path from 'path';

const ALLOWED_HOSTS = new Set(['fonts.googleapis.com', 'fonts.gstatic.com']);
const MAX_REDIRECTS = 3;
const MAX_DOWNLOAD_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;

const UA = {
    woff2: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    woff: 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)',
    ttf: 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16',
};

function assertAllowedUrl(urlString: string): URL {
    let parsed: URL;
    try {
        parsed = new URL(urlString);
    } catch {
        throw new Error('URL de fuente no valida');
    }

    if (parsed.protocol !== 'https:') {
        throw new Error('Solo se permiten descargas HTTPS');
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
        throw new Error('Host de fuente no permitido');
    }

    return parsed;
}

function fetchUrl(url: string, ua: string, redirectsLeft = MAX_REDIRECTS): Promise<Buffer> {
    const parsed = assertAllowedUrl(url);

    return new Promise((resolve, reject) => {
        const request = https.get(parsed, { headers: { 'User-Agent': ua } }, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                if (redirectsLeft <= 0) {
                    res.resume();
                    return reject(new Error('Demasiadas redirecciones'));
                }
                try {
                    const nextUrl = new URL(res.headers.location, parsed).toString();
                    res.resume();
                    return resolve(fetchUrl(nextUrl, ua, redirectsLeft - 1));
                } catch {
                    res.resume();
                    return reject(new Error('Redireccion no valida'));
                }
            }

            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            const contentLength = Number(res.headers['content-length'] || 0);
            if (contentLength > MAX_DOWNLOAD_BYTES) {
                res.destroy();
                return reject(new Error('Archivo de fuente demasiado grande'));
            }

            const chunks: Buffer[] = [];
            let received = 0;

            res.on('data', (chunk: Buffer) => {
                received += chunk.length;
                if (received > MAX_DOWNLOAD_BYTES) {
                    res.destroy();
                    return reject(new Error('Archivo de fuente demasiado grande'));
                }
                chunks.push(chunk);
            });
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        });

        request.setTimeout(REQUEST_TIMEOUT_MS, () => {
            request.destroy(new Error('Tiempo de espera agotado'));
        });
        request.on('error', reject);
    });
}

function extractUrls(css: string) {
    const entries: { url: string; format: string; weight: string; style: string }[] = [];
    const blocks = css.split('@font-face');

    for (const block of blocks) {
        if (!block.trim()) continue;

        const weightMatch = block.match(/font-weight:\s*(\d+)/);
        const weight = weightMatch ? weightMatch[1] : '400';

        const styleMatch = block.match(/font-style:\s*([a-z]+)/);
        const style = styleMatch ? styleMatch[1] : 'normal';

        const srcMatch = block.match(/src:\s*([^;]+)/);
        if (srcMatch) {
            const srcValue = srcMatch[1];
            for (const urlMatch of srcValue.matchAll(/url\(([^)]+)\)\s*format\(['"]?([^'")]+)['"]?\)/g)) {
                entries.push({
                    url: urlMatch[1].replace(/['"]/g, ''),
                    format: urlMatch[2].toLowerCase(),
                    weight,
                    style,
                });
            }
        }
    }

    return entries;
}

function buildCssUrl(family: string, weights: number[]) {
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}&display=swap`;
}

export async function downloadGoogleFont(family: string, weights: number[], outDir: string) {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const cssUrl = buildCssUrl(family, weights);
    let totalFilesDownloaded = 0;

    for (const [format, ua] of Object.entries(UA)) {
        try {
            const css = await fetchUrl(cssUrl, ua).then((buffer) => buffer.toString('utf8'));

            if (!css || css.trim().length === 0 || !css.includes('@font-face')) {
                continue;
            }

            const urls = extractUrls(css);
            if (urls.length === 0) {
                continue;
            }

            for (const { url, weight, style } of urls) {
                try {
                    const buffer = await fetchUrl(url, ua);
                    const familySlug = family.toLowerCase().replace(/\s+/g, '-');
                    const name = path.join(outDir, `${familySlug}-${style}-${weight}.${format}`);
                    fs.writeFileSync(name, buffer);
                    totalFilesDownloaded++;
                } catch (err) {
                    console.error(`Error descargando ${url}:`, err);
                }
            }
        } catch (err) {
            console.error(`Error descargando CSS para UA ${format}:`, err);
        }
    }

    if (totalFilesDownloaded === 0) {
        throw new Error(`Font '${family}' not found or is not available in Google Fonts. Please verify the exact font name.`);
    }
}
