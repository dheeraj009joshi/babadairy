import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/api/client';
import {
    Store,
    CreditCard,
    Truck,
    Bell,
    Shield,
    Save,
    Mail,
    Phone,
    MapPin,
    Percent,
    DollarSign,
    Clock,
    FileText,
    Package,
    Plus,
    X,
    Tag,
    Ruler,
    Leaf,
    IceCream,
    Image,
    Layout,
    Globe,
    Loader2
} from 'lucide-react';

interface SiteSettings {
    // Store Info
    store_name: string;
    store_tagline: string;
    store_description: string;
    store_email: string;
    store_phone: string;
    store_address: string;
    store_city: string;
    store_state: string;
    store_pincode: string;
    store_gstin: string;
    
    // Hero Section
    hero_title: string;
    hero_highlight: string;
    hero_subtitle: string;
    hero_badge: string;
    
    // Features
    features: Array<{ icon: string; title: string; description: string }>;
    
    // Trust Indicators
    trust_indicators: Array<{ icon: string; text: string }>;
    
    // About Section
    about_title: string;
    about_subtitle: string;
    about_description: string;
    about_year_founded: string;
    
    // Categories
    categories: Array<{ name: string; description: string; emoji: string }>;
    
    // Product Settings
    product_categories: string[];
    product_sizes: string[];
    product_flavors: string[];
    product_dietary: string[];
    
    // Carousel Images
    carousel_images: string[];
    
    // Business Settings
    tax_rate: number;
    delivery_charges: number;
    free_delivery_threshold: number;
    min_order_amount: number;
    estimated_delivery_days: number;
    low_stock_threshold: number;
    
    // Payment Methods
    enable_cod: boolean;
    enable_upi: boolean;
    enable_card: boolean;
    
    // Billing
    order_prefix: string;
    invoice_prefix: string;
    
    // Social Links
    social_instagram: string;
    social_facebook: string;
    social_twitter: string;
    social_whatsapp: string;
    
    // Footer
    footer_text: string;
    
    // Notifications
    enable_notifications: boolean;
}

const defaultSettings: SiteSettings = {
    store_name: "Jas&Mey Ice Cream",
    store_tagline: "Premium Ice Creams",
    store_description: "Premium artisan ice creams crafted with the finest ingredients.",
    store_email: "contact@jasmey.com",
    store_phone: "+91 98765 43210",
    store_address: "123 Ice Cream Lane",
    store_city: "Mumbai",
    store_state: "Maharashtra",
    store_pincode: "400001",
    store_gstin: "",
    
    hero_title: "Scoop into",
    hero_highlight: "Happiness",
    hero_subtitle: "Premium artisan ice creams crafted with the finest ingredients. Every scoop tells a story of passion and perfection.",
    hero_badge: "Handcrafted with Love",
    
    features: [
        { icon: "Leaf", title: "Fresh Ingredients", description: "Made with quality ingredients and authentic recipes" },
        { icon: "Heart", title: "Made with Love", description: "Every batch is crafted with passion and care" },
        { icon: "Truck", title: "Free Delivery", description: "Free home delivery on orders above ₹500" },
        { icon: "Clock", title: "Fresh Daily", description: "Prepared fresh every day with finest ingredients" },
    ],
    
    trust_indicators: [
        { icon: "★★★★★", text: "4.9 Rating" },
        { icon: "🚚", text: "Free Delivery" },
        { icon: "❄️", text: "Fresh Daily" },
    ],
    
    about_title: "Our Story",
    about_subtitle: "A Journey of Passion & Flavour",
    about_description: "At Jas&Mey, we believe that ice cream isn't just a dessert – it's a moment of pure joy.",
    about_year_founded: "2019",
    
    categories: [
        { name: "Cups", description: "Perfect single servings in delicious flavours", emoji: "🥤" },
        { name: "Cones", description: "Classic cones with crispy wafers", emoji: "🍦" },
        { name: "Tubs", description: "Share with family or enjoy yourself", emoji: "🍨" },
        { name: "Family Packs", description: "Perfect for gatherings & celebrations", emoji: "👨‍👩‍👧‍👦" },
        { name: "Premium", description: "Luxury flavours with premium ingredients", emoji: "✨" },
        { name: "Specials", description: "Limited editions & seasonal favourites", emoji: "🌟" },
    ],
    
    product_categories: ["Cups", "Cones", "Tubs", "Family Packs", "Premium", "Specials"],
    product_sizes: ["Small (100ml)", "Medium (250ml)", "Large (500ml)", "Family (1L)", "Party (2L)"],
    product_flavors: ["Vanilla", "Chocolate", "Strawberry", "Mango", "Butterscotch", "Pista", "Kesar", "Black Currant", "Coffee", "Cookies & Cream"],
    product_dietary: ["Vegetarian", "Eggless", "Low Fat", "Gluten-Free", "Vegan", "Keto-Friendly", "Organic"],
    
    carousel_images: [
        "/img-crausal/8.png",
        "/img-crausal/10.png",
        "/img-crausal/13.png",
        "/img-crausal/14.png",
        "/img-crausal/15.png",
    ],
    
    tax_rate: 5,
    delivery_charges: 40,
    free_delivery_threshold: 500,
    min_order_amount: 100,
    estimated_delivery_days: 3,
    low_stock_threshold: 10,
    
    enable_cod: true,
    enable_upi: true,
    enable_card: true,
    
    order_prefix: "ORD",
    invoice_prefix: "INV",
    
    social_instagram: "",
    social_facebook: "",
    social_twitter: "",
    social_whatsapp: "",
    
    footer_text: "",
    
    enable_notifications: true,
};

