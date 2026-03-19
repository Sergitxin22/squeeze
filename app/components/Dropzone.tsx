'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface DropzoneProps {
    onImageSelected: (file: File) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onImageSelected }) => {
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];

            // Crear una URL de previsualización
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Llamar al callback con el archivo seleccionado
            onImageSelected(file);

            // Limpiar la URL de previsualización cuando el componente se desmonte
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [onImageSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
        },
        maxFiles: 1,
        multiple: false
    });

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
                {preview ? (
                    <div className="relative h-64 w-full">
                        <div className="absolute inset-0 rounded-lg overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-purple-900/20 z-10"></div>
                            <Image
                                src={preview}
                                alt="Vista previa"
                                fill
                                style={{ objectFit: 'contain' }}
                                className="rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-48">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center mb-2">
                            <PhotoIcon className="h-10 w-10 text-indigo-400" aria-hidden="true" />
                        </div>
                        <p className="mt-2 text-base text-slate-300 font-medium">
                            {isDragActive
                                ? 'Suelta la imagen aquí'
                                : 'Arrastra y suelta una imagen, o haz clic para seleccionar'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">PNG, JPG, JPEG, GIF, WEBP hasta 10MB</p>

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
