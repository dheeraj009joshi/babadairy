import { useState, useEffect, useRef } from 'react';
import { Mail, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

export default function Newsletter() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail('');
        }
    };

    return (
        <section ref={sectionRef} className="py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>

                    {/* Heading */}
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white mb-4">
                        Stay in the Scoop!
                    </h2>
                    <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
                        Subscribe to get exclusive offers, new flavour alerts, and sweet surprises delivered to your inbox.
                    </p>

                    {/* Form */}
                    {!isSubscribed ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                size="lg"
                                className="px-8 py-4 rounded-full bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Subscribe
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </form>
                    ) : (
                        <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/20 backdrop-blur-sm rounded-full text-white">
                            <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                                <Check className="w-5 h-5" />
                            </div>
                            <span className="font-semibold">You're subscribed! Check your inbox for a welcome treat 🎉</span>
                        </div>
                    )}

                    {/* Benefits */}
                    <div className="flex flex-wrap justify-center gap-6 mt-10 text-white/80 text-sm">
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>Exclusive Offers</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>New Flavour Alerts</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            <span>No Spam, Ever</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
