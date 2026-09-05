'use client';

import ImageOptimizer from './components/ImageOptimizer';
import Header from './components/Header';

export default function Home() {
  return (
    <div>
      <Header currentPage="images" />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <ImageOptimizer />
      </main>
    </div>
  );
}
