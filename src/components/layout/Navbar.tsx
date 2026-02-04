import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, User, ChevronDown, LogOut, LayoutDashboard, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '../ui/button';
import CartDrawer from '../cart/CartDrawer';

export default function Navbar() {
    const { settings } = useSettings();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, isAuthenticated, logout, isAdmin } = useAuth();
    const { itemCount } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/shop' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    isScrolled || !isHomePage
                        ? 'bg-white shadow-sm border-b border-gray-100'
                        : 'bg-transparent'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center group">
                            <img 
                                src="/baba-logo.png" 
                                alt={`${settings.storeName} Logo`}
                                className="h-16 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors relative tracking-wide ${
                                        isActive(link.path)
                                            ? 'text-primary-700 font-semibold'
                                            : isScrolled || !isHomePage
                                                ? 'text-gray-600 hover:text-primary-600'
                                                : 'text-gray-800 hover:text-primary-700'
                                    }`}
                                >
                                    {link.name}
                                    {isActive(link.path) && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary-600 rounded-full"></span>
                                    )}
                            </Link>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Favorites */}
                            <Link
                                to="/dashboard"
                                className={`hidden sm:flex p-2 rounded-full transition-colors ${
                                    isScrolled || !isHomePage
                                        ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                                        : 'text-gray-700 hover:text-primary-700 hover:bg-white/50'
                                }`}
                            >
                                <Heart className="h-5 w-5" />
                            </Link>

                            {/* Cart Button */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className={`relative p-2 rounded-full transition-colors ${
                                    isScrolled || !isHomePage
                                        ? 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                                        : 'text-gray-700 hover:text-primary-700 hover:bg-white/50'
                                }`}
                            >
                                <ShoppingBag className="h-5 w-5" />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                                        {itemCount > 9 ? '9+' : itemCount}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            {isAuthenticated ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                                            isScrolled || !isHomePage
                                                ? 'text-gray-700 hover:bg-gray-100'
                                                : 'text-gray-800 hover:bg-white/50'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">
                                            {user?.name?.split(' ')[0]}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown */}
                                    {isUserMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)}></div>
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                </div>
                                                
                                                <Link
                                                    to="/dashboard"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4" />
                                                    My Account
                                                </Link>
                                                
                                                {isAdmin && (
                                                    <Link
                                                        to="/admin/dashboard"
                                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <LayoutDashboard className="h-4 w-4" />
                                                        Admin Dashboard
                                                    </Link>
                                                )}
                                                
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                                    >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Link to="/login">
                                        <Button variant="ghost" size="sm" className="text-gray-700">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white rounded-md px-6 shadow-sm">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`md:hidden p-2 rounded-lg transition-colors ${
                                    isScrolled || !isHomePage
                                        ? 'text-gray-700 hover:bg-gray-100'
                                        : 'text-gray-700 hover:bg-white/50'
                                }`}
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                        </div>
                    </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100">
                        <div className="px-4 py-4 space-y-1">
                            {navLinks.map((link) => (
                            <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                                        isActive(link.path)
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                    {link.name}
                            </Link>
                            ))}
                            
                            {!isAuthenticated && (
                                <div className="pt-4 border-t border-gray-100 space-y-2">
                                    <Link to="/login" className="block">
                                        <Button variant="outline" className="w-full">Sign In</Button>
                            </Link>
                                    <Link to="/signup" className="block">
                                        <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">Sign Up</Button>
                            </Link>
                        </div>
                    )}
                </div>
                    </div>
                )}
            </nav>

            {/* Cart Drawer */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
}
