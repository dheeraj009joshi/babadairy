'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export default function ImageCarousel() {
  const { settings } = useSettings();
  const { ref, isVisible } = useScrollAnimation();

  const carouselImages = settings.carouselImages.map((src, index) => ({
    id: index,
    src,
    alt: `Product ${index + 1}`,
  }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || carouselImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, carouselImages.length]);

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    setAutoPlay(false);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    setAutoPlay(false);
  };

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setAutoPlay(false);
  };

  if (!carouselImages.length) return null;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="pt-20 pb-10 bg-gradient-to-b from-background to-secondary/20 overflow-x-hidden"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
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
        <div
          className={`relative rounded-3xl overflow-hidden bg-white shadow-xl transition-all duration-700 ${
            isVisible ? 'animate-scale-in' : 'opacity-0'
          }`}
        >
          {/* MAIN IMAGE */}
          <div className="relative aspect-[16/9] overflow-hidden">
            {carouselImages.map((img, index) => (
              <div
                key={img.id}
                className={`absolute inset-0 transition-all duration-700 ${
                  index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {/* ARROWS */}
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
          </div>

          {/* THUMBNAILS */}
          <div className="p-6">
            <div className="flex justify-center gap-3 overflow-x-auto no-scrollbar">
              {carouselImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => goTo(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden transition-all ${
                    index === currentIndex
                      ? 'ring-2 ring-primary scale-110'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* DOTS */}
            <div className="mt-4 flex justify-center gap-2">
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-primary'
                      : 'w-2 bg-border'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
