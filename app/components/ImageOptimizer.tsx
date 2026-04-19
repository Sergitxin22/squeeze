'use client';

import React, { useState, useEffect } from 'react';
import Dropzone from './Dropzone';
import OptimizationControls from './OptimizationControls';
import ImageComparison from './ImageComparison';

type BatchSummary = {
    totalCount: number;
    processedCount: number;
    failedCount: number;
    zipFilename: string;
};

const ImageOptimizer: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [mode, setMode] = useState<'single' | 'batch'>('single');
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [optimizedImageUrl, setOptimizedImageUrl] = useState<string | null>(null);
    const [webpImageUrl, setWebpImageUrl] = useState<string | null>(null);
    const [avifImageUrl, setAvifImageUrl] = useState<string | null>(null);
    const [format, setFormat] = useState<string>('both'); // 'webp', 'avif', 'both'
    const [webpQuality, setWebpQuality] = useState<number>(75);
    const [avifQuality, setAvifQuality] = useState<number>(50);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [originalFilename, setOriginalFilename] = useState<string>('imagen');
    const [imageDimensions, setImageDimensions] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const [stats, setStats] = useState<{
        originalSize: number;
        optimizedSize: number;
        savings: string;
    } | null>(null);
    const [webpStats, setWebpStats] = useState<{
        size: number;
        savings: string;
    } | null>(null);
    const [avifStats, setAvifStats] = useState<{
        size: number;
        savings: string;
    } | null>(null);
    const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
    const [batchZipBlob, setBatchZipBlob] = useState<Blob | null>(null);

    // Limpiar URLs al desmontar el componente
    useEffect(() => {
        return () => {
            if (originalImageUrl) {
                URL.revokeObjectURL(originalImageUrl);
            }
        };
    }, [originalImageUrl]);

    const downloadBlob = (blob: Blob, fileName: string) => {
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
    };

    const handleImagesSelected = (files: File[]) => {
        if (!files.length) {
            return;
        }

        const firstFile = files[0];

        // Limpiar la URL anterior si existe para evitar memory leaks
        if (originalImageUrl) {
            URL.revokeObjectURL(originalImageUrl);
        }

        setSelectedFiles(files);
        setMode(files.length > 1 ? 'batch' : 'single');
        setOptimizedImageUrl(null);
        setWebpImageUrl(null);
        setAvifImageUrl(null);
        setStats(null);
        setWebpStats(null);
        setAvifStats(null);
        setImageDimensions(null);
        setBatchSummary(null);
        setBatchZipBlob(null);

        // Crear URL para la imagen original
        const objectUrl = URL.createObjectURL(firstFile);
        setOriginalImageUrl(objectUrl);

        // Establecer nombre del archivo
        setOriginalFilename(firstFile.name?.split('.').slice(0, -1).join('.') || 'imagen');

        // Extraer dimensiones de la imagen
        const img = new Image();
        img.onload = () => {
            setImageDimensions({
                width: img.width,
                height: img.height
            });
            // No eliminamos la URL porque la necesitamos para mostrar la imagen original
        };
        img.src = objectUrl;
    };

    const handleFormatChange = (newFormat: string) => {
        setFormat(newFormat);
        // Resetear la imagen optimizada si se cambia el formato
        if (optimizedImageUrl) {
            setOptimizedImageUrl(null);
            setStats(null);
        }
    };

    const handleWebpQualityChange = (newQuality: number) => {
        setWebpQuality(newQuality);
        // Resetear las imágenes optimizadas si se cambia la calidad
        if (optimizedImageUrl || webpImageUrl || avifImageUrl) {
            setOptimizedImageUrl(null);
            setWebpImageUrl(null);
            setAvifImageUrl(null);
            setStats(null);
            setWebpStats(null);
            setAvifStats(null);
        }
    };

    const handleAvifQualityChange = (newQuality: number) => {
        setAvifQuality(newQuality);
        // Resetear las imágenes optimizadas si se cambia la calidad
        if (optimizedImageUrl || webpImageUrl || avifImageUrl) {
            setOptimizedImageUrl(null);
            setWebpImageUrl(null);
            setAvifImageUrl(null);
            setStats(null);
            setWebpStats(null);
            setAvifStats(null);
        }
    };

    const handleOptimize = async () => {
        if (!selectedFiles.length) return;

        if (mode === 'batch') {
            await handleOptimizeBatch();
            return;
        }

        const selectedFile = selectedFiles[0];

        setIsProcessing(true);

        // Limpiar todas las imágenes optimizadas anteriores antes de procesar
        setOptimizedImageUrl(null);
        setWebpImageUrl(null);
        setAvifImageUrl(null);
        setStats(null);
        setWebpStats(null);
        setAvifStats(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('format', format);
            formData.append('webpQuality', webpQuality.toString());
            formData.append('avifQuality', avifQuality.toString());

            const response = await fetch('/api/optimize', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al optimizar la imagen');
            }

            const data = await response.json();

            // Procesar WebP si está disponible, limpiar si no
            if (data.webp && data.webp.data) {
                setWebpImageUrl(data.webp.data);
                setWebpStats({
                    size: data.webp.size,
                    savings: data.webp.savings
                });
            } else {
                setWebpImageUrl(null);
                setWebpStats(null);
            }

            // Procesar AVIF si está disponible, limpiar si no
            if (data.avif && data.avif.data) {
                setAvifImageUrl(data.avif.data);
                setAvifStats({
                    size: data.avif.size,
                    savings: data.avif.savings
                });
            } else {
                setAvifImageUrl(null);
                setAvifStats(null);
            }

            // Establecer la imagen principal para la comparación
            if (format === 'both' || format === 'webp') {
                if (data.webp && data.webp.data) {
                    setOptimizedImageUrl(data.webp.data);
                    setStats({
                        originalSize: data.originalSize,
                        optimizedSize: data.webp.size,
                        savings: data.webp.savings,
                    });
                }
            } else if (format === 'avif') {
                if (data.avif && data.avif.data) {
                    setOptimizedImageUrl(data.avif.data);
                    setStats({
                        originalSize: data.originalSize,
                        optimizedSize: data.avif.size,
                        savings: data.avif.savings,
                    });
                }
            }

            // Guardamos el nombre original
            setOriginalFilename(data.originalFilename || originalFilename);

        } catch (error) {
            console.error('Error al optimizar la imagen:', error);
            alert('Ha ocurrido un error al optimizar la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOptimizeBatch = async () => {
        if (!selectedFiles.length) return;

        setIsProcessing(true);
        setBatchSummary(null);
        setBatchZipBlob(null);

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append('files', file);
            });
            formData.append('format', format);
            formData.append('webpQuality', webpQuality.toString());
            formData.append('avifQuality', avifQuality.toString());

            const response = await fetch('/api/optimize-batch', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al optimizar el lote de imagenes');
            }

            const processedCount = parseInt(response.headers.get('x-processed-count') || '0', 10);
            const totalCount = parseInt(response.headers.get('x-total-count') || String(selectedFiles.length), 10);
            const failedCount = parseInt(response.headers.get('x-failed-count') || '0', 10);
            const disposition = response.headers.get('content-disposition') || '';
            const match = disposition.match(/filename="(.+)"/);
            const zipFilename = match?.[1] || `imagenes-optimizadas-${Date.now()}.zip`;

            const zipBlob = await response.blob();
            setBatchZipBlob(zipBlob);
            setBatchSummary({
                totalCount,
                processedCount,
                failedCount,
                zipFilename,
            });

            downloadBlob(zipBlob, zipFilename);
        } catch (error) {
            console.error('Error al optimizar el lote:', error);
            alert('Ha ocurrido un error al optimizar el lote de imagenes. Intentalo de nuevo.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Instrucciones */}
            <div className="text-center max-w-2xl mx-auto mb-10">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-indigo-400">
                        <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                    Optimiza tus imágenes para la web
                </h2>
                <p className="mt-2 text-slate-400 text-lg">
                    Sube una o hasta 100 imagenes de golpe, selecciona calidad y descarga
                    todas optimizadas en WebP y AVIF para mejorar el rendimiento de tu sitio.
                </p>
                {/* <div className="mt-4 inline-flex items-center text-sm px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1.5 text-indigo-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    Tu privacidad es importante: todas las imágenes se procesan localmente
                </div> */}
            </div>

            {/* Área de arrastrar y soltar */}
            <Dropzone onImagesSelected={handleImagesSelected} />

            {selectedFiles.length > 1 && (
                <div className="w-full max-w-xl mx-auto flex rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                    <button
                        onClick={() => setMode('single')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${mode === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        Modo individual (primera imagen)
                    </button>
                    <button
                        onClick={() => setMode('batch')}
                        className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${mode === 'batch' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                            }`}
                    >
                        Modo lote ({selectedFiles.length} imagenes)
                    </button>
                </div>
            )}

            {/* Controles de optimización */}
            {originalImageUrl && (
                <OptimizationControls
                    format={format}
                    webpQuality={webpQuality}
                    avifQuality={avifQuality}
                    mode={mode}
                    selectedCount={selectedFiles.length}
                    onFormatChange={handleFormatChange}
                    onWebpQualityChange={handleWebpQualityChange}
                    onAvifQualityChange={handleAvifQualityChange}
                    onOptimize={handleOptimize}
                    isProcessing={isProcessing}
                    isImageSelected={selectedFiles.length > 0}
                />
            )}

            {mode === 'batch' && batchSummary && (
                <div className="w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Resultado del lote</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                        <div className="rounded-lg bg-slate-800 border border-slate-700 p-3">
                            <p className="text-xs text-slate-400">Enviadas</p>
                            <p className="text-xl font-semibold text-white">{batchSummary.totalCount}</p>
                        </div>
                        <div className="rounded-lg bg-emerald-950/30 border border-emerald-900/50 p-3">
                            <p className="text-xs text-emerald-300">Procesadas</p>
                            <p className="text-xl font-semibold text-emerald-200">{batchSummary.processedCount}</p>
                        </div>
                        <div className="rounded-lg bg-rose-950/30 border border-rose-900/50 p-3">
                            <p className="text-xs text-rose-300">Fallidas</p>
                            <p className="text-xl font-semibold text-rose-200">{batchSummary.failedCount}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (batchZipBlob) {
                                downloadBlob(batchZipBlob, batchSummary.zipFilename);
                            }
                        }}
                        disabled={!batchZipBlob}
                        className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg text-sm font-medium transition-all"
                    >
                        Descargar ZIP nuevamente
                    </button>
                </div>
            )}

            {/* Comparación de imágenes */}
            {mode === 'single' && (
                <ImageComparison
                    originalImage={originalImageUrl}
                    optimizedImage={optimizedImageUrl}
                    stats={stats}
                    format={format === 'both' ? 'webp' : format}
                    webpImageUrl={webpImageUrl}
                    avifImageUrl={avifImageUrl}
                    webpStats={webpStats}
                    avifStats={avifStats}
                    originalFilename={originalFilename}
                    imageDimensions={imageDimensions}
                />
            )}
        </div>
    );
};

export default ImageOptimizer;
