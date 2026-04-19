import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import sharp from 'sharp';

const MAX_FILES = 100;

const getBaseName = (filename: string): string => {
    const dotIndex = filename.lastIndexOf('.');
    return dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
};

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        const format = (formData.get('format') as string) || 'webp';
        const webpQuality = parseInt((formData.get('webpQuality') as string) || '75', 10);
        const avifQuality = parseInt((formData.get('avifQuality') as string) || '50', 10);

        if (!files.length) {
            return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `El maximo permitido es ${MAX_FILES} archivos por lote` },
                { status: 400 }
            );
        }

        const zip = new JSZip();
        const errors: string[] = [];
        let processedCount = 0;

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                errors.push(`${file.name}: archivo no soportado`);
                continue;
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            const baseName = getBaseName(file.name || `imagen-${processedCount + 1}`);

            try {
                if (format === 'webp' || format === 'both') {
                    const webpBuffer = await sharp(buffer)
                        .webp({ quality: webpQuality })
                        .toBuffer();
                    zip.file(`${baseName}.webp`, webpBuffer);
                }

                if (format === 'avif' || format === 'both') {
                    const avifBuffer = await sharp(buffer)
                        .avif({ quality: avifQuality })
                        .toBuffer();
                    zip.file(`${baseName}.avif`, avifBuffer);
                }

                processedCount += 1;
            } catch {
                errors.push(`${file.name}: no se pudo procesar`);
            }
        }

        if (errors.length) {
            zip.file('errores.txt', errors.join('\n'));
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
        const failedCount = files.length - processedCount;
        const zipFilename = `imagenes-optimizadas-${Date.now()}.zip`;

        return new NextResponse(zipBuffer, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${zipFilename}"`,
                'x-total-count': String(files.length),
                'x-processed-count': String(processedCount),
                'x-failed-count': String(failedCount),
            },
        });
    } catch (error) {
        console.error('Error al procesar el lote de imagenes:', error);
        return NextResponse.json({ error: 'Error al procesar el lote de imagenes' }, { status: 500 });
    }
}
