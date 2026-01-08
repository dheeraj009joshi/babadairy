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
    storeName: "Jas&Mey Ice Cream",
    storeTagline: "Premium Ice Creams",
    storeDescription: "Premium artisan ice creams crafted with the finest ingredients.",
    storeEmail: "contact@jasmey.com",
    storePhone: "+91 98765 43210",
    storeAddress: "123 Ice Cream Lane",
    storeCity: "Mumbai",
    storeState: "Maharashtra",
    storePincode: "400001",
    
    heroTitle: "Scoop into",
    heroHighlight: "Happiness",
    heroSubtitle: "Premium artisan ice creams crafted with the finest ingredients. Every scoop tells a story of passion and perfection.",
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
        { icon: "❄️", text: "Fresh Daily" },
    ],
    
    aboutTitle: "Our Story",
    aboutSubtitle: "A Journey of Passion & Flavour",
    aboutDescription: "At Jas&Mey, we believe that ice cream isn't just a dessert – it's a moment of pure joy.",
    aboutYearFounded: "2019",
    
    categories: [
        { name: "Cups", description: "Perfect single servings in delicious flavours", emoji: "🥤" },
        { name: "Cones", description: "Classic cones with crispy wafers", emoji: "🍦" },
        { name: "Tubs", description: "Share with family or enjoy yourself", emoji: "🍨" },
        { name: "Family Packs", description: "Perfect for gatherings & celebrations", emoji: "👨‍👩‍👧‍👦" },
        { name: "Premium", description: "Luxury flavours with premium ingredients", emoji: "✨" },
        { name: "Specials", description: "Limited editions & seasonal favourites", emoji: "🌟" },
    ],
    
    carouselImages: [
        "/img-crausal/8.png",
        "/img-crausal/10.png",
        "/img-crausal/13.png",
        "/img-crausal/14.png",
        "/img-crausal/15.png",
        "/img-crausal/17.png",
        "/img-crausal/21.png",
        "/img-crausal/23.png",
        "/img-crausal/25.png",
        "/img-crausal/26.png",
        "/img-crausal/73.png",
    ],
    
    productCategories: ["Cups", "Cones", "Tubs", "Family Packs", "Premium", "Specials"],
    productSizes: ["Small (100ml)", "Medium (250ml)", "Large (500ml)", "Family (1L)", "Party (2L)"],
    productFlavors: ["Vanilla", "Chocolate", "Strawberry", "Mango", "Butterscotch", "Pista", "Kesar", "Black Currant", "Coffee", "Cookies & Cream"],
    productDietary: ["Vegetarian", "Eggless", "Low Fat", "Gluten-Free", "Vegan", "Keto-Friendly", "Organic"],
    
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
    
    footerText: "© 2024 Jas&Mey. All rights reserved.",
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
        try {
            setIsLoading(true);
            setError(null);
            // apiClient.get returns JSON directly, not wrapped in { data: ... }
            const response = await apiClient.get('/settings/public');
            console.log('Fetched settings from API:', response);
            if (response) {
                const newSettings = { ...defaultSettings, ...response };
                console.log('Updating settings state:', newSettings);
                setSettings(newSettings);
            }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            setError('Failed to load settings');
            // Use default settings on error
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

