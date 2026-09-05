import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import {
    MAX_FILE_SIZE_BYTES,
    clampQuality,
    checkRateLimit,
    isAllowedImage,
    parseOutputFormat,
} from '../../../utils/apiGuards';

export const runtime = 'nodejs';

interface OptimizeResult {
    message: string;
    originalSize: number;
    originalFilename: string;
    webp: {
        size: number;
        savings: string;
        data: string;
    };
    avif?: {
        size: number;
        savings: string;
        data: string;
    };
}

export async function POST(request: NextRequest) {
    const limited = checkRateLimit(request, 'optimize', 'RATE_LIMIT_OPTIMIZE_PER_MIN');
    if (limited) {
        return limited;
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        const format = parseOutputFormat(formData.get('format'));
        const webpQuality = clampQuality(formData.get('webpQuality'), 75);
        const avifQuality = clampQuality(formData.get('avifQuality'), 50);

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'No se proporciono ningun archivo' }, { status: 400 });
        }

        if (!isAllowedImage(file)) {
            return NextResponse.json({ error: 'Tipo de imagen no soportado' }, { status: 400 });
        }

        if (MAX_FILE_SIZE_BYTES && file.size > MAX_FILE_SIZE_BYTES) {
            return NextResponse.json(
                { error: `La imagen supera el tamano maximo de ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB} MB` },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let webpImage: Buffer | undefined;
        let avifImage: Buffer | undefined;

        if (format === 'webp' || format === 'both') {
            webpImage = await sharp(buffer)
                .webp({ quality: webpQuality })
                .toBuffer();
        }

        if (format === 'avif' || format === 'both') {
            avifImage = await sharp(buffer)
                .avif({ quality: avifQuality })
                .toBuffer();
        }

        const originalSize = buffer.length;
        const result: OptimizeResult = {
            message: 'Imagen optimizada correctamente',
            originalSize,
            originalFilename: file.name || 'imagen-original',
            webp: {
                size: 0,
                savings: '0%',
                data: '',
            },
        };

        if (webpImage) {
            const webpSize = webpImage.length;
            const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
            result.webp = {
                size: webpSize,
                savings: `${webpSavings}%`,
                data: `data:image/webp;base64,${webpImage.toString('base64')}`,
            };
        }

        if (avifImage) {
            const avifSize = avifImage.length;
            const avifSavings = ((originalSize - avifSize) / originalSize * 100).toFixed(2);
            result.avif = {
                size: avifSize,
                savings: `${avifSavings}%`,
                data: `data:image/avif;base64,${avifImage.toString('base64')}`,
            };
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
}
