'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface DropzoneProps {
    onImagesSelected: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImagesSelected }) => {
    const [previews, setPreviews] = useState<string[]>([]);
    const [selectedCount, setSelectedCount] = useState<number>(0);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));

            const nextPreviews = acceptedFiles.slice(0, 6).map((file) => URL.createObjectURL(file));
            setPreviews(nextPreviews);
            setSelectedCount(acceptedFiles.length);

            // Llamar al callback con los archivos seleccionados
            onImagesSelected(acceptedFiles);
        }
    }, [onImagesSelected, previews]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 100,
        multiple: true
    });

    React.useEffect(() => {
        return () => {
            previews.forEach((previewUrl) => URL.revokeObjectURL(previewUrl));
        };
    }, [previews]);

    return (
        <div className="w-full max-w-xl mx-auto">
            <div
                {...getRootProps()}
                className={`p-6 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 shadow-md
                ${isDragActive
                        ? 'border-indigo-500 bg-indigo-950/30 scale-[1.02]'
                        : 'border-slate-700 bg-slate-900/50 hover:border-indigo-500/70 hover:bg-slate-800/50'}
                `}
            >
                <input {...getInputProps()} />
                {previews.length > 0 ? (
                    <div className="space-y-3">
                        <div className="text-sm text-slate-300 font-medium">
                            {selectedCount} {selectedCount === 1 ? 'imagen seleccionada' : 'imagenes seleccionadas'}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {previews.map((previewUrl, index) => (
                                <div key={`${previewUrl}-${index}`} className="relative h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50">
                                    <Image
                                        src={previewUrl}
                                        alt={`Vista previa ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                    />
                                </div>
                            ))}
                        </div>
                        {selectedCount > previews.length && (
                            <p className="text-xs text-slate-400">
                                Mostrando {previews.length} de {selectedCount} previsualizaciones.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center mb-2">
                            <PhotoIcon className="h-10 w-10 text-indigo-400" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-base text-slate-300 font-medium">
                            {isDragActive
                                ? 'Suelta las imagenes aqui'
                                : 'Arrastra y suelta imagenes, o haz clic para seleccionar'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, GIF, WEBP. Hasta 100 archivos por lote.</p>

                        {/* <div className="mt-4 p-2 rounded-lg bg-slate-800/80 inline-flex items-center text-xs text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-indigo-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                            </svg>
                            Las imágenes se procesan localmente
                        </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dropzone;
