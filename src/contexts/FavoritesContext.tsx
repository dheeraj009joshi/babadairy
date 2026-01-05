import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';

interface FavoritesContextType {
    favorites: string[]; // Array of product IDs
    addFavorite: (productId: string) => void;
    removeFavorite: (productId: string) => void;
    toggleFavorite: (productId: string) => void;
    isFavorite: (productId: string) => boolean;
    favoriteCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within FavoritesProvider');
    }
    return context;
};

interface FavoritesProviderProps {
    children: ReactNode;
}

export const FavoritesProvider = ({ children }: FavoritesProviderProps) => {
    const [favorites, setFavorites] = useState<string[]>([]);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const storedFavorites = localStorage.getItem('jasmey_favorites');
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch (error) {
                console.error('Error parsing stored favorites:', error);
            }
        }
    }, []);

    // Save favorites to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('jasmey_favorites', JSON.stringify(favorites));
        } catch (error) {
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('localStorage quota exceeded for favorites');
                // Don't show toast for favorites as it's less critical
            }
        }
    }, [favorites]);

    const addFavorite = (productId: string) => {
        if (!favorites.includes(productId)) {
            setFavorites(prev => [...prev, productId]);
            toast.success('Added to favorites', { icon: '❤️' });
        }
    };

    const removeFavorite = (productId: string) => {
        setFavorites(prev => prev.filter(id => id !== productId));
        toast.success('Removed from favorites', { icon: '💔' });
    };

    const toggleFavorite = (productId: string) => {
        if (favorites.includes(productId)) {
            removeFavorite(productId);
        } else {
            addFavorite(productId);
        }
    };

    const isFavorite = (productId: string) => {
        return favorites.includes(productId);
    };

    const value: FavoritesContextType = {
        favorites,
        addFavorite,
        removeFavorite,
        toggleFavorite,
        isFavorite,
        favoriteCount: favorites.length,
    };

    return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};

