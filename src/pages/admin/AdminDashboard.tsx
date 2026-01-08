import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { exportOrderSummaryCSV, exportDailySalesCSV } from '@/utils/exportUtils';
import {
    DollarSign,
    ShoppingBag,
    Package,
    Users,
    TrendingUp,
    AlertTriangle,
    Download,
    RefreshCw,
    Eye,
    ArrowRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle
} from 'lucide-react';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
} from 'recharts';
import { Order, Product, User } from '@/types';

interface DashboardStats {
    revenue: number;
    orders: number;
    products: number;
    customers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    pendingOrders: number;
    lowStockProducts: number;
    todayRevenue: number;
    todayOrders: number;
    avgOrderValue: number;
}

export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        revenue: 0,
        orders: 0,
        products: 0,
        customers: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        pendingOrders: 0,
        lowStockProducts: 0,
        todayRevenue: 0,
        todayOrders: 0,
        avgOrderValue: 0,
    });
    const [orders, setOrders] = useState<Order[]>([]);
    const [, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [topProductsData, setTopProductsData] = useState<any[]>([]);
    const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
    const [dailyOrdersData, setDailyOrdersData] = useState<any[]>([]);
    const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadData = async () => {
        try {
            // Load all data in parallel
            const { fetchOrders, fetchProducts, fetchUsers } = await import('@/utils/dataManager');
            const [allOrders, allProducts, allUsers] = await Promise.all([
                fetchOrders(),
                fetchProducts(),
                fetchUsers()
            ]);

        setOrders(allOrders);
            setProducts(allProducts);

            // Calculate comprehensive stats
            const customers = allUsers.filter((u: User) => u.role === 'customer');
            const totalRevenue = allOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
            const pendingOrders = allOrders.filter((o: Order) => ['pending', 'confirmed', 'packed'].includes(o.status)).length;
            const lowStockProducts = allProducts.filter((p: Product) => p.stock <= p.lowStockThreshold).length;

            // Today's stats
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayOrders = allOrders.filter((o: Order) => new Date(o.createdAt) >= today);
            const todayRevenue = todayOrders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);

            // Calculate growth (compare with previous period)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

            const currentPeriodOrders = allOrders.filter((o: Order) => new Date(o.createdAt) >= thirtyDaysAgo);
            const previousPeriodOrders = allOrders.filter((o: Order) => {
                const date = new Date(o.createdAt);
                return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            });

            const currentRevenue = currentPeriodOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
            const previousRevenue = previousPeriodOrders.reduce((sum: number, o: Order) => sum + o.total, 0);
            const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            const ordersGrowth = previousPeriodOrders.length > 0 
                ? ((currentPeriodOrders.length - previousPeriodOrders.length) / previousPeriodOrders.length) * 100 
                : 0;

        setStats({
            revenue: totalRevenue,
            orders: allOrders.length,
                products: allProducts.length,
            customers: customers.length,
                revenueGrowth,
                ordersGrowth,
                pendingOrders,
                lowStockProducts,
                todayRevenue,
                todayOrders: todayOrders.length,
                avgOrderValue: allOrders.length > 0 ? totalRevenue / allOrders.length : 0,
            });

            processChartData(allOrders, allProducts);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const processChartData = (orders: Order[], _products: Product[]) => {
        // Process Revenue Data (Last 7 days)
        const last7Days: Record<string, number> = {};
        const dailyOrders: Record<string, number> = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            last7Days[dateKey] = 0;
            dailyOrders[dateKey] = 0;
        }

        orders.forEach(order => {
            const d = new Date(order.createdAt);
            const dateKey = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (last7Days[dateKey] !== undefined) {
                last7Days[dateKey] += Number(order.total);
                dailyOrders[dateKey] += 1;
            }
        });

        const revData = Object.entries(last7Days).map(([date, revenue]) => ({
            date,
            revenue
        }));
        setRevenueData(revData);

        const dailyData = Object.entries(dailyOrders).map(([date, count]) => ({
            date,
            orders: count
        }));
        setDailyOrdersData(dailyData);

        // Process Top Products
        const productSales: Record<string, { quantity: number; revenue: number }> = {};
        orders.forEach(order => {
            order.items?.forEach((item: any) => {
                const name = item.name;
                if (!productSales[name]) productSales[name] = { quantity: 0, revenue: 0 };
                productSales[name].quantity += item.quantity || 1;
                productSales[name].revenue += (item.price * (item.quantity || 1));
            });
        });

        const topProds = Object.entries(productSales)
            .sort(([, a], [, b]) => b.quantity - a.quantity)
            .slice(0, 5)
            .map(([name, data]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, sales: data.quantity, revenue: data.revenue }));
        setTopProductsData(topProds);

        // Process Order Status
        const statusCounts: Record<string, number> = {
            'pending': 0,
            'confirmed': 0,
            'packed': 0,
            'shipped': 0,
            'delivered': 0,
            'cancelled': 0
        };

        orders.forEach(order => {
            const status = (order.status || 'pending').toLowerCase();
            if (statusCounts[status] !== undefined) {
                statusCounts[status]++;
            }
        });

        const statData = [
            { name: 'Pending', value: statusCounts['pending'], color: '#F59E0B' },
            { name: 'Confirmed', value: statusCounts['confirmed'], color: '#3B82F6' },
            { name: 'Packed', value: statusCounts['packed'], color: '#8B5CF6' },
            { name: 'Shipped', value: statusCounts['shipped'], color: '#6366F1' },
            { name: 'Delivered', value: statusCounts['delivered'], color: '#10B981' },
            { name: 'Cancelled', value: statusCounts['cancelled'], color: '#EF4444' },
        ].filter(item => item.value > 0);

        setOrderStatusData(statData);

        // Payment method distribution
        const paymentMethods: Record<string, number> = {};
        orders.forEach(order => {
            const method = order.paymentMethod || 'Unknown';
            paymentMethods[method] = (paymentMethods[method] || 0) + 1;
        });

        const paymentData = Object.entries(paymentMethods).map(([name, value]) => ({
            name,
            value,
            color: name === 'COD' ? '#F59E0B' : name === 'UPI' ? '#10B981' : '#3B82F6'
        }));
        setPaymentMethodData(paymentData);
    };

    useEffect(() => {
        loadData();

        // Listen for updates
        const handleUpdate = () => loadData();
        window.addEventListener('ordersUpdated', handleUpdate);
        window.addEventListener('productsUpdated', handleUpdate);

        return () => {
            window.removeEventListener('ordersUpdated', handleUpdate);
            window.removeEventListener('productsUpdated', handleUpdate);
        };
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadData();
    };

    const handleExportOrders = () => {
        exportOrderSummaryCSV(orders);
    };

    const handleExportDailySales = () => {
        exportDailySalesCSV(orders);
    };

    if (!isAdmin) {
        return null;
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-chocolate/70 text-lg">Loading dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'confirmed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
            case 'shipped': return <Truck className="h-4 w-4 text-indigo-500" />;
            case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-chocolate">Dashboard</h1>
                    <p className="text-chocolate/70 mt-1">Welcome back, {user?.name}!</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportOrders}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Orders
                        </Button>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                        <p className="text-sm opacity-90">Today's Revenue</p>
                        <p className="text-2xl font-bold mt-1">{formatCurrency(stats.todayRevenue)}</p>
                        <p className="text-xs opacity-75 mt-1">{stats.todayOrders} orders today</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                        <p className="text-sm opacity-90">Pending Orders</p>
                        <p className="text-2xl font-bold mt-1">{stats.pendingOrders}</p>
                        <p className="text-xs opacity-75 mt-1">Needs attention</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                        <p className="text-sm opacity-90">Avg Order Value</p>
                        <p className="text-2xl font-bold mt-1">{formatCurrency(stats.avgOrderValue)}</p>
                        <p className="text-xs opacity-75 mt-1">Per order</p>
                    </div>
                    <div className={`bg-gradient-to-br ${stats.lowStockProducts > 0 ? 'from-red-500 to-red-600' : 'from-gray-500 to-gray-600'} rounded-xl p-4 text-white`}>
                        <p className="text-sm opacity-90">Low Stock Items</p>
                        <p className="text-2xl font-bold mt-1">{stats.lowStockProducts}</p>
                        <p className="text-xs opacity-75 mt-1">
                            {stats.lowStockProducts > 0 ? 'Restock needed' : 'All stocked'}
                        </p>
                    </div>
                </div>

                {/* Main Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value={formatCurrency(stats.revenue)}
                        icon={DollarSign}
                        trend={{ value: Math.abs(stats.revenueGrowth), isPositive: stats.revenueGrowth >= 0 }}
                        iconBgColor="bg-success/10"
                        iconColor="text-success"
                    />
                    <StatsCard
                        title="Total Orders"
                        value={stats.orders}
                        icon={ShoppingBag}
                        trend={{ value: Math.abs(stats.ordersGrowth), isPositive: stats.ordersGrowth >= 0 }}
                        iconBgColor="bg-primary/10"
                        iconColor="text-primary"
                    />
                    <StatsCard
                        title="Products"
                        value={stats.products}
                        icon={Package}
                        iconBgColor="bg-secondary/10"
                        iconColor="text-secondary"
                    />
                    <StatsCard
                        title="Customers"
                        value={stats.customers}
                        icon={Users}
                        iconBgColor="bg-accent/10"
                        iconColor="text-accent"
                    />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-chocolate">Revenue (Last 7 Days)</h2>
                            <Button variant="ghost" size="sm" onClick={handleExportDailySales}>
                                <Download className="h-4 w-4" />
                            </Button>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#E91E63" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#E91E63" stopOpacity={0}/>
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
                                    stroke="#E91E63"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Daily Orders Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-display font-bold text-chocolate">Orders (Last 7 Days)</h2>
                            <TrendingUp className="h-5 w-5 text-success" />
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyOrdersData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" stroke="#4A2C2A" fontSize={12} />
                                <YAxis stroke="#4A2C2A" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                />
                                <Bar dataKey="orders" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Status Pie Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-6">Order Status</h2>
                        {orderStatusData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                        outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {orderStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-chocolate/50">
                                No order data
                            </div>
                        )}
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {orderStatusData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-chocolate/70">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-6">Payment Methods</h2>
                        {paymentMethodData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={paymentMethodData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {paymentMethodData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-chocolate/50">
                                No payment data
                            </div>
                        )}
                        <div className="flex flex-wrap justify-center gap-3 mt-4">
                            {paymentMethodData.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-xs text-chocolate/70">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-xl p-6 shadow-md">
                        <h2 className="text-xl font-display font-bold text-chocolate mb-6">Top Products</h2>
                        {topProductsData.length > 0 ? (
                            <div className="space-y-4">
                                {topProductsData.map((product, index) => (
                                    <div key={index} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-chocolate truncate">{product.name}</p>
                                            <p className="text-xs text-chocolate/60">{product.sales} sold</p>
                                        </div>
                                        <p className="text-sm font-semibold text-primary">{formatCurrency(product.revenue)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-[200px] flex items-center justify-center text-chocolate/50">
                                No sales data
                            </div>
                        )}
                    </div>
                </div>

                {/* Low Stock Alert */}
                {stats.lowStockProducts > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                                <p className="text-sm text-red-600 mt-1">
                                    {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's' : ''} running low on stock. 
                                    Please restock soon to avoid stockouts.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-100"
                                onClick={() => navigate('/admin/inventory')}
                            >
                                View Inventory
                            </Button>
                        </div>
                </div>
                )}

                {/* Recent Orders Table */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-display font-bold text-chocolate">Recent Orders</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/admin/orders')}
                        >
                            View All
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                    {orders.length === 0 ? (
                        <p className="text-chocolate/60 text-center py-8">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-chocolate/10">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Order</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Customer</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Items</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Total</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Payment</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Date</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 10).map((order, index) => (
                                        <tr key={index} className="border-b border-chocolate/5 hover:bg-cream transition-colors">
                                            <td className="py-3 px-4 text-sm font-mono">{order.orderNumber}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <div>{order.customer?.name || 'Guest'}</div>
                                                <div className="text-xs text-chocolate/60">{order.customer?.email}</div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{order.items?.length || 0} items</td>
                                            <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(order.total)}</td>
                                            <td className="py-3 px-4 text-sm">
                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                                                    {order.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(order.status)}
                                                    <span className="text-sm capitalize">{order.status}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-chocolate/70">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate('/admin/orders')}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
