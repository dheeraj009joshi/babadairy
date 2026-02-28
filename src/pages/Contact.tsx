import { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, Instagram, Facebook, Twitter } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

export default function Contact() {
    const { settings } = useSettings();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        toast.success('Message sent successfully! We\'ll get back to you soon.');
        setFormData({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
        });
        setIsSubmitting(false);
    };

    const contactInfo = [
        {
            icon: MapPin,
            title: 'Visit Us',
            details: [
                settings.storeAddress,
                `${settings.storeCity}, ${settings.storeState}`,
                settings.storePincode
            ].filter(Boolean),
        },
        {
            icon: Phone,
            title: 'Call Us',
            details: [settings.storePhone].filter(Boolean),
        },
        {
            icon: Mail,
            title: 'Email Us',
            details: [settings.storeEmail].filter(Boolean),
        },
        {
            icon: Clock,
            title: 'Working Hours',
            details: ['Mon - Sat: 10:00 AM - 9:00 PM', 'Sunday: 11:00 AM - 8:00 PM'],
        },
    ];

    const faqs = [
        {
            question: 'What are your delivery areas?',
            answer: 'We currently deliver across Mumbai, Pune, and Bangalore. We\'re expanding to more cities soon!',
        },
        {
            question: 'How do you maintain ice cream freshness during delivery?',
            answer: 'We use insulated packaging with dry ice and temperature-controlled vehicles to ensure your ice cream arrives perfectly frozen.',
        },
        {
            question: 'Can I customize my order for events?',
            answer: 'Absolutely! We offer bulk orders and custom variants for events. Contact us at events@babadairy.com for special requests.',
        },
        {
            question: 'What is your return policy?',
            answer: 'If you\'re not satisfied with your order, contact us within 24 hours of delivery and we\'ll make it right.',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 bg-gradient-to-br from-primary/10 via-cream to-secondary/10 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
                        <div className="absolute bottom-20 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-chocolate mb-6">
                                Get in
                                <span className="text-primary"> Touch</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-chocolate/70 leading-relaxed">
                                Have a question, feedback, or just want to say hello? 
                                We'd love to hear from you. Our team is here to help!
                            </p>
                        </div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-cream rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-display font-bold text-chocolate mb-3">
                                            {info.title}
                                        </h3>
                                        <div className="space-y-1">
                                            {info.details.map((detail, idx) => (
                                                <p key={idx} className="text-chocolate/70 text-sm">
                                                    {detail}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Form & Map */}
                <section className="py-20 bg-cream">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {/* Contact Form */}
                            <div className="bg-white rounded-2xl p-8 shadow-lg">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <MessageCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-display font-bold text-chocolate">
                                        Send us a Message
                                    </h2>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="Your name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder={settings.storePhone || "+91 98765 43210"}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="subject">Subject</Label>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                placeholder="How can we help?"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us more about your inquiry..."
                                            rows={5}
                                            required
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </div>

                            {/* Map / Location */}
                            <div className="space-y-6">
                                {/* Map Placeholder */}
                                <div className="bg-white rounded-2xl p-4 shadow-lg h-80">
                                    <div className="w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl flex items-center justify-center">
                                        <div className="text-center">
                                            <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                                            <p className="text-chocolate font-display font-bold text-xl">{settings.storeName}</p>
                                            <p className="text-chocolate/70">{settings.storeAddress}, {settings.storeCity}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="bg-white rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-lg font-display font-bold text-chocolate mb-4">
                                        Follow Us
                                    </h3>
                                    <p className="text-chocolate/70 mb-4">
                                        Stay connected for updates, new flavors, and special offers!
                                    </p>
                                    <div className="flex gap-4">
                                        {settings.socialInstagram && (
                                            <a
                                                href={settings.socialInstagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                                            >
                                                <Instagram className="h-5 w-5" />
                                            </a>
                                        )}
                                        {settings.socialFacebook && (
                                            <a
                                                href={settings.socialFacebook}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white hover:scale-110 transition-transform"
                                            >
                                                <Facebook className="h-5 w-5" />
                                            </a>
                                        )}
                                        {settings.socialTwitter && (
                                            <a
                                                href={settings.socialTwitter}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                                            >
                                                <Twitter className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQs Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl font-display font-bold text-chocolate mb-4">
                                Frequently Asked Questions
                            </h2>
                            <p className="text-lg text-chocolate/70">
                                Quick answers to common questions
                            </p>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="bg-cream rounded-xl p-6 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="text-lg font-display font-bold text-chocolate mb-2">
                                        {faq.question}
                                    </h3>
                                    <p className="text-chocolate/70">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16 bg-gradient-to-r from-primary via-secondary to-accent">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
                            Can't find what you're looking for?
                        </h2>
                        <p className="text-white/80 mb-6">
                            Our customer support team is available to help you with any questions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a href={`tel:${settings.storePhone}`}>
                                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                                    <Phone className="h-4 w-4 mr-2" />
                                    Call Now
                                </Button>
                            </a>
                            <a href={`mailto:${settings.storeEmail}`}>
                                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email Support
                                </Button>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

