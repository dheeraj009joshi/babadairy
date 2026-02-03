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
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-50"
        >
            {/* Elegant Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Sophisticated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-neutral-100/50" />
                
                {/* Abstract shape instead of blobs */}
                <div 
                    className="absolute w-[800px] h-[800px] rounded-full bg-primary-50/30 blur-[100px]"
                    style={{
                        top: '-20%',
                        right: '-10%',
                        transform: `translate(${mousePosition.x * -10}px, ${mousePosition.y * -10}px)`,
                    }}
                />
                
                {/* Subtle texture */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(#AD1457 0.5px, transparent 0.5px)',
                    backgroundSize: '24px 24px',
                }} />
            </div>

            {/* Main Hero Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pt-24 pb-12">
                {/* Badge */}
                <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white border border-primary-100 text-primary-800 text-sm font-medium shadow-sm tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                        {settings.heroBadge}
                    </span>
                </div>

                {/* Main Headline */}
                <div className={`transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-tight text-gray-900">
                        <span className="block">{settings.heroTitle}</span>
                        <span className="block mt-2 text-primary-700 italic">
                            {settings.heroHighlight}
                        </span>
                    </h1>
                </div>

                {/* Subtitle */}
                <div className={`mt-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <p className="text-lg sm:text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
                        {settings.heroSubtitle}
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className={`mt-12 flex flex-col sm:flex-row gap-5 justify-center items-center transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <Link to="/shop">
                        <Button 
                            size="lg" 
                            className="min-w-[180px] h-14 text-base font-medium rounded-md bg-primary-700 hover:bg-primary-800 text-white shadow-lg shadow-primary-900/10 transition-all duration-300"
                        >
                            Order Now
                        </Button>
                    </Link>
                    <Link to="/shop">
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="min-w-[180px] h-14 text-base font-medium rounded-md border-2 border-gray-200 text-gray-800 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 bg-white"
                        >
                            View Menu
                        </Button>
                    </Link>
                </div>

                {/* Hero Visual - Replaced emojis with cleaner layout or placeholder for image */}
                {/* If you have a hero image, it should go here. For now, we'll keep it simple or use a placeholder div that implies an image will be here */}
                {/* Removed the emoji animation block for a cleaner look */}
                
                {/* Trust indicators */}
                <div className={`mt-20 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-gray-500 text-sm font-medium tracking-wide uppercase">
                        {settings.trustIndicators.map((indicator, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <span className={indicator.icon.includes('★') ? 'text-secondary-500 text-lg' : 'text-primary-600 text-lg'}>{indicator.icon}</span>
                                <span>{indicator.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <button 
                onClick={scrollToContent}
                className={`absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-primary-600 transition-all duration-300 cursor-pointer ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Scroll down"
            >
                <ChevronDown className="w-6 h-6 animate-bounce" />
            </button>
        </section>
    );
}
