import { Order } from '../types';
import { formatCurrency, formatDate } from './formatters';

export const generateInvoiceHTML = (order: Order): string => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice ${order.invoiceNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            color: #4A2C2A;
            background: #fff;
            padding: 40px;
            line-height: 1.6;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: #fff;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #FF6B9D 0%, #FFA726 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        .header p {
            font-size: 14px;
            opacity: 0.9;
        }
        .invoice-info {
            display: flex;
            justify-content: space-between;
            padding: 30px;
            background: #f9fafb;
            border-bottom: 2px solid #e5e7eb;
        }
        .info-section {
            flex: 1;
        }
        .info-section h3 {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .info-section p {
            font-size: 16px;
            font-weight: 600;
            color: #4A2C2A;
            margin-bottom: 5px;
        }
        .customer-details {
            padding: 30px;
            background: #fff;
            border-bottom: 2px solid #e5e7eb;
        }
        .customer-details h3 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #4A2C2A;
        }
        .customer-info {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        .customer-info p {
            font-size: 14px;
            color: #6b7280;
        }
        .customer-info strong {
            color: #4A2C2A;
            display: block;
            margin-bottom: 5px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .items-table thead {
            background: #FFF8E1;
        }
        .items-table th {
            padding: 15px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #4A2C2A;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 14px;
        }
        .items-table tbody tr:hover {
            background: #f9fafb;
        }
        .items-table .text-right {
            text-align: right;
        }
        .items-table .text-center {
            text-align: center;
        }
        .totals {
            padding: 30px;
            background: #f9fafb;
        }
        .totals-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            font-size: 14px;
        }
        .totals-row.total {
            border-top: 2px solid #4A2C2A;
            margin-top: 10px;
            padding-top: 20px;
            font-size: 20px;
            font-weight: bold;
            color: #FF6B9D;
        }
        .footer {
            padding: 30px;
            background: #fff;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 2px solid #e5e7eb;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-pending { background: #fef3c7; color: #92400e; }
        .status-confirmed { background: #dbeafe; color: #1e40af; }
        .status-packed { background: #e9d5ff; color: #6b21a8; }
        .status-shipped { background: #e0e7ff; color: #3730a3; }
        .status-delivered { background: #d1fae5; color: #065f46; }
        .status-cancelled { background: #fee2e2; color: #991b1b; }
        @media print {
            body {
                padding: 0;
            }
            .invoice-container {
                border: none;
            }
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <h1>Jas&Mey Ice Cream</h1>
            <p>Premium Handcrafted Ice Cream</p>
        </div>
        
        <div class="invoice-info">
            <div class="info-section">
                <h3>Invoice Details</h3>
                <p>Invoice #: ${order.invoiceNumber}</p>
                <p>Order #: ${order.orderNumber}</p>
                <p>Date: ${formatDate(order.createdAt)}</p>
            </div>
            <div class="info-section">
                <h3>Order Status</h3>
                <p><span class="status-badge status-${order.status}">${order.status}</span></p>
                <p style="margin-top: 10px;">Est. Delivery: ${formatDate(order.estimatedDelivery)}</p>
            </div>
        </div>

        <div class="customer-details">
            <h3>Customer Information</h3>
            <div class="customer-info">
                <div>
                    <strong>Name:</strong>
                    <p>${order.customer.name}</p>
                </div>
                <div>
                    <strong>Email:</strong>
                    <p>${order.customer.email}</p>
                </div>
                <div>
                    <strong>Phone:</strong>
                    <p>${order.customer.phone}</p>
                </div>
                <div>
                    <strong>Delivery Address:</strong>
                    <p>
                        ${order.customer.address.line1}${order.customer.address.line2 ? ', ' + order.customer.address.line2 : ''}<br>
                        ${order.customer.address.city}, ${order.customer.address.state} - ${order.customer.address.pincode}
                    </p>
                </div>
            </div>
        </div>

        <table class="items-table">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Size</th>
                    <th class="text-center">Quantity</th>
                    <th class="text-right">Unit Price</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.size}</td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.price)}</td>
                        <td class="text-right">${formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <div class="totals-row">
                <span>Subtotal:</span>
                <span>${formatCurrency(order.subtotal)}</span>
            </div>
            <div class="totals-row">
                <span>Tax (5%):</span>
                <span>${formatCurrency(order.tax)}</span>
            </div>
            <div class="totals-row">
                <span>Delivery Charges:</span>
                <span>${order.deliveryCharges === 0 ? 'FREE' : formatCurrency(order.deliveryCharges)}</span>
            </div>
            ${order.discount > 0 ? `
            <div class="totals-row">
                <span>Discount:</span>
                <span>-${formatCurrency(order.discount)}</span>
            </div>
            ` : ''}
            <div class="totals-row total">
                <span>Total Amount:</span>
                <span>${formatCurrency(order.total)}</span>
            </div>
        </div>

        <div class="footer">
            <p><strong>Payment Method:</strong> ${order.paymentMethod} | <strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p style="margin-top: 20px;">Thank you for your order! 🍦</p>
            <p style="margin-top: 10px;">Jas&Mey Ice Cream - Crafted with Love, Frozen with Care</p>
        </div>
    </div>
</body>
</html>
    `;
    return html;
};

export const downloadInvoice = (order: Order) => {
    const html = generateInvoiceHTML(order);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${order.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const printInvoice = (order: Order) => {
    const html = generateInvoiceHTML(order);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    }
};

