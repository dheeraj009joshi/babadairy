 'use client';

import { Instagram, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

interface Post {
  id: number;
  image: string;
  likes: string;
  comments: number;
  caption: string;
}

const posts: Post[] = [
  { id: 1, image: '🍦', likes: '2.4K', comments: 89, caption: 'Summer vibes with our classic vanilla' },
  { id: 2, image: '🍫', likes: '3.1K', comments: 124, caption: 'Chocolate lovers, this one\'s for you!' },
  { id: 3, image: '🍓', likes: '1.8K', comments: 67, caption: 'Fresh strawberry goodness' },
  { id: 4, image: '🥭', likes: '2.9K', comments: 98, caption: 'Mango season is here!' },
  { id: 5, image: '🍨', likes: '4.2K', comments: 156, caption: 'Sunday sundae funday' },
  { id: 6, image: '🧁', likes: '1.5K', comments: 45, caption: 'New flavour alert!' },
];

export default function InstagramFeed() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      id="social"
      className="py-24 bg-background overflow-x-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* HEADER */}
        <div
          className={`text-center mb-14 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 border border-pink-200 mb-4">
            <Instagram size={16} className="text-pink-600" />
            <span className="text-xs font-semibold text-pink-600 uppercase tracking-wider">
              @babadairy
            </span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Follow Us on Instagram
          </h2>

          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Join our community and stay updated with the latest products and offers
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {posts.map((post, index) => (
            <a
              key={post.id}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 transition-all duration-500 hover:shadow-xl ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* CONTENT */}
              <div className="absolute inset-0 flex items-center justify-center text-5xl">
                {post.image}
              </div>

              {/* HOVER OVERLAY */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="text-white text-center px-3">
                  <div className="flex justify-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <Heart className="w-5 h-5 fill-white" />
                      <span className="font-semibold">{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{post.comments}</span>
                    </div>
                  </div>
                  <p className="text-sm text-white/85 line-clamp-2">
                    {post.caption}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`text-center transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <a
            href="https://instagram.com/babadairy"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <Instagram size={20} />
            Follow @babadairy
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
