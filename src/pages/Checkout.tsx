import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/formatters';
import { saveOrder } from '@/utils/dataManager';
import { Order, Address } from '@/types';
import { CreditCard, CheckCircle, MapPin, User, Home, Building, Plus } from 'lucide-react';

type CheckoutStep = 'contact' | 'delivery' | 'payment';

export default function Checkout() {
    const navigate = useNavigate();
    const { items, subtotal, tax, deliveryCharges, total, clearCart } = useCart();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
    const [isProcessing, setIsProcessing] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);

    // Load saved addresses
    useEffect(() => {
        if (user?.addresses && user.addresses.length > 0) {
            setSavedAddresses(user.addresses);
            setSelectedAddressIndex(0); // Select first address by default
        } else {
            setUseNewAddress(true);
        }
    }, [user]);

    // Form state
    const [contactInfo, setContactInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });

    const [deliveryInfo, setDeliveryInfo] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'Card'>('COD');

    // Redirect if cart is empty
    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center bg-cream">
                    <div className="text-center">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-display font-bold text-chocolate mb-4">
                            Your cart is empty
                        </h2>
                        <p className="text-chocolate/70 mb-6">Add some delicious ice cream to get started!</p>
                        <Button onClick={() => navigate('/shop')}>Browse Products</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Generate order number
            const orderNumber = `JM${Date.now()}`;
            const invoiceNumber = `INV_${Date.now()}`;
            const orderId = `ORD_${Date.now()}`;
            const createdAt = new Date().toISOString();
            
            // Calculate estimated delivery (3 days from now)
            const estimatedDelivery = new Date();
            estimatedDelivery.setDate(estimatedDelivery.getDate() + 3);
            const estimatedDeliveryStr = estimatedDelivery.toISOString().split('T')[0];

            // Create address object - use saved address if selected, otherwise use new address
            let address: Address;
            if (!useNewAddress && selectedAddressIndex !== null && savedAddresses[selectedAddressIndex]) {
                address = savedAddresses[selectedAddressIndex];
            } else {
                address = {
                line1: deliveryInfo.address,
                city: deliveryInfo.city,
                state: deliveryInfo.state,
                pincode: deliveryInfo.pincode,
                type: 'home',
            };
            }

            // Create proper Order object
            const order: Order = {
                id: orderId,
                userId: user?.id || 'guest',
                orderNumber,
                items: items.map(item => ({
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    size: item.size,
                })),
                subtotal,
                tax,
                deliveryCharges,
                discount: 0,
                total,
                customer: {
                    name: contactInfo.name,
                    email: contactInfo.email,
                    phone: contactInfo.phone,
                    address,
                },
                paymentMethod,
                paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
                status: 'pending',
                statusHistory: [
                    {
                        status: 'pending',
                        timestamp: createdAt,
                    },
                ],
                invoiceNumber,
                createdAt,
                estimatedDelivery: estimatedDeliveryStr,
            };

            // Save order using centralized function
            await saveOrder(order);

            // Dispatch products update event (stock has changed)
            window.dispatchEvent(new CustomEvent('productsUpdated'));

            // Clear cart
            clearCart();

            // Show success message
            toast.success('Order placed successfully!', {
                icon: '🎉',
                duration: 2000,
            });

            // Navigate to success page
            navigate('/order-success');
        } catch (error) {
            console.error('Error placing order:', error);
            toast.error('Failed to place order. Please try again.');
            setIsProcessing(false);
        }
    };

    const steps = [
        { id: 'contact', label: 'Contact', icon: User },
        { id: 'delivery', label: 'Delivery', icon: MapPin },
        { id: 'payment', label: 'Payment', icon: CreditCard },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <h1 className="text-3xl font-display font-bold text-chocolate mb-8">
                        Checkout
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2">
                            {/* Progress Steps */}
                            <div className="bg-white rounded-xl p-4 sm:p-6 mb-6">
                                <div className="flex items-center justify-between">
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isActive = currentStep === step.id;
                                        const isCompleted = index < currentStepIndex;

                                        return (
                                            <div key={step.id} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center">
                                                    <div
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center transition-colors ${isCompleted
                                                            ? 'bg-success text-white'
                                                            : isActive
                                                                ? 'bg-primary text-white'
                                                                : 'bg-chocolate/10 text-chocolate/40'
                                                            }`}
                                                    >
                                                        {isCompleted ? (
                                                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                                        ) : (
                                                            <Icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                                                        )}
                                                    </div>
                                                    <span className={`mt-1 sm:mt-2 text-xs sm:text-sm font-medium ${isActive ? 'text-primary' : 'text-chocolate/60'} hidden sm:block`}>
                                                        {step.label}
                                                    </span>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`flex-1 h-1 mx-2 sm:mx-4 ${isCompleted ? 'bg-success' : 'bg-chocolate/10'}`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Form Content */}
                            <div className="bg-white rounded-xl p-6">
                                {currentStep === 'contact' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-display font-bold text-chocolate mb-4">
                                            Contact Information
                                        </h2>
                                        <div>
                                            <Label htmlFor="name">Full Name *</Label>
                                            <Input
                                                id="name"
                                                value={contactInfo.name}
                                                onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={contactInfo.email}
                                                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                                                placeholder="your@email.com"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number *</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={contactInfo.phone}
                                                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                                                placeholder="10-digit mobile number"
                                                required
                                            />
                                        </div>
                                        <Button
                                            onClick={() => setCurrentStep('delivery')}
                                            className="w-full mt-6"
                                            disabled={!contactInfo.name || !contactInfo.email || !contactInfo.phone}
                                        >
                                            Continue to Delivery
                                        </Button>
                                    </div>
                                )}

                                {currentStep === 'delivery' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-display font-bold text-chocolate mb-4">
                                            Delivery Address
                                        </h2>

                                        {/* Saved Addresses */}
                                        {savedAddresses.length > 0 && !useNewAddress && (
                                            <div className="space-y-3">
                                                <Label>Select a saved address</Label>
                                                {savedAddresses.map((addr, index) => (
                                                    <label
                                                        key={index}
                                                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                                                            selectedAddressIndex === index
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-chocolate/10 hover:border-chocolate/20'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="address"
                                                            checked={selectedAddressIndex === index}
                                                            onChange={() => setSelectedAddressIndex(index)}
                                                            className="mt-1 mr-3"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {addr.type === 'home' ? (
                                                                    <Home className="h-4 w-4 text-primary" />
                                                                ) : (
                                                                    <Building className="h-4 w-4 text-primary" />
                                                                )}
                                                                <span className="font-semibold capitalize">{addr.type}</span>
                                                            </div>
                                                            <p className="text-sm text-chocolate/70">
                                                                {addr.line1}
                                                                {addr.line2 && `, ${addr.line2}`}
                                                            </p>
                                                            <p className="text-sm text-chocolate/70">
                                                                {addr.city}, {addr.state} - {addr.pincode}
                                                            </p>
                                                        </div>
                                                    </label>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setUseNewAddress(true);
                                                        setSelectedAddressIndex(null);
                                                    }}
                                                    className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm mt-2"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Use a different address
                                                </button>
                                            </div>
                                        )}

                                        {/* New Address Form */}
                                        {(useNewAddress || savedAddresses.length === 0) && (
                                            <div className="space-y-4">
                                                {savedAddresses.length > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setUseNewAddress(false);
                                                            setSelectedAddressIndex(0);
                                                        }}
                                                        className="text-primary hover:text-primary/80 font-medium text-sm mb-2"
                                                    >
                                                        ← Use saved address
                                                    </button>
                                                )}
                                        <div>
                                            <Label htmlFor="address">Street Address *</Label>
                                            <Input
                                                id="address"
                                                value={deliveryInfo.address}
                                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, address: e.target.value })}
                                                placeholder="House/Flat No., Building Name, Street"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="city">City *</Label>
                                                <Input
                                                    id="city"
                                                    value={deliveryInfo.city}
                                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, city: e.target.value })}
                                                    placeholder="City"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="state">State *</Label>
                                                <Input
                                                    id="state"
                                                    value={deliveryInfo.state}
                                                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, state: e.target.value })}
                                                    placeholder="State"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="pincode">PIN Code *</Label>
                                            <Input
                                                id="pincode"
                                                value={deliveryInfo.pincode}
                                                onChange={(e) => setDeliveryInfo({ ...deliveryInfo, pincode: e.target.value })}
                                                placeholder="6-digit PIN code"
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentStep('contact')}
                                                className="flex-1"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={() => setCurrentStep('payment')}
                                                className="flex-1"
                                                disabled={
                                                    useNewAddress || savedAddresses.length === 0
                                                        ? !deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.state || !deliveryInfo.pincode
                                                        : selectedAddressIndex === null
                                                }
                                            >
                                                Continue to Payment
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 'payment' && (
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-display font-bold text-chocolate mb-4">
                                            Payment Method
                                        </h2>
                                        <div className="space-y-3">
                                            {['COD', 'UPI', 'Card'].map((method) => (
                                                <label
                                                    key={method}
                                                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === method
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-chocolate/10 hover:border-chocolate/20'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="payment"
                                                        value={method}
                                                        checked={paymentMethod === method}
                                                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                                                        className="mr-3"
                                                    />
                                                    <span className="font-medium">
                                                        {method === 'COD' && 'Cash on Delivery'}
                                                        {method === 'UPI' && 'UPI / PhonePe / Google Pay'}
                                                        {method === 'Card' && 'Credit / Debit Card'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCurrentStep('delivery')}
                                                className="flex-1"
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                onClick={handlePlaceOrder}
                                                className="flex-1"
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? 'Processing...' : `Place Order (${formatCurrency(total)})`}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-6 sticky top-24">
                                <h3 className="font-display font-bold text-lg mb-4">Order Summary</h3>

                                {/* Items */}
                                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                    {items.map((item) => (
                                        <div key={`${item.productId}-${item.size}`} className="flex justify-between text-sm">
                                            <span className="text-chocolate/70">
                                                {item.name} ({item.size}) x {item.quantity}
                                            </span>
                                            <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-chocolate/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-chocolate/70">Subtotal</span>
                                        <span className="font-semibold">{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-chocolate/70">Tax (5%)</span>
                                        <span className="font-semibold">{formatCurrency(tax)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-chocolate/70">Delivery</span>
                                        <span className="font-semibold">
                                            {deliveryCharges === 0 ? (
                                                <span className="text-success">FREE</span>
                                            ) : (
                                                formatCurrency(deliveryCharges)
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-chocolate/10 pt-2 mt-2">
                                        <span>Total</span>
                                        <span className="text-primary">{formatCurrency(total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
