import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Order } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { downloadInvoice, printInvoice } from '@/utils/invoiceGenerator';
import { exportSingleOrderToTallyCSV } from '@/utils/exportUtils';
import {
    Package,
    User,
    MapPin,
    Phone,
    Mail,
    CreditCard,
    Calendar,
    Truck,
    CheckCircle,
    Clock,
    Download,
    Printer,
    FileSpreadsheet
} from 'lucide-react';

interface OrderDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order | null;
}

export default function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
    if (!order) return null;

    const getStatusIcon = (status: string) => {
        const icons: Record<string, any> = {
            pending: Clock,
            confirmed: CheckCircle,
            packed: Package,
            shipped: Truck,
            delivered: CheckCircle,
            cancelled: Clock,
        };
        const Icon = icons[status.toLowerCase()] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    const getStatusColor = (status: string): string => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
            packed: 'bg-purple-100 text-purple-800 border-purple-200',
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Order ${order.orderNumber}`}
            size="lg"
            footer={
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={() => downloadInvoice(order)}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => printInvoice(order)}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => exportSingleOrderToTallyCSV(order)}
                    >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Tally CSV
                    </Button>
                    <Button onClick={onClose}>Close</Button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-4 border border-chocolate/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-chocolate/60 mb-1">Order ID</p>
                            <p className="font-mono font-semibold">{order.orderNumber}</p>
                        </div>
                        <div>
                            <p className="text-xs text-chocolate/60 mb-1">Order Date</p>
                            <p className="font-semibold">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-chocolate/60 mb-1">Total Amount</p>
                            <p className="font-semibold text-primary">{formatCurrency(order.total)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-chocolate/60 mb-1">Status</p>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {order.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div>
                    <h3 className="font-semibold text-lg text-chocolate mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Details
                    </h3>
                    <div className="bg-white border border-chocolate/10 rounded-lg p-4 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <User className="h-5 w-5 text-chocolate/60 mt-0.5" />
                                <div>
                                    <p className="text-xs text-chocolate/60">Name</p>
                                    <p className="font-medium">{order.customer.name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-chocolate/60 mt-0.5" />
                                <div>
                                    <p className="text-xs text-chocolate/60">Email</p>
                                    <p className="font-medium">{order.customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-chocolate/60 mt-0.5" />
                                <div>
                                    <p className="text-xs text-chocolate/60">Phone</p>
                                    <p className="font-medium">{order.customer.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-chocolate/60 mt-0.5" />
                                <div>
                                    <p className="text-xs text-chocolate/60">Delivery Address</p>
                                    <p className="font-medium">
                                        {order.customer.address.line1}
                                        {order.customer.address.line2 && `, ${order.customer.address.line2}`}
                                        <br />
                                        {order.customer.address.city}, {order.customer.address.state} {order.customer.address.pincode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div>
                    <h3 className="font-semibold text-lg text-chocolate mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Items ({order.items.length})
                    </h3>
                    <div className="border border-chocolate/10 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-cream">
                                <tr>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Product</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Size</th>
                                    <th className="text-center py-3 px-4 text-sm font-semibold text-chocolate">Qty</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-chocolate">Price</th>
                                    <th className="text-right py-3 px-4 text-sm font-semibold text-chocolate">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index} className="border-t border-chocolate/5">
                                        <td className="py-3 px-4 text-sm">{item.name}</td>
                                        <td className="py-3 px-4 text-sm">{item.size}</td>
                                        <td className="py-3 px-4 text-sm text-center">{item.quantity}</td>
                                        <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.price)}</td>
                                        <td className="py-3 px-4 text-sm text-right font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-cream border-t-2 border-chocolate/10">
                                <tr>
                                    <td colSpan={4} className="py-2 px-4 text-sm text-right">Subtotal:</td>
                                    <td className="py-2 px-4 text-sm text-right">{formatCurrency(order.subtotal)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="py-2 px-4 text-sm text-right">Tax:</td>
                                    <td className="py-2 px-4 text-sm text-right">{formatCurrency(order.tax)}</td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="py-2 px-4 text-sm text-right">Delivery Charges:</td>
                                    <td className="py-2 px-4 text-sm text-right">{formatCurrency(order.deliveryCharges)}</td>
                                </tr>
                                {order.discount > 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-2 px-4 text-sm text-right text-success">Discount:</td>
                                        <td className="py-2 px-4 text-sm text-right text-success">-{formatCurrency(order.discount)}</td>
                                    </tr>
                                )}
                                <tr className="border-t-2 border-chocolate/20">
                                    <td colSpan={4} className="py-3 px-4 text-sm text-right font-bold">Total:</td>
                                    <td className="py-3 px-4 text-sm text-right font-bold text-primary">{formatCurrency(order.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Information */}
                <div>
                    <h3 className="font-semibold text-lg text-chocolate mb-3 flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                    </h3>
                    <div className="bg-white border border-chocolate/10 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-chocolate/60 mb-1">Payment Method</p>
                                <p className="font-medium">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60 mb-1">Payment Status</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.paymentStatus}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60 mb-1">Invoice Number</p>
                                <p className="font-medium font-mono">{order.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-chocolate/60 mb-1">Estimated Delivery</p>
                                <p className="font-medium">{formatDate(order.estimatedDelivery)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Timeline */}
                <div>
                    <h3 className="font-semibold text-lg text-chocolate mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Order Timeline
                    </h3>
                    <div className="bg-white border border-chocolate/10 rounded-lg p-4">
                        <div className="space-y-4">
                            {order.statusHistory.map((history, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${getStatusColor(history.status)}`}>
                                        {getStatusIcon(history.status)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium capitalize">{history.status}</p>
                                        <p className="text-xs text-chocolate/60">{formatDate(history.timestamp)}</p>
                                    </div>
                                    {index < order.statusHistory.length - 1 && (
                                        <div className="absolute left-6 top-10 bottom-0 w-0.5 bg-chocolate/10 h-6" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
