import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { IceCream, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                // Get user from localStorage (set by login function)
                const storedUser = localStorage.getItem('jasmey_user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    // Redirect based on role
                    if (user?.role === 'admin') {
                        navigate('/admin/dashboard');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError('Invalid email or password. Please try again.');
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
                            Welcome Back
                        </h1>
                        <p className="text-chocolate/70">
                            Login to your Jas&Mey account
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white rounded-xl shadow-xl p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-chocolate/5 border border-chocolate/20 text-chocolate rounded-lg p-3 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email Field */}
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password Field */}
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
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

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input type="checkbox" className="mr-2" />
                                    <span className="text-chocolate/70">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition">
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>

                        {/* Demo Credentials */}
                        <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                            <p className="text-xs font-semibold text-chocolate mb-2">Demo Credentials:</p>
                            <p className="text-xs text-chocolate/70">
                                <strong>Customer:</strong> rahul@example.com / test123<br />
                                <strong>Admin:</strong> admin@jasmey.com / admin123
                            </p>
                        </div>


                        {/* Sign Up Link */}
                        <div className="mt-6 text-center text-sm text-chocolate/70">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
