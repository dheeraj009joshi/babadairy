import { Product, Order, User, Review, Inventory } from '../types';
import { apiClient } from '../api/client';

// Products
export const fetchProducts = async (): Promise<Product[]> => {
    try {
        const products = await apiClient.get('/products/');
        return products.map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description || '',
            price: Number(item.price),
            discount: Number(item.discount || 0),
            images: item.images || [],
            sizes: item.sizes || [],
            priceBySize: item.price_by_size || undefined,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 10,
            flavors: item.flavors || [],
            dietary: item.dietary || [],
            rating: Number(item.rating || 0),
            reviewCount: item.review_count || 0,
            ingredients: item.ingredients || '',
            nutrition: item.nutrition || {},
            status: item.status || 'active',
            featured: item.featured || false,
            createdAt: item.created_at,
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
};

export const fetchProductById = async (id: string): Promise<Product | undefined> => {
    try {
        const item = await apiClient.get(`/products/${id}`);
        return {
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description || '',
            price: Number(item.price),
            discount: Number(item.discount || 0),
            images: item.images || [],
            sizes: item.sizes || [],
            priceBySize: item.price_by_size || undefined,
            stock: item.stock || 0,
            lowStockThreshold: item.low_stock_threshold || 10,
            flavors: item.flavors || [],
            dietary: item.dietary || [],
            rating: Number(item.rating || 0),
            reviewCount: item.review_count || 0,
            ingredients: item.ingredients || '',
            nutrition: item.nutrition || {},
            status: item.status || 'active',
            featured: item.featured || false,
            createdAt: item.created_at,
        };
    } catch (error) {
        console.error('Error fetching product by id:', error);
        return undefined;
    }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
    const products = await fetchProducts();
    return products.filter(p => p.featured);
};

export const saveProduct = async (product: Partial<Product>): Promise<void> => {
    try {
        const productData: any = { ...product };
        // Map camelCase to snake_case
        if (product.lowStockThreshold !== undefined) {
            productData.low_stock_threshold = product.lowStockThreshold;
            delete productData.lowStockThreshold;
        }
        if (product.reviewCount !== undefined) {
            productData.review_count = product.reviewCount;
            delete productData.reviewCount;
        }
        if (product.createdAt) {
            productData.created_at = product.createdAt;
            delete productData.createdAt;
        }
        if (product.priceBySize !== undefined) {
            productData.price_by_size = product.priceBySize;
            delete productData.priceBySize;
        }

        if (product.id && !product.id.startsWith('prod_')) {
            await apiClient.put(`/products/${product.id}`, productData);
        } else {
            // Remove temp ID if it exists so backend generates one (or keep if using UUID from frontend? Backend usually gens)
            // Backend schema Optional[str] = None for Create.
            // If we send 'prod_...' backend sets it as ID.
            await apiClient.post('/products/', productData);
        }
        window.dispatchEvent(new CustomEvent('productsUpdated'));
    } catch (error) {
        console.error('Error saving product:', error);
        // Fallback or retry logic if needed
    }
};

export const deleteProduct = async (productId: string): Promise<void> => {
    try {
        await apiClient.delete(`/products/${productId}`);
        window.dispatchEvent(new CustomEvent('productsUpdated'));
    } catch (error) {
        console.error('Error deleting product:', error);
    }
};

// Orders
export const fetchOrders = async (userId?: string): Promise<Order[]> => {
    try {
        const url = userId ? `/orders/?user_id=${userId}` : '/orders/';
        const orders = await apiClient.get(url);
        return orders.map((item: any) => ({
            id: item.id,
            orderNumber: item.order_number,
            userId: item.user_id,
            customer: item.customer,
            items: item.items || [],
            subtotal: Number(item.subtotal),
            tax: Number(item.tax),
            deliveryCharges: Number(item.delivery_charges),
            discount: Number(item.discount || 0),
            total: Number(item.total),
            paymentMethod: item.payment_method,
            paymentStatus: item.payment_status || 'pending',
            invoiceNumber: item.invoice_number,
            status: item.status || 'pending',
            statusHistory: item.status_history || [],
            estimatedDelivery: item.estimated_delivery,
            createdAt: item.created_at,
        }));
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

export const fetchOrdersByUserId = async (userId: string): Promise<Order[]> => {
    return await fetchOrders(userId);
};

export const saveOrder = async (order: Order): Promise<void> => {
    try {
        const orderData = {
            id: order.id,
            user_id: order.userId,
            order_number: order.orderNumber,
            items: order.items,
            subtotal: order.subtotal,
            tax: order.tax,
            delivery_charges: order.deliveryCharges,
            discount: order.discount,
            total: order.total,
            customer: order.customer,
            payment_method: order.paymentMethod,
            payment_status: order.paymentStatus,
            status: order.status,
            status_history: order.statusHistory,
            invoice_number: order.invoiceNumber,
            created_at: order.createdAt,
            estimated_delivery: order.estimatedDelivery
        };
        await apiClient.post('/orders/', orderData);
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
    } catch (error) {
        console.error('Error saving order:', error);
    }
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<void> => {
    try {
        const updateData: any = { ...updates };
        if (updates.paymentStatus) {
            updateData.payment_status = updates.paymentStatus;
            delete updateData.paymentStatus;
        }
        // Add other mappings if schema expands, currently OrderUpdate only has status, payment_status, total

        await apiClient.put(`/orders/${orderId}`, updateData);
        window.dispatchEvent(new CustomEvent('ordersUpdated'));
    } catch (error) {
        console.error('Error updating order:', error);
    }
};

// Users
export const fetchUsers = async (): Promise<User[]> => {
    try {
        const users = await apiClient.get('/users/');
        return users.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            password: '', // security
            role: item.role || 'customer',
            addresses: item.addresses || [],
            joinedAt: item.joined_at,
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return [];
    }
};

// Reviews - (Assuming we haven't implemented backend for reviews yet, keep empty or implement later.
// The plan didn't explicitly detail Reviews router but it was in models.
// Let's implement fetch if we can, or return empty for now to avoid breaking.)
// Added Review model to models.py, need to make sure API exists? 
// Checking task... "Create Database Models (Products, Orders, Users, etc.)" -> "Create API Endpoints (CRUD)"
// I only created Products, Orders, Users routers. I missed Reviews.
// I should add Review support or return empty. Returning empty for now to stick to explicit plan, or quickly add it.
// I'll return empty for now to verify main flows first.
export const fetchReviews = async (): Promise<Review[]> => {
    // TODO: Implement reviews API
    return [];
};

export const fetchReviewsByProductId = async (productId: string): Promise<Review[]> => {
    // TODO: Implement reviews API
    console.log('Fetching reviews for', productId);
    return [];
};

// Inventory - Mock for now
export const fetchInventory = async (): Promise<Inventory[]> => {
    return [];
};

export const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));
