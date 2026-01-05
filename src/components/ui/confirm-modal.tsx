import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    isLoading = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700',
        },
        warning: {
            icon: 'text-yellow-600',
            button: 'bg-yellow-600 hover:bg-yellow-700',
        },
        info: {
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700',
        },
    };

    const style = variantStyles[variant];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
                <div className="p-6">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-full bg-${variant === 'danger' ? 'red' : variant === 'warning' ? 'yellow' : 'blue'}-100 flex items-center justify-center`}>
                            <AlertTriangle className={`h-8 w-8 ${style.icon}`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-display font-bold text-chocolate text-center mb-2">
                        {title}
                    </h2>

                    {/* Message */}
                    <p className="text-chocolate/70 text-center mb-6">
                        {message}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isLoading}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className={`flex-1 text-white ${style.button}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

