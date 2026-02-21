import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/api/client';

interface Feature {
    icon: string;
    title: string;
    description: string;
    color?: string;
}

interface TrustIndicator {
    icon: string;
    text: string;
}

interface Category {
    name: string;
    description: string;
    emoji: string;
}

interface SiteSettings {
    // Store Info
    storeName: string;
    storeTagline: string;
    storeDescription: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCity: string;
    storeState: string;
    storePincode: string;
    
    // Hero Section
    heroTitle: string;
    heroHighlight: string;
    heroSubtitle: string;
    heroBadge: string;
    
    // Features
    features: Feature[];
    
    // Trust Indicators
    trustIndicators: TrustIndicator[];
    
    // About Section
    aboutTitle: string;
    aboutSubtitle: string;
    aboutDescription: string;
    aboutYearFounded: string;
    
    // Categories
    categories: Category[];
    carouselImages: string[];
    
    // Product Settings
    productCategories: string[];
    productSizes: string[];
    productFlavors: string[];
    productDietary: string[];
    
    // Business Settings
    taxRate: number;
    deliveryCharges: number;
    freeDeliveryThreshold: number;
    minOrderAmount: number;
    estimatedDeliveryDays: number;
    
    // Payment Methods
    enableCOD: boolean;
    enableUPI: boolean;
    enableCard: boolean;
    
    // Social Links
    socialInstagram: string;
    socialFacebook: string;
    socialTwitter: string;
    socialWhatsapp: string;
    
    // Footer
    footerText: string;
}

interface SettingsContextType {
    settings: SiteSettings;
    isLoading: boolean;
    error: string | null;
    refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
    storeName: "Baba Dairy",
    storeTagline: "Premium Sweets, Ice Cream & Bakery",
    storeDescription: "Delicious sweets, artisan ice creams, and fresh bakery items crafted with love and tradition.",
    storeEmail: "contact@babadairy.com",
    storePhone: "+91 98765 43210",
    storeAddress: "123 Sweet Street",
    storeCity: "Mumbai",
    storeState: "Maharashtra",
    storePincode: "400001",
    
    heroTitle: "Taste the",
    heroHighlight: "Tradition",
    heroSubtitle: "Premium sweets, artisan ice creams, and fresh bakery items crafted with love. Every bite tells a story of tradition and quality.",
    heroBadge: "Handcrafted with Love",
    
    features: [
        { icon: "Leaf", title: "Fresh Ingredients", description: "Made with quality ingredients and authentic recipes" },
        { icon: "Heart", title: "Made with Love", description: "Every batch is crafted with passion and care" },
        { icon: "Truck", title: "Free Delivery", description: "Free home delivery on orders above ₹500" },
        { icon: "Clock", title: "Fresh Daily", description: "Prepared fresh every day with finest ingredients" },
    ],
    
    trustIndicators: [
        { icon: "★★★★★", text: "4.9 Rating" },
        { icon: "🚚", text: "Free Delivery" },
        { icon: "✨", text: "Fresh Daily" },
    ],
    
    aboutTitle: "Our Story",
    aboutSubtitle: "A Journey of Passion & Tradition",
    aboutDescription: "At Baba Dairy, we believe that every sweet treat is a moment of pure joy – crafted to perfection.",
    aboutYearFounded: "2019",
    
    categories: [
        { name: "Sweets", description: "Traditional Indian sweets & mithai", emoji: "🍬" },
        { name: "Ice Cream", description: "Premium handcrafted ice creams", emoji: "🍨" },
        { name: "Bakery", description: "Fresh baked goods & pastries", emoji: "🥐" },
        { name: "Cakes", description: "Custom cakes for every occasion", emoji: "🎂" },
        { name: "Chocolates", description: "Artisan chocolates & truffles", emoji: "🍫" },
        { name: "Snacks", description: "Namkeen, chips & savory treats", emoji: "🥨" },
    ],
    
    carouselImages: [],
    
    productCategories: ["Sweets", "Ice Cream", "Bakery", "Cakes", "Chocolates", "Snacks", "Dry Fruits", "Beverages"],
    productSizes: ["Small", "Medium", "Large", "250g", "500g", "1 Kg", "Family Pack"],
    productFlavors: ["Traditional", "Chocolate", "Vanilla", "Strawberry", "Mango", "Butterscotch", "Pista", "Kesar", "Rose", "Cardamom"],
    productDietary: ["Vegetarian", "Eggless", "Sugar-Free", "Gluten-Free", "Vegan", "Organic"],
    
    taxRate: 5,
    deliveryCharges: 40,
    freeDeliveryThreshold: 500,
    minOrderAmount: 100,
    estimatedDeliveryDays: 3,
    
    enableCOD: true,
    enableUPI: true,
    enableCard: true,
    
    socialInstagram: "",
    socialFacebook: "",
    socialTwitter: "",
    socialWhatsapp: "",
    
    footerText: "© 2024 Baba Dairy. All rights reserved.",
};

const SettingsContext = createContext<SettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    error: null,
    refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        const publicUrl = '/settings/public';
        try {
            setIsLoading(true);
            setError(null);
            const response = await apiClient.get(publicUrl);
            if (response) {
                const newSettings = { ...defaultSettings, ...response };
                setSettings(newSettings);
            }
        } catch (err) {
            console.error('Failed to fetch settings from', publicUrl, err);
            setError('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const refreshSettings = async () => {
        await fetchSettings();
    };

    useEffect(() => {
        fetchSettings();
        
        // Listen for settings updates
        const handleSettingsUpdate = () => {
            console.log('settingsUpdated event received, refreshing settings...');
            fetchSettings();
        };
        window.addEventListener('settingsUpdated', handleSettingsUpdate);
        
        return () => {
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, isLoading, error, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}

export type { SiteSettings, Feature, TrustIndicator, Category };

