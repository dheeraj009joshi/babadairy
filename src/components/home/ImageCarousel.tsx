'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function ImageCarousel() {
  const { settings } = useSettings();
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  const carouselImages = settings.carouselImages
    .filter((src) => src && src.trim() !== '')
    .map((src, index) => ({
      id: index,
      src,
      alt: `Product ${index + 1}`,
    }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleImageError = (index: number) => {
    console.error(`Failed to load carousel image at index ${index}:`, carouselImages[index]?.src);
    setFailedImages(prev => new Set(prev).add(index));
  };

  const validImages = carouselImages.filter((_, index) => !failedImages.has(index));

  useEffect(() => {
    const imageCount = validImages.length > 0 ? validImages.length : carouselImages.length;
    if (!autoPlay || imageCount === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imageCount);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, carouselImages.length, validImages.length]);

  const prev = () => {
    const imageCount = validImages.length > 0 ? validImages.length : carouselImages.length;
    setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
    setAutoPlay(false);
  };

  const next = () => {
    const imageCount = validImages.length > 0 ? validImages.length : carouselImages.length;
    setCurrentIndex((prev) => (prev + 1) % imageCount);
    setAutoPlay(false);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  if (!carouselImages.length) return null;

  const displayImages = validImages.length > 0 ? validImages : carouselImages;
  const safeCurrentIndex = currentIndex % Math.max(displayImages.length, 1);

  return (
    <section className="pt-20 pb-10 bg-gradient-to-b from-background to-secondary/20 overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div className="text-center mb-12">
          <div className="inline-flex px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Gallery
            </span>
          </div>
          <h2 className="text-4xl font-serif font-bold text-foreground">
            Our Creations
          </h2>
        </div>

        {/* CAROUSEL */}
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-xl">
          {/* MAIN IMAGE */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
            {displayImages.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ImageOff size={48} className="mx-auto mb-2" />
                  <p>No images available</p>
                </div>
              </div>
            ) : (
              displayImages.map((img, index) => (
                <div
                  key={img.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === safeCurrentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(img.id)}
                  />
                </div>
              ))
            )}

            {/* ARROWS */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition"
                >
                  <ChevronLeft size={24} />
                </button>

                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>

          {/* THUMBNAILS */}
          {displayImages.length > 1 && (
            <div className="p-6">
              <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar">
                {displayImages.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => goTo(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden transition-all bg-gray-100 ${
                      index === safeCurrentIndex
                        ? 'ring-2 ring-primary scale-110'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(img.id)}
                    />
                  </button>
                ))}
              </div>

              {/* DOTS */}
              <div className="mt-4 flex justify-center gap-2">
                {displayImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === safeCurrentIndex
                        ? 'w-8 bg-primary'
                        : 'w-2 bg-border'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
