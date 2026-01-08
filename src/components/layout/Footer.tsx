import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Footer() {
    const { settings } = useSettings();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle subscription
        setEmail('');
    };

    return (
        <footer className="bg-gray-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center mb-4">
                            <img 
                                src="/logo.png" 
                                alt={`${settings.storeName} Logo`}
                                className="h-24 w-auto object-contain"
                            />
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            {settings.storeDescription}
                        </p>
                        <div className="flex gap-3">
                            {settings.socialInstagram && (
                                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {settings.socialFacebook && (
                                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {settings.socialTwitter && (
                                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {!settings.socialInstagram && !settings.socialFacebook && !settings.socialTwitter && (
                                <>
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                        <Instagram className="w-5 h-5" />
                            </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                        <Facebook className="w-5 h-5" />
                            </a>
                                    <a href="#" className="w-10 h-10 rounded-full bg-gray-800 hover:bg-rose-500 flex items-center justify-center transition-colors">
                                        <Twitter className="w-5 h-5" />
                            </a>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Quick Links</h4>
                        <ul className="space-y-3">
                            {[
                                { name: 'Shop All', path: '/shop' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Contact', path: '/contact' },
                                { name: 'Track Order', path: '/order-tracking' },
                            ].map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-400 hover:text-rose-400 text-sm transition-colors">
                                        {link.name}
                                </Link>
                            </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories - Dynamic from settings */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Categories</h4>
                        <ul className="space-y-3">
                            {settings.productCategories.slice(0, 5).map((category) => (
                                <li key={category}>
                                    <Link to={`/shop?category=${encodeURIComponent(category)}`} className="text-gray-400 hover:text-rose-400 text-sm transition-colors">
                                        {category}
                                </Link>
                            </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact & Newsletter */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Get in Touch</h4>
                        <ul className="space-y-3 mb-6">
                            <li className="flex items-start gap-3 text-gray-400 text-sm">
                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{settings.storeAddress}, {settings.storeCity}, {settings.storeState} {settings.storePincode}</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Phone className="w-4 h-4 flex-shrink-0" />
                                <span>{settings.storePhone}</span>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400 text-sm">
                                <Mail className="w-4 h-4 flex-shrink-0" />
                                <span>{settings.storeEmail}</span>
                            </li>
                        </ul>

                        <h4 className="font-semibold text-white mb-3">Newsletter</h4>
                        <form onSubmit={handleSubscribe} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-rose-500"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                    </div>
                </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-500 text-sm">
                            {settings.footerText || `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`}
                        </p>
                        <div className="flex gap-6 text-sm">
                            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-500 hover:text-gray-400 transition-colors">Refund Policy</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
