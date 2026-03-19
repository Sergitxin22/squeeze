'use client';

import Link from 'next/link';

type HeaderProps = {
    currentPage: 'images' | 'fonts';
};

export default function Header({ currentPage }: HeaderProps) {
    return (
        <header className="bg-slate-900 shadow-md border-b border-slate-800">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center group">
                    <div className="mr-3 p-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                            <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight">Squeeze</h1>
                        <p className="text-slate-400 text-sm mt-1">
                        </p>
                    </div>
                </Link>
                <nav>
                    {currentPage === 'images' ? (
                        <Link
                            href="/fonts"
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all duration-300"
                        >
                            Optimizar Fuentes
                        </Link>
                    ) : <Link
                        href=".."
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-medium shadow-md transition-all duration-300"
                    >
                        Optimizar Imagenes
                    </Link>}
                </nav>
            </div>
        </header>
    );
}
