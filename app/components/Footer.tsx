'use client';

import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 mt-16">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="mr-3 p-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-slate-400 text-sm">
                            Optimiza tus imágenes y fuentes y mejora el rendimiento de tu web.
                        </p>
                    </div>
                    <p className="text-slate-500 text-xs">
                        Creado con Next.js y Sharp
                    </p>
                </div>
            </div>
        </footer>
    );
}
