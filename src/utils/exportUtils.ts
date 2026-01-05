import { Order, User, Product } from '../types';
import { formatDate } from './formatters';

// Tally-compatible date format: DD-MMM-YYYY
const formatTallyDate = (dateString: string): string => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

// Escape CSV values
const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Generate CSV from array of objects
const generateCSV = (headers: string[], rows: string[][]): string => {
    const headerRow = headers.map(escapeCSV).join(',');
    const dataRows = rows.map(row => row.map(escapeCSV).join(',')).join('\n');
    return `${headerRow}\n${dataRows}`;
};

// Download CSV file
const downloadCSV = (content: string, filename: string): void => {
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// ==================== TALLY-COMPATIBLE INVOICE EXPORT ====================

// Export orders as Tally-compatible Sales Voucher format
export const exportOrdersToTallyCSV = (orders: Order[], filename?: string): void => {
    const headers = [
        'Voucher Date',
        'Voucher Number',
        'Voucher Type',
        'Party Name',
        'Party GSTIN',
        'Party Address',
        'Party State',
        'Party Pincode',
        'Item Name',
        'HSN Code',
        'Quantity',
        'Unit',
        'Rate',
        'Amount',
        'Discount',
        'Taxable Value',
        'CGST Rate',
        'CGST Amount',
        'SGST Rate',
        'SGST Amount',
        'IGST Rate',
        'IGST Amount',
        'Total Tax',
        'Total Amount',
        'Payment Mode',
        'Narration'
    ];

    const rows: string[][] = [];

    orders.forEach(order => {
        order.items.forEach((item, index) => {
            const itemAmount = item.price * item.quantity;
            const itemTax = (itemAmount * 0.05); // 5% GST
            const cgst = itemTax / 2;
            const sgst = itemTax / 2;
            
            rows.push([
                formatTallyDate(order.createdAt),
                order.invoiceNumber,
                'Sales',
                order.customer.name,
                '', // GSTIN - can be added if available
                `${order.customer.address.line1}${order.customer.address.line2 ? ', ' + order.customer.address.line2 : ''}`,
                order.customer.address.state,
                order.customer.address.pincode,
                item.name,
                '2105', // HSN Code for Ice Cream
                String(item.quantity),
                item.size || 'PCS',
                String(item.price),
                String(itemAmount),
                String(order.discount > 0 ? (order.discount / order.items.length).toFixed(2) : 0),
                String(itemAmount),
                '2.5', // CGST Rate
                String(cgst.toFixed(2)),
                '2.5', // SGST Rate
                String(sgst.toFixed(2)),
                '0', // IGST Rate (for inter-state)
                '0', // IGST Amount
                String(itemTax.toFixed(2)),
                String((itemAmount + itemTax).toFixed(2)),
                order.paymentMethod,
                `Order #${order.orderNumber} - ${index === 0 ? 'Primary Item' : 'Additional Item'}`
            ]);
        });
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Tally_Sales_Invoices_${formatTallyDate(new Date().toISOString())}.csv`);
};

// Export single order invoice
export const exportSingleOrderToTallyCSV = (order: Order): void => {
    exportOrdersToTallyCSV([order], `Invoice_${order.invoiceNumber}.csv`);
};

// ==================== DETAILED INVOICE EXPORT ====================

export const exportDetailedInvoicesCSV = (orders: Order[], filename?: string): void => {
    const headers = [
        'Invoice Number',
        'Order Number',
        'Invoice Date',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Delivery Address',
        'City',
        'State',
        'Pincode',
        'Product Name',
        'Size',
        'Quantity',
        'Unit Price',
        'Line Total',
        'Subtotal',
        'Tax Amount',
        'Delivery Charges',
        'Discount',
        'Grand Total',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Created Date'
    ];

    const rows: string[][] = [];

    orders.forEach(order => {
        order.items.forEach((item, index) => {
            rows.push([
                order.invoiceNumber,
                order.orderNumber,
                formatTallyDate(order.createdAt),
                order.customer.name,
                order.customer.email,
                order.customer.phone,
                `${order.customer.address.line1}${order.customer.address.line2 ? ', ' + order.customer.address.line2 : ''}`,
                order.customer.address.city,
                order.customer.address.state,
                order.customer.address.pincode,
                item.name,
                item.size,
                String(item.quantity),
                String(item.price),
                String(item.price * item.quantity),
                index === 0 ? String(order.subtotal) : '',
                index === 0 ? String(order.tax) : '',
                index === 0 ? String(order.deliveryCharges) : '',
                index === 0 ? String(order.discount) : '',
                index === 0 ? String(order.total) : '',
                order.paymentMethod,
                order.paymentStatus,
                order.status,
                formatDate(order.createdAt)
            ]);
        });
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Detailed_Invoices_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== ORDER SUMMARY EXPORT ====================

export const exportOrderSummaryCSV = (orders: Order[], filename?: string): void => {
    const headers = [
        'Invoice Number',
        'Order Number',
        'Date',
        'Customer Name',
        'Phone',
        'City',
        'State',
        'Total Items',
        'Subtotal',
        'Tax',
        'Delivery',
        'Discount',
        'Total',
        'Payment Method',
        'Payment Status',
        'Order Status'
    ];

    const rows = orders.map(order => [
        order.invoiceNumber,
        order.orderNumber,
        formatTallyDate(order.createdAt),
        order.customer.name,
        order.customer.phone,
        order.customer.address.city,
        order.customer.address.state,
        String(order.items.reduce((sum, item) => sum + item.quantity, 0)),
        String(order.subtotal),
        String(order.tax),
        String(order.deliveryCharges),
        String(order.discount),
        String(order.total),
        order.paymentMethod,
        order.paymentStatus,
        order.status
    ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Order_Summary_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== USER INVOICES EXPORT ====================

export const exportUserInvoicesCSV = (user: User, orders: Order[], filename?: string): void => {
    const headers = [
        'Customer ID',
        'Customer Name',
        'Customer Email',
        'Customer Phone',
        'Invoice Number',
        'Order Number',
        'Date',
        'Product',
        'Size',
        'Qty',
        'Unit Price',
        'Line Total',
        'Order Total',
        'Payment Method',
        'Status'
    ];

    const rows: string[][] = [];

    orders.forEach(order => {
        order.items.forEach((item, index) => {
            rows.push([
                user.id,
                user.name,
                user.email,
                user.phone || '',
                order.invoiceNumber,
                order.orderNumber,
                formatTallyDate(order.createdAt),
                item.name,
                item.size,
                String(item.quantity),
                String(item.price),
                String(item.price * item.quantity),
                index === 0 ? String(order.total) : '',
                order.paymentMethod,
                order.status
            ]);
        });
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Customer_${user.name.replace(/\s+/g, '_')}_Invoices.csv`);
};

// ==================== PRODUCTS EXPORT ====================

export const exportProductsCSV = (products: Product[], filename?: string): void => {
    const headers = [
        'Product ID',
        'Name',
        'Category',
        'Description',
        'Price',
        'Discount %',
        'Final Price',
        'Stock',
        'Low Stock Threshold',
        'Sizes',
        'Flavors',
        'Dietary',
        'Rating',
        'Reviews',
        'Status',
        'Featured',
        'Created Date'
    ];

    const rows = products.map(product => {
        const finalPrice = product.price - (product.price * product.discount / 100);
        return [
            product.id,
            product.name,
            product.category,
            product.description,
            String(product.price),
            String(product.discount),
            String(finalPrice.toFixed(2)),
            String(product.stock),
            String(product.lowStockThreshold),
            product.sizes.join('; '),
            product.flavors.join('; '),
            product.dietary.join('; '),
            String(product.rating),
            String(product.reviewCount),
            product.status,
            product.featured ? 'Yes' : 'No',
            formatTallyDate(product.createdAt)
        ];
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Products_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== USERS/CUSTOMERS EXPORT ====================

export const exportUsersCSV = (users: User[], userAnalytics: Record<string, { orders: number; revenue: number }>, filename?: string): void => {
    const headers = [
        'Customer ID',
        'Name',
        'Email',
        'Phone',
        'Total Orders',
        'Total Revenue',
        'Average Order Value',
        'Joined Date',
        'Last Login'
    ];

    const rows = users.map(user => {
        const analytics = userAnalytics[user.id] || { orders: 0, revenue: 0 };
        const avgOrderValue = analytics.orders > 0 ? analytics.revenue / analytics.orders : 0;
        return [
            user.id,
            user.name,
            user.email,
            user.phone || '',
            String(analytics.orders),
            String(analytics.revenue.toFixed(2)),
            String(avgOrderValue.toFixed(2)),
            user.joinedAt ? formatTallyDate(user.joinedAt) : '',
            user.lastLogin ? formatTallyDate(user.lastLogin) : ''
        ];
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Customers_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== SALES REPORT EXPORT ====================

interface SalesReportData {
    period: string;
    totalOrders: number;
    totalRevenue: number;
    totalTax: number;
    totalDelivery: number;
    totalDiscount: number;
    netRevenue: number;
    avgOrderValue: number;
    topProducts: { name: string; quantity: number; revenue: number }[];
}

export const exportSalesReportCSV = (reportData: SalesReportData[], filename?: string): void => {
    const headers = [
        'Period',
        'Total Orders',
        'Gross Revenue',
        'Tax Collected',
        'Delivery Charges',
        'Discounts Given',
        'Net Revenue',
        'Average Order Value'
    ];

    const rows = reportData.map(data => [
        data.period,
        String(data.totalOrders),
        String(data.totalRevenue.toFixed(2)),
        String(data.totalTax.toFixed(2)),
        String(data.totalDelivery.toFixed(2)),
        String(data.totalDiscount.toFixed(2)),
        String(data.netRevenue.toFixed(2)),
        String(data.avgOrderValue.toFixed(2))
    ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Sales_Report_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== GST REPORT EXPORT ====================

export const exportGSTReportCSV = (orders: Order[], filename?: string): void => {
    const headers = [
        'Invoice Number',
        'Invoice Date',
        'Customer Name',
        'Customer GSTIN',
        'Place of Supply',
        'HSN Code',
        'Taxable Value',
        'CGST Rate',
        'CGST Amount',
        'SGST Rate',
        'SGST Amount',
        'IGST Rate',
        'IGST Amount',
        'Total Tax',
        'Invoice Value'
    ];

    const rows: string[][] = [];

    orders.forEach(order => {
        const taxableValue = order.subtotal;
        const cgst = order.tax / 2;
        const sgst = order.tax / 2;
        
        rows.push([
            order.invoiceNumber,
            formatTallyDate(order.createdAt),
            order.customer.name,
            '', // GSTIN
            order.customer.address.state,
            '2105', // HSN Code for Ice Cream
            String(taxableValue.toFixed(2)),
            '2.5',
            String(cgst.toFixed(2)),
            '2.5',
            String(sgst.toFixed(2)),
            '0',
            '0',
            String(order.tax.toFixed(2)),
            String(order.total.toFixed(2))
        ]);
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `GST_Report_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== DAILY SALES EXPORT ====================

export const exportDailySalesCSV = (orders: Order[], filename?: string): void => {
    // Group orders by date
    const dailySales: Record<string, { orders: number; revenue: number; tax: number; items: number }> = {};
    
    orders.forEach(order => {
        const date = formatTallyDate(order.createdAt);
        if (!dailySales[date]) {
            dailySales[date] = { orders: 0, revenue: 0, tax: 0, items: 0 };
        }
        dailySales[date].orders += 1;
        dailySales[date].revenue += order.total;
        dailySales[date].tax += order.tax;
        dailySales[date].items += order.items.reduce((sum, item) => sum + item.quantity, 0);
    });

    const headers = [
        'Date',
        'Total Orders',
        'Total Items Sold',
        'Gross Revenue',
        'Tax Collected',
        'Net Revenue'
    ];

    const rows = Object.entries(dailySales)
        .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
        .map(([date, data]) => [
            date,
            String(data.orders),
            String(data.items),
            String(data.revenue.toFixed(2)),
            String(data.tax.toFixed(2)),
            String((data.revenue - data.tax).toFixed(2))
        ]);

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Daily_Sales_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== INVENTORY EXPORT ====================

export const exportInventoryCSV = (products: Product[], filename?: string): void => {
    const headers = [
        'Product ID',
        'Product Name',
        'Category',
        'Current Stock',
        'Low Stock Threshold',
        'Stock Status',
        'Unit Price',
        'Stock Value',
        'Status'
    ];

    const rows = products.map(product => {
        const stockStatus = product.stock === 0 ? 'Out of Stock' :
            product.stock <= product.lowStockThreshold ? 'Low Stock' : 'In Stock';
        const stockValue = product.stock * product.price;
        
        return [
            product.id,
            product.name,
            product.category,
            String(product.stock),
            String(product.lowStockThreshold),
            stockStatus,
            String(product.price.toFixed(2)),
            String(stockValue.toFixed(2)),
            product.status
        ];
    });

    const csv = generateCSV(headers, rows);
    downloadCSV(csv, filename || `Inventory_${formatTallyDate(new Date().toISOString())}.csv`);
};

// ==================== COMBINED EXPORT (All Data) ====================

export const exportAllDataZip = async (
    orders: Order[],
    users: User[],
    products: Product[],
    userAnalytics: Record<string, { orders: number; revenue: number }>
): Promise<void> => {
    // Since we can't create ZIP in browser easily without a library,
    // we'll download individual files with a timestamp prefix
    const timestamp = formatTallyDate(new Date().toISOString());
    
    exportOrdersToTallyCSV(orders, `${timestamp}_Tally_Invoices.csv`);
    
    setTimeout(() => {
        exportOrderSummaryCSV(orders, `${timestamp}_Order_Summary.csv`);
    }, 500);
    
    setTimeout(() => {
        exportProductsCSV(products, `${timestamp}_Products.csv`);
    }, 1000);
    
    setTimeout(() => {
        exportUsersCSV(users, userAnalytics, `${timestamp}_Customers.csv`);
    }, 1500);
    
    setTimeout(() => {
        exportGSTReportCSV(orders, `${timestamp}_GST_Report.csv`);
    }, 2000);
};

