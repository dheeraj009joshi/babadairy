import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Product } from '@/types';
import { apiClient } from '@/api/client';

// Default product settings (fallback)
const defaultProductSettings = {
    categories: ['Cups', 'Cones', 'Tubs', 'Family Packs', 'Premium', 'Specials'],
    sizes: ['Small (100ml)', 'Medium (250ml)', 'Large (500ml)', 'Family (1L)', 'Party (2L)'],
    flavors: ['Vanilla', 'Chocolate', 'Strawberry', 'Mango', 'Butterscotch'],
    dietary: ['Vegetarian', 'Eggless', 'Low Fat', 'Gluten-Free', 'Vegan', 'Organic'],
};

// Load settings from API
const loadProductSettingsFromAPI = async () => {
    try {
        const response = await apiClient.get('/settings/');
        return {
            categories: response.product_categories || defaultProductSettings.categories,
            sizes: response.product_sizes || defaultProductSettings.sizes,
            flavors: response.product_flavors || defaultProductSettings.flavors,
            dietary: response.product_dietary || defaultProductSettings.dietary,
        };
    } catch (error) {
        console.error('Error loading product settings from API:', error);
        return defaultProductSettings;
    }
};

const productSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(1, 'Price must be greater than 0'),
    discount: z.number().min(0).max(100, 'Discount must be between 0-100'),
    stock: z.number().min(0, 'Stock cannot be negative'),
    lowStockThreshold: z.number().min(0, 'Threshold cannot be negative'),
    ingredients: z.string().min(5, 'Ingredients are required'),
    sizes: z.array(z.string()).min(1, 'At least one size is required'),
    dietary: z.array(z.string()),
    calories: z.number().min(0),
    protein: z.number().min(0),
    fat: z.number().min(0),
    carbs: z.number().min(0),
    sugar: z.number().min(0),
    featured: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Product>) => void;
    product?: Product | null;
}

