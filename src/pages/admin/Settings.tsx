import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    IceCream
} from 'lucide-react';

interface StoreSettings {
    storeName: string;
    storeEmail: string;
    storePhone: string;
    storeAddress: string;
    storeCity: string;
    storeState: string;
    storePincode: string;
    storeGSTIN: string;
    taxRate: number;
    deliveryCharges: number;
    freeDeliveryThreshold: number;
    minOrderAmount: number;
    estimatedDeliveryDays: number;
    orderPrefix: string;
    invoicePrefix: string;
    enableCOD: boolean;
    enableUPI: boolean;
    enableCard: boolean;
    enableNotifications: boolean;
    lowStockThreshold: number;
}

interface ProductSettings {
    categories: string[];
    sizes: string[];
    flavors: string[];
    dietary: string[];
}

const defaultSettings: StoreSettings = {
    storeName: "Jas&Mey Ice Cream",
    storeEmail: "contact@jasmey.com",
    storePhone: "+91 98765 43210",
    storeAddress: "123 Ice Cream Lane",
    storeCity: "Mumbai",
    storeState: "Maharashtra",
    storePincode: "400001",
    storeGSTIN: "27AABCU9603R1ZM",
    taxRate: 5,
    deliveryCharges: 40,
    freeDeliveryThreshold: 500,
    minOrderAmount: 100,
    estimatedDeliveryDays: 3,
    orderPrefix: "ORD",
    invoicePrefix: "INV",
    enableCOD: true,
    enableUPI: true,
    enableCard: true,
    enableNotifications: true,
    lowStockThreshold: 10,
};

const defaultProductSettings: ProductSettings = {
    categories: ['Cups', 'Cones', 'Tubs', 'Family Packs', 'Premium', 'Specials'],
    sizes: ['Small (100ml)', 'Medium (250ml)', 'Large (500ml)', 'Family (1L)', 'Party (2L)'],
    flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Mango', 'Butterscotch', 'Pista', 'Kesar', 'Black Currant', 'Coffee', 'Cookies & Cream'],
    dietary: ['Vegetarian', 'Eggless', 'Low Fat', 'Gluten-Free', 'Vegan', 'Keto-Friendly', 'Organic'],
};

