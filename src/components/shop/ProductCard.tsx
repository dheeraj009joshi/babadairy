import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Plus, Minus, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Button } from '../ui/button';
import { formatCurrency } from '@/utils/formatters';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
    viewMode?: 'grid' | 'list';
}

export default function ProductCard({ product, onQuickView, viewMode = 'grid' }: ProductCardProps) {
    const { items, addItem, updateQuantity, removeItem } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [isAdding, setIsAdding] = useState(false);

    const defaultSize = product.sizes[0] || '';
    // Get price for default size
    const basePrice = product.priceBySize && defaultSize && product.priceBySize[defaultSize] !== undefined
        ? product.priceBySize[defaultSize]
        : product.price;
    const discountedPrice = basePrice * (1 - product.discount / 100);

    // Check if product is in cart
    const cartItem = items.find(item => item.productId === product.id && item.size === defaultSize);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsAdding(true);
        addItem(product, defaultSize, 1);
        setTimeout(() => setIsAdding(false), 600);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartItem) {
            updateQuantity(product.id, defaultSize, cartItem.quantity + 1);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        if (cartItem) {
            if (cartItem.quantity === 1) {
                removeItem(product.id, defaultSize);
            } else {
                updateQuantity(product.id, defaultSize, cartItem.quantity - 1);
            }
        }
    };

    if (viewMode === 'list') {
        return (
            <Link
                to={`/product/${product.id}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row gap-4 sm:gap-6"
            >
                {/* Image */}
                <div className="relative w-full sm:w-48 h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`text-6xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>🍦</div>
                    {product.discount > 0 && (
                        <div className="absolute top-3 right-3 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                            {product.discount}% OFF
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 sm:p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="text-primary font-semibold text-xs sm:text-sm mb-1">{product.category}</div>
                            <h3 className="font-display font-semibold text-lg sm:text-xl text-chocolate mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-chocolate/70 mb-4 text-sm sm:text-base line-clamp-2 sm:line-clamp-none">{product.description}</p>
                        </div>
                        {onQuickView && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onQuickView(product);
                                }}
                                className="p-2 hover:bg-chocolate/5 rounded-lg transition-colors ml-4"
                                title="Quick View"
                            >
                                <Eye className="h-5 w-5 text-chocolate/60" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-1">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-4 w-4 ${i < Math.floor(product.rating)
                                                ? 'fill-secondary text-secondary'
                                                : 'text-chocolate/20'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-chocolate/60 ml-2">
                                    ({product.reviewCount})
                                </span>
                            </div>
                            <div className="text-xs text-chocolate/60">
                                Sizes: {product.sizes.join(', ')}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div>
                                <div className="text-2xl font-bold text-primary">
                                    {formatCurrency(discountedPrice)}
                                </div>
                                {product.discount > 0 && (
                                    <div className="text-sm text-chocolate/50 line-through">
                                        {formatCurrency(basePrice)}
                                    </div>
                                )}
                            </div>

                            {cartItem ? (
                                <div
                                    onClick={(e) => e.preventDefault()}
                                    className="flex items-center gap-2 bg-primary rounded-lg"
                                >
                                    <button
                                        onClick={handleDecrement}
                                        className="p-2 text-white hover:bg-primary/80 transition-colors rounded-l-lg"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="text-white font-semibold min-w-[24px] text-center">
                                        {cartItem.quantity}
                                    </span>
                                    <button
                                        onClick={handleIncrement}
                                        className="p-2 text-white hover:bg-primary/80 transition-colors rounded-r-lg"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || isAdding}
                                    size="sm"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
            <Link
                to={`/product/${product.id}`}
                className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:-translate-y-1 border border-gray-100"
            >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-neutral-100 flex items-center justify-center">
                    {/* Product Image */}
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div className={`text-4xl text-gray-300 ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-2xl font-serif text-gray-400">JM</span>
                        </div>
                    </div>

                    {/* Quick View & Favorite Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300">
                        {onQuickView && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onQuickView(product);
                                }}
                                className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-700 p-2 rounded-md shadow-md border border-gray-100"
                                title="Quick View"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleFavorite(product.id);
                            }}
                            className="bg-white hover:bg-primary-50 text-gray-700 hover:text-primary-700 p-2 rounded-md shadow-md border border-gray-100"
                            title={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-primary-600 text-primary-600' : ''}`} />
                        </button>
                    </div>

                    {/* Discount Badge */}
                    {product.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-secondary-500 text-white px-2.5 py-1 rounded-sm text-xs font-semibold shadow-sm tracking-wide">
                            {product.discount}% OFF
                        </div>
                    )}

                    {/* Stock Status */}
                    {product.stock <= product.lowStockThreshold && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-600/90 text-white py-1 text-center text-xs font-medium backdrop-blur-sm">
                            {product.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                    {/* Category */}
                    <div className="text-xs font-medium text-primary-700 uppercase tracking-wider">
                        {product.category}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-primary-800 transition-colors">
                        {product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>

                    {/* Size */}
                    <div className="text-xs text-gray-400 font-medium">
                        {product.sizes.join(', ')}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                        <div className="flex text-secondary-400">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${i < Math.floor(product.rating)
                                        ? 'fill-current'
                                        : 'text-gray-200'
                                        }`}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-1">
                            ({product.reviewCount})
                        </span>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex flex-col">
                            <div className="text-lg font-bold text-gray-900">
                                {formatCurrency(discountedPrice)}
                            </div>
                            {product.discount > 0 && (
                                <div className="text-xs text-gray-400 line-through">
                                    {formatCurrency(product.price)}
                                </div>
                            )}
                        </div>

                        {/* Add to Cart or Quantity Controls */}
                        {cartItem ? (
                            <div
                                onClick={(e) => e.preventDefault()}
                                className="flex items-center border border-gray-200 rounded-md bg-white shadow-sm"
                            >
                                <button
                                    onClick={handleDecrement}
                                    className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-gray-900 font-medium min-w-[24px] text-center text-sm">
                                    {cartItem.quantity}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    className="p-1.5 text-gray-500 hover:text-primary-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <Button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0 || isAdding}
                                size="sm"
                                className={`bg-white text-gray-900 border border-gray-200 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all shadow-sm ${isAdding ? 'opacity-70' : ''}`}
                            >
                                <ShoppingCart className="h-4 w-4 mr-1.5" />
                                Add
                            </Button>
                        )}
                    </div>
                </div>
            </Link>
    );
}
