import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Product } from '@/types';
import { saveProduct } from '@/utils/dataManager';
import toast from 'react-hot-toast';

interface ExcelUploadProps {
    onImportComplete?: () => void;
}

interface ParsedRow {
    name: string;
    category: string;
    description: string;
    price: number;
    discount: number;
    sizes: string;
    stock: number;
    lowStockThreshold: number;
    flavors: string;
    dietary: string;
    rating: number;
    reviewCount: number;
    ingredients: string;
    calories: number;
    protein: number;
    fat: number;
    carbs?: number;
    sugar?: number;
    status: string;
    featured: string;
    errors?: string[];
}

export default function ExcelUpload({ onImportComplete }: ExcelUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [previewData, setPreviewData] = useState<ParsedRow[]>([]);
    const [validationErrors, setValidationErrors] = useState<Record<number, string[]>>({});
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const parseCSV = (text: string): ParsedRow[] => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const rows: ParsedRow[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: ParsedRow = {
                name: values[headers.indexOf('name')] || '',
                category: values[headers.indexOf('category')] || '',
                description: values[headers.indexOf('description')] || '',
                price: parseFloat(values[headers.indexOf('price')] || '0'),
                discount: parseFloat(values[headers.indexOf('discount')] || '0'),
                sizes: values[headers.indexOf('sizes')] || '',
                stock: parseInt(values[headers.indexOf('stock')] || '0'),
                lowStockThreshold: parseInt(values[headers.indexOf('lowstockthreshold')] || '10'),
                flavors: values[headers.indexOf('flavors')] || '',
                dietary: values[headers.indexOf('dietary')] || '',
                rating: parseFloat(values[headers.indexOf('rating')] || '0'),
                reviewCount: parseInt(values[headers.indexOf('reviewcount')] || '0'),
                ingredients: values[headers.indexOf('ingredients')] || '',
                calories: parseInt(values[headers.indexOf('calories')] || '0'),
                protein: parseFloat(values[headers.indexOf('protein')] || '0'),
                fat: parseFloat(values[headers.indexOf('fat')] || '0'),
                carbs: values[headers.indexOf('carbs')] ? parseFloat(values[headers.indexOf('carbs')]) : undefined,
                sugar: values[headers.indexOf('sugar')] ? parseFloat(values[headers.indexOf('sugar')]) : undefined,
                status: values[headers.indexOf('status')] || 'active',
                featured: values[headers.indexOf('featured')] || 'false',
            };
            rows.push(row);
        }

        return rows;
    };

    const validateRow = (row: ParsedRow): string[] => {
        const errors: string[] = [];

        if (!row.name || row.name.trim() === '') {
            errors.push('Name is required');
        }
        if (!row.category || !['Sweets', 'Ice Cream', 'Bakery', 'Cakes', 'Chocolates', 'Snacks', 'Dry Fruits', 'Beverages'].includes(row.category)) {
            errors.push('Category must be one of: Sweets, Ice Cream, Bakery, Cakes, Chocolates, Snacks, Dry Fruits, Beverages');
        }
        if (!row.description || row.description.trim() === '') {
            errors.push('Description is required');
        }
        if (isNaN(row.price) || row.price <= 0) {
            errors.push('Price must be a positive number');
        }
        if (isNaN(row.discount) || row.discount < 0 || row.discount > 100) {
            errors.push('Discount must be between 0 and 100');
        }
        if (!row.sizes || row.sizes.trim() === '') {
            errors.push('Sizes are required');
        }
        if (isNaN(row.stock) || row.stock < 0) {
            errors.push('Stock must be a non-negative number');
        }
        if (isNaN(row.rating) || row.rating < 0 || row.rating > 5) {
            errors.push('Rating must be between 0 and 5');
        }

        return errors;
    };

    const handleFile = async (file: File) => {
        if (!file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        try {
            const text = await file.text();
            const parsed = parseCSV(text);
            
            // Validate all rows
            const errors: Record<number, string[]> = {};
            parsed.forEach((row, index) => {
                const rowErrors = validateRow(row);
                if (rowErrors.length > 0) {
                    errors[index] = rowErrors;
                }
            });

            setValidationErrors(errors);
            setPreviewData(parsed);

            if (Object.keys(errors).length === 0) {
                toast.success(`Successfully parsed ${parsed.length} products`);
            } else {
                toast.error(`Found ${Object.keys(errors).length} rows with errors`);
            }
        } catch (error: any) {
            toast.error(`Error parsing CSV: ${error.message}`);
            console.error(error);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleImport = async () => {
        if (previewData.length === 0) {
            toast.error('No data to import');
            return;
        }

        if (Object.keys(validationErrors).length > 0) {
            toast.error('Please fix validation errors before importing');
            return;
        }

        setIsImporting(true);
        let successCount = 0;
        let errorCount = 0;

        try {
            for (const row of previewData) {
                try {
                    const product: Product = {
                        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        name: row.name,
                        category: row.category as any,
                        description: row.description,
                        price: row.price,
                        discount: row.discount,
                        images: [],
                        sizes: row.sizes.split(',').map(s => s.trim()),
                        stock: row.stock,
                        lowStockThreshold: row.lowStockThreshold,
                        flavors: row.flavors.split(',').map(f => f.trim()),
                        dietary: row.dietary.split(',').map(d => d.trim()).filter(d => d),
                        rating: row.rating,
                        reviewCount: row.reviewCount,
                        ingredients: row.ingredients,
                        nutrition: {
                            calories: row.calories,
                            protein: row.protein,
                            fat: row.fat,
                            carbs: row.carbs,
                            sugar: row.sugar,
                        },
                        status: (row.status === 'active' || row.status === 'inactive') ? row.status : 'active',
                        featured: row.featured.toLowerCase() === 'true',
                        createdAt: new Date().toISOString().split('T')[0],
                    };

                    await saveProduct(product);
                    successCount++;
                } catch (error) {
                    console.error('Error importing product:', error);
                    errorCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} products`);
                setPreviewData([]);
                setValidationErrors({});
                if (onImportComplete) {
                    onImportComplete();
                }
            }
            if (errorCount > 0) {
                toast.error(`Failed to import ${errorCount} products`);
            }
        } catch (error) {
            toast.error('Error during import');
            console.error(error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-chocolate/20 hover:border-primary/50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
            >
                <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-chocolate/40" />
                <h3 className="text-xl font-display font-bold text-chocolate mb-2">
                    Upload CSV File
                </h3>
                <p className="text-chocolate/70 mb-4">
                    Drag and drop your CSV file here, or click to browse
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                </Button>
                <p className="text-xs text-chocolate/60 mt-4">
                    CSV format: name, category, description, price, discount, sizes, stock, lowStockThreshold, flavors, dietary, rating, reviewCount, ingredients, calories, protein, fat, carbs, sugar, status, featured
                </p>
            </div>

            {/* Preview Table */}
            {previewData.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-display font-bold text-chocolate">
                            Preview ({previewData.length} products)
                        </h3>
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${Object.keys(validationErrors).length === 0 ? 'text-success' : 'text-error'}`}>
                                {Object.keys(validationErrors).length === 0 ? (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle className="h-4 w-4" />
                                        All valid
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        {Object.keys(validationErrors).length} errors
                                    </span>
                                )}
                            </span>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting || Object.keys(validationErrors).length > 0}
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    'Import Products'
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-chocolate/10">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Name</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Category</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Price</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Stock</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Status</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-chocolate">Validation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, index) => (
                                    <tr
                                        key={index}
                                        className={`border-b border-chocolate/5 ${
                                            validationErrors[index] ? 'bg-red-50' : ''
                                        }`}
                                    >
                                        <td className="py-3 px-4 text-sm">{row.name}</td>
                                        <td className="py-3 px-4 text-sm">{row.category}</td>
                                        <td className="py-3 px-4 text-sm">₹{row.price}</td>
                                        <td className="py-3 px-4 text-sm">{row.stock}</td>
                                        <td className="py-3 px-4 text-sm">
                                            <span className={`px-2 py-1 rounded text-xs ${
                                                row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm">
                                            {validationErrors[index] ? (
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-xs">{validationErrors[index].length} errors</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs">Valid</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Error Details */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-semibold text-red-800 mb-2">Validation Errors:</h4>
                            <div className="space-y-2">
                                {Object.entries(validationErrors).map(([index, errors]) => (
                                    <div key={index} className="text-sm text-red-700">
                                        <strong>Row {parseInt(index) + 2}:</strong> {errors.join(', ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

