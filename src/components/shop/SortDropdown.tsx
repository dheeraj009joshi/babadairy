import { ChevronDown } from 'lucide-react';

export type SortOption = 'popularity' | 'price-low' | 'price-high' | 'newest';

interface SortDropdownProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
    const options: { value: SortOption; label: string }[] = [
        { value: 'popularity', label: 'Popularity' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'newest', label: 'Newest First' },
    ];

    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as SortOption)}
                className="appearance-none w-full md:w-48 px-4 py-2 pr-10 rounded-lg border-2 border-chocolate/10 focus:border-primary focus:outline-none transition-colors bg-white cursor-pointer"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-chocolate/40 pointer-events-none" />
        </div>
    );
}
