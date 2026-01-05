import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Order, Product, User } from '@/types';
import { fetchOrders, fetchProducts, fetchUsers } from '@/utils/dataManager';
import { formatCurrency } from '@/utils/formatters';
import {
    exportOrdersToTallyCSV,
    exportDetailedInvoicesCSV,
    exportOrderSummaryCSV,
    exportGSTReportCSV,
    exportDailySalesCSV,
    exportProductsCSV,
    exportUsersCSV,
    exportInventoryCSV,
    exportAllDataZip
} from '@/utils/exportUtils';
import {
    Download,
    FileSpreadsheet,
    FileText,
    RefreshCw,
    Calendar,
    DollarSign,
    ShoppingBag,
    Users as UsersIcon,
    Package,
    TrendingUp,
    BarChart3,
    Loader2
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';

export default function Reports() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
    const [userAnalytics, setUserAnalytics] = useState<Record<string, { orders: number; revenue: number }>>({});

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [ordersData, productsData, usersData] = await Promise.all([
                fetchOrders(),
                fetchProducts(),
                fetchUsers()
            ]);

            setOrders(ordersData);
            setProducts(productsData);
            setUsers(usersData.filter((u: User) => u.role === 'customer'));

            // Calculate user analytics
            const analytics: Record<string, { orders: number; revenue: number }> = {};
            ordersData.forEach((order: Order) => {
                if (!analytics[order.userId]) {
                    analytics[order.userId] = { orders: 0, revenue: 0 };
                }
                analytics[order.userId].orders += 1;
                analytics[order.userId].revenue += order.total;
            });
            setUserAnalytics(analytics);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Failed to load report data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter orders by date range
    const getFilteredOrders = () => {
        const now = new Date();
        let startDate: Date;

        switch (dateRange) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case 'quarter':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'year':
                startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                break;
            default:
                return orders;
        }

        return orders.filter(o => new Date(o.createdAt) >= startDate);
    };

    const filteredOrders = getFilteredOrders();

    // Calculate metrics
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTax = filteredOrders.reduce((sum, o) => sum + o.tax, 0);
    const totalDelivery = filteredOrders.reduce((sum, o) => sum + o.deliveryCharges, 0);
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + o.discount, 0);
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    const deliveredOrders = filteredOrders.filter(o => o.status === 'delivered').length;

    // Daily revenue for chart
    const getDailyData = () => {
        const dailyData: Record<string, { revenue: number; orders: number }> = {};
        
        filteredOrders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!dailyData[date]) {
                dailyData[date] = { revenue: 0, orders: 0 };
            }
            dailyData[date].revenue += order.total;
            dailyData[date].orders += 1;
        });

        return Object.entries(dailyData)
            .map(([date, data]) => ({ date, ...data }))
            .slice(-14); // Last 14 data points
    };

    // Category sales
    const getCategorySales = () => {
        const categorySales: Record<string, number> = {};
        
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                // Find product category
                const product = products.find(p => p.id === item.productId || p.name === item.name);
                const category = product?.category || 'Other';
                categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
            });
        });

        return Object.entries(categorySales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    // Payment method breakdown
    const getPaymentBreakdown = () => {
        const paymentMethods: Record<string, { count: number; revenue: number }> = {};
        
        filteredOrders.forEach(order => {
            const method = order.paymentMethod;
            if (!paymentMethods[method]) {
                paymentMethods[method] = { count: 0, revenue: 0 };
            }
            paymentMethods[method].count += 1;
            paymentMethods[method].revenue += order.total;
        });

        return Object.entries(paymentMethods).map(([name, data]) => ({
            name,
            count: data.count,
            revenue: data.revenue
        }));
    };

    // Export handlers
    const handleExportTally = () => {
        exportOrdersToTallyCSV(filteredOrders);
        toast.success('Exported Tally-compatible invoices');
    };

    const handleExportDetailed = () => {
        exportDetailedInvoicesCSV(filteredOrders);
        toast.success('Exported detailed invoices');
    };

    const handleExportSummary = () => {
        exportOrderSummaryCSV(filteredOrders);
        toast.success('Exported order summary');
    };

    const handleExportGST = () => {
        exportGSTReportCSV(filteredOrders);
        toast.success('Exported GST report');
    };

    const handleExportDailySales = () => {
        exportDailySalesCSV(filteredOrders);
        toast.success('Exported daily sales report');
    };

    const handleExportProducts = () => {
        exportProductsCSV(products);
        toast.success('Exported products list');
    };

    const handleExportCustomers = () => {
        exportUsersCSV(users, userAnalytics);
        toast.success('Exported customers list');
    };

    const handleExportInventory = () => {
        exportInventoryCSV(products);
        toast.success('Exported inventory report');
    };

    const handleExportAll = async () => {
        toast.loading('Preparing exports...', { id: 'export-all' });
        await exportAllDataZip(filteredOrders, users, products, userAnalytics);
        toast.success('All reports exported!', { id: 'export-all' });
    };

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-chocolate/70 text-lg">Loading reports...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const dailyData = getDailyData();
    const categorySales = getCategorySales();
    const paymentBreakdown = getPaymentBreakdown();

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-chocolate">Reports & Analytics</h1>
                        <p className="text-chocolate/70 mt-1">Comprehensive business insights and exports</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value as any)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="quarter">Last 3 Months</option>
                            <option value="year">Last Year</option>
                            <option value="all">All Time</option>
                        </select>
                        <Button variant="outline" onClick={loadData}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <DollarSign className="h-5 w-5 opacity-80" />
                            <p className="text-sm opacity-90">Total Revenue</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p>
                        <p className="text-xs opacity-75 mt-1">{filteredOrders.length} orders</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="h-5 w-5 opacity-80" />
                            <p className="text-sm opacity-90">Avg Order Value</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(avgOrderValue)}</p>
                        <p className="text-xs opacity-75 mt-1">Per order</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-5 w-5 opacity-80" />
                            <p className="text-sm opacity-90">Tax Collected</p>
                        </div>
                        <p className="text-3xl font-bold">{formatCurrency(totalTax)}</p>
                        <p className="text-xs opacity-75 mt-1">GST @ 5%</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 opacity-80" />
                            <p className="text-sm opacity-90">Delivered</p>
                        </div>
                        <p className="text-3xl font-bold">{deliveredOrders}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {filteredOrders.length > 0 
                                ? `${((deliveredOrders / filteredOrders.length) * 100).toFixed(1)}% success rate`
                                : 'No orders'
                            }
                        </p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Trend */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-chocolate">Revenue Trend</h2>
                            <Button variant="ghost" size="sm" onClick={handleExportDailySales}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                        {dailyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={dailyData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="date" stroke="#4A2C2A" fontSize={12} />
                                    <YAxis stroke="#4A2C2A" fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#10B981"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-chocolate/50">
                                No data for selected period
                            </div>
                        )}
                    </div>

                    {/* Category Sales */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-6">Sales by Category</h2>
                        {categorySales.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={categorySales} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" stroke="#4A2C2A" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="#4A2C2A" fontSize={12} width={100} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    />
                                    <Bar dataKey="value" fill="#E91E63" radius={[0, 8, 8, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-chocolate/50">
                                No sales data
                            </div>
                        )}
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-display font-bold text-chocolate mb-6">Financial Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Gross Revenue</p>
                            <p className="text-xl font-bold text-chocolate">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Tax Collected</p>
                            <p className="text-xl font-bold text-blue-600">{formatCurrency(totalTax)}</p>
                        </div>
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Delivery Revenue</p>
                            <p className="text-xl font-bold text-purple-600">{formatCurrency(totalDelivery)}</p>
                        </div>
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Discounts Given</p>
                            <p className="text-xl font-bold text-red-600">-{formatCurrency(totalDiscount)}</p>
                        </div>
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Net Revenue</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue - totalTax)}</p>
                        </div>
                        <div className="p-4 bg-cream rounded-lg">
                            <p className="text-sm text-chocolate/60">Cancelled Value</p>
                            <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(filteredOrders.filter(o => o.status === 'cancelled').reduce((s, o) => s + o.total, 0))}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <h2 className="text-xl font-display font-bold text-chocolate mb-6">Payment Methods</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {paymentBreakdown.map((method) => (
                            <div key={method.name} className="p-4 bg-cream rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="font-semibold text-chocolate">{method.name}</p>
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        method.name === 'COD' ? 'bg-yellow-100 text-yellow-800' :
                                        method.name === 'UPI' ? 'bg-green-100 text-green-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {method.count} orders
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-chocolate">{formatCurrency(method.revenue)}</p>
                                <p className="text-xs text-chocolate/60 mt-1">
                                    {filteredOrders.length > 0 
                                        ? `${((method.count / filteredOrders.length) * 100).toFixed(1)}% of orders`
                                        : '0%'
                                    }
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Export Section */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-display font-bold text-chocolate">Export Reports</h2>
                            <p className="text-sm text-chocolate/60 mt-1">Download reports for accounting and analysis</p>
                        </div>
                        <Button onClick={handleExportAll} className="bg-gradient-to-r from-primary to-secondary">
                            <Download className="h-4 w-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Tally Export */}
                        <button
                            onClick={handleExportTally}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Tally Format</p>
                                    <p className="text-xs text-chocolate/60">Compatible with Tally ERP</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">{filteredOrders.length} invoices</p>
                        </button>

                        {/* GST Report */}
                        <button
                            onClick={handleExportGST}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <FileText className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">GST Report</p>
                                    <p className="text-xs text-chocolate/60">Tax filing format</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">{formatCurrency(totalTax)} tax</p>
                        </button>

                        {/* Detailed Invoices */}
                        <button
                            onClick={handleExportDetailed}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Detailed Invoices</p>
                                    <p className="text-xs text-chocolate/60">Full invoice details</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">Line item details</p>
                        </button>

                        {/* Order Summary */}
                        <button
                            onClick={handleExportSummary}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <BarChart3 className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Order Summary</p>
                                    <p className="text-xs text-chocolate/60">One row per order</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">{formatCurrency(totalRevenue)} total</p>
                        </button>

                        {/* Daily Sales */}
                        <button
                            onClick={handleExportDailySales}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Daily Sales</p>
                                    <p className="text-xs text-chocolate/60">Day-wise breakdown</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">Revenue by date</p>
                        </button>

                        {/* Products */}
                        <button
                            onClick={handleExportProducts}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                                    <Package className="h-5 w-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Products</p>
                                    <p className="text-xs text-chocolate/60">Product catalog</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">{products.length} products</p>
                        </button>

                        {/* Customers */}
                        <button
                            onClick={handleExportCustomers}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                                    <UsersIcon className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Customers</p>
                                    <p className="text-xs text-chocolate/60">Customer list</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">{users.length} customers</p>
                        </button>

                        {/* Inventory */}
                        <button
                            onClick={handleExportInventory}
                            className="p-4 bg-cream rounded-lg hover:bg-cream/80 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                                    <Package className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-chocolate">Inventory</p>
                                    <p className="text-xs text-chocolate/60">Stock levels</p>
                                </div>
                            </div>
                            <p className="text-xs text-chocolate/50">
                                {products.filter(p => p.stock <= p.lowStockThreshold).length} low stock
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

