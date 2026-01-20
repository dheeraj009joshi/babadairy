import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Product, Review } from '@/types';
import { fetchProductById, fetchReviewsByProductId } from '@/utils/dataManager';
import { formatCurrency } from '@/utils/formatters';
import { Star, ShoppingCart, Truck, Shield, Heart } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { toggleFavorite, isFavorite } = useFavorites();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const loadProduct = async () => {
        if (!id) return;

        setIsLoading(true);
        const productData = await fetchProductById(id);
        const reviewsData = await fetchReviewsByProductId(id);

        if (productData) {
            setProduct(productData);
            setSelectedSize(productData.sizes[0] || '');
            setReviews(reviewsData);
        }
        setIsLoading(false);
    };
    
    // Get current price based on selected size
    const getCurrentPrice = () => {
        if (!product) return 0;
        if (product.priceBySize && selectedSize && product.priceBySize[selectedSize] !== undefined) {
            return product.priceBySize[selectedSize];
        }
        return product.price;
    };

    useEffect(() => {
        loadProduct();

        // Listen for product updates from admin
        const handleProductsUpdate = () => {
            loadProduct();
        };
        window.addEventListener('productsUpdated', handleProductsUpdate);

        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdate);
        };
    }, [id]);

    const handleAddToCart = () => {
        if (product && selectedSize) {
            addItem(product, selectedSize, quantity);
        }
    };
    
    const currentPrice = getCurrentPrice();
    const discount = product?.discount ?? 0;
    const discountedPrice = currentPrice * (1 - discount / 100);

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

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-chocolate mb-4">
                            Product not found
                        </h2>
                        <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/shop')}
                        className="text-primary hover:text-primary/80 mb-6 flex items-center"
                    >
                        ← Back to Shop
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
                        {/* Product Image */}
                        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 flex items-center justify-center aspect-square overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                            ) : null}
                            <div className={`text-9xl ${product.images && product.images.length > 0 ? 'hidden' : ''}`}>🍦</div>
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            {/* Title & Category */}
                            <div>
                                <div className="text-primary font-semibold mb-2 text-sm sm:text-base">{product.category}</div>
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-chocolate mb-4">
                                    {product.name}
                                </h1>
                                <p className="text-chocolate/70 text-base sm:text-lg">{product.description}</p>
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
                            <div className="border-y border-chocolate/10 py-6">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-4xl font-bold text-primary">
                                        {formatCurrency(discountedPrice)}
                                    </span>
                                    {product.discount > 0 && (
                                        <>
                                            <span className="text-2xl text-chocolate/40 line-through">
                                                {formatCurrency(currentPrice)}
                                            </span>
                                            <span className="px-3 py-1 bg-secondary text-white rounded-full text-sm font-bold">
                                                {product.discount}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                                {selectedSize && (
                                    <p className="text-sm text-chocolate/60 mt-2">
                                        Price for {selectedSize}
                                    </p>
                                )}
                            </div>

                            {/* Size Selection */}
                            <div>
                                <label className="block text-sm font-semibold text-chocolate mb-3">
                                    Select Size
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((size) => {
                                        const sizePrice = product.priceBySize?.[size] || product.price;
                                        const sizeDiscountedPrice = sizePrice * (1 - product.discount / 100);
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`px-6 py-3 rounded-lg border-2 font-medium transition-colors text-left ${selectedSize === size
                                                    ? 'border-primary bg-primary text-white'
                                                    : 'border-chocolate/20 text-chocolate hover:border-primary'
                                                    }`}
                                            >
                                                <div className="font-semibold">{size}</div>
                                                <div className={`text-xs mt-1 ${selectedSize === size ? 'text-white/90' : 'text-chocolate/60'}`}>
                                                    {formatCurrency(sizeDiscountedPrice)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block text-sm font-semibold text-chocolate mb-3">
                                    Quantity
                                </label>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-lg border-2 border-chocolate/20 hover:border-primary transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-10 h-10 rounded-lg border-2 border-chocolate/20 hover:border-primary transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleAddToCart}
                                    size="lg"
                                    className="flex-1"
                                    disabled={product.stock === 0}
                                >
                                    <ShoppingCart className="h-5 w-5 mr-2" />
                                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                </Button>
                                <Button 
                                    size="lg" 
                                    variant="outline" 
                                    className="px-6"
                                    onClick={() => product && toggleFavorite(product.id)}
                                >
                                    <Heart className={`h-5 w-5 ${product && isFavorite(product.id) ? 'fill-primary text-primary' : ''}`} />
                                </Button>
                            </div>

                            {/* Features */}
                            <div className="grid grid-cols-2 gap-4 pt-6">
                                <div className="flex items-center gap-3">
                                    <Truck className="h-6 w-6 text-accent" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Free Delivery</div>
                                        <div className="text-chocolate/60">On orders above ₹500</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Shield className="h-6 w-6 text-success" />
                                    <div className="text-sm">
                                        <div className="font-semibold">Quality Assured</div>
                                        <div className="text-chocolate/60">Premium ingredients</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="

 mt-16">
                        <h2 className="text-3xl font-display font-bold text-chocolate mb-8">
                            Customer Reviews ({reviews.length})
                        </h2>
                        <div className="space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-chocolate/60 text-center py-12">No reviews yet</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="bg-white rounded-xl p-6">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-semibold text-chocolate">{review.userName}</div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating
                                                                    ? 'fill-secondary text-secondary'
                                                                    : 'text-chocolate/20'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {review.verified && (
                                                        <span className="text-xs text-success">✓ Verified Purchase</span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-sm text-chocolate/60">{review.createdAt}</span>
                                        </div>
                                        <h3 className="font-semibold text-chocolate mb-2">{review.title}</h3>
                                        <p className="text-chocolate/70">{review.comment}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
