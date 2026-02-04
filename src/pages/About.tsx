import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Leaf, Award, Users, Sparkles, Shield, Truck, Clock } from 'lucide-react';

export default function About() {
    const values = [
        {
            icon: Heart,
            title: 'Made with Love',
            description: 'Every scoop is crafted with passion and care, using recipes perfected over generations.',
        },
        {
            icon: Leaf,
            title: 'Fresh Ingredients',
            description: 'We use quality ingredients with authentic recipes perfected over time.',
        },
        {
            icon: Award,
            title: 'Premium Quality',
            description: 'Sourced from the finest dairy farms and organic fruit suppliers across India.',
        },
        {
            icon: Users,
            title: 'Family Tradition',
            description: 'A family business built on trust, quality, and the joy of sharing great ice cream.',
        },
    ];

    const stats = [
        { number: '50+', label: 'Unique Flavors' },
        { number: '10K+', label: 'Happy Customers' },
        { number: '5+', label: 'Years of Excellence' },
        { number: '100%', label: 'Customer Satisfaction' },
    ];

    const features = [
        {
            icon: Sparkles,
            title: 'Handcrafted Daily',
            description: 'Fresh batches made every day to ensure the perfect taste and texture.',
        },
        {
            icon: Shield,
            title: 'Quality Assured',
            description: 'Rigorous quality checks at every step of production.',
        },
        {
            icon: Truck,
            title: 'Cold Chain Delivery',
            description: 'Temperature-controlled delivery to maintain freshness.',
        },
        {
            icon: Clock,
            title: 'Quick Delivery',
            description: 'Same-day delivery available in select areas.',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-primary/10 via-cream to-secondary/10 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-chocolate mb-6">
                                Our Story of
                                <span className="text-primary"> Sweet Indulgence</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-chocolate/70 leading-relaxed">
                                Born from a passion for creating moments of joy, Baba Dairy brings you 
                                premium handcrafted sweets, ice cream, and bakery items that are as pure as they are delicious. 
                                Every bite tells a story of quality, tradition, and love.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Our Story Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                                    <span className="text-primary font-bold text-sm uppercase tracking-wide">Our Journey</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-display font-bold text-chocolate mb-6">
                                    From a Small Kitchen to Your Heart
                                </h2>
                                <div className="space-y-4 text-chocolate/70">
                                    <p>
                                        It all started in 2019 with a simple dream – to create sweets and treats that 
                                        bring back the joy of childhood memories. What began as experiments 
                                        in a small kitchen has grown into a beloved brand trusted by thousands.
                                    </p>
                                    <p>
                                        At Baba Dairy, we believe that great food isn't just about taste – 
                                        it's about the experience. That's why we use quality 
                                        ingredients, traditional recipes, and modern techniques to create 
                                        products that delight your senses.
                                    </p>
                                    <p>
                                        Our commitment to quality means authentic recipes, fresh ingredients, 
                                        and no shortcuts. Just pure, delicious goodness in every bite.
                                    </p>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-9xl mb-4">🍦</div>
                                        <p className="text-2xl font-display font-bold text-chocolate">
                                            Crafted with Love
                                        </p>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-xl"></div>
                                <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-gradient-to-r from-primary via-secondary to-accent">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl sm:text-5xl font-display font-bold text-white mb-2">
                                        {stat.number}
                                    </div>
                                    <div className="text-white/80 font-medium">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-cream">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-chocolate mb-4">
                                What We Stand For
                            </h2>
                            <p className="text-lg text-chocolate/70 max-w-2xl mx-auto">
                                Our values guide everything we do, from sourcing ingredients to serving our customers.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => {
                                const Icon = value.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                                    >
                                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-chocolate mb-3">
                                            {value.title}
                                        </h3>
                                        <p className="text-chocolate/70">
                                            {value.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-chocolate mb-4">
                                Why Choose Baba Dairy?
                            </h2>
                            <p className="text-lg text-chocolate/70 max-w-2xl mx-auto">
                                We go the extra mile to ensure you get the best experience.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="flex items-start gap-4 p-6 bg-cream rounded-xl"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-display font-bold text-chocolate mb-2">
                                                {feature.title}
                                            </h3>
                                            <p className="text-chocolate/70">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-br from-chocolate to-chocolate/90">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
                            Ready to Taste the Difference?
                        </h2>
                        <p className="text-lg text-white/80 mb-8">
                            Join thousands of happy customers who have made Baba Dairy their favorite brand.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/shop">
                                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                                    Shop Now
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-chocolate">
                                    Contact Us
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

