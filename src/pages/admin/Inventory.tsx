import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { fetchProducts, saveProduct } from '@/utils/dataManager';
import { formatCurrency } from '@/utils/formatters';
import { exportInventoryCSV } from '@/utils/exportUtils';
import {
    Search,
    Download,
    RefreshCw,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Edit,
    Save,
    Loader2
} from 'lucide-react';

export default function Inventory() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'ok'>('all');
    const [editingProduct, setEditingProduct] = useState<string | null>(null);
    const [editStock, setEditStock] = useState<number>(0);
    const [editThreshold, setEditThreshold] = useState<number>(0);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await fetchProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load inventory');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();

        const handleProductsUpdate = () => loadProducts();
        window.addEventListener('productsUpdated', handleProductsUpdate);

        return () => {
            window.removeEventListener('productsUpdated', handleProductsUpdate);
        };
    }, []);

    const getStockStatus = (product: Product) => {
        if (product.stock === 0) return 'out';
        if (product.stock <= product.lowStockThreshold) return 'low';
        return 'ok';
    };

    const filteredProducts = products
        .filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            
            if (filterStatus === 'all') return matchesSearch;
            return matchesSearch && getStockStatus(product) === filterStatus;
        })
        .sort((a, b) => {
            // Sort by stock status: out first, then low, then ok
            const statusOrder = { out: 0, low: 1, ok: 2 };
            return statusOrder[getStockStatus(a)] - statusOrder[getStockStatus(b)];
        });

    const handleStartEdit = (product: Product) => {
        setEditingProduct(product.id);
        setEditStock(product.stock);
        setEditThreshold(product.lowStockThreshold);
    };

    const handleSaveStock = async (product: Product) => {
        try {
            await saveProduct({
                ...product,
                stock: editStock,
                lowStockThreshold: editThreshold
            });
            
            setProducts(prev =>
                prev.map(p =>
                    p.id === product.id
                        ? { ...p, stock: editStock, lowStockThreshold: editThreshold }
                        : p
                )
            );
            
            setEditingProduct(null);
            toast.success('Stock updated successfully');
        } catch (error) {
            console.error('Error updating stock:', error);
            toast.error('Failed to update stock');
        }
    };

    const handleExportInventory = () => {
        exportInventoryCSV(products);
        toast.success('Inventory report exported');
    };


    // Calculate stats
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
    const healthyStock = products.filter(p => p.stock > p.lowStockThreshold).length;
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-chocolate/70 text-lg">Loading inventory...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-chocolate">Inventory Management</h1>
                        <p className="text-chocolate/70 mt-1">{totalProducts} products • {formatCurrency(totalStockValue)} stock value</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={loadProducts}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportInventory}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <Package className="h-5 w-5 text-blue-500" />
                            <p className="text-sm text-chocolate/60">Total Products</p>
                        </div>
                        <p className="text-2xl font-bold text-chocolate">{totalProducts}</p>
                    </div>
                    <div className={`rounded-xl p-4 shadow-md ${outOfStock > 0 ? 'bg-red-50' : 'bg-white'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <XCircle className={`h-5 w-5 ${outOfStock > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                            <p className="text-sm text-chocolate/60">Out of Stock</p>
                        </div>
                        <p className={`text-2xl font-bold ${outOfStock > 0 ? 'text-red-600' : 'text-chocolate'}`}>{outOfStock}</p>
                    </div>
                    <div className={`rounded-xl p-4 shadow-md ${lowStock > 0 ? 'bg-yellow-50' : 'bg-white'}`}>
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className={`h-5 w-5 ${lowStock > 0 ? 'text-yellow-500' : 'text-gray-400'}`} />
                            <p className="text-sm text-chocolate/60">Low Stock</p>
                        </div>
                        <p className={`text-2xl font-bold ${lowStock > 0 ? 'text-yellow-600' : 'text-chocolate'}`}>{lowStock}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <p className="text-sm text-chocolate/60">Healthy Stock</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{healthyStock}</p>
                    </div>
                </div>

                {/* Alerts */}
                {(outOfStock > 0 || lowStock > 0) && (
                    <div className={`rounded-xl p-4 ${outOfStock > 0 ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${outOfStock > 0 ? 'text-red-500' : 'text-yellow-500'}`} />
                            <div>
                                <p className={`font-semibold ${outOfStock > 0 ? 'text-red-800' : 'text-yellow-800'}`}>
                                    {outOfStock > 0 ? 'Stock Alert!' : 'Low Stock Warning'}
                                </p>
                                <p className={`text-sm ${outOfStock > 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {outOfStock > 0 && `${outOfStock} product${outOfStock > 1 ? 's are' : ' is'} out of stock. `}
                                    {lowStock > 0 && `${lowStock} product${lowStock > 1 ? 's have' : ' has'} low stock.`}
                                </p>
                            </div>
                        </div>
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Products</option>
                            <option value="out">Out of Stock</option>
                            <option value="low">Low Stock</option>
                            <option value="ok">Healthy Stock</option>
                        </select>
                    </div>
                </div>

                {/* Inventory Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {filteredProducts.length === 0 ? (
                        <div className="p-12 text-center text-chocolate/60">
                            No products found
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-cream">
                                        <tr>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Product</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Category</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Price</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Stock</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Threshold</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Status</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Stock Value</th>
                                            <th className="text-left py-4 px-6 text-sm font-semibold text-chocolate">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProducts.map((product) => {
                                            const status = getStockStatus(product);
                                            const isEditing = editingProduct === product.id;
                                            
                                            return (
                                                <tr key={product.id} className={`border-b border-chocolate/5 hover:bg-cream/50 transition-colors ${
                                                    status === 'out' ? 'bg-red-50/50' : status === 'low' ? 'bg-yellow-50/50' : ''
                                                }`}>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                                {product.images && product.images[0] ? (
                                                                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xl">🍦</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-chocolate">{product.name}</p>
                                                                <p className="text-xs text-chocolate/60">{product.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm">{product.category}</td>
                                                    <td className="py-4 px-6 text-sm font-semibold">{formatCurrency(product.price)}</td>
                                                    <td className="py-4 px-6">
                                                        {isEditing ? (
                                                            <Input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(Number(e.target.value))}
                                                                className="w-20"
                                                                min={0}
                                                            />
                                                        ) : (
                                                            <span className={`font-semibold ${
                                                                status === 'out' ? 'text-red-600' :
                                                                status === 'low' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                            }`}>
                                                                {product.stock}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {isEditing ? (
                                                            <Input
                                                                type="number"
                                                                value={editThreshold}
                                                                onChange={(e) => setEditThreshold(Number(e.target.value))}
                                                                className="w-20"
                                                                min={0}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-chocolate/70">{product.lowStockThreshold}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                                            status === 'out' ? 'bg-red-100 text-red-800' :
                                                            status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {status === 'out' && <XCircle className="h-3 w-3" />}
                                                            {status === 'low' && <AlertTriangle className="h-3 w-3" />}
                                                            {status === 'ok' && <CheckCircle className="h-3 w-3" />}
                                                            {status === 'out' ? 'Out of Stock' : status === 'low' ? 'Low Stock' : 'In Stock'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-sm font-semibold">
                                                        {formatCurrency(product.stock * product.price)}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {isEditing ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSaveStock(product)}
                                                                >
                                                                    <Save className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setEditingProduct(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleStartEdit(product)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4 p-4">
                                {filteredProducts.map((product) => {
                                    const status = getStockStatus(product);
                                    const isEditing = editingProduct === product.id;
                                    
                                    return (
                                        <div key={product.id} className={`rounded-lg p-4 border ${
                                            status === 'out' ? 'bg-red-50 border-red-200' :
                                            status === 'low' ? 'bg-yellow-50 border-yellow-200' :
                                            'bg-cream border-chocolate/10'
                                        }`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
                                                        {product.images && product.images[0] ? (
                                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-2xl">🍦</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-chocolate">{product.name}</p>
                                                        <p className="text-xs text-chocolate/60">{product.category}</p>
                                                    </div>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                                                    status === 'out' ? 'bg-red-100 text-red-800' :
                                                    status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                    {status === 'out' ? 'Out' : status === 'low' ? 'Low' : 'OK'}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div>
                                                    <span className="text-chocolate/60">Price:</span>
                                                    <span className="ml-1 font-semibold">{formatCurrency(product.price)}</span>
                                                </div>
                                                <div>
                                                    <span className="text-chocolate/60">Value:</span>
                                                    <span className="ml-1 font-semibold">{formatCurrency(product.stock * product.price)}</span>
                                                </div>
                                            </div>
                                            
                                            {isEditing ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="text-xs text-chocolate/60 block mb-1">Stock</label>
                                                            <Input
                                                                type="number"
                                                                value={editStock}
                                                                onChange={(e) => setEditStock(Number(e.target.value))}
                                                                min={0}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-chocolate/60 block mb-1">Threshold</label>
                                                            <Input
                                                                type="number"
                                                                value={editThreshold}
                                                                onChange={(e) => setEditThreshold(Number(e.target.value))}
                                                                min={0}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleSaveStock(product)}
                                                        >
                                                            <Save className="h-4 w-4 mr-2" />
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1"
                                                            onClick={() => setEditingProduct(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="grid grid-cols-2 gap-3 text-sm flex-1">
                                                        <div>
                                                            <span className="text-chocolate/60">Stock:</span>
                                                            <span className={`ml-1 font-semibold ${
                                                                status === 'out' ? 'text-red-600' :
                                                                status === 'low' ? 'text-yellow-600' :
                                                                'text-green-600'
                                                            }`}>{product.stock}</span>
                                                        </div>
                                                        <div>
                                                            <span className="text-chocolate/60">Threshold:</span>
                                                            <span className="ml-1">{product.lowStockThreshold}</span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleStartEdit(product)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

