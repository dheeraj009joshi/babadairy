'use client';

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Heart,
  ShoppingBag,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  User,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSettings } from '@/contexts/SettingsContext';
import CartDrawer from '../cart/CartDrawer';
import { Button } from '../ui/button';

export default function Navbar() {
  const { settings } = useSettings();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* NAVBAR */}
      <header
        className={`fixed top-0 inset-x-0 z-50 h-20 transition-all duration-300 ${
          isScrolled || !isHomePage
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/baba-logo.png"
                alt={`${settings.storeName} Logo`}
                className="h-12 w-auto object-contain"
              />
              <div className="hidden sm:block leading-tight">
                <p className="font-serif font-semibold text-base">
                  {settings.storeName}
                </p>
                <p className="text-xs text-foreground/60">
                  Premium Artisan
                </p>
              </div>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-10">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`relative text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary font-semibold'
                      : isScrolled || !isHomePage
                        ? 'text-foreground/70 hover:text-primary'
                        : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>

            {/* RIGHT ACTIONS */}
            <div className="flex items-center gap-2">
              <Link to="/dashboard" className="hidden sm:flex p-2 rounded-lg hover:bg-primary/10">
                <Heart size={20} />
              </Link>

              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-lg hover:bg-primary/10"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {/* AUTH */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/10"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${
                        isUserMenuOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border z-50">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-semibold">{user?.name}</p>
                          <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
                        </div>

                        <Link to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                          <User size={16} /> My Account
                        </Link>

                        {isAdmin && (
                          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50">
                            <LayoutDashboard size={16} /> Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-primary text-white">Sign Up</Button>
                  </Link>
                </div>
              )}

              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-primary/10"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 🔥 SPACER — THIS FIXES COLLISION EVERYWHERE */}
      <div className="h-20" />

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-2">
            {navItems.map(item => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg ${
                  isActive(item.href) ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
