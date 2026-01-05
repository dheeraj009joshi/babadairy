import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ProductFiltersProps {
    filters: {
        categories: string[];
        priceRange: [number, number];
        flavors: string[];
        dietary: string[];
        sizes: string[];
        rating: number | null;
    };
    setFilters: (filters: any) => void;
    className?: string;
    onClose?: () => void; // For mobile drawer
}

export default function ProductFilters({ filters, setFilters, className, onClose }: ProductFiltersProps) {
    const categories = ['Cups', 'Cones', 'Tubs', 'Family Packs', 'Premium', 'Specials'];
    const sizes = ['Single', '500ml', '1L', '2L'];
    const flavors = ['Chocolate', 'Vanilla', 'Strawberry', 'Mango', 'Pistachio', 'Coffee', 'Butterscotch', 'Coconut'];
    const dietary = ['Vegetarian', 'Eggless', 'Nut-Free', 'Gluten-Free', 'Vegan'];

    const handleCategoryChange = (category: string) => {
        const newCategories = filters.categories.includes(category)
            ? filters.categories.filter(c => c !== category)
            : [...filters.categories, category];
        setFilters({ ...filters, categories: newCategories });
    };

    const handleFlavorChange = (flavor: string) => {
        const flavorLower = flavor.toLowerCase();
        const newFlavors = filters.flavors.includes(flavorLower)
            ? filters.flavors.filter(f => f !== flavorLower)
            : [...filters.flavors, flavorLower];
        setFilters({ ...filters, flavors: newFlavors });
    };

    const handleDietaryChange = (diet: string) => {
        const dietLower = diet.toLowerCase();
        const newDietary = filters.dietary.includes(dietLower)
            ? filters.dietary.filter(d => d !== dietLower)
            : [...filters.dietary, dietLower];
        setFilters({ ...filters, dietary: newDietary });
    };

    const handleSizeChange = (size: string) => {
        const newSizes = filters.sizes.includes(size)
            ? filters.sizes.filter(s => s !== size)
            : [...filters.sizes, size];
        setFilters({ ...filters, sizes: newSizes });
    };

    const clearFilters = () => {
        setFilters({
            categories: [],
            priceRange: [0, 1000],
            flavors: [],
            dietary: [],
            sizes: [],
            rating: null
        });
    };

    return (
        <div className={`space-y-8 ${className}`}>
            <div className="flex justify-between items-center md:hidden mb-4">
                <h3 className="font-display font-bold text-xl">Filters</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>
            </div>

            {/* Categories */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">Categories</h3>
                <div className="space-y-2">
                    {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                            <Checkbox
                                id={`cat-${category}`}
                                checked={filters.categories.includes(category)}
                                onCheckedChange={() => handleCategoryChange(category)}
                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                                htmlFor={`cat-${category}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {category}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">
                    Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
                </h3>
                <Slider
                    defaultValue={[0, 1000]}
                    value={filters.priceRange}
                    max={1000}
                    step={10}
                    onValueChange={(value) => setFilters({ ...filters, priceRange: value })}
                    className="py-4"
                />
            </div>

            {/* Sizes */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">Sizes</h3>
                <div className="space-y-2">
                    {sizes.map(size => (
                        <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                                id={`size-${size}`}
                                checked={filters.sizes.includes(size)}
                                onCheckedChange={() => handleSizeChange(size)}
                                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                            />
                            <label
                                htmlFor={`size-${size}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                {size}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Flavors */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">Flavors</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {flavors.map(flavor => (
                        <div key={flavor} className="flex items-center space-x-2">
                            <Checkbox
                                id={`flav-${flavor}`}
                                checked={filters.flavors.includes(flavor.toLowerCase())}
                                onCheckedChange={() => handleFlavorChange(flavor)}
                                className="data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                            />
                            <label
                                htmlFor={`flav-${flavor}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                {flavor}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Dietary */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">Dietary</h3>
                <div className="space-y-2">
                    {dietary.map(diet => (
                        <div key={diet} className="flex items-center space-x-2">
                            <Checkbox
                                id={`diet-${diet}`}
                                checked={filters.dietary.includes(diet.toLowerCase())}
                                onCheckedChange={() => handleDietaryChange(diet)}
                                className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                            />
                            <label
                                htmlFor={`diet-${diet}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                                {diet}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rating */}
            <div>
                <h3 className="font-display font-bold text-lg mb-4 text-chocolate">Rating</h3>
                <div className="space-y-2">
                    {[4, 3].map(rating => (
                        <div key={rating} className="flex items-center space-x-2">
                            <Checkbox
                                id={`rating-${rating}`}
                                checked={filters.rating === rating}
                                onCheckedChange={() => setFilters({ ...filters, rating: filters.rating === rating ? null : rating })}
                                className="data-[state=checked]:bg-accent data-[state=checked]:border-accent"
                            />
                            <label
                                htmlFor={`rating-${rating}`}
                                className="text-sm font-medium leading-none cursor-pointer flex items-center"
                            >
                                {rating}★ & above
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <Button
                variant="outline"
                className="w-full border-primary text-primary hover:bg-primary hover:text-white"
                onClick={clearFilters}
            >
                Clear All Filters
            </Button>
        </div>
    );
}
