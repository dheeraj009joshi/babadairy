import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '../ui/button';
import { formatCurrency } from '@/utils/formatters';
import { Link } from 'react-router-dom';
import { CartItem } from '@/types';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CartItemCardProps {
    item: CartItem;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    removeItem: (productId: string, size: string) => void;
}

function CartItemCard({ item, updateQuantity, removeItem }: CartItemCardProps) {
    const [imageError, setImageError] = useState(false);
    
    return (
        <div className="bg-cream rounded-lg p-4">
            <div className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.image && !imageError ? (
                        <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <span className="text-3xl">🍦</span>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-chocolate truncate">
                        {item.name}
                    </h3>
                    <p className="text-sm text-chocolate/60">{item.size}</p>
                    <div className="text-primary font-bold mt-1">
                        {formatCurrency(item.price)}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                        <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="p-1 hover:bg-white rounded transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="ml-auto p-1 text-chocolate/40 hover:text-chocolate hover:bg-white rounded transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const { items, updateQuantity, removeItem, subtotal, tax, deliveryCharges, total, itemCount } = useCart();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
                {/* Header */}
                <div className="p-6 border-b border-chocolate/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-6 w-6 text-primary" />
                            <h2 className="text-2xl font-display font-bold text-chocolate">
                                Your Cart
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-chocolate/5 rounded-lg transition-colors"
                        >
                            <X className="h-6 w-6 text-chocolate/60" />
                        </button>
                    </div>
                    <p className="text-sm text-chocolate/60 mt-1">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">🛒</div>
                            <p className="text-chocolate/60 mb-4">Your cart is empty</p>
                            <Link to="/shop">
                                <Button onClick={onClose}>Start Shopping</Button>
                            </Link>
                        </div>
                    ) : (
                        items.map((item) => (
                            <CartItemCard
                                key={`${item.productId}-${item.size}`}
                                item={item}
                                updateQuantity={updateQuantity}
                                removeItem={removeItem}
                            />
                        ))
                    )}
                </div>

                {/* Footer - Summary & Checkout */}
                {items.length > 0 && (
                    <div className="border-t border-chocolate/10 p-6 space-y-4">
                        {/* Price Breakdown */}
                        <div className="space-y-2">
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
                            {subtotal < 500 && subtotal > 0 && (
                                <p className="text-xs text-chocolate/60">
                                    Add {formatCurrency(500 - subtotal)} more for free delivery
                                </p>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t border-chocolate/10 pt-2">
                                <span>Total</span>
                                <span className="text-primary">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <Link to="/checkout" onClick={onClose}>
                            <Button size="lg" className="w-full">
                                Proceed to Checkout
                            </Button>
                        </Link>

                        <button
                            onClick={onClose}
                            className="w-full text-center text-sm text-chocolate/60 hover:text-chocolate transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
