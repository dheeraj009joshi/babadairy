import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductFormModal from '@/components/admin/ProductFormModal';
import ExcelUpload from '@/components/admin/ExcelUpload';
import ConfirmModal from '@/components/ui/confirm-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { fetchProducts, deleteProduct, saveProduct } from '@/utils/dataManager';
import { formatCurrency } from '@/utils/formatters';
import { Search, Plus, Edit, Trash2, Power, Upload } from 'lucide-react';

export default function ProductManagement() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
        isOpen: false,
        productId: null,
        productName: '',
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [showExcelUpload, setShowExcelUpload] = useState(false);
    const [bulkAction, setBulkAction] = useState<'delete' | 'activate' | 'deactivate' | null>(null);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadProducts = async () => {
        const data = await fetchProducts();
        setProducts(data);
    };

    useEffect(() => {
        loadProducts();

        // Listen for product updates
        const handleProductsUpdate = () => {
            loadProducts();
        };
        window.addEventListener('productsUpdated', handleProductsUpdate);

        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdate);
        };
    }, []);

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEditProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSubmitProduct = async (productData: Partial<Product>) => {
        try {
            // Import saveProduct dynamically to avoid circular deps
            const { saveProduct } = await import('@/utils/dataManager');

            // Check if product has large base64 images
            if (productData.images && productData.images.length > 0) {
                const firstImage = productData.images[0];
                if (firstImage.startsWith('data:image/') && firstImage.length > 500 * 1024) {
                    toast.error('Image is too large. Please use image URL or upload a smaller image.');
                    return;
                }
            }

            // Save to localStorage
            await saveProduct(productData);

            // Update local state
            if (selectedProduct) {
                // Update existing product
                setProducts(prev =>
                    prev.map(p => p.id === productData.id ? { ...p, ...productData } as Product : p)
                );
                toast.success('Product updated successfully!');
            } else {
                // Add new product
                setProducts(prev => [...prev, productData as Product]);
                toast.success('Product created successfully!');
            }

            setIsModalOpen(false);
            setSelectedProduct(null);
        } catch (error: any) {
            const errorMessage = error?.message || 'Failed to save product';
            if (errorMessage.includes('Storage limit exceeded') || errorMessage.includes('too large')) {
                toast.error('Storage limit exceeded. Please use image URLs instead of uploading files, or clear some products.');
            } else {
                toast.error(errorMessage);
            }
            console.error('Error saving product:', error);
        }
    };

    const handleToggleStatus = async (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (!product) return;

        const newStatus = product.status === 'active' ? 'inactive' : 'active';
        await saveProduct({ ...product, status: newStatus });
        
        setProducts(prev =>
            prev.map(p =>
                p.id === productId
                    ? { ...p, status: newStatus }
                    : p
            )
        );
        toast.success('Product status updated');
    };

    const handleDeleteClick = (productId: string, productName: string) => {
        setDeleteConfirm({
            isOpen: true,
            productId,
            productName,
        });
    };

    // Calculate filtered products first (needed by other functions)
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(productId)) {
                newSet.delete(productId);
            } else {
                newSet.add(productId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedProducts.size === 0) return;

        setIsDeleting(true);
        try {
            for (const productId of selectedProducts) {
                await deleteProduct(productId);
            }
            setProducts(prev => prev.filter(p => !selectedProducts.has(p.id)));
            toast.success(`Deleted ${selectedProducts.size} products`);
            setSelectedProducts(new Set());
            setBulkAction(null);
        } catch (error) {
            toast.error('Failed to delete some products');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkStatusChange = async (newStatus: 'active' | 'inactive') => {
        if (selectedProducts.size === 0) return;

        try {
            for (const productId of selectedProducts) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    await saveProduct({ ...product, status: newStatus });
                }
            }
            setProducts(prev =>
                prev.map(p =>
                    selectedProducts.has(p.id) ? { ...p, status: newStatus } : p
                )
            );
            toast.success(`Updated ${selectedProducts.size} products`);
            setSelectedProducts(new Set());
            setBulkAction(null);
        } catch (error) {
            toast.error('Failed to update some products');
            console.error(error);
        }
    };

    const handleDeleteConfirm = async () => {
        if (bulkAction === 'delete' && selectedProducts.size > 0) {
            // Bulk delete
            await handleBulkDelete();
            setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
            setBulkAction(null);
            return;
        }

        if (!deleteConfirm.productId) return;

        setIsDeleting(true);
        try {
            await deleteProduct(deleteConfirm.productId);
            setProducts(prev => prev.filter(p => p.id !== deleteConfirm.productId));
            setSelectedProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(deleteConfirm.productId!);
                return newSet;
            });
            toast.success('Product deleted successfully');
            setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
        } catch (error) {
            toast.error('Failed to delete product');
            console.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-chocolate">Product Management</h1>
                        <p className="text-chocolate/70 mt-1 text-sm sm:text-base">{filteredProducts.length} products found</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowExcelUpload(!showExcelUpload)}
                            className="w-full sm:w-auto"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            <span className="hidden sm:inline">{showExcelUpload ? 'Hide' : 'Excel Upload'}</span>
                            <span className="sm:hidden">{showExcelUpload ? 'Hide' : 'Upload'}</span>
                        </Button>
                        <Button onClick={handleAddProduct} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </div>
                </div>

                {/* Excel Upload Section */}
                {showExcelUpload && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <ExcelUpload
                            onImportComplete={() => {
                                loadProducts();
                                setShowExcelUpload(false);
                            }}
                        />
                    </div>
                )}

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <span className="font-semibold text-chocolate text-sm sm:text-base">
                                {selectedProducts.size} product{selectedProducts.size > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setBulkAction('delete');
                                        setDeleteConfirm({
                                            isOpen: true,
                                            productId: null,
                                            productName: `${selectedProducts.size} products`,
                                        });
                                    }}
                                    className="text-xs sm:text-sm"
                                >
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Delete
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkStatusChange('active')}
                                    className="text-xs sm:text-sm"
                                >
                                    <Power className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Activate
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleBulkStatusChange('inactive')}
                                    className="text-xs sm:text-sm"
                                >
                                    <Power className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Deactivate
                                </Button>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedProducts(new Set())}
                            className="w-full sm:w-auto"
                        >
                            Clear Selection
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate/40" />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                {filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-chocolate/60 shadow-md">
                        No products found
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {/* Select All */}
                        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedProducts.size > 0 && selectedProducts.size === filteredProducts.length}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-primary border-chocolate/20 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-chocolate">
                                Select All ({filteredProducts.length} products)
                            </span>
                        </div>
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start gap-6">
                                    {/* Checkbox */}
                                    <div className="pt-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.has(product.id)}
                                            onChange={() => handleSelectProduct(product.id)}
                                            className="w-5 h-5 text-primary border-chocolate/20 rounded focus:ring-primary"
                                        />
                                    </div>
                                    {/* Product Image */}
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {product.images && product.images[0] && !product.images[0].includes('placeholder') ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl">🍦</span>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-display font-bold text-chocolate">{product.name}</h3>
                                                <p className="text-sm text-chocolate/70 line-clamp-2">{product.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditProduct(product)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(product.id)}
                                                >
                                                    <Power
                                                        className={`h-4 w-4 ${product.status === 'active' ? 'text-success' : 'text-chocolate/40'
                                                            }`}
                                                    />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(product.id, product.name)}
                                                    className="text-error hover:text-error/80"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-chocolate/60">Category</p>
                                                <p className="text-xs sm:text-sm font-semibold truncate">{product.category}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-chocolate/60">Price</p>
                                                <p className="text-xs sm:text-sm font-semibold">{formatCurrency(product.price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-chocolate/60">Discount</p>
                                                <p className="text-xs sm:text-sm font-semibold">{product.discount}%</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-chocolate/60">Stock</p>
                                                <p className={`text-xs sm:text-sm font-semibold ${product.stock === 0 ? 'text-error' :
                                                    product.stock <= product.lowStockThreshold ? 'text-yellow-600' :
                                                        'text-success'
                                                    }`}>
                                                    {product.stock} units
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-chocolate/60">Status</p>
                                                <p className={`text-xs sm:text-sm font-semibold ${product.status === 'active' ? 'text-success' : 'text-chocolate/40'
                                                    }`}>
                                                    {product.status}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <span className="text-xs text-chocolate/60">Sizes:</span>
                                            {product.sizes.map(size => (
                                                <span
                                                    key={size}
                                                    className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                                                >
                                                    {size}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Product Form Modal */}
                <ProductFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmitProduct}
                    product={selectedProduct}
                />

                {/* Delete Confirmation Modal */}
                <ConfirmModal
                    isOpen={deleteConfirm.isOpen}
                    onClose={() => {
                        setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
                        setBulkAction(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    title={bulkAction === 'delete' ? 'Delete Multiple Products' : 'Delete Product'}
                    message={
                        bulkAction === 'delete'
                            ? `Are you sure you want to delete ${selectedProducts.size} selected products? This action cannot be undone.`
                            : `Are you sure you want to delete "${deleteConfirm.productName}"? This action cannot be undone.`
                    }
                    confirmText="Delete"
                    cancelText="Cancel"
                    variant="danger"
                    isLoading={isDeleting}
                />
            </div>
        </AdminLayout>
    );
}
