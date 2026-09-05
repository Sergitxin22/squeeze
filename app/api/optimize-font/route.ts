import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { downloadGoogleFont } from '../../../utils/fontOptimizer';
import {
    checkRateLimit,
    parseFontFamily,
    parseFontWeights,
    parseIncludeItalic,
} from '../../../utils/apiGuards';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const limited = checkRateLimit(request, 'optimize-font', 'RATE_LIMIT_FONT_PER_MIN');
    if (limited) {
        return limited;
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'JSON no valido' }, { status: 400 });
    }

    const payload = body as { family?: unknown; weights?: unknown; includeItalic?: unknown; ital?: unknown };
    const family = parseFontFamily(payload.family);
    const weights = parseFontWeights(payload.weights);
    const includeItalic = parseIncludeItalic(payload.includeItalic ?? payload.ital);

    if (!family) {
        return NextResponse.json({ error: 'Nombre de fuente no valido' }, { status: 400 });
    }

    if (weights.length === 0) {
        return NextResponse.json({ error: 'Selecciona al menos un grosor valido' }, { status: 400 });
    }

    const tempDir = path.join(os.tmpdir(), `font-opt-${Date.now()}-${crypto.randomUUID()}`);

    try {
        fs.mkdirSync(tempDir, { recursive: true });

        await downloadGoogleFont(family, weights, tempDir, includeItalic);

        const filesInDir = fs.readdirSync(tempDir);
        const files = filesInDir.map((fileName) => {
            const filePath = path.join(tempDir, fileName);
            const buffer = fs.readFileSync(filePath);
            const ext = path.extname(fileName).slice(1);
            return {
                name: fileName,
                type: `font/${ext}`,
                data: buffer.toString('base64'),
                size: buffer.length,
            };
        });

        const filesByType = { ttf: 0, woff: 0, woff2: 0 };
        for (const file of files) {
            const ext = path.extname(file.name).slice(1) as 'ttf' | 'woff' | 'woff2';
            if (filesByType[ext] !== undefined) filesByType[ext]++;
        }

        const formatMap: { [key: string]: string } = {
            ttf: 'truetype',
            woff: 'woff',
            woff2: 'woff2',
        };

        const cssBlocks: string[] = [];
        const filesByWeightAndStyle: { [key: string]: typeof files } = {};
        for (const file of files) {
            const parts = file.name.replace(/\.[^/.]+$/, '').split('-');
            const weight = parts.pop() || '400';
            const style = parts.pop() || 'normal';
            const key = `${style}-${weight}`;
            if (!filesByWeightAndStyle[key]) filesByWeightAndStyle[key] = [];
            filesByWeightAndStyle[key].push(file);
        }

        for (const key of Object.keys(filesByWeightAndStyle)) {
            const groupFiles = filesByWeightAndStyle[key];
            const [style, weight] = key.split('-');

            groupFiles.sort((a, b) => {
                const extA = path.extname(a.name).slice(1);
                const extB = path.extname(b.name).slice(1);
                const order = { woff2: 1, woff: 2, ttf: 3 };
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
            const styleLabel = style === 'italic' ? ' Italic' : '';

            const srcLines = [
                `local("${family}")`,
                `local("${family} ${weightName}${styleLabel}")`,
                `local("${family.replace(/\s+/g, '')}-${weightName}${styleLabel.trim()}")`,
                ...groupFiles.map((file) => {
                    const ext = path.extname(file.name).slice(1);
                    const format = formatMap[ext] || ext;
                    return `url("./${file.name}") format("${format}")`;
                }),
            ];

            cssBlocks.push(`@font-face {
    font-family: "${family}";
    src: ${srcLines.join(',\n        ')};
    font-weight: ${weight};
    font-style: ${style};
    font-display: swap;
}`);
        }

        return NextResponse.json({
            files,
            css: cssBlocks.join('\n\n'),
            summary: {
                ttf: filesByType.ttf,
                woff: filesByType.woff,
                woff2: filesByType.woff2,
                total: files.length,
            },
        });
    } catch (err) {
        console.error('Error en la optimizacion de fuentes:', err);
        const message = err instanceof Error ? err.message : 'Error al optimizar la fuente';
        const userMessage = message.includes('not found') || message.includes('not available')
            ? message
            : 'Error al optimizar la fuente';
        return NextResponse.json({ error: userMessage }, { status: 500 });
    } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
    }
}
