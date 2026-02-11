"use client";

import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

interface Product {
  id: string;
  name: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  image: string;
  products: Product[];
}

const categories: Category[] = [
  {
    id: "ice-cream",
    name: "Ice Cream",
    image: "🍦",
    products: [
      {
        id: "1",
        name: "Pista",
        image: "/ice-images/image_4_966908a7ed8f.jpeg",
      },
      {
        id: "2",
        name: "Vanilla",
        image: "/ice-images/image_3_45cd289378b6.jpeg",
      },
      {
        id: "3",
        name: "Strawberry",
        image: "/ice-images/image_8_358389476f50.jpeg",
      },
      {
        id: "4",
        name: "Butter Scotch",
        image: "/ice-images/image_10_6f5cb26b79e3.jpeg",
      },
    ],
  },
  {
    id: "sweets",
    name: "Sweets",
    image: "🍬",
    products: [
      { id: "5", name: "Rasgulla", image: "/Rasgulla.png" },
      { id: "6", name: "Kesar Rasmalai", image: "/assests2.jpeg" },
      { id: "7", name: "Desi Ghee Barfi", image: "/assests3.jpeg" },
      { id: "8", name: "Rasmalai", image: "/assests4.jpeg" },
    ],
  },
  {
    id: "bakery",
    name: "Bakery",
    image: "🎂",
    products: [
      { id: "9", name: "Vanilla Chocochips Cookies", image: "/Bakery.png" },
      { id: "10", name: "Almond Cookies", image: "/Almond.png" },
      { id: "11", name: "Burger Bunnn", image: "/Burger.png" },
      { id: "12", name: "Jera Stick Cookies", image: "/Jera.png" },
    ],
  },
  {
    id: "custom",
    name: "Custom Box",
    image: "📦",
    products: [
      { id: "13", name: "Build Your Own", image: "/Gifthamper/Gifthamper5.jpeg" },
      { id: "14", name: "Gift Combo", image: "/Gifthamper/Gifthamper6.jpeg" },
      { id: "15", name: "Party Pack", image: "/Gifthamper/Gifthamper7.jpeg" },
      { id: "16", name: "Festival Special", image: "/Gifthamper/Gifthamper9.jpeg" },
    ],
  },
];

export default function ProductsCategories() {
  const navigate = useNavigate();
  const { ref, isVisible } = useScrollAnimation();
  const [selectedCategory, setSelectedCategory] = useState("ice-cream");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const currentCategory = categories.find(
    (cat) => cat.id === selectedCategory,
  )!;

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="products"
      className="compact-section bg-background"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center mb-12 transition-opacity duration-700 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
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
        <div
          className={`flex gap-3 mb-10 overflow-x-auto pb-2 justify-center flex-wrap transition-opacity duration-700 delay-100 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setSelectedProduct(null);
              }}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 whitespace-nowrap border-2 ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg border-primary"
                  : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30 hover:border-primary/50"
              }`}
            >
              <span className="text-2xl">{category.image}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentCategory.products.map((product, idx) => (
            <div
              key={product.id}
              onClick={() => {
                window.scrollTo(0, 0);
                navigate("/shop");
              }}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                selectedProduct === product.id
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border/50 bg-white hover:border-primary/50 hover:shadow-md"
              } ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
              style={{
                animationDelay: isVisible ? `${(idx + 2) * 75}ms` : "0ms",
              }}
            >
              <div className="flex items-center justify-center h-40 mb-4 bg-gray-50 rounded-lg group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain p-2"
                />
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
