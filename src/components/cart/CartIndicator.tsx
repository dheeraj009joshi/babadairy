import { useEffect, useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Check } from 'lucide-react';

export default function CartIndicator() {
    const { itemCount } = useCart();
    const [showIndicator, setShowIndicator] = useState(false);
    const [prevCount, setPrevCount] = useState(itemCount);

    useEffect(() => {
        // Show indicator when item count increases
        if (itemCount > prevCount && itemCount > 0) {
            setShowIndicator(true);
            const timer = setTimeout(() => {
                setShowIndicator(false);
            }, 1500); // Hide after 1.5 seconds
            return () => clearTimeout(timer);
        }
        setPrevCount(itemCount);
    }, [itemCount, prevCount]);

    if (!showIndicator) return null;

    return (
        <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce-in">
            <div className="bg-success text-white rounded-full px-3 py-2 shadow-lg flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="text-xs font-medium">Added</span>
            </div>
        </div>
    );
}

