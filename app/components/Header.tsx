'use client';

import Link from 'next/link';
import Logo from './Logo';

type HeaderProps = {
    currentPage: 'images' | 'fonts';
};

export default function Header({ currentPage }: HeaderProps) {
    return (
        <header className="bg-slate-900 shadow-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <Logo size={36} className="shrink-0 shadow-md shadow-indigo-950/40 transition-transform duration-300 group-hover:scale-105" />
                    <h1 className="text-2xl font-bold text-white tracking-tight">Squeeze</h1>
                </Link>
                <nav>
                    {currentPage === 'images' ? (
                        <Link
                            href="/fonts"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all duration-300"
                        >
                            Optimizar Fuentes
                        </Link>
                    ) : (
                        <Link
                            href="/"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all duration-300"
                        >
                            Optimizar Imagenes
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}
