import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Order, OrderStatus } from '@/types';
import { fetchOrders } from '@/utils/dataManager';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Package, CheckCircle, Clock, Truck, MapPin, ArrowLeft, X } from 'lucide-react';

const statusConfig: Record<OrderStatus, { label: string; icon: any; color: string; bgColor: string }> = {
    pending: {
        label: 'Pending',
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
    confirmed: {
        label: 'Confirmed',
        icon: CheckCircle,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    packed: {
        label: 'Packed',
        icon: Package,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100',
    },
    shipped: {
        label: 'Shipped',
        icon: Truck,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-100',
    },
    delivered: {
        label: 'Delivered',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    cancelled: {
        label: 'Cancelled',
        icon: X,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
    },
};

export default function OrderTracking() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadOrder = async () => {
            if (!orderId) {
                setIsLoading(false);
                return;
            }

            try {
                const orders = await fetchOrders();
                const foundOrder = orders.find(o => o.id === orderId || o.orderNumber === orderId);
                setOrder(foundOrder || null);
            } catch (error) {
                console.error('Error loading order:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrder();

        // Listen for order updates
        const handleOrdersUpdate = () => {
            loadOrder();
        };
        window.addEventListener('ordersUpdated', handleOrdersUpdate);

        return () => {
            window.removeEventListener('ordersUpdated', handleOrdersUpdate);
        };
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-chocolate/60">Loading...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-chocolate mb-4">
                            Order not found
                        </h2>
                        <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];
    const currentStatusIndex = statusSteps.indexOf(order.status);
    const isCancelled = order.status === 'cancelled';

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-primary hover:text-primary/80 mb-6 flex items-center"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </button>

                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-3xl font-display font-bold text-chocolate mb-2">
                                    Order Tracking
                                </h1>
                                <p className="text-chocolate/70">
                                    Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span>
                                </p>
                            </div>
                            <div className={`px-4 py-2 rounded-full font-semibold ${statusConfig[order.status].bgColor} ${statusConfig[order.status].color}`}>
                                {statusConfig[order.status].label}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-chocolate/10">
                            <div>
                                <p className="text-xs text-chocolate/60">Total Amount</p>
                                <p className="text-lg font-bold text-primary">{formatCurrency(order.total)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60">Items</p>
                                <p className="text-lg font-semibold">{order.items.length} items</p>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60">Order Date</p>
                                <p className="text-sm font-semibold">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60">Est. Delivery</p>
                                <p className="text-sm font-semibold">{formatDate(order.estimatedDelivery)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    {!isCancelled && (
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <h2 className="text-xl font-display font-bold text-chocolate mb-6">Order Status</h2>
                            <div className="relative">
                                {/* Timeline Line */}
                                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-chocolate/20" />

                                {/* Status Steps */}
                                <div className="space-y-8">
                                    {statusSteps.map((status, index) => {
                                        const config = statusConfig[status];
                                        const Icon = config.icon;
                                        const isCompleted = index <= currentStatusIndex;
                                        const isCurrent = index === currentStatusIndex;
                                        const statusHistory = order.statusHistory.find(sh => sh.status === status);

                                        return (
                                            <div key={status} className="relative flex items-start gap-4">
                                                {/* Icon */}
                                                <div
                                                    className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${
                                                        isCompleted
                                                            ? `${config.bgColor} ${config.color}`
                                                            : 'bg-chocolate/10 text-chocolate/40'
                                                    }`}
                                                >
                                                    <Icon className="h-6 w-6" />
                                                    {isCurrent && (
                                                        <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 pt-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3
                                                            className={`font-semibold ${
                                                                isCompleted ? 'text-chocolate' : 'text-chocolate/60'
                                                            }`}
                                                        >
                                                            {config.label}
                                                        </h3>
                                                        {statusHistory && (
                                                            <span className="text-xs text-chocolate/60">
                                                                {formatDate(statusHistory.timestamp)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {isCurrent && (
                                                        <p className="text-sm text-chocolate/70">
                                                            {status === 'pending' && 'Your order is being processed'}
                                                            {status === 'confirmed' && 'Order confirmed and payment received'}
                                                            {status === 'packed' && 'Your order is being packed'}
                                                            {status === 'shipped' && 'Order is on the way'}
                                                            {status === 'delivered' && 'Order has been delivered'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-chocolate/10 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center text-2xl">
                                            🍦
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-chocolate">{item.name}</h3>
                                            <p className="text-sm text-chocolate/60">Size: {item.size} × {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="mt-6 pt-6 border-t border-chocolate/10 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-chocolate/70">Subtotal</span>
                                <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-chocolate/70">Tax</span>
                                <span className="font-semibold">{formatCurrency(order.tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-chocolate/70">Delivery Charges</span>
                                <span className="font-semibold">
                                    {order.deliveryCharges === 0 ? (
                                        <span className="text-success">FREE</span>
                                    ) : (
                                        formatCurrency(order.deliveryCharges)
                                    )}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-chocolate/10 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Delivery Address
                        </h2>
                        <div className="text-chocolate/70">
                            <p className="font-semibold text-chocolate mb-2">{order.customer.name}</p>
                            <p>{order.customer.address.line1}</p>
                            {order.customer.address.line2 && <p>{order.customer.address.line2}</p>}
                            <p>
                                {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                            </p>
                            <p className="mt-2">Phone: {order.customer.phone}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

