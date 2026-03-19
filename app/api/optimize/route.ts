import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

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
    try {
        // Obtenemos el FormData de la solicitud
        const formData = await request.formData();
        const file = formData.get('file') as File;

        // Obtenemos los parámetros de formato y calidad
        const format = formData.get('format') as string || 'webp'; // 'webp', 'avif', o 'both'
        const webpQuality = parseInt(formData.get('webpQuality') as string) || 75;
        const avifQuality = parseInt(formData.get('avifQuality') as string) || 50;

        if (!file) {
            return NextResponse.json({ error: 'No se proporcionó ningún archivo' }, { status: 400 });
        }

        // Convertimos el archivo a un Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Procesamos la imagen con sharp según el formato solicitado
        let webpImage;
        let avifImage;

        if (format === 'webp' || format === 'both') {
            // Procesamos WebP
            webpImage = await sharp(buffer)
                .webp({ quality: webpQuality })
                .toBuffer();
        }

        if (format === 'avif' || format === 'both') {
            // Procesamos AVIF
            avifImage = await sharp(buffer)
                .avif({ quality: avifQuality })
                .toBuffer();
        }

        // Calculamos los tamaños y ahorros
        const originalSize = buffer.length;
        let result: OptimizeResult = {
            message: 'Imagen optimizada correctamente',
            originalSize,
            originalFilename: (file as any).name || 'imagen-original',
            webp: {
                size: 0,
                savings: '0%',
                data: ''
            }
        };

        // Si procesamos WebP, añadimos su información
        if (webpImage) {
            const webpSize = webpImage.length;
            const webpSavings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);
            result.webp = {
                size: webpSize,
                savings: `${webpSavings}%`,
                data: `data:image/webp;base64,${webpImage.toString('base64')}`
            };
        }

        // Si procesamos AVIF, añadimos su información
        if (avifImage) {
            const avifSize = avifImage.length;
            const avifSavings = ((originalSize - avifSize) / originalSize * 100).toFixed(2);
            result.avif = {
                size: avifSize,
                savings: `${avifSavings}%`,
                data: `data:image/avif;base64,${avifImage.toString('base64')}`
            };
        }

        // Devolvemos la(s) imagen(es) procesada(s)
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error al procesar la imagen:', error);
        return NextResponse.json({ error: 'Error al procesar la imagen' }, { status: 500 });
    }
}
