'use client';

import React from 'react';
import Logo from './Logo';

export default function Footer() {
    return (
        <footer className="bg-slate-900 border-t border-slate-800 mt-16">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center mb-4 md:mb-0">
                        <Logo size={28} className="mr-3 shrink-0" />
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
