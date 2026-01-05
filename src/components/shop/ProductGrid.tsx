import { Product } from '@/types';
import ProductCard from './ProductCard';
import { Loader2 } from 'lucide-react';

interface ProductGridProps {
    products: Product[];
    isLoading?: boolean;
    onQuickView?: (product: Product) => void;
    viewMode?: 'grid' | 'list';
}

export default function ProductGrid({ products, isLoading, onQuickView, viewMode = 'grid' }: ProductGridProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-display font-bold text-chocolate mb-2">
                    No products found
                </h3>
                <p className="text-chocolate/60">
                    Try adjusting your filters or search terms
                </p>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} onQuickView={onQuickView} viewMode="list" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
                <ProductCard key={product.id} product={product} onQuickView={onQuickView} />
            ))}
        </div>
    );
}
