'use client';

import Header from '../components/Header';
import ImageOptimizer from '../components/ImageOptimizer';

export default function ImagesPage() {
    return (
        <div>
            <Header currentPage="images" />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <ImageOptimizer />
            </main>
        </div>
    );
}
