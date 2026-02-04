import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Grid3x3, List } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductFilters from '@/components/shop/ProductFilters';
import SearchBar from '@/components/shop/SearchBar';
import SortDropdown, { SortOption } from '@/components/shop/SortDropdown';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductQuickView from '@/components/shop/ProductQuickView';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { fetchProducts } from '@/utils/dataManager';

export default function Shop() {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 12;

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('popularity');
    const [filters, setFilters] = useState({
        categories: [] as string[],
        priceRange: [0, 1000] as [number, number],
        flavors: [] as string[],
        dietary: [] as string[],
        sizes: [] as string[],
        rating: null as number | null,
    });

    // Read category from URL query params on mount
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setFilters(prev => ({
                ...prev,
                categories: [categoryParam],
            }));
        }
    }, [searchParams]);

    const loadProducts = async () => {
        setIsLoading(true);
        const data = await fetchProducts();
        setProducts(data.filter(p => p.status === 'active'));
        setIsLoading(false);
    };

    // Load products
    useEffect(() => {
        loadProducts();

        // Listen for product updates from admin
        const handleProductsUpdate = () => {
            loadProducts();
        };
        window.addEventListener('productsUpdated', handleProductsUpdate);

        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdate);
        };
    }, []);

    // Apply filters and search
    useEffect(() => {
        let result = [...products];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                p =>
                    p.name.toLowerCase().includes(query) ||
                    p.description.toLowerCase().includes(query) ||
                    p.flavors.some(f => f.toLowerCase().includes(query))
            );
        }

        // Category filter
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(p.category));
        }

        // Price range filter
        const [min, max] = filters.priceRange;
        result = result.filter(p => {
            const price = p.price * (1 - p.discount / 100);
            return price >= min && price <= max;
        });

        // Flavor filter
        if (filters.flavors.length > 0) {
            result = result.filter(p =>
                p.flavors.some(f => filters.flavors.includes(f.toLowerCase()))
            );
        }

        // Dietary filter
        if (filters.dietary.length > 0) {
            result = result.filter(p =>
                filters.dietary.every(d => p.dietary.includes(d))
            );
        }

        // Size filter
        if (filters.sizes.length > 0) {
            result = result.filter(p =>
                p.sizes.some(s => filters.sizes.includes(s))
            );
        }

        // Rating filter
        if (filters.rating !== null) {
            result = result.filter(p => p.rating >= filters.rating!);
        }

        // Sorting
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => {
                    const priceA = a.price * (1 - a.discount / 100);
                    const priceB = b.price * (1 - b.discount / 100);
                    return priceA - priceB;
                });
                break;
            case 'price-high':
                result.sort((a, b) => {
                    const priceA = a.price * (1 - a.discount / 100);
                    const priceB = b.price * (1 - b.discount / 100);
                    return priceB - priceA;
                });
                break;
            case 'newest':
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'popularity':
            default:
                result.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
                break;
        }

        setFilteredProducts(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [products, searchQuery, filters, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-grow">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl font-display font-bold text-chocolate mb-2">
                            Our Product Collection
                        </h1>
                        <p className="text-chocolate/70">
                            Discover our handcrafted flavors made with love
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Filters Sidebar - Desktop */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24 bg-white rounded-xl shadow-md p-6">
                                <ProductFilters filters={filters} setFilters={setFilters} />
                            </div>
                        </aside>

                        {/* Mobile Filters */}
                        {isFilterOpen && (
                            <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsFilterOpen(false)}>
                                <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-y-auto" onClick={e => e.stopPropagation()}>
                                    <div className="p-6">
                                        <ProductFilters
                                            filters={filters}
                                            setFilters={setFilters}
                                            onClose={() => setIsFilterOpen(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products Section */}
                        <div className="flex-1">
                            {/* Search & Sort Bar */}
                            <div className="mb-6 space-y-4">
                                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <Button
                                            variant="outline"
                                            className="lg:hidden"
                                            onClick={() => setIsFilterOpen(true)}
                                            size="sm"
                                        >
                                            <Filter className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>

                                        <span className="text-xs sm:text-sm text-chocolate/60">
                                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                                        </span>
                                        
                                        {/* View Mode Toggle */}
                                        <div className="flex items-center gap-1 border border-chocolate/20 rounded-lg p-1">
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`p-1 sm:p-1.5 rounded transition-colors ${viewMode === 'grid'
                                                    ? 'bg-primary text-white'
                                                    : 'text-chocolate/60 hover:text-chocolate'
                                                    }`}
                                                title="Grid View"
                                            >
                                                <Grid3x3 className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('list')}
                                                className={`p-1 sm:p-1.5 rounded transition-colors ${viewMode === 'list'
                                                    ? 'bg-primary text-white'
                                                    : 'text-chocolate/60 hover:text-chocolate'
                                                    }`}
                                                title="List View"
                                            >
                                                <List className="h-3 w-3 sm:h-4 sm:w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm text-chocolate/60 hidden sm:inline">Sort by:</span>
                                        <SortDropdown value={sortBy} onChange={setSortBy} />
                                    </div>
                                </div>
                            </div>

                            {/* Product Grid/List */}
                            <ProductGrid 
                                products={paginatedProducts} 
                                isLoading={isLoading}
                                onQuickView={(product) => setQuickViewProduct(product)}
                                viewMode={viewMode}
                            />

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-center gap-2 mt-8">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        Previous
                                    </Button>
                                    
                                    <div className="flex items-center gap-1">
                                        {[...Array(totalPages)].map((_, index) => {
                                            const page = index + 1;
                                            // Show first page, last page, current page, and pages around current
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`px-3 py-1 rounded-lg transition-colors ${
                                                            currentPage === page
                                                                ? 'bg-primary text-white'
                                                                : 'bg-white text-chocolate hover:bg-chocolate/5'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            } else if (
                                                page === currentPage - 2 ||
                                                page === currentPage + 2
                                            ) {
                                                return <span key={page} className="px-2">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Quick View Modal */}
            <ProductQuickView
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
            />
        </div>
    );
}
