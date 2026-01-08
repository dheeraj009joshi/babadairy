import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { ChevronDown, Sparkles, Heart } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function HeroSection() {
    const { settings } = useSettings();
    const [isVisible, setIsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const heroRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setIsVisible(true);
        
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - rect.left) / rect.width,
                    y: (e.clientY - rect.top) / rect.height,
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight - 80,
            behavior: 'smooth'
        });
    };

    return (
        <section 
            ref={heroRef}
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-rose-50 via-white to-amber-50"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Soft gradient blobs */}
                <div 
                    className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-200/40 to-rose-100/20 blur-3xl animate-blob"
                    style={{
                        top: '-10%',
                        right: '-5%',
                        transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                    }}
                />
                <div 
                    className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-amber-200/30 to-orange-100/20 blur-3xl animate-blob animation-delay-2000"
                    style={{
                        bottom: '0%',
                        left: '-10%',
                        transform: `translate(${mousePosition.x * 15}px, ${mousePosition.y * 15}px)`,
                    }}
                />
                <div 
                    className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-br from-violet-200/25 to-purple-100/15 blur-3xl animate-blob animation-delay-4000"
                    style={{
                        top: '40%',
                        left: '30%',
                        transform: `translate(${mousePosition.x * 10}px, ${mousePosition.y * 10}px)`,
                    }}
                />
                
                {/* Floating decorative elements */}
                <div className="absolute top-20 right-[15%] text-pink-300/40 animate-float">
                    <Sparkles className="w-8 h-8" />
            </div>
                <div className="absolute bottom-32 left-[10%] text-amber-300/40 animate-float animation-delay-1000">
                    <Heart className="w-6 h-6" />
                    </div>
                <div className="absolute top-1/3 right-[8%] text-rose-300/30 animate-float animation-delay-500">
                    <Sparkles className="w-5 h-5" />
                </div>

                {/* Subtle dot pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }} />
            </div>

            {/* Main Hero Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-24 pb-12">
                {/* Badge */}
                <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-200/50 text-rose-600 text-sm font-medium backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                        {settings.heroBadge}
                    </span>
                </div>

                {/* Main Headline */}
                <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95]">
                        <span className="block text-gray-900">{settings.heroTitle}</span>
                        <span className="block mt-2 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                            {settings.heroHighlight}
                    </span>
                </h1>
                </div>

                {/* Subtitle */}
                <div className={`mt-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <p className="text-lg sm:text-xl text-gray-600 font-light max-w-xl mx-auto leading-relaxed">
                        {settings.heroSubtitle}
                </p>
                </div>

                {/* CTA Buttons */}
                <div className={`mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <Link to="/shop">
                        <Button 
                            size="lg" 
                            className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all duration-300 hover:scale-105"
                        >
                            Order Now
                            <span className="ml-2">→</span>
                        </Button>
                    </Link>
                    <Link to="/shop">
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-full border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                        >
                            Explore Flavours
                        </Button>
                    </Link>
                </div>

                {/* Hero Visual */}
                <div className={`mt-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}>
                    <div className="relative inline-block">
                        {/* Main ice cream visual */}
                        <div 
                            className="text-[120px] sm:text-[160px] lg:text-[200px] filter drop-shadow-2xl"
                            style={{
                                transform: `translate(${mousePosition.x * 8}px, ${mousePosition.y * 8}px)`,
                            }}
                        >
                            🍨
                        </div>
                        
                        {/* Floating elements around */}
                        <div className="absolute -left-8 sm:-left-16 top-1/4 text-4xl sm:text-5xl animate-float opacity-90" style={{ animationDelay: '0.3s' }}>
                            🍓
                        </div>
                        <div className="absolute -right-6 sm:-right-12 top-1/3 text-3xl sm:text-4xl animate-float opacity-80" style={{ animationDelay: '0.8s' }}>
                            🍫
                        </div>
                        <div className="absolute left-4 -bottom-4 text-2xl sm:text-3xl animate-float opacity-70" style={{ animationDelay: '1.2s' }}>
                            🥜
                        </div>
                        <div className="absolute right-0 bottom-8 text-2xl sm:text-3xl animate-float opacity-75" style={{ animationDelay: '0.5s' }}>
                            🍦
                        </div>
                    </div>
                </div>

                {/* Trust indicators */}
                <div className={`mt-12 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-gray-500 text-sm">
                        {settings.trustIndicators.map((indicator, index) => (
                            <div key={index} className="flex items-center gap-2">
                                {index > 0 && <div className="hidden sm:block w-px h-4 bg-gray-300 mr-6"></div>}
                                <span className={indicator.icon.includes('★') ? 'text-rose-500' : ''}>{indicator.icon}</span>
                                <span>{indicator.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <button 
                onClick={scrollToContent}
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-rose-500 transition-all duration-300 animate-bounce cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Scroll down"
            >
                <ChevronDown className="w-8 h-8" />
            </button>
        </section>
    );
}
