import { useState } from 'react';
import { X, Star, ShoppingCart, Plus, Minus, Truck, Shield } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { Button } from '../ui/button';
import { formatCurrency } from '@/utils/formatters';

interface ProductQuickViewProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);

    if (!isOpen || !product) return null;

    const discountedPrice = product.price * (1 - product.discount / 100);
    const defaultSize = selectedSize || product.sizes[0];
    const cartItem = items.find(item => item.productId === product.id && item.size === defaultSize);

    const handleAddToCart = () => {
        addItem(product, defaultSize, quantity);
        onClose();
    };

    const handleIncrement = () => {
        if (cartItem) {
            updateQuantity(product.id, defaultSize, cartItem.quantity + 1);
        } else {
            setQuantity(quantity + 1);
        }
    };

    const handleDecrement = () => {
        if (cartItem) {
            if (cartItem.quantity === 1) {
                removeItem(product.id, defaultSize);
            } else {
                updateQuantity(product.id, defaultSize, cartItem.quantity - 1);
            }
        } else {
            setQuantity(Math.max(1, quantity - 1));
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-bounce-in"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-chocolate/5 rounded-full transition-colors z-10"
                    >
                        <X className="h-6 w-6 text-chocolate/60" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
                        {/* Image */}
                        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8 flex items-center justify-center aspect-square">
                            <div className="text-9xl">🍦</div>
                        </div>

                        {/* Content */}
                        <div className="space-y-4">
                            {/* Category & Title */}
                            <div>
                                <div className="text-primary font-semibold text-sm mb-2">{product.category}</div>
                                <h2 className="text-3xl font-display font-bold text-chocolate mb-2">
                                    {product.name}
                                </h2>
                                <p className="text-chocolate/70">{product.description}</p>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center space-x-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(product.rating)
                                                ? 'fill-secondary text-secondary'
                                                : 'text-chocolate/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="font-semibold">{product.rating.toFixed(1)}</span>
                                <span className="text-chocolate/60">({product.reviewCount} reviews)</span>
                            </div>

                            {/* Price */}
                            <div className="border-y border-chocolate/10 py-4">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-3xl font-bold text-primary">
                                        {formatCurrency(discountedPrice)}
                                    </span>
                                    {product.discount > 0 && (
                                        <>
                                            <span className="text-xl text-chocolate/40 line-through">
                                                {formatCurrency(product.price)}
                                            </span>
                                            <span className="px-3 py-1 bg-secondary text-white rounded-full text-sm font-bold">
                                                {product.discount}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Size Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-chocolate mb-2">
                                    Select Size
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setSelectedSize(size);
                                                setQuantity(1);
                                            }}
                                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${(selectedSize || product.sizes[0]) === size
                                                ? 'border-primary bg-primary text-white'
                                                : 'border-chocolate/20 text-chocolate hover:border-primary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDecrement}
                                        className="w-10 h-10 rounded-lg border-2 border-chocolate/20 hover:border-primary transition-colors flex items-center justify-center"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">
                                        {cartItem ? cartItem.quantity : quantity}
                                    </span>
                                    <button
                                        onClick={handleIncrement}
                                        className="w-10 h-10 rounded-lg border-2 border-chocolate/20 hover:border-primary transition-colors flex items-center justify-center"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                {!cartItem && (
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="flex-1"
                                        size="lg"
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </Button>
                                )}
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-chocolate/10">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-5 w-5 text-accent" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Free Delivery</div>
                                        <div className="text-chocolate/60">On orders above ₹500</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-success" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Quality Assured</div>
                                        <div className="text-chocolate/60">Premium ingredients</div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Status */}
                            {product.stock <= product.lowStockThreshold && (
                                <div className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                                    {product.stock === 0 ? '⚠️ Out of Stock' : `⚠️ Only ${product.stock} left in stock`}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

