'use client';

import React from 'react';

interface OptimizationControlsProps {
    format: string; // 'webp', 'avif', 'both'
    webpQuality: number;
    avifQuality: number;
    mode: 'single' | 'batch';
    selectedCount: number;
    onFormatChange: (format: string) => void;
    onWebpQualityChange: (quality: number) => void;
    onAvifQualityChange: (quality: number) => void;
    onOptimize: () => void;
    isProcessing: boolean;
    isImageSelected: boolean;
}

const OptimizationControls: React.FC<OptimizationControlsProps> = ({
    format,
    webpQuality,
    avifQuality,
    mode,
    selectedCount,
    onFormatChange,
    onWebpQualityChange,
    onAvifQualityChange,
    onOptimize,
    isProcessing,
    isImageSelected
}) => {
    return (
        <div className="mt-8 w-full max-w-xl mx-auto bg-slate-900 p-6 rounded-xl shadow-md border border-slate-800">
            <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-indigo-400 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
                <h3 className="text-lg font-semibold text-white">Opciones de Optimización</h3>
            </div>

            <div className="space-y-6">
                {/* Selector de formato */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="flex items-center text-sm font-medium text-slate-300 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-indigo-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                        </svg>
                        Formato de salida
                    </label>

                    <div className="flex flex-wrap gap-3 bg-slate-900/50 p-3 rounded-lg">

                        <label className="inline-flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-800 transition-all">
                            <input
                                type="radio"
                                value="both"
                                checked={format === 'both'}
                                onChange={() => onFormatChange('both')}
                                className="h-4 w-4 text-indigo-600 border-slate-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                            />
                            <span className="ml-2 text-sm text-slate-300">Ambos formatos</span>
                        </label>
                        <label className="inline-flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-800 transition-all">
                            <input
                                type="radio"
                                value="webp"
                                checked={format === 'webp'}
                                onChange={() => onFormatChange('webp')}
                                className="h-4 w-4 text-green-600 border-slate-600 focus:ring-green-500 focus:ring-offset-slate-900"
                            />
                            <span className="ml-2 text-sm text-slate-300">Solo WebP</span>
                        </label>
                        <label className="inline-flex items-center px-3 py-2 rounded-md cursor-pointer hover:bg-slate-800 transition-all">
                            <input
                                type="radio"
                                value="avif"
                                checked={format === 'avif'}
                                onChange={() => onFormatChange('avif')}
                                className="h-4 w-4 text-purple-600 border-slate-600 focus:ring-purple-500 focus:ring-offset-slate-900"
                            />
                            <span className="ml-2 text-sm text-slate-300">Solo AVIF</span>
                        </label>
                    </div>
                </div>

                {/* Controles de calidad */}
                <div className="space-y-4">
                    {/* Control de calidad WebP */}
                    <div className={`bg-slate-800/50 p-4 rounded-lg border border-slate-700 transition-opacity ${format === 'avif' ? 'opacity-50' : ''
                        }`}>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="webp-quality" className="flex items-center text-sm font-medium text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-green-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                </svg>
                                Calidad WebP: <span className="ml-1 text-white font-semibold">{webpQuality}%</span>
                                {format === 'avif' && <span className="ml-2 text-xs text-slate-500">(deshabilitado)</span>}
                            </label>
                            <span className="text-xs py-1 px-2 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                                {webpQuality < 30 ? '💾 Máxima compresión' :
                                    webpQuality > 70 ? '✨ Máxima calidad' :
                                        '⚖️ Equilibrado'}
                            </span>
                        </div>

                        <div className="mt-3">
                            <input
                                type="range"
                                id="webp-quality"
                                min="10"
                                max="100"
                                step="5"
                                value={webpQuality}
                                onChange={(e) => onWebpQualityChange(Number(e.target.value))}
                                disabled={format === 'avif'}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundImage: format === 'avif' ? 'none' : `linear-gradient(to right, #10b981, #34d399 ${(webpQuality - 10) * 100 / 90}%, #1e293b ${(webpQuality - 10) * 100 / 90}%)`,
                                    height: '8px'
                                }}
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                                <span>Menor tamaño</span>
                                <span>Mayor calidad</span>
                            </div>
                        </div>
                    </div>

                    {/* Control de calidad AVIF */}
                    <div className={`bg-slate-800/50 p-4 rounded-lg border border-slate-700 transition-opacity ${format === 'webp' ? 'opacity-50' : ''
                        }`}>
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor="avif-quality" className="flex items-center text-sm font-medium text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2 text-purple-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21a48.25 48.25 0 0 1-8.135-1.687c-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                                </svg>
                                Calidad AVIF: <span className="ml-1 text-white font-semibold">{avifQuality}%</span>
                                {format === 'webp' && <span className="ml-2 text-xs text-slate-500">(deshabilitado)</span>}
                            </label>
                            <span className="text-xs py-1 px-2 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                                {avifQuality < 30 ? '💾 Máxima compresión' :
                                    avifQuality > 70 ? '✨ Máxima calidad' :
                                        '⚖️ Equilibrado'}
                            </span>
                        </div>

                        <div className="mt-3">
                            <input
                                type="range"
                                id="avif-quality"
                                min="10"
                                max="100"
                                step="5"
                                value={avifQuality}
                                onChange={(e) => onAvifQualityChange(Number(e.target.value))}
                                disabled={format === 'webp'}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    backgroundImage: format === 'webp' ? 'none' : `linear-gradient(to right, #a855f7, #c084fc ${(avifQuality - 10) * 100 / 90}%, #1e293b ${(avifQuality - 10) * 100 / 90}%)`,
                                    height: '8px'
                                }}
                            />
                            <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                                <span>Menor tamaño</span>
                                <span>Mayor calidad</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Botón de optimización */}
            <div className="mt-6">
                <button
                    onClick={onOptimize}
                    disabled={!isImageSelected || isProcessing}
                    className={`w-full py-3 px-4 rounded-lg text-white text-base font-medium transition-all duration-300 flex items-center justify-center
                        ${!isImageSelected || isProcessing
                            ? 'bg-slate-700 cursor-not-allowed opacity-70'
                            : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md hover:shadow-indigo-900/30'}
                    `}
                >
                    {isProcessing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {mode === 'batch' ? 'Optimizando lote...' : 'Optimizando...'}
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            {mode === 'batch' ? `Optimizar ${selectedCount} imagenes` : 'Optimizar Imagen'}
                        </>
                    )}
                </button>

                {isImageSelected && !isProcessing && (
                    <p className="mt-2 text-center text-xs text-slate-500">
                        {format === 'both' ?
                            `${mode === 'batch' ? `Se procesaran ${selectedCount} imagenes` : 'La imagen se procesara'} con WebP al ${webpQuality}% y AVIF al ${avifQuality}% de calidad` :
                            format === 'webp' ?
                                `${mode === 'batch' ? `Se procesaran ${selectedCount} imagenes` : 'La imagen se procesara'} con formato WebP al ${webpQuality}% de calidad` :
                                `${mode === 'batch' ? `Se procesaran ${selectedCount} imagenes` : 'La imagen se procesara'} con formato AVIF al ${avifQuality}% de calidad`
                        }
                    </p>
                )}
            </div>
        </div>
    );
};

export default OptimizationControls;
