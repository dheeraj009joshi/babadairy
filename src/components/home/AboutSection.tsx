import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Quote } from 'lucide-react';

export default function AboutSection() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.2 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} className="py-24 bg-gradient-to-b from-white to-rose-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Content */}
                    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-6">
                            Our Story
                        </span>
                        
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-6 leading-tight">
                            Crafting Happiness,
                            <br />
                            <span className="text-rose-500">One Scoop at a Time</span>
                        </h2>
                        
                        <p className="text-gray-600 text-lg leading-relaxed mb-6">
                            At Baba Dairy, we believe that every sweet treat is more than just food – 
                            it's a moment of pure joy. Our journey began with a simple dream: 
                            to create products that bring smiles to faces and warmth to hearts.
                        </p>
                        
                        <p className="text-gray-600 text-lg leading-relaxed mb-8">
                            Every product is crafted with passion, using quality 
                            ingredients sourced from trusted suppliers. No shortcuts, no compromises – 
                            just pure, delicious treats the way they should be.
                        </p>

                        <div className="flex flex-wrap gap-8 mb-8">
                            <div>
                                <div className="text-3xl font-bold text-gray-900">2019</div>
                                <div className="text-gray-500">Founded</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">200+</div>
                                <div className="text-gray-500">Products</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-gray-900">100K+</div>
                                <div className="text-gray-500">Happy Customers</div>
                            </div>
                        </div>

                        <Link 
                            to="/about"
                            className="inline-flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold group"
                        >
                            Learn More About Us
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Right - Visual */}
                    <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
                        <div className="relative">
                            {/* Main card */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                                <Quote className="w-12 h-12 text-rose-200 mb-4" />
                                <p className="text-xl text-gray-700 italic leading-relaxed mb-6">
                                    "We don't just make sweets. We create memories, 
                                    celebrate moments, and spread happiness – one bite at a time."
                                </p>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                                        B
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Baba Dairy Team</div>
                                        <div className="text-gray-500 text-sm">Founders, Baba Dairy</div>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-amber-100 rounded-2xl -z-10"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-rose-100 rounded-2xl -z-10"></div>
                            
                            {/* Floating emojis */}
                            <div className="absolute -top-4 left-1/4 text-4xl animate-float">🍦</div>
                            <div className="absolute -bottom-2 right-1/4 text-3xl animate-float animation-delay-1000">🍨</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