export default function ProductFormModal({ isOpen, onClose, onSubmit, product }: ProductFormModalProps) {
    // Load settings from API
    const [productSettings, setProductSettings] = useState(defaultProductSettings);
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    
    // Load settings from API when modal opens
    useEffect(() => {
        if (isOpen) {
            setIsLoadingSettings(true);
            loadProductSettingsFromAPI()
                .then(settings => {
                    setProductSettings(settings);
                    setIsLoadingSettings(false);
                })
                .catch(error => {
                    console.error('Failed to load settings:', error);
                    setIsLoadingSettings(false);
                });
        }
    }, [isOpen]);
    
    // Listen for settings updates
    useEffect(() => {
        const handleSettingsUpdate = () => {
            loadProductSettingsFromAPI()
                .then(settings => {
                    setProductSettings(settings);
                })
                .catch(error => {
                    console.error('Failed to reload settings:', error);
                });
        };
        
        window.addEventListener('settingsUpdated', handleSettingsUpdate);
        return () => {
            window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        };
    }, []);

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: productSettings.categories[0] || 'Cups',
            description: '',
            price: 0,
            discount: 0,
            stock: 0,
            lowStockThreshold: 10,
            ingredients: '',
            sizes: [],
            dietary: [],
            calories: 0,
            protein: 0,
            fat: 0,
            carbs: 0,
            sugar: 0,
            featured: false,
        },
    });

    const selectedSizes = watch('sizes');
    const selectedDietary = watch('dietary');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [priceBySize, setPriceBySize] = useState<Record<string, number>>({});
    const [sizePriceErrors, setSizePriceErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (product) {
            reset({
                name: product.name,
                category: product.category,
                description: product.description,
                price: product.price,
                discount: product.discount,
                stock: product.stock,
                lowStockThreshold: product.lowStockThreshold,
                ingredients: product.ingredients,
                sizes: product.sizes,
                dietary: product.dietary,
                calories: product.nutrition.calories,
                protein: product.nutrition.protein,
                fat: product.nutrition.fat,
                carbs: product.nutrition.carbs || 0,
                sugar: product.nutrition.sugar || 0,
                featured: product.featured,
            });
            // Set priceBySize if it exists, otherwise initialize from sizes
            if (product.priceBySize) {
                setPriceBySize(product.priceBySize);
            } else if (product.sizes.length > 0) {
                // Initialize with base price for all sizes
                const initialPrices: Record<string, number> = {};
                product.sizes.forEach(size => {
                    initialPrices[size] = product.price;
                });
                setPriceBySize(initialPrices);
            }
            // Set image preview if product has image
            if (product.images && product.images.length > 0) {
                const img = product.images[0];
                setImagePreview(img);
                // If it's a URL (not base64), set it in the URL field
                if (!img.startsWith('data:')) {
                    setImageUrl(img);
                }
            }
        } else {
            reset({
                name: '',
                category: 'Cups',
                description: '',
                price: 0,
                discount: 0,
                stock: 0,
                lowStockThreshold: 10,
                ingredients: '',
                sizes: [],
                dietary: [],
                calories: 0,
                protein: 0,
                fat: 0,
                carbs: 0,
                sugar: 0,
                featured: false,
            });
            setPriceBySize({});
            setImagePreview(null);
            setImageUrl('');
        }
    }, [product, reset]);
    
    // Update priceBySize when sizes change
    useEffect(() => {
        if (selectedSizes && selectedSizes.length > 0) {
            setPriceBySize(prev => {
                const updated = { ...prev };
                // Add prices for new sizes (use base price or existing price, but don't auto-set to 0)
                selectedSizes.forEach(size => {
                    if (!(size in updated)) {
                        // Only use existing price if it's valid, otherwise leave empty for user to enter
                        const existingPrice = product?.priceBySize?.[size] || product?.price;
                        updated[size] = existingPrice && existingPrice > 0 ? existingPrice : 0;
                    }
                });
                // Remove prices for unselected sizes
                Object.keys(updated).forEach(size => {
                    if (!selectedSizes.includes(size)) {
                        delete updated[size];
                    }
                });
                return updated;
            });
            // Clear errors when sizes change
            setSizePriceErrors({});
        } else {
            setPriceBySize({});
            setSizePriceErrors({});
        }
    }, [selectedSizes, product]);

    const handleFormSubmit = async (data: ProductFormData) => {
        try {
            // Validate that all selected sizes have prices
            const errors: Record<string, string> = {};
            if (selectedSizes && selectedSizes.length > 0) {
                selectedSizes.forEach(size => {
                    const price = priceBySize[size];
                    if (!price || price <= 0) {
                        errors[size] = `Price is required for ${size}`;
                    }
                });
            }
            
            if (Object.keys(errors).length > 0) {
                setSizePriceErrors(errors);
                toast.error('Please set a valid price (greater than 0) for all selected sizes');
                return;
            }
            
            setSizePriceErrors({});
            
            // Use first size price as base price if priceBySize exists
            const basePrice = Object.keys(priceBySize).length > 0 && selectedSizes && selectedSizes.length > 0
                ? priceBySize[selectedSizes[0]]
                : data.price;
            
            const productData: Partial<Product> = {
                id: product?.id || `prod_${Date.now()}`,
                name: data.name,
                category: data.category,
                description: data.description,
                price: basePrice, // Base price (first size price or form price)
                discount: data.discount,
                stock: data.stock,
                lowStockThreshold: data.lowStockThreshold,
                ingredients: data.ingredients,
                sizes: data.sizes,
                priceBySize: Object.keys(priceBySize).length > 0 ? priceBySize : undefined,
                dietary: data.dietary,
                images: imagePreview ? [imagePreview] : (product?.images || ['/images/placeholder.jpg']),
                flavors: product?.flavors || [],
                rating: product?.rating || 0,
                reviewCount: product?.reviewCount || 0,
                nutrition: {
                    calories: data.calories,
                    protein: data.protein,
                    fat: data.fat,
                    carbs: data.carbs,
                    sugar: data.sugar,
                },
                status: product?.status || 'active',
                featured: data.featured,
                createdAt: product?.createdAt || new Date().toISOString().split('T')[0],
            };

            await onSubmit(productData);
            toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
            onClose();
        } catch (error) {
            toast.error('Failed to save product');
            console.error(error);
        }
    };



    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                e.target.value = ''; // Reset file input
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                e.target.value = ''; // Reset file input
                return;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                toast.loading('Uploading image...', { id: 'upload-toast' });

                const { apiClient } = await import('@/api/client');
                const response = await apiClient.upload('/upload/', formData);

                setImagePreview(response.url);
                setImageUrl(''); // Clear URL when file is uploaded

                toast.success('Image uploaded successfully', { id: 'upload-toast' });
            } catch (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image. Please try again or use image URL.', { id: 'upload-toast' });
                e.target.value = '';
            }
        }
    };

    const handleImageUrlChange = (url: string) => {
        setImageUrl(url);
        if (url.trim()) {
            setImagePreview(url);
        }
    };

    const toggleSize = (size: string) => {
        const current = selectedSizes || [];
        if (current.includes(size)) {
            setValue('sizes', current.filter(s => s !== size));
        } else {
            setValue('sizes', [...current, size]);
        }
    };

    const toggleDietary = (option: string) => {
        const current = selectedDietary || [];
        if (current.includes(option)) {
            setValue('dietary', current.filter(d => d !== option));
        } else {
            setValue('dietary', [...current, option]);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={product ? 'Edit Product' : 'Add New Product'}
            size="lg"
            footer={
                <>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
                    </Button>
                </>
            }
        >
            <form className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-chocolate">Basic Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Product Name *</Label>
                            <Input
                                id="name"
                                {...register('name')}
                                placeholder="e.g., Classic Chocolate Tub"
                            />
                            {errors.name && <p className="text-sm text-error mt-1">{errors.name.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select id="category" {...register('category')}>
                                {productSettings.categories.map((cat: string) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </Select>
                            {errors.category && <p className="text-sm text-error mt-1">{errors.category.message}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            {...register('description')}
                            placeholder="Describe your delicious ice cream..."
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-error mt-1">{errors.description.message}</p>}
                    </div>

                    {/* Product Image */}
                    <div>
                        <Label>Product Image</Label>
                        <div className="mt-2 flex items-start gap-4">
                            {/* Image Preview */}
                            <div className="w-32 h-32 border-2 border-dashed border-chocolate/20 rounded-lg flex items-center justify-center bg-chocolate/5 overflow-hidden flex-shrink-0 relative">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Product preview"
                                        className="w-full h-full object-cover"
                                        onError={() => {
                                            // Fallback if image fails to load - use React state instead of DOM manipulation
                                            console.warn('Image preview failed to load:', imagePreview);
                                            setImagePreview(null);
                                            setImageUrl('');
                                        }}
                                    />
                                ) : (
                                    <span className="text-4xl">🍦</span>
                                )}
                            </div>

                            {/* Upload Options */}
                            <div className="flex-1 space-y-3">
                                {/* URL Input */}
                                <div>
                                    <Label htmlFor="imageUrl" className="text-sm">Image URL</Label>
                                    <Input
                                        id="imageUrl"
                                        type="url"
                                        value={imageUrl}
                                        onChange={(e) => handleImageUrlChange(e.target.value)}
                                        placeholder="https://example.com/image.jpg"
                                        className="mt-1"
                                    />
                                </div>

                                {/* File Upload */}
                                <div>
                                    <Label className="text-sm">Or Upload File</Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <input
                                            type="file"
                                            id="productImage"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="productImage"
                                            className="inline-block px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90 transition-colors text-sm"
                                        >
                                            Choose File
                                        </label>
                                        {imagePreview && !imageUrl && (
                                            <span className="text-xs text-success">✓ Uploaded</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-chocolate/60 mt-1">
                                        Max 2MB • JPG, PNG, WebP
                                    </p>
                                </div>

                                {/* Remove Button */}
                                {imagePreview && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null);
                                            setImageUrl('');
                                        }}
                                        className="text-xs text-error hover:underline"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="ingredients">Ingredients *</Label>
                        <Textarea
                            id="ingredients"
                            {...register('ingredients')}
                            placeholder="Milk, Sugar, Belgian Cocoa..."
                            rows={2}
                        />
                        {errors.ingredients && <p className="text-sm text-error mt-1">{errors.ingredients.message}</p>}
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-chocolate">Pricing & Stock</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label htmlFor="price">
                                Base Price (₹) {selectedSizes && selectedSizes.length > 0 ? '' : '*'}
                            </Label>
                            {selectedSizes && selectedSizes.length > 0 ? (
                                <p className="text-xs text-chocolate/60 mb-1">
                                    Auto-synced with first size price
                                </p>
                            ) : null}
                            <Input
                                id="price"
                                type="number"
                                {...register('price', { valueAsNumber: true })}
                                placeholder="250"
                                disabled={selectedSizes && selectedSizes.length > 0}
                                className={selectedSizes && selectedSizes.length > 0 ? 'bg-chocolate/5' : ''}
                            />
                            {errors.price && <p className="text-sm text-error mt-1">{errors.price.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="discount">Discount (%) *</Label>
                            <Input
                                id="discount"
                                type="number"
                                {...register('discount', { valueAsNumber: true })}
                                placeholder="10"
                            />
                            {errors.discount && <p className="text-sm text-error mt-1">{errors.discount.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="stock">Stock *</Label>
                            <Input
                                id="stock"
                                type="number"
                                {...register('stock', { valueAsNumber: true })}
                                placeholder="50"
                            />
                            {errors.stock && <p className="text-sm text-error mt-1">{errors.stock.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="lowStockThreshold">Low Stock Alert *</Label>
                            <Input
                                id="lowStockThreshold"
                                type="number"
                                {...register('lowStockThreshold', { valueAsNumber: true })}
                                placeholder="10"
                            />
                            {errors.lowStockThreshold && <p className="text-sm text-error mt-1">{errors.lowStockThreshold.message}</p>}
                        </div>
                    </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Available Sizes *</Label>
                        {selectedSizes && selectedSizes.length > 0 && (
                            <span className="text-xs text-chocolate/60">
                                {selectedSizes.length} size{selectedSizes.length > 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-chocolate/60 mb-2">
                        Select one or more sizes. You'll need to set a price for each selected size below.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {productSettings.sizes.map((size: string) => (
                            <button
                                key={size}
                                type="button"
                                onClick={() => toggleSize(size)}
                                className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedSizes?.includes(size)
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-chocolate border-chocolate/20 hover:border-primary'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                    {errors.sizes && <p className="text-sm text-error mt-1">{errors.sizes.message}</p>}
                    {selectedSizes && selectedSizes.length === 0 && (
                        <p className="text-sm text-error mt-1">Please select at least one size</p>
                    )}
                    
                    {/* Size-based Pricing */}
                    {selectedSizes && selectedSizes.length > 0 && (
                        <div className="mt-4 space-y-3">
                            <Label className="text-sm font-semibold">Price for Each Size (₹) *</Label>
                            <p className="text-xs text-chocolate/60 mb-3">
                                You must set a price for each selected size. Prices must be greater than ₹0.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedSizes.map((size: string) => (
                                    <div key={size}>
                                        <Label htmlFor={`price-${size}`} className="text-xs text-chocolate/70 mb-1 block">
                                            {size} <span className="text-error">*</span>
                                        </Label>
                                        <Input
                                            id={`price-${size}`}
                                            type="number"
                                            value={priceBySize[size] || ''}
                                            onChange={(e) => {
                                                const value = Number(e.target.value);
                                                setPriceBySize(prev => ({
                                                    ...prev,
                                                    [size]: value
                                                }));
                                                // Clear error for this size when user starts typing
                                                if (sizePriceErrors[size]) {
                                                    setSizePriceErrors(prev => {
                                                        const updated = { ...prev };
                                                        delete updated[size];
                                                        return updated;
                                                    });
                                                }
                                                // Update base price field if this is the first size
                                                if (selectedSizes[0] === size) {
                                                    setValue('price', value);
                                                }
                                            }}
                                            placeholder="Enter price"
                                            min={0}
                                            step="0.01"
                                            required
                                            className={sizePriceErrors[size] ? 'border-error' : ''}
                                        />
                                        {sizePriceErrors[size] && (
                                            <p className="text-xs text-error mt-1">{sizePriceErrors[size]}</p>
                                        )}
                                        {!sizePriceErrors[size] && (!priceBySize[size] || priceBySize[size] <= 0) && (
                                            <p className="text-xs text-chocolate/50 mt-1">Required</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Dietary Options */}
                <div className="space-y-3">
                    <Label>Dietary Options</Label>
                    <div className="flex flex-wrap gap-3">
                        {productSettings.dietary.map((option: string) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={selectedDietary?.includes(option)}
                                    onCheckedChange={() => toggleDietary(option)}
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Nutrition Information */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-chocolate">Nutrition Information (per serving)</h3>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="calories">Calories</Label>
                            <Input
                                id="calories"
                                type="number"
                                {...register('calories', { valueAsNumber: true })}
                                placeholder="200"
                            />
                        </div>

                        <div>
                            <Label htmlFor="protein">Protein (g)</Label>
                            <Input
                                id="protein"
                                type="number"
                                step="0.1"
                                {...register('protein', { valueAsNumber: true })}
                                placeholder="4"
                            />
                        </div>

                        <div>
                            <Label htmlFor="fat">Fat (g)</Label>
                            <Input
                                id="fat"
                                type="number"
                                step="0.1"
                                {...register('fat', { valueAsNumber: true })}
                                placeholder="10"
                            />
                        </div>

                        <div>
                            <Label htmlFor="carbs">Carbs (g)</Label>
                            <Input
                                id="carbs"
                                type="number"
                                step="0.1"
                                {...register('carbs', { valueAsNumber: true })}
                                placeholder="24"
                            />
                        </div>

                        <div>
                            <Label htmlFor="sugar">Sugar (g)</Label>
                            <Input
                                id="sugar"
                                type="number"
                                step="0.1"
                                {...register('sugar', { valueAsNumber: true })}
                                placeholder="20"
                            />
                        </div>
                    </div>
                </div>

                {/* Featured */}
                <div className="flex items-center gap-2">
                    <Controller
                        name="featured"
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                    <Label className="cursor-pointer">Feature this product on homepage</Label>
                </div>
            </form>
        </Modal>
    );
}
