import { useEffect, useRef, useState } from 'react';
import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';

interface Post {
    id: number;
    image: string;
    likes: string;
    comments: number;
    caption: string;
}

export default function InstagramFeed() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    const posts: Post[] = [
        { id: 1, image: '🍦', likes: '2.4K', comments: 89, caption: 'Summer vibes with our classic vanilla' },
        { id: 2, image: '🍫', likes: '3.1K', comments: 124, caption: 'Chocolate lovers, this one\'s for you!' },
        { id: 3, image: '🍓', likes: '1.8K', comments: 67, caption: 'Fresh strawberry goodness' },
        { id: 4, image: '🥭', likes: '2.9K', comments: 98, caption: 'Mango season is here!' },
        { id: 5, image: '🍨', likes: '4.2K', comments: 156, caption: 'Sunday sundae funday' },
        { id: 6, image: '🧁', likes: '1.5K', comments: 45, caption: 'New flavour alert!' },
    ];

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

    return (
        <section ref={sectionRef} className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white text-sm font-medium mb-4">
                        <Instagram className="w-4 h-4" />
                        @babadairy
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        Follow Us on Instagram
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Join our community and stay updated with the latest products and offers
                    </p>
                </div>

                {/* Instagram Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {posts.map((post, index) => (
                        <a
                            key={post.id}
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative aspect-square bg-gradient-to-br from-rose-100 to-amber-100 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl ${
                                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                            style={{ transitionDelay: `${index * 80}ms` }}
                        >
                            {/* Post Content */}
                            <div className="w-full h-full flex items-center justify-center text-6xl">
                                {post.image}
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <div className="text-white text-center">
                                    <div className="flex items-center justify-center gap-4 mb-2">
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-5 h-5 fill-white" />
                                            <span className="font-semibold">{post.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="font-semibold">{post.comments}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-white/80 px-2 line-clamp-2">{post.caption}</p>
                                </div>
                            </div>
                        </a>
                    ))}
                </div>

                {/* Follow Button */}
                <div className={`text-center mt-10 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        <Instagram className="w-5 h-5" />
                        Follow @babadairy
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
