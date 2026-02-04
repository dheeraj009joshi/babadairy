import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Store, Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        setIsSubmitted(true);
        toast.success('Password reset link sent to your email!', {
            icon: '📧',
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-cream to-secondary/10">
            <Navbar />

            <main className="flex-grow flex items-center justify-center py-12 px-4">
                <div className="max-w-md w-full">
                    {/* Logo/Branding */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                                <Store className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-display font-bold text-chocolate mb-2">
                            Forgot Password?
                        </h1>
                        <p className="text-chocolate/70">
                            No worries! Enter your email and we'll send you reset instructions.
                        </p>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-xl shadow-xl p-8">
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate/40" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            required
                                            autoComplete="email"
                                            className="pl-10"
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isLoading || !email}
                                >
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </form>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                                    <Mail className="h-8 w-8 text-success" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-display font-bold text-chocolate mb-2">
                                        Check Your Email
                                    </h2>
                                    <p className="text-chocolate/70 text-sm">
                                        We've sent password reset instructions to <strong>{email}</strong>
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-chocolate/10">
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Didn't receive the email? Check your spam folder or try again.
                                    </p>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsSubmitted(false);
                                            setEmail('');
                                        }}
                                        className="w-full"
                                    >
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Back to Login */}
                        <div className="mt-6 pt-6 border-t border-chocolate/10">
                            <Link
                                to="/login"
                                className="flex items-center justify-center text-sm text-chocolate/70 hover:text-primary transition"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

