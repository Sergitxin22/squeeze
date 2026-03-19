import { NextRequest } from 'next/server';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { downloadGoogleFont } from '../../../utils/fontOptimizer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { family, weights = [400] } = body;

        const tempDir = path.join(os.tmpdir(), `font-opt-${Date.now()}`);
        fs.mkdirSync(tempDir, { recursive: true });

        console.log(`Descargando fuente: ${family} con pesos: ${weights.join(', ')}`);
        await downloadGoogleFont(family, weights, tempDir);

        // Leer todos los archivos generados
        const filesInDir = fs.readdirSync(tempDir);
        const files = filesInDir.map(fileName => {
            const filePath = path.join(tempDir, fileName);
            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(fileName).slice(1); // ttf, woff, woff2
            return {
                name: fileName,
                type: `font/${ext}`,
                data: buffer.toString('base64'),
                size: buffer.length,
            };
        });

        // Resumen por tipo
        const filesByType = { ttf: 0, woff: 0, woff2: 0 };
        for (const f of files) {
            const ext = path.extname(f.name).slice(1) as 'ttf' | 'woff' | 'woff2';
            if (filesByType[ext] !== undefined) filesByType[ext]++;
        }

        // CSS con formato mejorado
        const formatMap: { [key: string]: string } = {
            'ttf': 'truetype',
            'woff': 'woff',
            'woff2': 'woff2'
        };

        const cssBlocks: string[] = [];

        // Agrupar archivos por peso (y opcionalmente estilo, asumiendo 'normal' acá)
        const filesByWeightAndStyle: { [key: string]: typeof files } = {};
        for (const f of files) {
            // f.name es como inter-normal-400.woff2
            const parts = f.name.replace(/\.[^/.]+$/, "").split('-');
            const weight = parts.pop() || '400';
            const style = parts.pop() || 'normal';
            const key = `${style}-${weight}`;
            if (!filesByWeightAndStyle[key]) filesByWeightAndStyle[key] = [];
            filesByWeightAndStyle[key].push(f);
        }

        for (const key of Object.keys(filesByWeightAndStyle)) {
            const groupFiles = filesByWeightAndStyle[key];
            const [style, weight] = key.split('-');

            groupFiles.sort((a, b) => {
                const extA = path.extname(a.name).slice(1);
                const extB = path.extname(b.name).slice(1);
                const order = { 'woff2': 1, 'woff': 2, 'ttf': 3 };
                return (order[extA as keyof typeof order] || 3) - (order[extB as keyof typeof order] || 3);
            });

            const weightNames: Record<string, string> = {
                '100': 'Thin',
                '200': 'ExtraLight',
                '300': 'Light',
                '400': 'Regular',
                '500': 'Medium',
                '600': 'SemiBold',
                '700': 'Bold',
                '800': 'ExtraBold',
                '900': 'Black',
            };
            const weightName = weightNames[weight] || 'Regular';

            const localName1 = family;
            const localName2 = `${family} ${weightName}`;
            const localName3 = `${family.replace(/\s+/g, '')}-${weightName}`;

            const srcLines = [
                `local("${localName1}")`,
                `local("${localName2}")`,
                `local("${localName3}")`,
                ...groupFiles.map(f => {
                    const ext = path.extname(f.name).slice(1);
                    const format = formatMap[ext] || ext;
                    return `url("./${f.name}") format("${format}")`;
                })
            ];

            const block = `@font-face {
    font-family: "${family}";
    src: ${srcLines.join(',\n        ')};
    font-weight: ${weight};
    font-style: ${style};
    font-display: swap;
}`;
            cssBlocks.push(block);
        }

        const css = cssBlocks.join('\n\n');

        // Eliminar directorio temporal
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`Directorio temporal eliminado: ${tempDir}`);

        return new Response(JSON.stringify({
            files,
            css,
            summary: {
                ttf: filesByType.ttf,
                woff: filesByType.woff,
                woff2: filesByType.woff2,
                total: files.length
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error('Error en la optimización de fuentes:', err);
        return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
