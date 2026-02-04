import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

interface CategoryDisplay {
    name: string;
    description: string;
    emoji: string;
    route: string;
    gradient: string;
    hoverGradient: string;
}

const gradients = [
    { gradient: 'from-amber-100 to-yellow-50', hoverGradient: 'from-amber-500 to-yellow-500' },      // Sweets
    { gradient: 'from-cyan-100 to-sky-50', hoverGradient: 'from-cyan-400 to-sky-400' },              // Ice Cream
    { gradient: 'from-orange-100 to-amber-50', hoverGradient: 'from-orange-400 to-amber-400' },     // Bakery
    { gradient: 'from-pink-100 to-rose-50', hoverGradient: 'from-pink-400 to-rose-400' },           // Cakes
    { gradient: 'from-amber-100 to-orange-50', hoverGradient: 'from-amber-600 to-orange-500' },     // Chocolates
    { gradient: 'from-emerald-100 to-teal-50', hoverGradient: 'from-emerald-400 to-teal-400' },     // Snacks
];

export default function ProductCategories() {
    const { settings } = useSettings();
    const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
    const [isHeaderVisible, setIsHeaderVisible] = useState(false);
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
    const headerRef = useRef<HTMLDivElement>(null);

    // Map settings categories to display categories
    const categories: CategoryDisplay[] = settings.categories.map((cat, index) => ({
        name: cat.name,
        description: cat.description,
        emoji: cat.emoji,
        route: `/shop?category=${encodeURIComponent(cat.name)}`,
        ...gradients[index % gradients.length],
    }));

    useEffect(() => {
        const headerObserver = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setIsHeaderVisible(true);
            },
            { threshold: 0.2 }
        );

        if (headerRef.current) headerObserver.observe(headerRef.current);

        const cardObservers = cardRefs.current.map((ref, index) => {
            if (!ref) return null;
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setVisibleCards(prev => new Set([...prev, index]));
                    }
                },
                { threshold: 0.1 }
            );
            observer.observe(ref);
            return observer;
        });

        return () => {
            headerObserver.disconnect();
            cardObservers.forEach((observer, index) => {
                if (observer && cardRefs.current[index]) {
                    observer.unobserve(cardRefs.current[index]!);
                }
            });
        };
    }, []);

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div 
                    ref={headerRef}
                    className={`text-center mb-16 transition-all duration-700 ${isHeaderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-4">
                        Our Collection
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900">
                        Find Your Perfect Treat
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto mt-4">
                        From traditional sweets to fresh bakery items, we have something for every occasion
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category, index) => {
                        const isVisible = visibleCards.has(index);
                        
                        return (
                            <Link
                                key={category.name}
                                to={category.route}
                                ref={(el) => { cardRefs.current[index] = el as unknown as HTMLDivElement; }}
                                className={`group relative rounded-3xl p-8 transition-all duration-500 overflow-hidden bg-gradient-to-br ${category.gradient} hover:shadow-2xl ${
                                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                }`}
                                style={{ transitionDelay: `${index * 80}ms` }}
                            >
                                {/* Hover gradient overlay */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${category.hoverGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                
                                {/* Content */}
                                <div className="relative z-10">
                                    {/* Emoji */}
                                    <div className="text-6xl mb-6 group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
                                        {category.emoji}
                                </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                                    {category.name}
                                </h3>

                                {/* Description */}
                                    <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300 mb-6">
                                    {category.description}
                                </p>

                                    {/* Arrow */}
                                    <div className="flex items-center gap-2 text-gray-900 group-hover:text-white font-semibold transition-colors duration-300">
                                        <span>Shop Now</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
