'use client';

import React from 'react';
import Image from 'next/image';

interface ImageComparisonProps {
    originalImage: string | null;
    optimizedImage: string | null;
    stats: {
        originalSize: number;
        optimizedSize: number;
        savings: string;
    } | null;
    format: string;
    webpImageUrl?: string | null;
    avifImageUrl?: string | null;
    webpStats?: { size: number; savings: string } | null;
    avifStats?: { size: number; savings: string } | null;
    originalFilename?: string;
    imageDimensions?: { width: number; height: number } | null;
}

const ImageComparison: React.FC<ImageComparisonProps> = ({
    originalImage,
    optimizedImage,
    stats,
    format,
    webpImageUrl,
    avifImageUrl,
    webpStats,
    avifStats,
    originalFilename,
    imageDimensions
}) => {

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadImage = (dataUrl: string, fileName: string) => {
        const link = document.createElement('a');
        link.href = dataUrl;

        // Determinar el formato de salida
        const format = dataUrl.includes('avif') ? '.avif' : dataUrl.includes('webp') ? '.webp' : '.jpg';

        // Si el nombre ya termina con la extensión correcta, usarlo tal cual
        if (fileName.toLowerCase().endsWith(format)) {
            link.download = fileName;
        } else {
            // Si no, remover cualquier extensión existente y añadir la correcta
            const nameWithoutExt = fileName.replace(/\.[^/.]+$/, "");
            link.download = nameWithoutExt + format;
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // No mostrar nada si no hay imagen original
    if (!originalImage) {
        return null;
    }

    // No mostrar nada si no se ha optimizado ninguna imagen
    if (!optimizedImage && !webpImageUrl && !avifImageUrl) {
        return null;
    }

    return (
        <div className="mt-10 w-full max-w-4xl mx-auto">
            <div className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800">
                <div className="flex items-center mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400 mr-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                    <h3 className="text-xl font-bold text-white">Comparación de Imágenes</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Imagen Original - siempre visible */}
                    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/50 shadow-md">
                        <div className="py-3 px-4 border-b border-slate-700 bg-slate-800 flex items-center justify-between">
                            <div className="flex flex-col">
                                <h4 className="font-medium text-slate-200">Original</h4>
                            </div>
                            {stats && (
                                <span className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300">
                                    {formatBytes(stats.originalSize)}
                                </span>
                            )}
                        </div>
                        <div className="relative h-56 w-full bg-slate-900">
                            <div className="absolute inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm z-10"></div>
                            <Image
                                src={originalImage}
                                alt="Imagen Original"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="z-20"
                            />
                        </div>
                        <div className="px-4 py-3">
                            <button
                                onClick={() => {
                                    if (originalImage) {
                                        const baseFilename = originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen';
                                        downloadImage(originalImage, baseFilename);
                                    }
                                }}
                                className="w-full px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Descargar Original
                            </button>
                        </div>
                    </div>

                    {/* Imagen WebP */}
                    {webpImageUrl && (
                        <div className="border border-indigo-900/70 rounded-xl overflow-hidden bg-indigo-950/30 shadow-md">
                            <div className="py-3 px-4 border-b border-indigo-900/70 bg-indigo-900/50 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></div>
                                    <h4 className="font-medium text-indigo-200">WebP</h4>
                                </div>
                                {webpStats && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 bg-indigo-900/80 rounded-full text-indigo-300">
                                            {formatBytes(webpStats.size)}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full border border-emerald-800/50">
                                            -{webpStats.savings}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="relative h-56 w-full bg-indigo-950/20">
                                <div className="absolute inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm z-10"></div>
                                <Image
                                    src={webpImageUrl}
                                    alt="Imagen WebP"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="z-20"
                                />
                            </div>
                            <div className="px-4 py-3">
                                <button
                                    onClick={() => {
                                        if (webpImageUrl) {
                                            const baseFilename = originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen';
                                            downloadImage(webpImageUrl, `${baseFilename}.webp`);
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Descargar WebP
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Imagen AVIF */}
                    {avifImageUrl && (
                        <div className="border border-emerald-900/70 rounded-xl overflow-hidden bg-emerald-950/30 shadow-md">
                            <div className="py-3 px-4 border-b border-emerald-900/70 bg-emerald-900/50 flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                                    <h4 className="font-medium text-emerald-200">AVIF</h4>
                                </div>
                                {avifStats && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs px-2 py-1 bg-emerald-900/80 rounded-full text-emerald-300">
                                            {formatBytes(avifStats.size)}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded-full border border-emerald-800/50">
                                            -{avifStats.savings}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="relative h-56 w-full bg-emerald-950/20">
                                <div className="absolute inset-0 bg-slate-900 bg-opacity-30 backdrop-blur-sm z-10"></div>
                                <Image
                                    src={avifImageUrl}
                                    alt="Imagen AVIF"
                                    fill
                                    style={{ objectFit: 'contain' }}
                                    className="z-20"
                                />
                            </div>
                            <div className="px-4 py-3">
                                <button
                                    onClick={() => {
                                        if (avifImageUrl) {
                                            const baseFilename = originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen';
                                            downloadImage(avifImageUrl, `${baseFilename}.avif`);
                                        }
                                    }}
                                    className="w-full px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Descargar AVIF
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón para descargar ambas imágenes + Estadísticas */}
                {(optimizedImage || webpImageUrl || avifImageUrl) && (
                    <div className="mt-8 space-y-6">
                        {/* Mostrar botón para descargar ambos formatos solo si ambos están disponibles */}
                        {webpImageUrl && avifImageUrl && (
                            <button
                                onClick={() => {
                                    if (webpImageUrl && avifImageUrl) {
                                        const baseFilename = originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen';
                                        downloadImage(webpImageUrl, `${baseFilename}.webp`);
                                        downloadImage(avifImageUrl, `${baseFilename}.avif`);
                                    }
                                }}
                                className="w-full md:w-auto md:mx-auto px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg text-base font-medium shadow-lg shadow-violet-900/20 hover:shadow-violet-900/30 transition-all flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                </svg>
                                Descargar WebP y AVIF
                            </button>
                        )}

                        <div className="mt-8 w-full">
                            <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-inner">
                                <h4 className="text-base font-semibold text-white mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                                    </svg>
                                    Resultados de Optimización
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Original - siempre visible */}
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-slate-400">Original</span>
                                            <span className="text-sm text-slate-300 font-medium">
                                                {stats?.originalSize ? formatBytes(stats.originalSize) : '-'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-1.5">
                                            <div className="bg-slate-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                                        </div>
                                    </div>

                                    {/* WebP - visible solo si hay datos de WebP */}
                                    {webpStats && webpImageUrl && (
                                        <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-900/50">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-indigo-300">WebP</span>
                                                <span className="text-sm text-indigo-200 font-medium">
                                                    {formatBytes(webpStats.size)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                <div className="bg-indigo-500 h-1.5 rounded-full"
                                                    style={{
                                                        width: stats?.originalSize
                                                            ? `${(webpStats.size / stats.originalSize) * 100}%`
                                                            : '0%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="mt-1.5 text-xs text-emerald-400">
                                                {webpStats.savings} menos que el original
                                            </div>
                                        </div>
                                    )}

                                    {/* AVIF - visible solo si hay datos de AVIF */}
                                    {avifStats && avifImageUrl && (
                                        <div className="bg-emerald-900/20 p-3 rounded-lg border border-emerald-900/50">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm text-emerald-300">AVIF</span>
                                                <span className="text-sm text-emerald-200 font-medium">
                                                    {formatBytes(avifStats.size)}
                                                </span>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-1.5">
                                                <div className="bg-emerald-500 h-1.5 rounded-full"
                                                    style={{
                                                        width: stats?.originalSize
                                                            ? `${(avifStats.size / stats.originalSize) * 100}%`
                                                            : '0%'
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="mt-1.5 text-xs text-emerald-400">
                                                {avifStats.savings} menos que el original
                                            </div>
                                        </div>
                                    )}

                                    {/* Ocupa una columna adicional si solo hay un formato */}
                                    {(!webpStats || !webpImageUrl || !avifStats || !avifImageUrl) && (
                                        <div className="hidden md:block"></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Código HTML para implementación */}
                {(webpImageUrl || avifImageUrl) && (
                    <div className="mt-8 p-5 border border-slate-700 rounded-xl bg-slate-800/50 shadow-inner">
                        <h4 className="text-base font-semibold text-white mb-4 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                            Código HTML para tu sitio web
                        </h4>

                        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 overflow-hidden">
                            <pre className="text-sm overflow-x-auto whitespace-pre-wrap text-slate-300 font-mono">
                                {`<picture>${avifImageUrl ? `
    <source srcset="./images/${originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen'}.avif" type="image/avif">` : ''}${webpImageUrl ? `
    <source srcset="./images/${originalFilename ? originalFilename.replace(/\.[^/.]+$/, "") : 'imagen'}.webp" type="image/webp">` : ''}
    <img src="./images/${originalFilename || 'imagen.jpg'}" alt="Descripción de la imagen" width="${imageDimensions?.width || 800}" height="${imageDimensions?.height || 800}">
</picture>`}
                            </pre>
                        </div>

                        <p className="text-sm text-slate-400 mt-4 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-indigo-400 flex-shrink-0 mt-0.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                            </svg>
                            <span>
                                Este código utiliza el elemento <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">{'<picture>'}</code> para mostrar la imagen optimizada
                                en navegadores modernos, con respaldo para navegadores más antiguos. Guarda las imágenes optimizadas en la carpeta "./images" de tu sitio web.
                            </span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageComparison;
