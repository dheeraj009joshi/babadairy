import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, CartContextType } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: ReactNode;
}

const TAX_RATE = 0.05; // 5% GST
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 50;

export const CartProvider = ({ children }: CartProviderProps) => {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = localStorage.getItem('jasmey_cart');
        if (storedCart) {
            try {
                const parsedCart = JSON.parse(storedCart);
                setItems(parsedCart);
            } catch (error) {
                console.error('Error parsing cart:', error);
                // localStorage.removeItem('jasmey_cart'); // Removed as per instruction
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        try {
            const cartData = JSON.stringify(items);
            // Check if data is too large (localStorage limit is ~5-10MB)
            if (cartData.length > 5 * 1024 * 1024) {
                console.warn('Cart data too large, clearing old cart data');
                localStorage.removeItem('jasmey_cart');
                return;
            }
            localStorage.setItem('jasmey_cart', cartData);
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded. Clearing cart.');
                localStorage.removeItem('jasmey_cart');
                setItems([]);
            } else {
                console.error('Error saving cart to localStorage:', error);
            }
        }
    }, [items]);

    const addItem = (product: Product, size: string, quantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(
                item => item.productId === product.id && item.size === size
            );

            if (existingItem) {
                // Update quantity for existing item
                return prevItems.map(item =>
                    item.productId === product.id && item.size === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            // Add new item
            const newItem: CartItem = {
                productId: product.id,
                name: product.name,
                price: product.price * (1 - product.discount / 100),
                size,
                quantity,
                image: product.images[0],
            };

            return [...prevItems, newItem];
        });
    };

    const updateQuantity = (productId: string, size: string, quantity: number) => {
        if (quantity < 1) return; // Changed from quantity <= 0 to quantity < 1 and removed removeItem call
        setItems(prevItems =>
            prevItems.map(item =>
                item.productId === productId && item.size === size
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const removeItem = (productId: string, size: string) => {
        setItems(prevItems =>
            prevItems.filter(item => !(item.productId === productId && item.size === size))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    // Calculations
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * TAX_RATE;
    const deliveryCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
    const total = subtotal + tax + deliveryCharges;
    const itemCount = items.reduce((count, item) => count + item.quantity, 0);

    const value: CartContextType = {
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        tax,
        deliveryCharges,
        total,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
