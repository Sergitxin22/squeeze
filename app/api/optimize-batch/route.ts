import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import sharp from 'sharp';
import {
    MAX_BATCH_BYTES,
    MAX_FILES,
    MAX_FILE_SIZE_BYTES,
    clampQuality,
    checkRateLimit,
    isAllowedImage,
    parseOutputFormat,
    safeZipBaseName,
} from '../../../utils/apiGuards';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    const limited = checkRateLimit(request, 'optimize-batch', 'RATE_LIMIT_BATCH_PER_MIN');
    if (limited) {
        return limited;
    }

    try {
        const formData = await request.formData();
        const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

        const format = parseOutputFormat(formData.get('format'));
        const webpQuality = clampQuality(formData.get('webpQuality'), 75);
        const avifQuality = clampQuality(formData.get('avifQuality'), 50);

        if (!files.length) {
            return NextResponse.json({ error: 'No se proporcionaron archivos' }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json(
                { error: `El maximo permitido es ${MAX_FILES} archivos por lote` },
                { status: 400 }
            );
        }

        const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
        if (MAX_BATCH_BYTES && totalBytes > MAX_BATCH_BYTES) {
            return NextResponse.json(
                { error: `El lote supera el tamano maximo de ${process.env.NEXT_PUBLIC_MAX_BATCH_SIZE_MB} MB` },
                { status: 400 }
            );
        }

        const zip = new JSZip();
        const errors: string[] = [];
        const usedNames = new Set<string>();
        let processedCount = 0;

        for (const file of files) {
            if (!isAllowedImage(file)) {
                errors.push(`${file.name}: archivo no soportado`);
                continue;
            }

            if (MAX_FILE_SIZE_BYTES && file.size > MAX_FILE_SIZE_BYTES) {
                errors.push(`${file.name}: supera el tamano maximo de ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB} MB`);
                continue;
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            let baseName = safeZipBaseName(file.name || `imagen-${processedCount + 1}`, `imagen-${processedCount + 1}`);
            let uniqueName = baseName;
            let suffix = 1;
            while (usedNames.has(uniqueName)) {
                uniqueName = `${baseName}-${suffix}`;
                suffix += 1;
            }
            usedNames.add(uniqueName);

            try {
                if (format === 'webp' || format === 'both') {
                    const webpBuffer = await sharp(buffer)
                        .webp({ quality: webpQuality })
                        .toBuffer();
                    zip.file(`${uniqueName}.webp`, webpBuffer);
                }

                if (format === 'avif' || format === 'both') {
                    const avifBuffer = await sharp(buffer)
                        .avif({ quality: avifQuality })
                        .toBuffer();
                    zip.file(`${uniqueName}.avif`, avifBuffer);
                }

                processedCount += 1;
            } catch {
                errors.push(`${file.name}: no se pudo procesar`);
            }
        }

        if (errors.length) {
            zip.file('errores.txt', errors.join('\n'));
        }

        const zipBuffer = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
        const zipArrayBuffer = Uint8Array.from(zipBuffer).buffer;
        const failedCount = files.length - processedCount;
        const zipFilename = `imagenes-optimizadas-${Date.now()}.zip`;

        return new NextResponse(zipArrayBuffer, {
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
