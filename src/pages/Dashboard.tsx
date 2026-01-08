import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order, Address } from '@/types';
import { fetchOrdersByUserId } from '@/utils/dataManager';
import { apiClient } from '@/api/client';
import OrderDetailModal from '@/components/user/OrderDetailModal';
import Modal from '@/components/ui/modal';
import { Package, User, MapPin, ShoppingBag, Clock, Truck, Search, Eye, Filter, Plus, Edit, Trash2, Home, Building } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/formatters';

type Tab = 'orders' | 'profile' | 'addresses';

interface AddressFormData {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    type: 'home' | 'office';
}

const initialAddressForm: AddressFormData = {
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    type: 'home',
};

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    
    // Address management state
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);
    const [addressForm, setAddressForm] = useState<AddressFormData>(initialAddressForm);
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Load addresses from user
    useEffect(() => {
        if (user?.addresses) {
            setAddresses(user.addresses);
        }
    }, [user]);

    const loadOrders = async () => {
        if (user?.id) {
            const userOrders = await fetchOrdersByUserId(user.id);
            // Sort by created date, newest first
            const sortedOrders = userOrders.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setOrders(sortedOrders);
        }
    };

    // Load user's orders
    useEffect(() => {
        loadOrders();

        // Listen for order updates
        const handleOrdersUpdate = () => {
            loadOrders();
        };
        window.addEventListener('ordersUpdated', handleOrdersUpdate);

        return () => {
            window.removeEventListener('ordersUpdated', handleOrdersUpdate);
        };
    }, [user]);

    if (!user) {
        return null;
    }

    // Filter orders based on search and status
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = searchQuery === '' || 
                order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = statusFilter === 'All' || order.status === statusFilter.toLowerCase();
            
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchQuery, statusFilter]);

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

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailModalOpen(true);
    };

    // Address management functions
    const handleAddAddress = () => {
        setEditingAddressIndex(null);
        setAddressForm(initialAddressForm);
        setIsAddressModalOpen(true);
    };

    const handleEditAddress = (index: number) => {
        const address = addresses[index];
        setEditingAddressIndex(index);
        setAddressForm({
            line1: address.line1 || '',
            line2: address.line2 || '',
            city: address.city || '',
            state: address.state || '',
            pincode: address.pincode || '',
            landmark: address.landmark || '',
            type: address.type || 'home',
        });
        setIsAddressModalOpen(true);
    };

    const handleDeleteAddress = async (index: number) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        
        const newAddresses = addresses.filter((_, i) => i !== index);
        
        try {
            // Update user addresses in backend
            await apiClient.put(`/users/${user.id}/addresses`, { addresses: newAddresses });
            setAddresses(newAddresses);
            
            // Update localStorage
            const storedUser = localStorage.getItem('jasmey_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                userData.addresses = newAddresses;
                localStorage.setItem('jasmey_user', JSON.stringify(userData));
            }
            
            toast.success('Address deleted successfully');
        } catch (error) {
            console.error('Error deleting address:', error);
            toast.error('Failed to delete address');
        }
    };

    const handleSaveAddress = async () => {
        // Validation
        if (!addressForm.line1 || !addressForm.city || !addressForm.state || !addressForm.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (addressForm.pincode.length !== 6) {
            toast.error('PIN code must be 6 digits');
            return;
        }

        setIsSavingAddress(true);

        try {
            const newAddress: Address = {
                line1: addressForm.line1,
                line2: addressForm.line2 || undefined,
                city: addressForm.city,
                state: addressForm.state,
                pincode: addressForm.pincode,
                landmark: addressForm.landmark || undefined,
                type: addressForm.type,
            };

            let newAddresses: Address[];
            if (editingAddressIndex !== null) {
                // Update existing address
                newAddresses = [...addresses];
                newAddresses[editingAddressIndex] = newAddress;
            } else {
                // Add new address
                newAddresses = [...addresses, newAddress];
            }

            // Update user addresses in backend
            await apiClient.put(`/users/${user.id}/addresses`, { addresses: newAddresses });
            setAddresses(newAddresses);
            
            // Update localStorage
            const storedUser = localStorage.getItem('jasmey_user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                userData.addresses = newAddresses;
                localStorage.setItem('jasmey_user', JSON.stringify(userData));
            }

            toast.success(editingAddressIndex !== null ? 'Address updated successfully' : 'Address added successfully');
            setIsAddressModalOpen(false);
            setAddressForm(initialAddressForm);
            setEditingAddressIndex(null);
        } catch (error) {
            console.error('Error saving address:', error);
            toast.error('Failed to save address');
        } finally {
            setIsSavingAddress(false);
        }
    };

    const statusOptions = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

    const tabs = [
        { id: 'orders' as Tab, label: 'My Orders', icon: Package },
        { id: 'profile' as Tab, label: 'Profile', icon: User },
        { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <Navbar />

            <main className="flex-grow py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-display font-bold text-chocolate">
                            My Dashboard
                        </h1>
                        <p className="text-chocolate/70 mt-2 text-sm sm:text-base">
                            Welcome back, {user.name}!
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl shadow-md mb-6">
                        <div className="flex border-b border-chocolate/10">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${activeTab === tab.id
                                            ? 'text-primary border-b-2 border-primary'
                                            : 'text-chocolate/60 hover:text-chocolate'
                                            }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="hidden sm:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                                        <h2 className="text-lg sm:text-xl font-display font-bold text-chocolate">
                                            Order History
                                        </h2>
                                        <Button onClick={() => navigate('/shop')} size="sm" className="w-full sm:w-auto">
                                            <ShoppingBag className="h-4 w-4 mr-2" />
                                            Shop Now
                                        </Button>
                                    </div>

                                    {/* Search and Filter */}
                                    {orders.length > 0 && (
                                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-chocolate/40" />
                                                <Input
                                                    type="text"
                                                    placeholder="Search orders by order number or product..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="pl-10 text-sm"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Filter className="h-4 w-4 text-chocolate/60 flex-shrink-0" />
                                                <select
                                                    value={statusFilter}
                                                    onChange={(e) => setStatusFilter(e.target.value)}
                                                    className="px-3 py-2 border border-chocolate/20 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-chocolate flex-1 sm:flex-none sm:w-auto"
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>{status}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {orders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="h-16 w-16 text-chocolate/20 mx-auto mb-4" />
                                            <h3 className="text-lg sm:text-xl font-semibold text-chocolate mb-2">
                                                No orders yet
                                            </h3>
                                            <p className="text-chocolate/70 mb-6 text-sm sm:text-base">
                                                Start shopping to see your orders here
                                            </p>
                                            <Button onClick={() => navigate('/shop')}>
                                                Browse Products
                                            </Button>
                                        </div>
                                    ) : filteredOrders.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Package className="h-16 w-16 text-chocolate/20 mx-auto mb-4" />
                                            <h3 className="text-lg sm:text-xl font-semibold text-chocolate mb-2">
                                                No orders found
                                            </h3>
                                            <p className="text-chocolate/70 mb-6 text-sm sm:text-base">
                                                Try adjusting your search or filter criteria
                                            </p>
                                            <Button 
                                                variant="outline" 
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setStatusFilter('All');
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="text-sm text-chocolate/60 mb-2">
                                                Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
                                            </div>
                                            {filteredOrders.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="border border-chocolate/10 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow bg-white"
                                                >
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                <span className="font-mono text-xs sm:text-sm font-semibold text-chocolate">
                                                                    {order.orderNumber}
                                                                </span>
                                                                <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getStatusColor(order.status)}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs sm:text-sm text-chocolate/70">
                                                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                {formatDate(order.createdAt)}
                                                            </div>
                                                        </div>
                                                        <div className="text-left sm:text-right">
                                                            <div className="text-lg sm:text-xl font-bold text-primary mb-1">
                                                                {formatCurrency(order.total)}
                                                            </div>
                                                            <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                                                                {order.paymentMethod}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 mb-4">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="flex items-center justify-between text-xs sm:text-sm"
                                                            >
                                                                <span className="text-chocolate truncate flex-1 mr-2">
                                                                    {item.name} ({item.size}) × {item.quantity}
                                                                </span>
                                                                <span className="font-semibold flex-shrink-0">
                                                                    {formatCurrency(item.price * item.quantity)}
                                                                </span>
                                                            </div>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="text-xs sm:text-sm text-chocolate/60 italic">
                                                                +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="pt-4 border-t border-chocolate/10 space-y-2">
                                                        <div className="text-xs sm:text-sm text-chocolate/70">
                                                            <strong>Delivery To:</strong> {order.customer.name}
                                                        </div>
                                                        <div className="text-xs sm:text-sm text-chocolate/70 line-clamp-2">
                                                            {order.customer.address.line1}, {order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}
                                                        </div>
                                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
                                                            {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-primary">
                                                                    <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                                                                    <span className="truncate">Est. delivery: {formatDate(order.estimatedDelivery)}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleViewOrder(order)}
                                                                    className="flex-1 sm:flex-none"
                                                                >
                                                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                                    <span className="text-xs sm:text-sm">View Details</span>
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => navigate(`/order-tracking/${order.id}`)}
                                                                    className="flex-1 sm:flex-none"
                                                                >
                                                                    <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                                    <span className="text-xs sm:text-sm">Track</span>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-display font-bold text-chocolate mb-4">
                                        Profile Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <Input id="name" value={user.name} readOnly />
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input id="email" value={user.email} readOnly />
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" value={user.phone || 'Not provided'} readOnly />
                                        </div>
                                        <div>
                                            <Label htmlFor="joined">Member Since</Label>
                                            <Input
                                                id="joined"
                                                value={formatDate(user.joinedAt || '')}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <Button disabled>
                                            Edit Profile (Coming Soon)
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-display font-bold text-chocolate">
                                            Saved Addresses
                                        </h2>
                                        <Button size="sm" onClick={handleAddAddress}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add New Address
                                        </Button>
                                    </div>

                                    {addresses.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MapPin className="h-16 w-16 text-chocolate/20 mx-auto mb-4" />
                                            <h3 className="text-xl font-semibold text-chocolate mb-2">
                                                No saved addresses
                                            </h3>
                                            <p className="text-chocolate/70 mb-6">
                                                Add an address for faster checkout
                                            </p>
                                            <Button onClick={handleAddAddress}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Address
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {addresses.map((address: Address, index: number) => (
                                                <div
                                                    key={index}
                                                    className="border border-chocolate/10 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {address.type === 'home' ? (
                                                                <Home className="h-5 w-5 text-primary" />
                                                            ) : (
                                                                <Building className="h-5 w-5 text-primary" />
                                                            )}
                                                            <span className="font-semibold text-chocolate capitalize">
                                                            {address.type} Address
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => handleEditAddress(index)}
                                                                className="p-1.5 text-chocolate/60 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteAddress(index)}
                                                                className="p-1.5 text-chocolate/60 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="text-sm text-chocolate/70 space-y-1">
                                                        <div className="font-medium text-chocolate">{address.line1}</div>
                                                        {address.line2 && <div>{address.line2}</div>}
                                                        <div>
                                                            {address.city}, {address.state} - {address.pincode}
                                                        </div>
                                                        {address.landmark && (
                                                            <div className="text-chocolate/60">
                                                                <span className="font-medium">Landmark:</span> {address.landmark}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedOrder(null);
                }}
                order={selectedOrder}
            />

            {/* Address Form Modal */}
            <Modal
                isOpen={isAddressModalOpen}
                onClose={() => {
                    setIsAddressModalOpen(false);
                    setAddressForm(initialAddressForm);
                    setEditingAddressIndex(null);
                }}
                title={editingAddressIndex !== null ? 'Edit Address' : 'Add New Address'}
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAddressModalOpen(false);
                                setAddressForm(initialAddressForm);
                                setEditingAddressIndex(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleSaveAddress} disabled={isSavingAddress}>
                            {isSavingAddress ? 'Saving...' : editingAddressIndex !== null ? 'Update Address' : 'Add Address'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    {/* Address Type */}
                    <div>
                        <Label>Address Type</Label>
                        <div className="flex gap-4 mt-2">
                            <button
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, type: 'home' })}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                    addressForm.type === 'home'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-chocolate/20 text-chocolate/70 hover:border-chocolate/40'
                                }`}
                            >
                                <Home className="h-5 w-5" />
                                <span className="font-medium">Home</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setAddressForm({ ...addressForm, type: 'office' })}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                                    addressForm.type === 'office'
                                        ? 'border-primary bg-primary/5 text-primary'
                                        : 'border-chocolate/20 text-chocolate/70 hover:border-chocolate/40'
                                }`}
                            >
                                <Building className="h-5 w-5" />
                                <span className="font-medium">Office</span>
                            </button>
                        </div>
                    </div>

                    {/* Address Line 1 */}
                    <div>
                        <Label htmlFor="line1">Street Address *</Label>
                        <Input
                            id="line1"
                            value={addressForm.line1}
                            onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                            placeholder="House/Flat No., Building Name, Street"
                            required
                        />
                    </div>

                    {/* Address Line 2 */}
                    <div>
                        <Label htmlFor="line2">Address Line 2</Label>
                        <Input
                            id="line2"
                            value={addressForm.line2}
                            onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                            placeholder="Area, Colony (Optional)"
                        />
                    </div>

                    {/* City & State */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={addressForm.city}
                                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                placeholder="City"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                                id="state"
                                value={addressForm.state}
                                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                placeholder="State"
                                required
                            />
                        </div>
                    </div>

                    {/* PIN Code */}
                    <div>
                        <Label htmlFor="pincode">PIN Code *</Label>
                        <Input
                            id="pincode"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                            placeholder="6-digit PIN code"
                            maxLength={6}
                            required
                        />
                    </div>

                    {/* Landmark */}
                    <div>
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                            id="landmark"
                            value={addressForm.landmark}
                            onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                            placeholder="Near... (Optional)"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
