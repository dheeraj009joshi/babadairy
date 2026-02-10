'use client';

import React from "react"
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Link } from "react-router-dom";

interface HeroImage {
  id: number;
  image: string;
  title: string;
  description: string;
}

const heroImages: HeroImage[] = [
  {
    id: 1,
    image: 'public/Icecream.jpeg',
    title: 'Premium Ice Cream',
    description: 'Creamy, luxurious ice cream',
  },
  {
    id: 2,
    image: 'public/Bakery.png',
    title: 'Fresh Bakery',
    description: 'Handcrafted baked goods',
  },
  {
    id: 4,
    image: 'public/assests4.jpeg',
    title: 'Luxury Treats',
    description: 'Exclusive special creations',
  },
  {
    id: 3,
    image: 'public/assests3.jpeg',
    title: 'Artisan Sweets',
    description: 'Premium candy & confections',
  },
];

export default function HeroSection() {
  const { ref, isVisible } = useScrollAnimation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    setAutoPlay(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    setAutoPlay(false);
  };

  const currentImage = heroImages[currentIndex];

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      id="hero" 
      className="relative overflow-hidden bg-gradient-to-b from-background via-background to-secondary/30 compact-section"
    >
      {/* Decorative Elements */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/3 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className={`flex flex-col space-y-8 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 w-fit">
              <div className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <Sparkles size={16} className="text-primary" />
                <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wider">
                  Handcrafted with Love
                </span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold leading-tight text-foreground text-pretty">
                Taste the
                <span className="block text-primary">Tradition</span>
              </h1>
              <p className="text-lg sm:text-xl text-foreground/70 leading-relaxed max-w-2xl font-light">
                Premium sweets, artisan ice creams, and fresh bakery items crafted with love. Every bite tells a story of tradition and quality.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to='/shop' className="group px-8 py-4 bg-[#B01D5D] text-primary-foreground rounded-xl hover:bg-primary/90 text-white transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                Order Now
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to='/shop' className="px-8 py-4 border-2 border-primary/30 text-foreground rounded-xl hover:bg-primary/5 transition-all duration-300 font-semibold">
                View Menu
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 pt-6 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-2xl font-bold font-serif text-foreground">4.9★</p>
                <p className="text-sm text-foreground/60">Average Rating</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-serif text-foreground">100K+</p>
                <p className="text-sm text-foreground/60">Happy Customers</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold font-serif text-foreground">Free</p>
                <p className="text-sm text-foreground/60">Delivery Available</p>
              </div>
            </div>
          </div>

          {/* Right Visual - Premium Image Carousel */}
          <div className={`relative h-96 lg:h-96 flex items-center justify-center ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            {/* Background Shapes */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-primary/5 rounded-3xl blur-2xl" />
            
            {/* Main Showcase Card */}
            <div className="relative w-full max-w-sm group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-3xl border border-primary/30 shadow-2xl" />
              <div className="relative p-8 rounded-3xl backdrop-blur-sm">
                {/* Carousel Content */}
                <div className="space-y-6 transition-all duration-500">
                  <div className="aspect-square bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-2xl shadow-lg flex items-center justify-center overflow-hidden">
                    <img 
                      src={currentImage.image} 
                      alt={currentImage.title}
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                  </div>
                  <div className="text-center space-y-3 transition-all duration-500 px-4 py-4 rounded-xl backdrop-blur-sm">
                    <p className="font-serif text-xl sm:text-2xl font-bold text-foreground leading-snug">{currentImage.title}</p>
                    <p className="text-xs sm:text-sm text-foreground/70 font-light leading-relaxed">{currentImage.description}</p>
                  </div>
                </div>

                {/* Carousel Controls */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <button
                    onClick={goToPrevious}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-primary transition-all duration-200 shadow-md"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex gap-2">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentIndex(index);
                          setAutoPlay(false);
                        }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'w-6 bg-primary'
                            : 'w-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goToNext}
                    className="p-2 rounded-lg bg-white/90 hover:bg-white text-primary transition-all duration-200 shadow-md"
                    aria-label="Next"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-8 right-8 px-4 py-2 bg-white rounded-full shadow-md border border-primary/20 text-sm font-medium text-foreground animate-pulse">
              ✨ Premium Quality
            </div>
            <div className="absolute bottom-12 left-4 px-4 py-2 bg-white rounded-full shadow-md border border-primary/20 text-sm font-medium text-foreground">
              🌟 Award Winner
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
