import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User, Order } from '@/types';
import { fetchOrders, fetchUsers } from '@/utils/dataManager';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { exportUsersCSV, exportUserInvoicesCSV } from '@/utils/exportUtils';
import {
    Search,
    Phone,
    Calendar,
    Eye,
    Loader2,
    Download,
    RefreshCw,
    Users as UsersIcon,
    DollarSign,
    ShoppingBag,
    FileSpreadsheet,
    ChevronDown,
    TrendingUp,
    MapPin
} from 'lucide-react';

export default function UserManagement() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'orders' | 'revenue' | 'date'>('date');
    const [userAnalytics, setUserAnalytics] = useState<Record<string, { orders: number; revenue: number; lastOrder: string }>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [usersData, orders] = await Promise.all([
                fetchUsers(),
                fetchOrders()
            ]);
            
            // Filter out admin users, show only customers
            const customers = usersData.filter((u: User) => u.role === 'customer');
            setUsers(customers);
            setAllOrders(orders);

            // Process order analytics
            const analytics: Record<string, { orders: number; revenue: number; lastOrder: string }> = {};
            orders.forEach(order => {
                if (!analytics[order.userId]) {
                    analytics[order.userId] = { orders: 0, revenue: 0, lastOrder: '' };
                }
                analytics[order.userId].orders += 1;
                analytics[order.userId].revenue += order.total;
                if (!analytics[order.userId].lastOrder || new Date(order.createdAt) > new Date(analytics[order.userId].lastOrder)) {
                    analytics[order.userId].lastOrder = order.createdAt;
                }
            });
            setUserAnalytics(analytics);
        } catch (error) {
            console.error('Error loading user data:', error);
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleExportAllUsers = () => {
        const usersToExport = selectedUsers.size > 0 
            ? filteredUsers.filter(u => selectedUsers.has(u.id))
            : filteredUsers;
        exportUsersCSV(usersToExport, userAnalytics);
        toast.success(`Exported ${usersToExport.length} customers`);
        setShowExportMenu(false);
    };

    const handleExportUserInvoices = (user: User) => {
        const userOrders = allOrders.filter(o => o.userId === user.id);
        if (userOrders.length === 0) {
            toast.error('No orders found for this customer');
            return;
        }
        exportUserInvoicesCSV(user, userOrders);
        toast.success(`Exported ${userOrders.length} invoices for ${user.name}`);
    };

    const handleExportSelectedInvoices = () => {
        if (selectedUsers.size === 0) {
            toast.error('Please select customers first');
            return;
        }
        
        let totalExported = 0;
        selectedUsers.forEach(userId => {
            const user = users.find(u => u.id === userId);
            const userOrders = allOrders.filter(o => o.userId === userId);
            if (user && userOrders.length > 0) {
                exportUserInvoicesCSV(user, userOrders);
                totalExported += userOrders.length;
            }
        });
        
        toast.success(`Exported invoices for ${selectedUsers.size} customers`);
        setShowExportMenu(false);
    };

    const filteredUsers = users
        .filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone && user.phone.includes(searchQuery))
        )
        .sort((a, b) => {
            const analyticsA = userAnalytics[a.id] || { orders: 0, revenue: 0, lastOrder: '' };
            const analyticsB = userAnalytics[b.id] || { orders: 0, revenue: 0, lastOrder: '' };
            
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'orders':
                    return analyticsB.orders - analyticsA.orders;
                case 'revenue':
                    return analyticsB.revenue - analyticsA.revenue;
                case 'date':
                default:
                    return new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime();
            }
        });

    // Calculate summary stats
    const totalCustomers = filteredUsers.length;
    const totalRevenue = Object.values(userAnalytics).reduce((sum, a) => sum + a.revenue, 0);
    const totalOrders = Object.values(userAnalytics).reduce((sum, a) => sum + a.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    if (!isAdmin) return null;

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                        <p className="text-chocolate/70 text-lg">Loading customers...</p>
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
                        <h1 className="text-3xl font-display font-bold text-chocolate">Customer Management</h1>
                        <p className="text-chocolate/70 mt-1">{totalCustomers} customers • {formatCurrency(totalRevenue)} lifetime value</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadData}
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <div className="relative">
                            <Button 
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                Export
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                            {showExportMenu && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-40" 
                                        onClick={() => setShowExportMenu(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-chocolate/10 z-50 py-2">
                                        <div className="px-4 py-2 border-b border-chocolate/10">
                                            <p className="text-xs text-chocolate/60 font-semibold">
                                                {selectedUsers.size > 0 
                                                    ? `${selectedUsers.size} customers selected`
                                                    : `All ${filteredUsers.length} customers`
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleExportAllUsers}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                        >
                                            <UsersIcon className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium">Customer List</p>
                                                <p className="text-xs text-chocolate/60">Export customer details</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportSelectedInvoices}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                            disabled={selectedUsers.size === 0}
                                        >
                                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Customer Invoices</p>
                                                <p className="text-xs text-chocolate/60">
                                                    {selectedUsers.size > 0 
                                                        ? 'Export selected customers\' invoices'
                                                        : 'Select customers first'
                                                    }
                                                </p>
                                            </div>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <UsersIcon className="h-5 w-5 text-blue-500" />
                            <p className="text-sm text-chocolate/60">Total Customers</p>
                        </div>
                        <p className="text-2xl font-bold text-chocolate">{totalCustomers}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="h-5 w-5 text-green-500" />
                            <p className="text-sm text-chocolate/60">Total Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <ShoppingBag className="h-5 w-5 text-purple-500" />
                            <p className="text-sm text-chocolate/60">Total Orders</p>
                        </div>
                        <p className="text-2xl font-bold text-chocolate">{totalOrders}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="h-5 w-5 text-orange-500" />
                            <p className="text-sm text-chocolate/60">Avg Order Value</p>
                        </div>
                        <p className="text-2xl font-bold text-chocolate">{formatCurrency(avgOrderValue)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate/40" />
                            <Input
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="date">Sort by Join Date</option>
                            <option value="name">Sort by Name</option>
                            <option value="orders">Sort by Orders</option>
                            <option value="revenue">Sort by Revenue</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Selection Bar */}
                {selectedUsers.size > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <span className="font-semibold text-chocolate">
                            {selectedUsers.size} customer{selectedUsers.size > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" onClick={handleExportAllUsers}>
                                <Download className="h-4 w-4 mr-2" />
                                Export List
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleExportSelectedInvoices}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Export Invoices
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedUsers(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Users Grid */}
                {filteredUsers.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center text-chocolate/60 shadow-md">
                        No customers found
                    </div>
                ) : (
                    <>
                        {/* Select All */}
                        <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={selectedUsers.size > 0 && selectedUsers.size === filteredUsers.length}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-primary border-chocolate/20 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-semibold text-chocolate">
                                Select All ({filteredUsers.length} customers)
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => {
                                const analytics = userAnalytics[user.id] || { orders: 0, revenue: 0, lastOrder: '' };
                                return (
                                    <div
                                        key={user.id}
                                        className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-chocolate/5"
                                    >
                                        <div className="flex items-start gap-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="w-5 h-5 mt-1 text-primary border-chocolate/20 rounded focus:ring-primary"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-chocolate/80 to-chocolate flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="text-lg font-display font-bold text-chocolate truncate">
                                                                {user.name}
                                                            </h3>
                                                            <p className="text-xs text-chocolate/60 truncate">{user.email}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-2 mt-4">
                                                    {user.phone && (
                                                        <div className="flex items-center text-sm text-chocolate/70">
                                                            <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-chocolate/50" />
                                                            <span>{user.phone}</span>
                                                        </div>
                                                    )}
                                                    {user.joinedAt && (
                                                        <div className="flex items-center text-sm text-chocolate/70">
                                                            <Calendar className="h-4 w-4 mr-2 flex-shrink-0 text-chocolate/50" />
                                                            <span>Joined {formatDate(user.joinedAt)}</span>
                                                        </div>
                                                    )}
                                                    {user.addresses && user.addresses.length > 0 && (
                                                        <div className="flex items-center text-sm text-chocolate/70">
                                                            <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-chocolate/50" />
                                                            <span>{user.addresses[0].city}, {user.addresses[0].state}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Analytics */}
                                                <div className="mt-4 pt-4 border-t border-chocolate/10 grid grid-cols-2 gap-4">
                                                    <div className="bg-cream/50 rounded-lg p-3">
                                                        <p className="text-xs text-chocolate/60">Orders</p>
                                                        <p className="text-xl font-bold text-chocolate">{analytics.orders}</p>
                                                    </div>
                                                    <div className="bg-cream/50 rounded-lg p-3">
                                                        <p className="text-xs text-chocolate/60">Revenue</p>
                                                        <p className="text-xl font-bold text-green-600">{formatCurrency(analytics.revenue)}</p>
                                                    </div>
                                                </div>

                                                {analytics.lastOrder && (
                                                    <p className="text-xs text-chocolate/50 mt-3 text-center">
                                                        Last order: {formatDate(analytics.lastOrder)}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 border-chocolate/20 hover:bg-chocolate/5"
                                                        onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 border-chocolate/20 hover:bg-chocolate/5"
                                                        onClick={() => handleExportUserInvoices(user)}
                                                        disabled={analytics.orders === 0}
                                                    >
                                                        <Download className="h-4 w-4 mr-2" />
                                                        Invoices
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
