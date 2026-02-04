import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';

export default function OrderSuccess() {
    useEffect(() => {
        // Confetti or celebration animation could go here
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow flex items-center justify-center py-12">
                <div className="max-w-2xl mx-auto px-4 text-center">
                    {/* Success Animation */}
                    <div className="mb-8 relative">
                        <div className="w-32 h-32 mx-auto bg-gradient-to-br from-success to-success/70 rounded-full flex items-center justify-center animate-bounce-in">
                            <CheckCircle className="h-20 w-20 text-white" strokeWidth={2} />
                        </div>
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-success/20 rounded-full blur-3xl animate-pulse" />
                    </div>

                    {/* Success Message */}
                    <h1 className="text-4xl font-display font-bold text-chocolate mb-4">
                        Order Placed Successfully! 🎉
                    </h1>

                    <p className="text-lg text-chocolate/70 mb-8">
                        Thank you for your order! We've received your order and will start preparing it right away.
                    </p>

                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl p-8 mb-8 text-left">
                        <h2 className="font-display font-bold text-xl text-chocolate mb-4">
                            What's Next?
                        </h2>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-chocolate">Order Confirmation</h3>
                                    <p className="text-sm text-chocolate/70">
                                        You'll receive an email confirmation with your order details shortly.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-5 w-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-chocolate">Preparation</h3>
                                    <p className="text-sm text-chocolate/70">
                                        Our team will carefully pack your order to ensure freshness.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                                    <Package className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-chocolate">On the Way</h3>
                                    <p className="text-sm text-chocolate/70">
                                        Your order will be delivered within 2-3 business days with proper cooling.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                <Home className="h-5 w-5 mr-2" />
                                Back to Home
                            </Button>
                        </Link>
                        <Link to="/shop">
                            <Button size="lg" className="w-full sm:w-auto">
                                <ShoppingBag className="h-5 w-5 mr-2" />
                                Continue Shopping
                            </Button>
                        </Link>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 p-6 bg-primary/5 rounded-xl">
                        <p className="text-sm text-chocolate/70">
                            💡 <strong>Tip:</strong> Store your products as recommended on the packaging
                            for best quality and taste!
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
