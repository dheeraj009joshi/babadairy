'use client';

import { Link } from 'react-router-dom';
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface FooterLink {
  label: string;
  href: string;
}

export default function Footer() {
  const { settings } = useSettings();
  const { ref, isVisible } = useScrollAnimation();
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setEmail('');
  };

  const quickLinks: FooterLink[] = [
    { label: 'Shop All', href: '/shop' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Track Order', href: '/order-tracking' },
  ];

  return (
    <footer
      ref={ref as React.RefObject<HTMLElement>}
      className="relative bg-gradient-to-b from-background to-secondary/30 border-t border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN FOOTER */}
        <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* BRAND */}
          <div
            className={`space-y-5 transition-all duration-700 ${
              isVisible ? 'animate-fade-in-left' : 'opacity-0'
            }`}
          >
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/baba-logo.png"
                alt={`${settings.storeName} Logo`}
                className="h-14 w-auto object-contain"
              />
              <div>
                <p className="font-serif font-semibold text-foreground">
                  {settings.storeName}
                </p>
                <p className="text-xs text-foreground/60">
                  Premium Artisan
                </p>
              </div>
            </Link>

            <p className="text-sm text-foreground/70 leading-relaxed">
              {settings.storeDescription}
            </p>

            {/* SOCIAL */}
            <div className="flex gap-3">
              {(settings.socialInstagram || settings.socialFacebook || settings.socialTwitter) ? (
                <>
                  {settings.socialInstagram && (
                    <a
                      href={settings.socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                    >
                      <Instagram size={18} />
                    </a>
                  )}
                  {settings.socialFacebook && (
                    <a
                      href={settings.socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                    >
                      <Facebook size={18} />
                    </a>
                  )}
                  {settings.socialTwitter && (
                    <a
                      href={settings.socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition"
                    >
                      <Twitter size={18} />
                    </a>
                  )}
                </>
              ) : (
                <>
                  <Instagram size={18} />
                  <Facebook size={18} />
                  <Twitter size={18} />
                </>
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <h4 className="font-semibold mb-4 text-foreground">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map(link => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-foreground/70 hover:text-primary transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <h4 className="font-semibold mb-4 text-foreground">
              Categories
            </h4>
            <ul className="space-y-3">
              {settings.productCategories.slice(0, 5).map(category => (
                <li key={category}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-sm text-foreground/70 hover:text-primary transition"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CONTACT + NEWSLETTER */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <h4 className="font-semibold mb-4 text-foreground">
              Get in Touch
            </h4>

            <ul className="space-y-3 text-sm text-foreground/70 mb-6">
              <li className="flex gap-3">
                <MapPin size={16} />
                <span>
                  {settings.storeAddress}, {settings.storeCity},{' '}
                  {settings.storeState} {settings.storePincode}
                </span>
              </li>
              <li className="flex gap-3">
                <Phone size={16} />
                <span>{settings.storePhone}</span>
              </li>
              <li className="flex gap-3">
                <Mail size={16} />
                <span>{settings.storeEmail}</span>
              </li>
            </ul>

            <h4 className="font-semibold mb-3 text-foreground">
              Newsletter
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition"
              >
                <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-border/50 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-foreground/60">
            {settings.footerText ||
              `© ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.`}
          </p>

          <div className="flex gap-6 text-xs sm:text-sm text-foreground/60">
            <Link to="#" className="hover:text-primary transition">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-primary transition">
              Terms of Service
            </Link>
            <Link to="#" className="hover:text-primary transition">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
