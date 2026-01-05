import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Order } from '@/types';
import { fetchOrders, updateOrder } from '@/utils/dataManager';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
    exportOrdersToTallyCSV,
    exportDetailedInvoicesCSV,
    exportOrderSummaryCSV,
    exportGSTReportCSV,
    exportSingleOrderToTallyCSV
} from '@/utils/exportUtils';
import {
    Search,
    Eye,
    Download,
    RefreshCw,
    FileSpreadsheet,
    FileText,
    ChevronDown
} from 'lucide-react';
import { downloadInvoice } from '@/utils/invoiceGenerator';

export default function OrderManagement() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [paymentFilter, setPaymentFilter] = useState<string>('All');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        }
    }, [isAdmin, navigate]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchOrders();
            // Sort by date, newest first
            const sortedOrders = data.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);

            // Check if there's an orderId in URL params to open
            const orderIdParam = searchParams.get('orderId');
            if (orderIdParam) {
                const orderToOpen = sortedOrders.find(o => o.id === orderIdParam);
                if (orderToOpen) {
                    setSelectedOrder(orderToOpen);
                    setIsDetailModalOpen(true);
                }
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();

        const handleOrdersUpdate = () => loadOrders();
        window.addEventListener('ordersUpdated', handleOrdersUpdate);

        return () => {
            window.removeEventListener('ordersUpdated', handleOrdersUpdate);
        };
    }, [searchParams]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const order = orders.find(o => o.id === orderId);
            const oldStatus = order?.status;
            
            await updateOrder(orderId, { status: newStatus as any });
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId
                        ? { ...order, status: newStatus as any }
                        : order
                )
            );
            
            // If status changed to/from cancelled, update products (stock changed)
            if (oldStatus === 'cancelled' || newStatus === 'cancelled') {
                window.dispatchEvent(new CustomEvent('productsUpdated'));
            }
            
            toast.success('Order status updated successfully');
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
        }
    };

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    const handleSelectOrder = (orderId: string) => {
        setSelectedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedOrders.size === filteredOrders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(filteredOrders.map(o => o.id)));
        }
    };

    // Filter orders based on date
    const getDateFilteredOrders = (orders: Order[]) => {
        const now = new Date();
        switch (dateFilter) {
            case 'today':
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return orders.filter(o => new Date(o.createdAt) >= today);
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return orders.filter(o => new Date(o.createdAt) >= weekAgo);
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return orders.filter(o => new Date(o.createdAt) >= monthAgo);
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return orders.filter(o => new Date(o.createdAt) >= yearAgo);
            default:
                return orders;
        }
    };

    const filteredOrders = getDateFilteredOrders(orders).filter(order => {
        const matchesSearch =
            order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || order.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesPayment = paymentFilter === 'All' || order.paymentMethod === paymentFilter;
        return matchesSearch && matchesStatus && matchesPayment;
    });

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            packed: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    // Export functions
    const handleExportTally = () => {
        const ordersToExport = selectedOrders.size > 0 
            ? filteredOrders.filter(o => selectedOrders.has(o.id))
            : filteredOrders;
        exportOrdersToTallyCSV(ordersToExport);
        toast.success(`Exported ${ordersToExport.length} invoices for Tally`);
        setShowExportMenu(false);
    };

    const handleExportDetailed = () => {
        const ordersToExport = selectedOrders.size > 0 
            ? filteredOrders.filter(o => selectedOrders.has(o.id))
            : filteredOrders;
        exportDetailedInvoicesCSV(ordersToExport);
        toast.success(`Exported ${ordersToExport.length} detailed invoices`);
        setShowExportMenu(false);
    };

    const handleExportSummary = () => {
        const ordersToExport = selectedOrders.size > 0 
            ? filteredOrders.filter(o => selectedOrders.has(o.id))
            : filteredOrders;
        exportOrderSummaryCSV(ordersToExport);
        toast.success(`Exported ${ordersToExport.length} orders summary`);
        setShowExportMenu(false);
    };

    const handleExportGST = () => {
        const ordersToExport = selectedOrders.size > 0 
            ? filteredOrders.filter(o => selectedOrders.has(o.id))
            : filteredOrders;
        exportGSTReportCSV(ordersToExport);
        toast.success(`Exported GST report for ${ordersToExport.length} orders`);
        setShowExportMenu(false);
    };

    const handleExportSingleTally = (order: Order) => {
        exportSingleOrderToTallyCSV(order);
        toast.success(`Exported invoice ${order.invoiceNumber}`);
    };

    // Calculate summary stats
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalTax = filteredOrders.reduce((sum, o) => sum + o.tax, 0);

    if (!isAdmin) return null;

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-chocolate">Order Management</h1>
                        <p className="text-chocolate/70 mt-1 text-sm sm:text-base">
                            {filteredOrders.length} orders • {formatCurrency(totalRevenue)} revenue
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadOrders}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
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
                                                {selectedOrders.size > 0 
                                                    ? `Export ${selectedOrders.size} selected orders`
                                                    : `Export all ${filteredOrders.length} orders`
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleExportTally}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                        >
                                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="text-sm font-medium">Tally Format (CSV)</p>
                                                <p className="text-xs text-chocolate/60">Compatible with Tally ERP</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportDetailed}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                        >
                                            <FileText className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm font-medium">Detailed Invoices</p>
                                                <p className="text-xs text-chocolate/60">Full invoice details</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportSummary}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                        >
                                            <FileText className="h-5 w-5 text-purple-600" />
                                            <div>
                                                <p className="text-sm font-medium">Order Summary</p>
                                                <p className="text-xs text-chocolate/60">One row per order</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={handleExportGST}
                                            className="w-full px-4 py-3 text-left hover:bg-cream flex items-center gap-3 transition-colors"
                                        >
                                            <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                                            <div>
                                                <p className="text-sm font-medium">GST Report</p>
                                                <p className="text-xs text-chocolate/60">Tax filing format</p>
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
                        <p className="text-sm text-chocolate/60">Total Orders</p>
                        <p className="text-2xl font-bold text-chocolate">{filteredOrders.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-chocolate/60">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-chocolate/60">Tax Collected</p>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalTax)}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-md">
                        <p className="text-sm text-chocolate/60">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {filteredOrders.filter(o => ['pending', 'confirmed', 'packed'].includes(o.status)).length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl p-6 shadow-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-chocolate/40" />
                            <Input
                                placeholder="Search orders, customers, invoices..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="All">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="All">All Payments</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="UPI">UPI</option>
                            <option value="Card">Card</option>
                        </select>
                        <select
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-4 py-2 border border-chocolate/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                            <option value="year">Last Year</option>
                        </select>
                    </div>
                </div>

                {/* Bulk Selection Bar */}
                {selectedOrders.size > 0 && (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <span className="font-semibold text-chocolate">
                            {selectedOrders.size} order{selectedOrders.size > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex items-center gap-3">
                            <Button size="sm" variant="outline" onClick={handleExportTally}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Export Tally
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleExportDetailed}>
                                <FileText className="h-4 w-4 mr-2" />
                                Export Detailed
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrders(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}

                {/* Orders Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                            <p className="text-chocolate/60">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-12 text-center text-chocolate/60">
                            No orders found
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-cream">
                                        <tr>
                                            <th className="py-4 px-4 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 text-primary border-chocolate/20 rounded"
                                                />
                                            </th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Invoice</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Customer</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Items</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Total</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Payment</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Status</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Date</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-chocolate">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.map((order) => (
                                            <tr key={order.id} className="border-b border-chocolate/5 hover:bg-cream/50 transition-colors">
                                                <td className="py-4 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedOrders.has(order.id)}
                                                        onChange={() => handleSelectOrder(order.id)}
                                                        className="w-4 h-4 text-primary border-chocolate/20 rounded"
                                                    />
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="text-sm font-mono font-semibold">{order.invoiceNumber}</div>
                                                    <div className="text-xs text-chocolate/60">{order.orderNumber}</div>
                                                </td>
                                                <td className="py-4 px-4 text-sm">
                                                    <div className="font-medium">{order.customer.name}</div>
                                                    <div className="text-xs text-chocolate/60">{order.customer.email}</div>
                                                </td>
                                                <td className="py-4 px-4 text-sm">{order.items.length} items</td>
                                                <td className="py-4 px-4 text-sm font-semibold">{formatCurrency(order.total)}</td>
                                                <td className="py-4 px-4 text-sm">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        order.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.paymentMethod === 'UPI' ? 'bg-green-100 text-green-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {order.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(order.status)}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="packed">Packed</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="py-4 px-4 text-sm text-chocolate/70">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleViewOrder(order)}
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => downloadInvoice(order)}
                                                            title="Download Invoice"
                                                        >
                                                            <Download className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleExportSingleTally(order)}
                                                            title="Export for Tally"
                                                        >
                                                            <FileSpreadsheet className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="lg:hidden space-y-4 p-4">
                                {filteredOrders.map((order) => (
                                    <div key={order.id} className="bg-cream rounded-lg p-4 space-y-3 border border-chocolate/10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedOrders.has(order.id)}
                                                    onChange={() => handleSelectOrder(order.id)}
                                                    className="w-4 h-4 mt-1 text-primary border-chocolate/20 rounded"
                                                />
                                                <div>
                                                    <div className="font-mono text-sm font-semibold text-chocolate">{order.invoiceNumber}</div>
                                                    <div className="text-xs text-chocolate/60">{order.orderNumber}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => downloadInvoice(order)}>
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
                                        <div className="pl-7">
                                            <div className="text-sm font-semibold text-chocolate">{order.customer.name}</div>
                                            <div className="text-xs text-chocolate/60">{order.customer.email}</div>
                                        </div>
                                        
                                        <div className="pl-7 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-chocolate/60">Items:</span>
                                                <span className="ml-1 font-semibold">{order.items.length}</span>
                                            </div>
                                            <div>
                                                <span className="text-chocolate/60">Total:</span>
                                                <span className="ml-1 font-semibold">{formatCurrency(order.total)}</span>
                                            </div>
                                            <div>
                                                <span className="text-chocolate/60">Payment:</span>
                                                <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
                                                    order.paymentMethod === 'COD' ? 'bg-yellow-100 text-yellow-800' :
                                                    order.paymentMethod === 'UPI' ? 'bg-green-100 text-green-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {order.paymentMethod}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-chocolate/60">Date:</span>
                                                <span className="ml-1 text-xs">{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="pl-7">
                                            <label className="text-xs text-chocolate/60 mb-1 block">Status:</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`w-full px-3 py-2 rounded text-sm font-semibold capitalize ${getStatusColor(order.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="packed">Packed</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Order Detail Modal */}
                <OrderDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    order={selectedOrder}
                />
            </div>
        </AdminLayout>
    );
}
