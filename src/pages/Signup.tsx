import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { IceCream, Eye, EyeOff } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (formData.phone.length !== 10) {
            setError('Phone number must be 10 digits');
            return;
        }

        setIsLoading(true);

        try {
            const success = await signup(
                formData.name,
                formData.email,
                formData.password,
                formData.phone
            );

            if (success) {
                navigate('/');
            } else {
                setError('Email already exists. Please use a different email.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
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
                                <IceCream className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-display font-bold text-chocolate mb-2">
                            Create Account
                        </h1>
                        <p className="text-chocolate/70">
                            Join Jas&Mey for delicious ice cream
                        </p>
                    </div>

                    {/* Signup Form */}
                    <div className="bg-white rounded-xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-chocolate/5 border border-chocolate/20 text-chocolate rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Name Field */}
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            {/* Email Field */}
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            {/* Phone Field */}
                            <div>
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="10-digit mobile number"
                                    maxLength={10}
                                    required
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Minimum 6 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-chocolate/40 hover:text-chocolate transition"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Re-enter password"
                                    required
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start text-sm">
                                <input type="checkbox" required className="mr-2 mt-1" />
                                <span className="text-chocolate/70">
                                    I agree to the{' '}
                                    <Link to="/terms" className="text-primary hover:text-primary/80">
                                        Terms & Conditions
                                    </Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-primary hover:text-primary/80">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                        </form>

                        {/* Login Link */}
                        <div className="mt-6 text-center text-sm text-chocolate/70">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