export default function Settings() {
    const { isAdmin, user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
    const [productSettings, setProductSettings] = useState<ProductSettings>(defaultProductSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'store' | 'products' | 'payment' | 'delivery' | 'billing'>('store');
    
    // New item inputs
    const [newCategory, setNewCategory] = useState('');
    const [newSize, setNewSize] = useState('');
    const [newFlavor, setNewFlavor] = useState('');
    const [newDietary, setNewDietary] = useState('');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('storeSettings');
        if (savedSettings) {
            setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
        }
        
        const savedProductSettings = localStorage.getItem('productSettings');
        if (savedProductSettings) {
            setProductSettings({ ...defaultProductSettings, ...JSON.parse(savedProductSettings) });
        }
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            localStorage.setItem('storeSettings', JSON.stringify(settings));
            localStorage.setItem('productSettings', JSON.stringify(productSettings));
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof StoreSettings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    // Product settings handlers
    const addItem = (type: keyof ProductSettings, value: string) => {
        if (!value.trim()) return;
        if (productSettings[type].includes(value.trim())) {
            toast.error(`${value} already exists`);
            return;
        }
        setProductSettings(prev => ({
            ...prev,
            [type]: [...prev[type], value.trim()]
        }));
        // Clear input
        switch (type) {
            case 'categories': setNewCategory(''); break;
            case 'sizes': setNewSize(''); break;
            case 'flavors': setNewFlavor(''); break;
            case 'dietary': setNewDietary(''); break;
        }
        toast.success(`Added ${value}`);
    };

    const removeItem = (type: keyof ProductSettings, value: string) => {
        setProductSettings(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item !== value)
        }));
        toast.success(`Removed ${value}`);
    };

    const tabs = [
        { id: 'store', label: 'Store Info', icon: Store },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        { id: 'delivery', label: 'Delivery', icon: Truck },
        { id: 'billing', label: 'Billing', icon: FileText },
    ];

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-chocolate">Settings</h1>
                        <p className="text-chocolate/70 mt-1">Manage your store configuration</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="h-4 w-4 mr-2" />
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
                                            value={settings.storeName}
                                            onChange={(e) => handleChange('storeName', e.target.value)}
                                            placeholder="Your Store Name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Mail className="h-4 w-4 inline mr-2" />
                                            Store Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={settings.storeEmail}
                                            onChange={(e) => handleChange('storeEmail', e.target.value)}
                                            placeholder="contact@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Phone className="h-4 w-4 inline mr-2" />
                                            Store Phone
                                        </label>
                                        <Input
                                            value={settings.storePhone}
                                            onChange={(e) => handleChange('storePhone', e.target.value)}
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Shield className="h-4 w-4 inline mr-2" />
                                            GSTIN
                                        </label>
                                        <Input
                                            value={settings.storeGSTIN}
                                            onChange={(e) => handleChange('storeGSTIN', e.target.value)}
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
                                        value={settings.storeAddress}
                                        onChange={(e) => handleChange('storeAddress', e.target.value)}
                                        placeholder="Street Address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">City</label>
                                        <Input
                                            value={settings.storeCity}
                                            onChange={(e) => handleChange('storeCity', e.target.value)}
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">State</label>
                                        <Input
                                            value={settings.storeState}
                                            onChange={(e) => handleChange('storeState', e.target.value)}
                                            placeholder="State"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">Pincode</label>
                                        <Input
                                            value={settings.storePincode}
                                            onChange={(e) => handleChange('storePincode', e.target.value)}
                                            placeholder="400001"
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
                                        Manage the categories available for your products
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {productSettings.categories.map((category) => (
                                            <span
                                                key={category}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                                            >
                                                {category}
                                                <button
                                                    onClick={() => removeItem('categories', category)}
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
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('categories', newCategory)}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => addItem('categories', newCategory)}
                                        >
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
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Define the sizes available for your products
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {productSettings.sizes.map((size) => (
                                            <span
                                                key={size}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                                            >
                                                {size}
                                                <button
                                                    onClick={() => removeItem('sizes', size)}
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
                                            placeholder="Add new size (e.g., XL (750ml))..."
                                            className="max-w-xs"
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('sizes', newSize)}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => addItem('sizes', newSize)}
                                        >
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
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Manage the flavor options for your ice cream products
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {productSettings.flavors.map((flavor) => (
                                            <span
                                                key={flavor}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-pink-100 text-pink-700 rounded-lg text-sm font-medium"
                                            >
                                                {flavor}
                                                <button
                                                    onClick={() => removeItem('flavors', flavor)}
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
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('flavors', newFlavor)}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => addItem('flavors', newFlavor)}
                                        >
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
                                    <p className="text-sm text-chocolate/60 mb-4">
                                        Define dietary tags for your products
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {productSettings.dietary.map((option) => (
                                            <span
                                                key={option}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                                            >
                                                {option}
                                                <button
                                                    onClick={() => removeItem('dietary', option)}
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
                                            onKeyDown={(e) => e.key === 'Enter' && addItem('dietary', newDietary)}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => addItem('dietary', newDietary)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add
                                        </Button>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                    <div className="flex items-start gap-3">
                                        <Package className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800">How to use these settings</p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                These options will be available when creating or editing products. 
                                                Categories, sizes, flavors, and dietary options defined here will appear 
                                                in the product form dropdowns.
                                            </p>
                                        </div>
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
                                            value={settings.taxRate}
                                            onChange={(e) => handleChange('taxRate', Number(e.target.value))}
                                            placeholder="5"
                                            min={0}
                                            max={28}
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Applied to all orders</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <DollarSign className="h-4 w-4 inline mr-2" />
                                            Minimum Order Amount (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.minOrderAmount}
                                            onChange={(e) => handleChange('minOrderAmount', Number(e.target.value))}
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
                                                checked={settings.enableCOD}
                                                onChange={(e) => handleChange('enableCOD', e.target.checked)}
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
                                                checked={settings.enableUPI}
                                                onChange={(e) => handleChange('enableUPI', e.target.checked)}
                                                className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-chocolate">UPI Payment</p>
                                                <p className="text-sm text-chocolate/60">Accept UPI payments (GPay, PhonePe, etc.)</p>
                                            </div>
                                        </label>
                                        <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={settings.enableCard}
                                                onChange={(e) => handleChange('enableCard', e.target.checked)}
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
                                            value={settings.deliveryCharges}
                                            onChange={(e) => handleChange('deliveryCharges', Number(e.target.value))}
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
                                            value={settings.freeDeliveryThreshold}
                                            onChange={(e) => handleChange('freeDeliveryThreshold', Number(e.target.value))}
                                            placeholder="500"
                                            min={0}
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Set to 0 to disable free delivery</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-chocolate mb-2">
                                            <Clock className="h-4 w-4 inline mr-2" />
                                            Estimated Delivery (Days)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.estimatedDeliveryDays}
                                            onChange={(e) => handleChange('estimatedDeliveryDays', Number(e.target.value))}
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
                                            value={settings.lowStockThreshold}
                                            onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                                            placeholder="10"
                                            min={1}
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Alert when stock falls below this</p>
                                    </div>
                                </div>

                                <div className="border-t border-chocolate/10 pt-6">
                                    <label className="flex items-center gap-3 p-4 bg-cream rounded-lg cursor-pointer hover:bg-cream/80 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={settings.enableNotifications}
                                            onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                                            className="w-5 h-5 text-primary border-chocolate/20 rounded"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-chocolate">Order Notifications</p>
                                            <p className="text-sm text-chocolate/60">Send email notifications for new orders</p>
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
                                            value={settings.orderPrefix}
                                            onChange={(e) => handleChange('orderPrefix', e.target.value)}
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
                                            value={settings.invoicePrefix}
                                            onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                                            placeholder="INV"
                                        />
                                        <p className="text-xs text-chocolate/60 mt-1">Example: INV-2024-001</p>
                                    </div>
                                </div>

                                <div className="bg-cream rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-chocolate mb-4">Tally Integration</h3>
                                    <p className="text-sm text-chocolate/70 mb-4">
                                        Export your invoices in Tally-compatible CSV format from the Orders or Reports page. 
                                        The exported files include:
                                    </p>
                                    <ul className="space-y-2 text-sm text-chocolate/70">
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Sales Voucher format for direct import
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            GST details with CGST/SGST breakdown
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            HSN codes for ice cream products (2105)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                            Customer details and addresses
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-blue-800">GST Compliance</p>
                                            <p className="text-sm text-blue-600 mt-1">
                                                Your GSTIN: <span className="font-mono">{settings.storeGSTIN || 'Not set'}</span>
                                            </p>
                                            <p className="text-sm text-blue-600">
                                                Tax Rate: {settings.taxRate}% (CGST: {settings.taxRate/2}% + SGST: {settings.taxRate/2}%)
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
