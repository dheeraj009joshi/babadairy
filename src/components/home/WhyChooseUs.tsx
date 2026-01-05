import { useEffect, useRef, useState } from 'react';
import { Leaf, Truck, Clock, IceCream, Heart, Award, Sparkles, Shield } from 'lucide-react';

export default function WhyChooseUs() {
    const [isVisible, setIsVisible] = useState(false);
    const [counters, setCounters] = useState({ customers: 0, flavors: 0, rating: 0 });
    const sectionRef = useRef<HTMLElement>(null);

    const features = [
        {
            icon: Leaf,
            title: '100% Natural',
            description: 'Made with organic ingredients and no artificial flavors',
            color: 'bg-emerald-500',
        },
        {
            icon: Heart,
            title: 'Made with Love',
            description: 'Every batch is crafted with passion and care',
            color: 'bg-rose-500',
        },
        {
            icon: Truck,
            title: 'Free Delivery',
            description: 'Free home delivery on orders above ₹500',
            color: 'bg-blue-500',
        },
        {
            icon: Clock,
            title: 'Fresh Daily',
            description: 'Prepared fresh every day with finest ingredients',
            color: 'bg-amber-500',
        },
        {
            icon: IceCream,
            title: '50+ Flavours',
            description: 'Wide variety of unique and exotic flavours',
            color: 'bg-purple-500',
        },
        {
            icon: Award,
            title: 'Premium Quality',
            description: 'Award-winning recipes by expert artisans',
            color: 'bg-yellow-500',
        },
        {
            icon: Shield,
            title: 'Quality Assured',
            description: 'Every batch tested for quality and safety',
            color: 'bg-teal-500',
        },
        {
            icon: Sparkles,
            title: 'Rich & Creamy',
            description: 'Indulgent texture that melts in your mouth',
            color: 'bg-pink-500',
        },
    ];

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    const duration = 2000;
                    const steps = 60;
                    const interval = duration / steps;
                    
                    let step = 0;
                    const timer = setInterval(() => {
                        step++;
                        const progress = step / steps;
                        setCounters({
                            customers: Math.floor(100000 * progress),
                            flavors: Math.floor(50 * progress),
                            rating: parseFloat((4.9 * progress).toFixed(1)),
                        });
                        if (step >= steps) clearInterval(timer);
                    }, interval);
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
        <section 
            ref={sectionRef}
            className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-100/50 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-rose-100 text-rose-600 text-sm font-medium mb-4">
                        Why Jas&Mey
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        Crafted for Pure Joy
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        We believe in creating moments of happiness with every scoop
                    </p>
                </div>

                {/* Stats Counter */}
                <div className={`grid grid-cols-3 gap-8 mb-16 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1">
                            {counters.customers.toLocaleString()}+
                        </div>
                        <div className="text-gray-500 font-medium">Happy Customers</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1">
                            {counters.flavors}+
                        </div>
                        <div className="text-gray-500 font-medium">Delicious Flavours</div>
                    </div>
                    <div className="text-center p-6 rounded-2xl bg-white shadow-sm border border-gray-100">
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-1">
                            {counters.rating}★
                        </div>
                        <div className="text-gray-500 font-medium">Average Rating</div>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className={`group bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${index * 50 + 200}ms` }}
                            >
                                {/* Icon */}
                                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                                </div>

                                {/* Title */}
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {feature.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-500 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
