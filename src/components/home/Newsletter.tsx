'use client';

import React, { useState } from 'react';
import {
  Mail,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export default function Newsletter() {
  const { ref, isVisible } = useScrollAnimation();

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitted(true);
      setEmail('');

      setTimeout(() => {
        setSubmitted(false);
      }, 4500);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="newsletter"
      className="py-24 bg-gradient-to-br from-rose-500 via-pink-500 to-amber-500"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative rounded-3xl overflow-hidden bg-white/95 backdrop-blur border border-white/30 shadow-2xl transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Decorative Blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-300/30 rounded-full blur-3xl" />

          <div className="relative p-12 sm:p-16 lg:p-20 text-center space-y-10">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/15 border border-primary/30 mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>

            {/* Heading */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground">
                Stay in the Scoop!
              </h2>
              <p className="text-lg text-foreground/70">
                Subscribe to get exclusive offers, new flavour alerts, and sweet
                surprises delivered straight to your inbox.
              </p>
            </div>

            {/* Form */}
            {!submitted ? (
              <form
                onSubmit={handleSubmit}
                className="max-w-md mx-auto space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      disabled={isLoading}
                      required
                      className="w-full pl-12 pr-4 py-4 rounded-full bg-white border-2 border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-md"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-4 rounded-full bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Subscribing
                      </>
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
              </form>
            ) : (
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-primary/10 border border-primary/20 rounded-full text-primary font-semibold animate-fade-in-up">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                You’re subscribed! Check your inbox for a sweet surprise 🎉
              </div>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-foreground/70">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Exclusive Offers
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                New Flavour Alerts
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                No Spam, Ever
              </div>
            </div>

            {/* Privacy */}
            <p className="text-xs text-foreground/50 max-w-md mx-auto">
              We respect your privacy. You can unsubscribe at any time. No spam,
              ever.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
