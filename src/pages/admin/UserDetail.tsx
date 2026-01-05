import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { User, Order } from '@/types';
import { fetchUsers, fetchOrders } from '@/utils/dataManager';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { exportUserInvoicesCSV, exportOrdersToTallyCSV } from '@/utils/exportUtils';
import { ArrowLeft, Mail, Phone, Calendar, DollarSign, ShoppingBag, TrendingUp, Package, Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function UserDetail() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;

            setIsLoading(true);
            try {
                const users = await fetchUsers();
                const foundUser = users.find(u => u.id === userId);
                setUser(foundUser || null);

                const allOrders = await fetchOrders();
                const userOrders = allOrders.filter(o => o.userId === userId);
                setOrders(userOrders.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            } catch (error) {
                console.error('Error loading user data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();

        // Listen for order updates
        const handleOrdersUpdate = () => {
            loadData();
        };
        window.addEventListener('ordersUpdated', handleOrdersUpdate);

        return () => {
            window.removeEventListener('ordersUpdated', handleOrdersUpdate);
        };
    }, [userId]);

    const handleExportInvoices = () => {
        if (user && orders.length > 0) {
            exportUserInvoicesCSV(user, orders);
            toast.success(`Exported ${orders.length} invoices for ${user.name}`);
        }
    };

    const handleExportTally = () => {
        if (orders.length > 0) {
            exportOrdersToTallyCSV(orders, `${user?.name.replace(/\s+/g, '_')}_Tally_Invoices.csv`);
            toast.success(`Exported ${orders.length} invoices for Tally`);
        }
    };

    if (!isAdmin) {
        return null;
    }

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-chocolate/70 text-lg">Loading customer data...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    if (!user) {
        return (
            <AdminLayout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-display font-bold text-chocolate mb-4">
                        User not found
                    </h2>
                    <Button onClick={() => navigate('/admin/users')}>Back to Users</Button>
                </div>
            </AdminLayout>
        );
    }

    // Calculate analytics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'packed', 'shipped'].includes(o.status)).length;

    // Prepare chart data (monthly revenue)
    const monthlyRevenue = orders.reduce((acc: Record<string, number>, order) => {
        const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + order.total;
        return acc;
    }, {});

    const chartData = Object.entries(monthlyRevenue)
        .map(([month, revenue]) => ({ month, revenue }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Order status distribution
    const statusData = [
        { name: 'Delivered', value: completedOrders, color: '#10B981' },
        { name: 'Pending', value: pendingOrders, color: '#F59E0B' },
        { name: 'Cancelled', value: orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' },
    ];

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <Button
                            variant="outline"
                            onClick={() => navigate('/admin/users')}
                            className="w-full sm:w-auto"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-display font-bold text-chocolate">
                                Customer Details
                            </h1>
                            <p className="text-chocolate/70 mt-1 text-sm sm:text-base">Analytics and order history</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportInvoices}
                            disabled={orders.length === 0}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Invoices
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportTally}
                            disabled={orders.length === 0}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Tally Export
                        </Button>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-display font-bold text-chocolate mb-2">
                                    {user.name}
                                </h2>
                                <div className="space-y-1 text-chocolate/70 text-sm sm:text-base">
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                        <span className="break-all">{user.email}</span>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 flex-shrink-0" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.joinedAt && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                            <span>Joined: {formatDate(user.joinedAt)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                        </div>
                        <p className="text-xs sm:text-sm text-chocolate/60 mb-1">Total Revenue</p>
                        <p className="text-lg sm:text-2xl font-bold text-chocolate break-words">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <ShoppingBag className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                        </div>
                        <p className="text-xs sm:text-sm text-chocolate/60 mb-1">Total Orders</p>
                        <p className="text-lg sm:text-2xl font-bold text-chocolate">{totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                        </div>
                        <p className="text-xs sm:text-sm text-chocolate/60 mb-1">Avg Order Value</p>
                        <p className="text-lg sm:text-2xl font-bold text-chocolate break-words">{formatCurrency(averageOrderValue)}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                        </div>
                        <p className="text-xs sm:text-sm text-chocolate/60 mb-1">Completed Orders</p>
                        <p className="text-lg sm:text-2xl font-bold text-chocolate">{completedOrders}</p>
                    </div>
                </div>

                {/* Charts */}
                {chartData.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-display font-bold text-chocolate mb-4">
                                Revenue Trend
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" stroke="#4A2C2A" fontSize={12} />
                                    <YAxis stroke="#4A2C2A" fontSize={12} />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#E91E63"
                                        strokeWidth={2}
                                        dot={{ fill: '#E91E63', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-display font-bold text-chocolate mb-4">
                                Order Status Distribution
                            </h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={statusData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" stroke="#4A2C2A" fontSize={12} />
                                    <YAxis stroke="#4A2C2A" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                                    />
                                    <Bar dataKey="value" fill="#E91E63" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Order History */}
                <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-chocolate mb-4">
                        Order History ({orders.length})
                    </h3>
                    {orders.length === 0 ? (
                        <p className="text-chocolate/60 text-center py-8 text-sm sm:text-base">No orders found</p>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-chocolate/10">
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Order #</th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Date</th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Items</th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Total</th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Status</th>
                                            <th className="text-left py-3 px-4 text-xs sm:text-sm font-semibold text-chocolate">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => (
                                            <tr key={order.id} className="border-b border-chocolate/5 hover:bg-cream/50 transition-colors">
                                                <td className="py-3 px-4 text-xs sm:text-sm font-mono">{order.orderNumber}</td>
                                                <td className="py-3 px-4 text-xs sm:text-sm">{formatDate(order.createdAt)}</td>
                                                <td className="py-3 px-4 text-xs sm:text-sm">{order.items.length} items</td>
                                                <td className="py-3 px-4 text-xs sm:text-sm font-semibold">{formatCurrency(order.total)}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/admin/orders?orderId=${order.id}`)}
                                                        className="text-xs sm:text-sm"
                                                    >
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-cream rounded-lg p-4 space-y-3 border border-chocolate/10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="font-mono text-xs sm:text-sm font-semibold text-chocolate mb-1">{order.orderNumber}</div>
                                                <div className="text-xs sm:text-sm text-chocolate/60">{formatDate(order.createdAt)}</div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/admin/orders?orderId=${order.id}`)}
                                                className="flex-shrink-0"
                                            >
                                                View
                                            </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                                            <div>
                                                <span className="text-chocolate/60">Items:</span>
                                                <span className="ml-1 font-semibold">{order.items.length}</span>
                                            </div>
                                            <div>
                                                <span className="text-chocolate/60">Total:</span>
                                                <span className="ml-1 font-semibold">{formatCurrency(order.total)}</span>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