export default function Settings() {
    const { isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'store' | 'website' | 'products' | 'payment' | 'delivery' | 'billing'>('store');
    
    // New item inputs
    const [newCategory, setNewCategory] = useState('');
    const [newSize, setNewSize] = useState('');
    const [newFlavor, setNewFlavor] = useState('');
    const [newDietary, setNewDietary] = useState('');
    const [newCarouselImage, setNewCarouselImage] = useState('');
    
    // Category editing
    const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
    const [editCategoryData, setEditCategoryData] = useState({ name: '', description: '', emoji: '' });

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setIsLoading(true);
            const response = await apiClient.get('/settings/');
            // API client returns JSON directly, not wrapped in data
            if (response) {
                // Merge backend response with defaults to ensure all fields exist
                const loadedSettings = {
                    ...defaultSettings,
                    ...response,
                    // Ensure arrays are properly set (don't override with undefined)
                    product_categories: response.product_categories || defaultSettings.product_categories,
                    product_sizes: response.product_sizes || defaultSettings.product_sizes,
                    product_flavors: response.product_flavors || defaultSettings.product_flavors,
                    product_dietary: response.product_dietary || defaultSettings.product_dietary,
                    categories: response.categories || defaultSettings.categories,
                    carousel_images: response.carousel_images || defaultSettings.carousel_images,
                    features: response.features || defaultSettings.features,
                    trust_indicators: response.trust_indicators || defaultSettings.trust_indicators,
                };
                setSettings(loadedSettings);
                console.log('Settings loaded from backend:', loadedSettings);
            } else {
                // If no response, use defaults
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
            toast.error('Failed to load settings. Using default values.');
            // Use defaults on error
            setSettings(defaultSettings);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            console.log('Saving settings to backend:', settings);
            console.log('Settings object keys:', Object.keys(settings));
            // apiClient.put returns the JSON directly, not wrapped in { data: ... }
            const response = await apiClient.put('/settings/', settings);
            console.log('Settings saved response:', response);
            console.log('Verifying save - fetching settings again...');
            // Verify by fetching the settings again
            const verifyResponse = await apiClient.get('/settings/');
            console.log('Verified settings from DB:', verifyResponse);
            toast.success('Settings saved successfully! Refreshing...');
            // Dispatch event to refresh settings across the app
            setTimeout(() => {
                window.dispatchEvent(new Event('settingsUpdated'));
            }, 100);
        } catch (error: any) {
            console.error('Error saving settings:', error);
            console.error('Error message:', error?.message);
            toast.error(`Failed to save settings: ${error?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof SiteSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Product settings handlers - auto-save to backend
    const addProductItem = async (type: 'product_categories' | 'product_sizes' | 'product_flavors' | 'product_dietary', value: string) => {
        if (!value.trim()) return;
        if (settings[type].includes(value.trim())) {
            toast.error(`${value} already exists`);
            return;
        }
        const updatedSettings = {
            ...settings,
            [type]: [...settings[type], value.trim()]
        };
        setSettings(updatedSettings);
        switch (type) {
            case 'product_categories': setNewCategory(''); break;
            case 'product_sizes': setNewSize(''); break;
            case 'product_flavors': setNewFlavor(''); break;
            case 'product_dietary': setNewDietary(''); break;
        }
        
        // Auto-save to backend
        try {
            await apiClient.put('/settings/', { [type]: updatedSettings[type] });
            toast.success(`Added ${value}`);
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('settingsUpdated'));
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
            // Revert on error
            setSettings(settings);
        }
    };

    const removeProductItem = async (type: 'product_categories' | 'product_sizes' | 'product_flavors' | 'product_dietary', value: string) => {
        const updatedSettings = {
            ...settings,
            [type]: settings[type].filter(item => item !== value)
        };
        setSettings(updatedSettings);
        
        // Auto-save to backend
        try {
            await apiClient.put('/settings/', { [type]: updatedSettings[type] });
            toast.success(`Removed ${value}`);
            // Dispatch event to notify other components
            window.dispatchEvent(new Event('settingsUpdated'));
        } catch (error: any) {
            console.error('Error saving settings:', error);
            toast.error(`Failed to save: ${error?.message || 'Unknown error'}`);
            // Revert on error
            setSettings(settings);
        }
    };

    // Category handlers
    const addCategory = () => {
        if (!editCategoryData.name.trim()) return;
        setSettings(prev => ({
            ...prev,
            categories: [...prev.categories, editCategoryData]
        }));
        setEditCategoryData({ name: '', description: '', emoji: '' });
        toast.success('Category added');
    };

    const removeCategory = (index: number) => {
        setSettings(prev => ({
            ...prev,
            categories: prev.categories.filter((_, i) => i !== index)
        }));
        toast.success('Category removed');
    };

    const updateCategory = (index: number) => {
        setSettings(prev => ({
            ...prev,
            categories: prev.categories.map((cat, i) => i === index ? editCategoryData : cat)
        }));
        setEditingCategoryIndex(null);
        setEditCategoryData({ name: '', description: '', emoji: '' });
        toast.success('Category updated');
    };

    // Carousel handlers
    const addCarouselImage = () => {
        if (!newCarouselImage.trim()) return;
        setSettings(prev => ({
            ...prev,
            carousel_images: [...prev.carousel_images, newCarouselImage.trim()]
        }));
        setNewCarouselImage('');
        toast.success('Image added');
    };

    const removeCarouselImage = (index: number) => {
        setSettings(prev => ({
            ...prev,
            carousel_images: prev.carousel_images.filter((_, i) => i !== index)
        }));
        toast.success('Image removed');
    };

    // Trust indicator handlers
    const addTrustIndicator = () => {
        setSettings(prev => ({
            ...prev,
            trust_indicators: [...prev.trust_indicators, { icon: '⭐', text: 'New Indicator' }]
        }));
    };

    const updateTrustIndicator = (index: number, field: 'icon' | 'text', value: string) => {
        setSettings(prev => ({
            ...prev,
            trust_indicators: prev.trust_indicators.map((ind, i) => 
                i === index ? { ...ind, [field]: value } : ind
            )
        }));
    };

    const removeTrustIndicator = (index: number) => {
        setSettings(prev => ({
            ...prev,
            trust_indicators: prev.trust_indicators.filter((_, i) => i !== index)
        }));
    };

    const tabs = [
        { id: 'store', label: 'Store Info', icon: Store },
        { id: 'website', label: 'Website', icon: Layout },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'billing', label: 'Billing', icon: FileText },
    ];

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-chocolate">Settings</h1>
                        <p className="text-chocolate/70 mt-1">Manage your store and website configuration</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="flex border-b border-chocolate/10 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary bg-primary/5'
                                            : 'text-chocolate/60 hover:text-chocolate hover:bg-cream'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-6">
                        {/* Store Info Tab */}
                        {activeTab === 'store' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Store className="h-4 w-4 inline mr-2" />
                                            Store Name
                                        </label>
                                        <Input
                                            value={settings.store_name}
                                            onChange={(e) => handleChange('store_name', e.target.value)}
                                            placeholder="Your Store Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            Tagline
                                        </label>
                                        <Input
                                            value={settings.store_tagline}
                                            onChange={(e) => handleChange('store_tagline', e.target.value)}
                                            placeholder="Premium Ice Creams"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            Store Description
                                        </label>
                                        <Textarea
                                            value={settings.store_description}
                                            onChange={(e) => handleChange('store_description', e.target.value)}
                                            placeholder="Describe your store..."
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Mail className="h-4 w-4 inline mr-2" />
                                            Store Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={settings.store_email}
                                            onChange={(e) => handleChange('store_email', e.target.value)}
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Phone className="h-4 w-4 inline mr-2" />
                                            Store Phone
                                        </label>
                                        <Input
                                            value={settings.store_phone}
                                            onChange={(e) => handleChange('store_phone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Shield className="h-4 w-4 inline mr-2" />
                                            GSTIN
                                        </label>
                                        <Input
                                            value={settings.store_gstin}
                                            onChange={(e) => handleChange('store_gstin', e.target.value)}
                                            placeholder="27AABCU9603R1ZM"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-chocolate mb-2">
                                        <MapPin className="h-4 w-4 inline mr-2" />
                                        Store Address
                                    </label>
                                    <Input
                                        value={settings.store_address}
                                        onChange={(e) => handleChange('store_address', e.target.value)}
                                        placeholder="Street Address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">City</label>
                                        <Input
                                            value={settings.store_city}
                                            onChange={(e) => handleChange('store_city', e.target.value)}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">State</label>
                                        <Input
                                            value={settings.store_state}
                                            onChange={(e) => handleChange('store_state', e.target.value)}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">Pincode</label>
                                        <Input
                                            value={settings.store_pincode}
                                            onChange={(e) => handleChange('store_pincode', e.target.value)}
                                            placeholder="400001"
                                        />
                                    </div>
                                </div>

                                {/* Social Links */}
                                <div className="border-t border-chocolate/10 pt-6">
                                    <h3 className="text-lg font-semibold text-chocolate mb-4 flex items-center gap-2">
                                        <Globe className="h-5 w-5" />
                                        Social Media Links
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Instagram URL</label>
                                            <Input
                                                value={settings.social_instagram}
                                                onChange={(e) => handleChange('social_instagram', e.target.value)}
                                                placeholder="https://instagram.com/yourpage"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Facebook URL</label>
                                            <Input
                                                value={settings.social_facebook}
                                                onChange={(e) => handleChange('social_facebook', e.target.value)}
                                                placeholder="https://facebook.com/yourpage"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Twitter URL</label>
                                            <Input
                                                value={settings.social_twitter}
                                                onChange={(e) => handleChange('social_twitter', e.target.value)}
                                                placeholder="https://twitter.com/yourhandle"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">WhatsApp Number</label>
                                            <Input
                                                value={settings.social_whatsapp}
                                                onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                                                placeholder="+919876543210"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Website Tab */}
                        {activeTab === 'website' && (
                            <div className="space-y-8">
                                {/* Hero Section */}
                                <div>
                                    <h3 className="text-lg font-semibold text-chocolate mb-4">Hero Section</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Badge Text</label>
                                            <Input
                                                value={settings.hero_badge}
                                                onChange={(e) => handleChange('hero_badge', e.target.value)}
                                                placeholder="Handcrafted with Love"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Title (Line 1)</label>
                                            <Input
                                                value={settings.hero_title}
                                                onChange={(e) => handleChange('hero_title', e.target.value)}
                                                placeholder="Scoop into"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-chocolate mb-2">Title Highlight (Line 2)</label>
                                            <Input
                                                value={settings.hero_highlight}
                                                onChange={(e) => handleChange('hero_highlight', e.target.value)}
                                                placeholder="Happiness"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-chocolate mb-2">Subtitle</label>
                                            <Textarea
                                                value={settings.hero_subtitle}
                                                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
                                                placeholder="Premium artisan ice creams..."
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Trust Indicators */}
                                <div className="border-t border-chocolate/10 pt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-chocolate">Trust Indicators</h3>
                                        <Button variant="outline" size="sm" onClick={addTrustIndicator}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {settings.trust_indicators.map((indicator, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                                                <Input
                                                    value={indicator.icon}
                                                    onChange={(e) => updateTrustIndicator(index, 'icon', e.target.value)}
                                                    placeholder="Icon/Emoji"
                                                    className="w-24"
                                                />
                                                <Input
                                                    value={indicator.text}
                                                    onChange={(e) => updateTrustIndicator(index, 'text', e.target.value)}
                                                    placeholder="Text"
                                                    className="flex-1"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeTrustIndicator(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Carousel Images */}
                                <div className="border-t border-chocolate/10 pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Image className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-chocolate">Carousel Images</h3>
                                    </div>
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Add image URLs for the homepage carousel
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {settings.carousel_images.map((image, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={image}
                                                    alt={`Carousel ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg border"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://via.placeholder.com/150?text=Image';
                                                    }}
                                                />
                                                <button
                                                    onClick={() => removeCarouselImage(index)}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newCarouselImage}
                                            onChange={(e) => setNewCarouselImage(e.target.value)}
                                            placeholder="Image URL (e.g., /img-crausal/1.png)"
                                            className="flex-1"
                                        />
                                        <Button variant="outline" onClick={addCarouselImage}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Categories Display */}
                                <div className="border-t border-chocolate/10 pt-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-chocolate">Homepage Categories</h3>
                                    </div>
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        These categories are displayed on the homepage
                                    </p>
                                    <div className="space-y-3 mb-4">
                                        {settings.categories.map((cat, index) => (
                                            <div key={index} className="flex items-center gap-3 p-3 bg-cream rounded-lg">
                                                {editingCategoryIndex === index ? (
                                                    <>
                                                        <Input
                                                            value={editCategoryData.emoji}
                                                            onChange={(e) => setEditCategoryData(prev => ({ ...prev, emoji: e.target.value }))}
                                                            placeholder="Emoji"
                                                            className="w-16"
                                                        />
                                                        <Input
                                                            value={editCategoryData.name}
                                                            onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                                                            placeholder="Name"
                                                            className="w-32"
                                                        />
                                                        <Input
                                                            value={editCategoryData.description}
                                                            onChange={(e) => setEditCategoryData(prev => ({ ...prev, description: e.target.value }))}
                                                            placeholder="Description"
                                                            className="flex-1"
                                                        />
                                                        <Button size="sm" onClick={() => updateCategory(index)}>Save</Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setEditingCategoryIndex(null)}>Cancel</Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span className="text-2xl">{cat.emoji}</span>
                                                        <span className="font-medium">{cat.name}</span>
                                                        <span className="text-sm text-chocolate/60 flex-1">{cat.description}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                setEditingCategoryIndex(index);
                                                                setEditCategoryData(cat);
                                                            }}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeCategory(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 items-end">
                                        <div>
                                            <label className="block text-xs text-chocolate/60 mb-1">Emoji</label>
                                            <Input
                                                value={editCategoryData.emoji}
                                                onChange={(e) => setEditCategoryData(prev => ({ ...prev, emoji: e.target.value }))}
                                                placeholder="🍦"
                                                className="w-16"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-chocolate/60 mb-1">Name</label>
                                            <Input
                                                value={editCategoryData.name}
                                                onChange={(e) => setEditCategoryData(prev => ({ ...prev, name: e.target.value }))}
                                                placeholder="Category Name"
                                                className="w-32"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-chocolate/60 mb-1">Description</label>
                                            <Input
                                                value={editCategoryData.description}
                                                onChange={(e) => setEditCategoryData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Category description"
                                            />
                                        </div>
                                        <Button variant="outline" onClick={addCategory}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-chocolate/10 pt-6">
                                    <h3 className="text-lg font-semibold text-chocolate mb-4">Footer</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">Footer Text</label>
                                        <Input
                                            value={settings.footer_text}
                                            onChange={(e) => handleChange('footer_text', e.target.value)}
                                            placeholder="© 2024 Your Store. All rights reserved."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Tab */}
                        {activeTab === 'products' && (
                            <div className="space-y-8">
                                {/* Categories */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Tag className="h-5 w-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-chocolate">Product Categories</h3>
                                    </div>
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Categories available when creating products
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {settings.product_categories.map((category) => (
                                            <span
                                                key={category}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                                            >
                                                {category}
                                                <button
                                                    onClick={() => removeProductItem('product_categories', category)}
                                                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            placeholder="Add new category..."
                                            className="max-w-xs"
                                            onKeyDown={(e) => e.key === 'Enter' && addProductItem('product_categories', newCategory)}
                                        />
                                        <Button variant="outline" onClick={() => addProductItem('product_categories', newCategory)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div className="border-t border-chocolate/10 pt-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Ruler className="h-5 w-5 text-blue-500" />
                                        <h3 className="text-lg font-semibold text-chocolate">Product Sizes</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {settings.product_sizes.map((size) => (
                                            <span
                                                key={size}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                                            >
                                                {size}
                                                <button
                                                    onClick={() => removeProductItem('product_sizes', size)}
                                                    className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newSize}
                                            onChange={(e) => setNewSize(e.target.value)}
                                            placeholder="Add new size..."
                                            className="max-w-xs"
                                            onKeyDown={(e) => e.key === 'Enter' && addProductItem('product_sizes', newSize)}
                                        />
                                        <Button variant="outline" onClick={() => addProductItem('product_sizes', newSize)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Flavors */}
                                <div className="border-t border-chocolate/10 pt-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <IceCream className="h-5 w-5 text-pink-500" />
                                        <h3 className="text-lg font-semibold text-chocolate">Flavors</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {settings.product_flavors.map((flavor) => (
                                            <span
                                                key={flavor}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium"
                                            >
                                                {flavor}
                                                <button
                                                    onClick={() => removeProductItem('product_flavors', flavor)}
                                                    className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newFlavor}
                                            onChange={(e) => setNewFlavor(e.target.value)}
                                            placeholder="Add new flavor..."
                                            className="max-w-xs"
                                            onKeyDown={(e) => e.key === 'Enter' && addProductItem('product_flavors', newFlavor)}
                                        />
                                        <Button variant="outline" onClick={() => addProductItem('product_flavors', newFlavor)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Dietary Options */}
                                <div className="border-t border-chocolate/10 pt-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Leaf className="h-5 w-5 text-green-500" />
                                        <h3 className="text-lg font-semibold text-chocolate">Dietary Options</h3>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {settings.product_dietary.map((option) => (
                                            <span
                                                key={option}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                                            >
                                                {option}
                                                <button
                                                    onClick={() => removeProductItem('product_dietary', option)}
                                                    className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newDietary}
                                            onChange={(e) => setNewDietary(e.target.value)}
                                            placeholder="Add new dietary option..."
                                            className="max-w-xs"
                                            onKeyDown={(e) => e.key === 'Enter' && addProductItem('product_dietary', newDietary)}
                                        />
                                        <Button variant="outline" onClick={() => addProductItem('product_dietary', newDietary)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Tab */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Percent className="h-4 w-4 inline mr-2" />
                                            Tax Rate (GST %)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.tax_rate}
                                            onChange={(e) => handleChange('tax_rate', Number(e.target.value))}
                                            placeholder="5"
                                            min={0}
                                            max={28}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <DollarSign className="h-4 w-4 inline mr-2" />
                                            Minimum Order Amount (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.min_order_amount}
                                            onChange={(e) => handleChange('min_order_amount', Number(e.target.value))}
                                            placeholder="100"
                                            min={0}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-chocolate/10 pt-6">
                                    <h3 className="text-lg font-semibold text-chocolate mb-4">Payment Methods</h3>
                                    <div className="space-y-4">
                                        <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={settings.enable_cod}
                                                onChange={(e) => handleChange('enable_cod', e.target.checked)}
                                                className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-chocolate">Cash on Delivery (COD)</p>
                                                <p className="text-sm text-chocolate/60">Accept payment upon delivery</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={settings.enable_upi}
                                                onChange={(e) => handleChange('enable_upi', e.target.checked)}
                                                className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-chocolate">UPI Payment</p>
                                                <p className="text-sm text-chocolate/60">Accept UPI payments</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={settings.enable_card}
                                                onChange={(e) => handleChange('enable_card', e.target.checked)}
                                                className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-chocolate">Card Payment</p>
                                                <p className="text-sm text-chocolate/60">Accept credit/debit cards</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Tab */}
                        {activeTab === 'delivery' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Truck className="h-4 w-4 inline mr-2" />
                                            Delivery Charges (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.delivery_charges}
                                            onChange={(e) => handleChange('delivery_charges', Number(e.target.value))}
                                            placeholder="40"
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <DollarSign className="h-4 w-4 inline mr-2" />
                                            Free Delivery Above (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.free_delivery_threshold}
                                            onChange={(e) => handleChange('free_delivery_threshold', Number(e.target.value))}
                                            placeholder="500"
                                            min={0}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Clock className="h-4 w-4 inline mr-2" />
                                            Estimated Delivery (Days)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.estimated_delivery_days}
                                            onChange={(e) => handleChange('estimated_delivery_days', Number(e.target.value))}
                                            placeholder="3"
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Bell className="h-4 w-4 inline mr-2" />
                                            Low Stock Threshold
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.low_stock_threshold}
                                            onChange={(e) => handleChange('low_stock_threshold', Number(e.target.value))}
                                            placeholder="10"
                                            min={1}
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-chocolate/10 pt-6">
                                    <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.enable_notifications}
                                            onChange={(e) => handleChange('enable_notifications', e.target.checked)}
                                            className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-chocolate">Order Notifications</p>
                                            <p className="text-sm text-chocolate/60">Send notifications for new orders</p>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <FileText className="h-4 w-4 inline mr-2" />
                                            Order Number Prefix
                                        </label>
                                        <Input
                                            value={settings.order_prefix}
                                            onChange={(e) => handleChange('order_prefix', e.target.value)}
                                            placeholder="ORD"
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Example: ORD-2024-001</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <FileText className="h-4 w-4 inline mr-2" />
                                            Invoice Number Prefix
                                        </label>
                                        <Input
                                            value={settings.invoice_prefix}
                                            onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                                            placeholder="INV"
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Example: INV-2024-001</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800">GST Compliance</p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                Your GSTIN: <span className="font-mono">{settings.store_gstin || 'Not set'}</span>
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Tax Rate: {settings.tax_rate}% (CGST: {settings.tax_rate/2}% + SGST: {settings.tax_rate/2}%)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Admin Info */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h3 className="text-lg font-semibold text-chocolate mb-4">Admin Account</h3>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-chocolate/80 to-chocolate rounded-full flex items-center justify-center text-white text-2xl font-bold">
                            {user?.name?.charAt(0).toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="font-semibold text-chocolate">{user?.name || 'Admin'}</p>
                            <p className="text-sm text-chocolate/60">{user?.email || 'admin@jasmey.com'}</p>
                            <p className="text-xs text-chocolate/40 mt-1">Administrator</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
