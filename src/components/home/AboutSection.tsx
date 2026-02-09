'use client';

import React from "react";
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Award, Heart, Leaf } from 'lucide-react';
import { JSX } from 'react/jsx-runtime'; // Import JSX

interface Benefit {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Leaf,
    title: 'Natural Ingredients',
    description: 'Premium quality, sourced from trusted suppliers worldwide',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Handcrafted with passion in small batches daily',
  },
  {
    icon: Award,
    title: 'Award Winning',
    description: 'Recognized for excellence and artisan craftsmanship',
  },
];

export default function AboutSection(): JSX.Element {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="about"
      className="compact-section bg-gradient-to-b from-zinc-50 to-amber-50 py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`space-y-6 transition-opacity duration-700 ${isVisible ? 'animate-fade-in-left' : 'opacity-0'}`}>
            <div className="space-y-3">
              <div className="inline-flex px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Our Story
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">
                Crafting Happiness, One Scoop at a Time
              </h2>
              <p className="text-lg text-foreground/70 leading-relaxed font-light">
                At Baba Dairy, we believe every sweet treat is a moment of pure joy. Founded with a simple dream to create products that bring smiles and warmth to hearts, we've been perfecting our craft for over 25 years.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 py-6 border-y border-border/50">
              <div>
                <p className="text-3xl font-serif font-bold text-primary">2019</p>
                <p className="text-xs text-foreground/60 mt-1">Founded</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-primary">200+</p>
                <p className="text-xs text-foreground/60 mt-1">Flavors</p>
              </div>
              <div>
                <p className="text-3xl font-serif font-bold text-primary">100K+</p>
                <p className="text-xs text-foreground/60 mt-1">Customers</p>
              </div>
            </div>
          </div>

          {/* Right Benefits */}
          <div className={`space-y-4 transition-opacity duration-700 delay-200 ${isVisible ? 'animate-fade-in-right' : 'opacity-0'}`}>
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 ${
                    isVisible ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: isVisible ? `${(idx + 2) * 100}ms` : '0ms',
                  }}
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm">{benefit.title}</h3>
                      <p className="text-sm text-foreground/60 mt-1">{benefit.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
