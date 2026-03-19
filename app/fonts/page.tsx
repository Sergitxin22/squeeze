'use client';

import React, { useState } from 'react';
import Header from '../components/Header';

export default function FontsPage() {
    const [fontName, setFontName] = useState('');
    const [selectedWeights, setSelectedWeights] = useState<number[]>([400]);
    const [fontFiles, setFontFiles] = useState<any[]>([]);

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
                setFontFiles(data.files || []);
                setFontCss(data.css || '');
            }
        } catch (err) {
            setError('Error al optimizar la fuente.');
        } finally {
            setDownloading(false);
        }
    };

    // Descargar archivo desde base64
    const downloadBase64 = (base64: string, filename: string, mime: string) => {
        const link = document.createElement('a');
        link.href = `data:${mime};base64,${base64}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Función para descargar todos los archivos con un pequeño retraso entre cada uno
    const downloadAllFiles = async () => {
        for (let i = 0; i < fontFiles.length; i++) {
            const file = fontFiles[i];
            downloadBase64(file.data, file.name, file.type);
            // Pequeño retraso para evitar problemas en algunos navegadores
            if (i < fontFiles.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
    };

    return (
        <div>
            <Header currentPage="fonts" />

            <div className="max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-lg p-8 border border-slate-800 mt-6">
                <div className="flex items-center justify-center mb-6">
                    <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Optimizar Fuentes</h1>
                </div>

                <p className="text-slate-400 text-center mb-6">
                    Optimiza y convierte fuentes web para mejorar el rendimiento de tu sitio
                </p>

                <form onSubmit={e => { e.preventDefault(); handleOptimizeFont(); }} className="flex flex-col gap-4 mb-8">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={fontName}
                            onChange={e => setFontName(e.target.value)}
                            placeholder="Nombre exacto de la fuente (ej: Roboto)"
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
                            ) : 'Optimizar y Descargar'}
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
                    <>
                        <div className="flex items-center mb-3 border-b border-slate-800 pb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <h3 className="text-lg font-semibold text-white">Archivos Generados ({fontFiles.length})</h3>
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
                            className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium flex items-center justify-center gap-2 shadow-md transition-all mb-6"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Descargar Todos los Formatos
                        </button>
                    </>
                )}

                {fontCss && !error && (
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mt-4">
                        <div className="flex items-center mb-2 text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-indigo-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                            </svg>
                            <span className="text-sm font-medium">CSS para incluir en tu sitio</span>
                        </div>
                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap bg-slate-900 p-3 rounded-md overflow-x-auto border border-slate-700">{fontCss}</pre>
                    </div>
                )}

                {error && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-4 mt-4 flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <span className="text-red-300">{error}</span>
                    </div>
                )}

                {!fontFiles.length && !error && (
                    <div className="text-center mt-8 text-slate-400 bg-slate-800/30 rounded-lg p-6 border border-dashed border-slate-700">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-500 mb-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                        <p>Ingresa el nombre exacto de una fuente de Google Fonts para empezar</p>
                        <p className="text-sm mt-2 text-slate-500">Por ejemplo: Roboto, Open Sans, Lato, Montserrat...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
