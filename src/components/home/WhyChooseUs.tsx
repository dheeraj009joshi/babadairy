'use client';

import React from "react";
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { Shield, Truck, Sparkles, Clock, Award, Heart } from 'lucide-react';
// no local useState imports required here
import { Counter } from '@/components/counter';

interface Feature {
  icon: React.ComponentType<{ size: number; className?: string }>;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'Premium Quality',
    description: 'Award-winning recipes crafted with finest ingredients',
  },
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Handcrafted daily with passion and care',
  },
  {
    icon: Truck,
    title: 'Free Delivery',
    description: 'Quick delivery on orders above 500',
  },
  {
    icon: Shield,
    title: 'Quality Assured',
    description: 'Every batch tested for taste and safety',
  },
  {
    icon: Clock,
    title: 'Fresh Daily',
    description: 'Prepared fresh every single day',
  },
  {
    icon: Award,
    title: 'Industry Leaders',
    description: '25+ years of excellence and innovation',
  },
];

export default function WhyChooseUs() {
  const { ref, isVisible } = useScrollAnimation();
  // no local newsletter state here; newsletter is handled by a separate component

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="why-choose"
      className="compact-section bg-gradient-to-b from-zinc-50 to-amber-50 py-12 sm:py-16"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className={`mb-16 text-center relative transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-flex px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Why Baba Dairy
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4">
            Crafted for Pure Joy
          </h2>
          <p className="text-lg text-foreground/70 font-light max-w-2xl mx-auto mb-8">
            We believe in creating moments of happiness with every bite
          </p>

          {/* Counter Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 p-8 bg-white/95 rounded-2xl shadow-sm border border-primary/5">
            <Counter
              target={100000}
              label="Happy Customers"
              prefix="+"
              isVisible={isVisible}
              delay={0}
            />
            <Counter
              target={50}
              label="Delicious Products"
              prefix=""
              suffix="+"
              isVisible={isVisible}
              delay={100}
            />
            <div className="space-y-2 text-center animate-count-up" style={{ animationDelay: '200ms' }}>
              <p className="text-5xl sm:text-6xl font-serif font-bold text-primary">4.9★</p>
              <p className="text-sm sm:text-base text-foreground/70 font-light">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className={`group p-6 rounded-xl border border-border/50 hover:border-primary/30 hover:shadow-lg hover:bg-primary/5 transition-all duration-300 ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{
                  animationDelay: isVisible ? `${(idx + 1) * 100}ms` : '0ms',
                }}
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all">
                    <Icon size={24} className="text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
