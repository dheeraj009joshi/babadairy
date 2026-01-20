export interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    price: number; // Base price (for backward compatibility, uses first size price if priceBySize exists)
    discount: number;
    images: string[];
    sizes: string[];
    priceBySize?: Record<string, number>; // Size-based pricing: { "Small (100ml)": 100, "Medium (250ml)": 200, ... }
    stock: number;
    lowStockThreshold: number;
    flavors: string[];
    dietary: string[];
    rating: number;
    reviewCount: number;
    ingredients: string;
    nutrition: {
        calories: number;
        protein: number;
        fat: number;
        carbs?: number;
        sugar?: number;
    };
    status: 'active' | 'inactive';
    featured: boolean;
    createdAt: string;
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    image: string;
}

export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
    type: 'home' | 'office';
}

export interface Customer {
    name: string;
    email: string;
    phone: string;
    address: Address;
}

export interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    size: string;
}

export interface StatusHistory {
    status: OrderStatus;
    timestamp: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    userId: string;
    orderNumber: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    deliveryCharges: number;
    discount: number;
    total: number;
    customer: Customer;
    paymentMethod: 'COD' | 'UPI' | 'Card';
    paymentStatus: 'pending' | 'paid' | 'failed';
    status: OrderStatus;
    statusHistory: StatusHistory[];
    invoiceNumber: string;
    createdAt: string;
    estimatedDelivery: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: 'customer' | 'admin';
    addresses?: Address[];
    orders?: string[];
    totalOrders?: number;
    totalSpent?: number;
    joinedAt: string;
    lastLogin?: string;
}

export interface Inventory {
    productId: string;
    stock: number;
    reserved: number;
    available: number;
    reorderLevel: number;
    lastRestocked: string;
    stockHistory: {
        date: string;
        change: number;
        reason: string;
    }[];
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    images: string[];
    verified: boolean;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
}

export interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, size: string, quantity: number) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    removeItem: (productId: string, size: string) => void;
    clearCart: () => void;
    itemCount: number;
    subtotal: number;
    tax: number;
    deliveryCharges: number;
    total: number;
}
