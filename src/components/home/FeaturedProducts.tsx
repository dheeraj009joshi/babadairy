import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Product } from '@/types';
import { fetchFeaturedProducts } from '@/utils/dataManager';
import { Button } from '../ui/button';
import { formatCurrency } from '@/utils/formatters';

export default function FeaturedProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const loadProducts = async () => {
        const featured = await fetchFeaturedProducts();
        setProducts(featured);
    };

    useEffect(() => {
        loadProducts();

        const handleProductsUpdate = () => {
            loadProducts();
        };
        window.addEventListener('productsUpdated', handleProductsUpdate);

        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdate);
        };
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % products.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
    };

    if (products.length === 0) return null;

    const visibleProducts = [
        products[currentIndex % products.length],
        products[(currentIndex + 1) % products.length],
        products[(currentIndex + 2) % products.length],
        products[(currentIndex + 3) % products.length],
    ];

    return (
        <section ref={sectionRef} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 text-sm font-medium mb-3">
                            Bestsellers
                        </span>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900">
                            Customer Favourites
                        </h2>
                    </div>
                    <Link to="/shop" className="text-rose-500 hover:text-rose-600 font-medium flex items-center gap-2 transition-colors group">
                        View All
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Carousel */}
                <div className="relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200 hover:text-rose-500"
                        aria-label="Previous"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-rose-200 hover:text-rose-500"
                        aria-label="Next"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleProducts.map((product, idx) => {
                            const discountedPrice = product.price * (1 - product.discount / 100);

                            return (
                                <div
                                    key={`${product.id}-${idx}`}
                                    className={`group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-rose-200 hover:shadow-xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                    style={{ transitionDelay: `${idx * 100}ms` }}
                                >
                                    {/* Product Image */}
                                    <Link to={`/product/${product.id}`} className="block relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                        {product.discount > 0 && (
                                            <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                                                {product.discount}% OFF
                                            </div>
                                        )}
                                        
                                        {product.images && product.images.length > 0 ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}
                                        <div className={`w-full h-full flex items-center justify-center text-7xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                                            🍦
                                        </div>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="p-5">
                                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            {product.category}
                                        </span>

                                        <Link to={`/product/${product.id}`}>
                                            <h3 className="font-semibold text-gray-900 mt-1 mb-2 line-clamp-1 group-hover:text-rose-500 transition-colors">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <div className="flex items-center gap-1 mb-3">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-3.5 w-3.5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400 ml-1">
                                                ({product.reviewCount})
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-lg font-bold text-gray-900">
                                                    {formatCurrency(discountedPrice)}
                                                </span>
                                                {product.discount > 0 && (
                                                    <span className="text-sm text-gray-400 line-through ml-2">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                )}
                                            </div>
                                            <Link 
                                                to={`/product/${product.id}`}
                                                className="w-10 h-10 rounded-full bg-rose-50 hover:bg-rose-500 text-rose-500 hover:text-white flex items-center justify-center transition-all duration-300"
                                            >
                                                <ShoppingBag className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-10 gap-2">
                    {products.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === currentIndex 
                                    ? 'bg-rose-500 w-8' 
                                    : 'bg-gray-200 w-2 hover:bg-gray-300'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* CTA */}
                <div className={`text-center mt-12 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <Link to="/shop">
                        <Button 
                            size="lg" 
                            className="px-8 py-6 text-base font-semibold rounded-full bg-gray-900 hover:bg-gray-800"
                        >
                            Explore All Flavours
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
