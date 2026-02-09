'use client';

import React from "react"
import { useState } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface Product {
  id: string;
  name: string;
  icon: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  products: Product[];
}

const categories: Category[] = [
  {
    id: 'ice-cream',
    name: 'Ice Cream',
    icon: '🍦',
    products: [
      { id: '1', name: 'Vanilla Dream', icon: '🍦' },
      { id: '2', name: 'Salted Caramel', icon: '✨' },
      { id: '3', name: 'Golden Honey', icon: '🍯' },
      { id: '4', name: 'Pistachio Bliss', icon: '🌰' },
    ],
  },
  {
    id: 'sweets',
    name: 'Sweets',
    icon: '🍬',
    products: [
      { id: '5', name: 'Fudge Brownies', icon: '🍫' },
      { id: '6', name: 'Truffle Bites', icon: '🎁' },
      { id: '7', name: 'Fruit Jellies', icon: '🫐' },
      { id: '8', name: 'Caramel Clusters', icon: '✨' },
    ],
  },
  {
    id: 'bakery',
    name: 'Bakery',
    icon: '🎂',
    products: [
      { id: '9', name: 'Fresh Donuts', icon: '🍩' },
      { id: '10', name: 'Chocolate Cake', icon: '🎂' },
      { id: '11', name: 'Croissants', icon: '🥐' },
      { id: '12', name: 'Macarons', icon: '🌈' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Box',
    icon: '📦',
    products: [
      { id: '13', name: 'Build Your Own', icon: '🎨' },
      { id: '14', name: 'Gift Combo', icon: '🎁' },
      { id: '15', name: 'Party Pack', icon: '🎉' },
      { id: '16', name: 'Premium Bundle', icon: '👑' },
    ],
  },
];

export default function ProductsCategories() {
  const { ref, isVisible } = useScrollAnimation();
  const [selectedCategory, setSelectedCategory] = useState('ice-cream');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const currentCategory = categories.find(cat => cat.id === selectedCategory)!;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="products"
      className="compact-section bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={`text-center mb-12 transition-opacity duration-700 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <div className="inline-flex px-3 py-1 bg-primary/10 rounded-full border border-primary/20 mb-4">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Product Collection
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-3">
            Explore Our Products
          </h2>
          <p className="text-lg text-foreground/70 font-light">
            Choose from our premium selection of artisan treats
          </p>
        </div>

        {/* Category Tabs */}
        <div className={`flex gap-3 mb-10 overflow-x-auto pb-2 justify-center flex-wrap transition-opacity duration-700 delay-100 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedProduct(null);
              }}
              className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap border-2 ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-lg border-primary'
                  : 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 hover:border-primary/50'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentCategory.products.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedProduct === product.id
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border/50 bg-white hover:border-primary/50 hover:shadow-md'
              } ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
              style={{
                animationDelay: isVisible ? `${(idx + 2) * 75}ms` : '0ms',
              }}
            >
              <div className="text-4xl text-center mb-3 group-hover:scale-110 transition-transform">
                {product.icon}
              </div>
              <h3 className="font-semibold text-center text-sm text-foreground">
                {product.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
