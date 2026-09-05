'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import Header from '../components/Header';

type FontFile = {
    name: string;
    type: string;
    data: string;
    size: number;
};

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

export default function FontsPage() {
    const [fontName, setFontName] = useState('');
    const [selectedWeights, setSelectedWeights] = useState<number[]>([400]);
    const [fontFiles, setFontFiles] = useState<FontFile[]>([]);
    const [packingZip, setPackingZip] = useState(false);

    const availableWeights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

    const toggleWeight = (weight: number) => {
        setSelectedWeights(prev =>
            prev.includes(weight)
                ? prev.filter(w => w !== weight)
                : [...prev, weight].sort()
        );
    };
    const [fontCss, setFontCss] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [cssCopied, setCssCopied] = useState(false);

    // Descargar y optimizar fuente usando la API
    const handleOptimizeFont = async () => {
        if (!fontName || selectedWeights.length === 0) return;
        setDownloading(true);
        setFontFiles([]);
        setFontCss('');
        setError('');
        try {
            const res = await fetch('/api/optimize-font', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    family: fontName,
                    weights: selectedWeights,
                    ital: false,
                    subset: 'latin',
                    display: 'swap',
                }),
            });
            const data = await res.json();
            if (data.error) {
                setError(data.error.includes('not found') || data.error.includes('not available') || data.error.includes('no encontrada')
                    ? `La fuente "${fontName}" no ha sido encontrada. Verifica que el nombre sea exacto y que esté disponible en Google Fonts.`
                    : data.error);
            } else {
                setFontFiles((data.files || []) as FontFile[]);
                setFontCss(data.css || '');
                setCssCopied(false);
            }
        } catch (err) {
            setError('Error al optimizar la fuente.');
        } finally {
            setDownloading(false);
        }
    };

    const downloadBase64 = (base64: string, filename: string, mime: string) => {
        const link = document.createElement('a');
        link.href = `data:${mime};base64,${base64}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadFontZip = async (files: FontFile[], family: string) => {
        const zip = new JSZip();
        for (const file of files) {
            zip.file(file.name, file.data, { base64: true });
        }

        const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        const zipName = `${family.trim().toLowerCase().replace(/\s+/g, '-') || 'fuentes'}.zip`;
        downloadBlob(zipBlob, zipName);
    };

    const downloadAllFiles = async () => {
        if (!fontFiles.length || packingZip) return;
        setPackingZip(true);
        try {
            await downloadFontZip(fontFiles, fontName);
        } finally {
            setPackingZip(false);
        }
    };

    const copyCss = async () => {
        if (!fontCss) return;
        try {
            await navigator.clipboard.writeText(fontCss);
            setCssCopied(true);
            window.setTimeout(() => setCssCopied(false), 2000);
        } catch {
            setCssCopied(false);
        }
    };

    return (
        <div>
            <Header currentPage="fonts" />

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <div className="inline-flex items-center justify-center p-2 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-indigo-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            Optimiza tus fuentes para la web
                        </h2>
                        <p className="mt-2 text-slate-400 text-lg">
                            Obtén WOFF2, WOFF y TTF desde Google Fonts y el CSS listo para pegar en tu proyecto.
                        </p>
                    </div>

                    <form onSubmit={e => { e.preventDefault(); handleOptimizeFont(); }} className="w-full max-w-xl mx-auto flex flex-col gap-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={fontName}
                                onChange={e => setFontName(e.target.value)}
                                placeholder="Nombre exacto de la fuente (ej: Roboto)"
                                maxLength={63}
                                className="flex-1 px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all whitespace-nowrap"
                                disabled={downloading || selectedWeights.length === 0}
                            >
                                {downloading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Procesando...
                                    </span>
                                ) : 'Optimizar'}
                            </button>
                        </div>

                        <div>
                            <p className="text-sm text-slate-400 mb-2">Grosores (Weights):</p>
                            <div className="flex flex-wrap gap-2">
                                {availableWeights.map(weight => (
                                    <button
                                        key={weight}
                                        type="button"
                                        onClick={() => toggleWeight(weight)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${selectedWeights.includes(weight)
                                            ? 'bg-indigo-600 text-white border border-indigo-500 shadow-sm'
                                            : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                            }`}
                                    >
                                        {weight === 400 ? '400 (Regular)' : weight === 700 ? '700 (Bold)' : weight}
                                    </button>
                                ))}
                            </div>
                            {selectedWeights.length === 0 && (
                                <p className="text-rose-400 text-xs mt-2">Debes seleccionar al menos un grosor.</p>
                            )}
                        </div>
                    </form>

                    {fontFiles.length > 0 && (
                        <div className="w-full max-w-xl mx-auto">
                            <div className="flex items-center mb-3 border-b border-slate-800 pb-2">
                                <h3 className="text-lg font-semibold text-white">Archivos generados ({fontFiles.length})</h3>
                            </div>

                            <div className="flex gap-3 mb-6 flex-wrap bg-slate-800/50 p-4 rounded-lg">
                                {fontFiles.map(file => {
                                    const ext = file.name.split('.').pop()?.toUpperCase() || '';
                                    const nameParts = file.name.split('-');
                                    const weight = nameParts.length >= 2 ? nameParts[nameParts.length - 1].split('.')[0] : '400';

                                    return (
                                        <button
                                            key={file.name}
                                            onClick={() => downloadBase64(file.data, file.name, file.type)}
                                            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium flex items-center gap-2 border border-slate-700 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            {ext} - {weight}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={downloadAllFiles}
                                disabled={packingZip}
                                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium flex items-center justify-center gap-2 shadow-md transition-all mb-6 disabled:opacity-60"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                {packingZip ? 'Preparando ZIP...' : 'Descargar ZIP'}
                            </button>
                        </div>
                    )}

                    {fontCss && !error && (
                        <div className="w-full max-w-xl mx-auto bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between gap-3 mb-2 text-slate-300">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-indigo-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                                    </svg>
                                    <span className="text-sm font-medium">CSS para incluir en tu sitio</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyCss}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 transition-colors whitespace-nowrap"
                                >
                                    {cssCopied ? 'Copiado' : 'Copiar CSS'}
                                </button>
                            </div>
                            <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-3 rounded-md overflow-x-auto border border-slate-700">{fontCss}</pre>
                        </div>
                    )}

                    {error && (
                        <div className="w-full max-w-xl mx-auto bg-red-900/30 border border-red-700 rounded-lg p-4 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                            <span className="text-red-300">{error}</span>
                        </div>
                    )}

                    {!fontFiles.length && !error && (
                        <div className="w-full max-w-xl mx-auto text-center text-slate-400 bg-slate-800/30 rounded-lg p-6 border border-dashed border-slate-700">
                            <p>Ingresa el nombre exacto de una fuente de Google Fonts para empezar</p>
                            <p className="text-sm mt-2 text-slate-500">Por ejemplo: Roboto, Open Sans, Lato, Montserrat...</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
