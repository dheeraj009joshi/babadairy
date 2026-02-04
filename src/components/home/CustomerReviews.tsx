import { useEffect, useRef, useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

interface Review {
    id: number;
    name: string;
    location: string;
    rating: number;
    text: string;
    date: string;
    avatar: string;
}

export default function CustomerReviews() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const sectionRef = useRef<HTMLElement>(null);

    const reviews: Review[] = [
        {
            id: 1,
            name: 'Priya Sharma',
            location: 'Mumbai',
            rating: 5,
            text: 'Absolutely the best ice cream I\'ve ever had! The Belgian Chocolate is to die for. My whole family is hooked now.',
            date: 'Dec 2025',
            avatar: '👩',
        },
        {
            id: 2,
            name: 'Rahul Verma',
            location: 'Delhi',
            rating: 5,
            text: 'The quality is exceptional. You can taste the difference with every scoop. Fast delivery and perfect packaging too!',
            date: 'Dec 2025',
            avatar: '👨',
        },
        {
            id: 3,
            name: 'Anita Patel',
            location: 'Bangalore',
            rating: 5,
            text: 'My kids absolutely love Baba Dairy! The Mango ice cream tastes like real mangoes. Will definitely order again.',
            date: 'Nov 2025',
            avatar: '👩‍🦱',
        },
        {
            id: 4,
            name: 'Vikram Singh',
            location: 'Pune',
            rating: 5,
            text: 'Premium quality ice cream at reasonable prices. The Butterscotch is my personal favourite. Highly recommend!',
            date: 'Nov 2025',
            avatar: '👨‍🦰',
        },
        {
            id: 5,
            name: 'Meera Krishnan',
            location: 'Chennai',
            rating: 5,
            text: 'Finally found an ice cream brand that uses real ingredients. The taste is authentic and absolutely delicious!',
            date: 'Oct 2025',
            avatar: '👩‍🦳',
        },
    ];

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

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % reviews.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [reviews.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    return (
        <section ref={sectionRef} className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <span className="inline-block px-4 py-1.5 rounded-full bg-amber-100 text-amber-600 text-sm font-medium mb-4">
                        Testimonials
                    </span>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                        Join thousands of happy customers who love our ice creams
                    </p>
                </div>

                {/* Reviews Carousel */}
                <div className={`relative transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {/* Navigation */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        aria-label="Previous review"
                    >
                        <ChevronLeft className="h-5 w-5 text-gray-600" />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        aria-label="Next review"
                    >
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                    </button>

                    {/* Reviews Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[0, 1, 2].map((offset) => {
                            const review = reviews[(currentIndex + offset) % reviews.length];
                            return (
                                <div
                                    key={`${review.id}-${offset}`}
                                    className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-500 hover:shadow-lg ${
                                        offset === 1 ? 'md:scale-105 md:shadow-lg' : ''
                                    }`}
                                >
                                    <Quote className="w-8 h-8 text-rose-200 mb-4" />
                                    
                                    {/* Rating */}
                                    <div className="flex items-center gap-1 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                                            />
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        "{review.text}"
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-2xl">
                                            {review.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{review.name}</div>
                                            <div className="text-gray-500 text-sm">{review.location} • {review.date}</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-10 gap-2">
                    {reviews.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                idx === currentIndex 
                                    ? 'bg-rose-500 w-8' 
                                    : 'bg-gray-300 w-2 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to review ${idx + 1}`}
                        />
                    ))}
                </div>

                {/* Trust Badge */}
                <div className={`text-center mt-12 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-full shadow-sm border border-gray-100">
                        <div className="flex -space-x-2">
                            {['👩', '👨', '👩‍🦱', '👨‍🦰'].map((emoji, i) => (
                                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-100 to-amber-100 flex items-center justify-center text-sm border-2 border-white">
                                    {emoji}
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <span className="font-semibold text-gray-900">100,000+</span>
                            <span className="text-gray-500"> happy customers</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
